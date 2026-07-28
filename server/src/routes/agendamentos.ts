import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { requireAdmin } from '../middlewares/auth'
import { escolherPrimeiroProfissionalDisponivel, isValidBlock, listarHorariosDisponiveis, obterBlocos, validarDisponibilidade } from '../services/horarios.service'

const router = Router()
const appointmentStatuses = ['PENDENTE', 'CONFIRMADO', 'CONCLUIDO', 'CANCELADO']

function isValidDate(value: unknown) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

function isValidTime(value: unknown) {
  return isValidBlock(value)
}

function isValidStatus(value: unknown) {
  return typeof value === 'string' && appointmentStatuses.includes(value)
}

async function hasAvailableProfessionalAndService(profissionalId: string, servicoId: string) {
  const [profissional, servico] = await Promise.all([
    prisma.profissional.findFirst({ where: { id: profissionalId, ativo: true } }),
    prisma.servico.findFirst({ where: { id: servicoId, ativo: true } }),
  ])

  return Boolean(profissional && servico)
}

router.get('/', async (req, res) => {
  try {
    const agendamentos = await prisma.agendamento.findMany({
      where: req.auth!.nivel === 'Administrador' ? undefined : { usuarioId: req.auth!.sub },
      include: { usuario: true, profissional: true, servico: true },
      orderBy: { createdAt: 'desc' },
    })
    return res.json(agendamentos)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao listar agendamentos.' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { servicoId, data, hora, observacao } = req.body
    let { profissionalId } = req.body
    if ((profissionalId !== 'sem-preferencia' && typeof profissionalId !== 'string') || typeof servicoId !== 'string' || !isValidDate(data) || !isValidTime(hora)) {
      return res.status(400).json({ error: 'Profissional, serviço, data e hora em blocos de 30 minutos são obrigatórios.' })
    }

    if (profissionalId === 'sem-preferencia') {
      profissionalId = await escolherPrimeiroProfissionalDisponivel(servicoId, data, hora)
      if (!profissionalId) return res.status(409).json({ error: 'Nenhum funcionário disponível para este horário.' })
    }

    const usuarioId = req.auth!.nivel === 'Administrador' && typeof req.body.usuarioId === 'string' ? req.body.usuarioId : req.auth!.sub
    const [disponivel, usuario] = await Promise.all([
      hasAvailableProfessionalAndService(profissionalId, servicoId),
      prisma.usuario.findFirst({ where: { id: usuarioId, ativo: true } }),
    ])
    if (!disponivel || !usuario) return res.status(400).json({ error: 'Cliente, profissional ou serviço indisponível.' })

    const horarioDisponivel = await validarDisponibilidade(profissionalId, servicoId, data, hora)
    if (!horarioDisponivel) return res.status(409).json({ error: 'Este horário não está disponível para a duração do serviço.' })

    const agendamento = await prisma.agendamento.create({ data: { usuarioId, profissionalId, servicoId, data, hora, observacao } })
    return res.status(201).json(agendamento)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao criar agendamento.' })
  }
})

router.get('/disponibilidade', async (req, res) => {
  const { profissionalId, servicoId, data } = req.query
  if (typeof profissionalId !== 'string' || typeof servicoId !== 'string' || !isValidDate(data)) return res.status(400).json({ error: 'Profissional, serviço e data válidos são obrigatórios.' })
  if (profissionalId === 'sem-preferencia') {
    const horarios: string[] = []
    for (const hora of obterBlocos()) {
      if (await escolherPrimeiroProfissionalDisponivel(servicoId, data, hora)) horarios.push(hora)
    }
    return res.json({ horarios })
  }
  const horarios = await listarHorariosDisponiveis(profissionalId, servicoId, data)
  return res.json({ horarios })
})

router.patch('/:id/cancelar', async (req, res) => {
  const agendamento = await prisma.agendamento.findUnique({ where: { id: req.params.id } })
  if (!agendamento) return res.status(404).json({ error: 'Agendamento não encontrado.' })
  if (req.auth!.nivel !== 'Administrador' && agendamento.usuarioId !== req.auth!.sub) return res.status(403).json({ error: 'Sem permissão para cancelar este agendamento.' })
  return res.json(await prisma.agendamento.update({ where: { id: agendamento.id }, data: { status: 'CANCELADO' } }))
})

router.patch('/:id/status', requireAdmin, async (req, res) => {
  if (!isValidStatus(req.body.status)) return res.status(400).json({ error: 'Status inválido.' })
  return res.json(await prisma.agendamento.update({ where: { id: req.params.id }, data: { status: req.body.status } }))
})

router.put('/:id', requireAdmin, async (req, res) => {
  const agendamento = await prisma.agendamento.findUnique({ where: { id: req.params.id } })
  if (!agendamento) return res.status(404).json({ error: 'Agendamento não encontrado.' })
  if ((req.body.data !== undefined && !isValidDate(req.body.data)) || (req.body.hora !== undefined && !isValidTime(req.body.hora)) || (req.body.status !== undefined && !isValidStatus(req.body.status))) {
    return res.status(400).json({ error: 'Dados de agendamento inválidos.' })
  }

  const data = req.body.data ?? agendamento.data
  const hora = req.body.hora ?? agendamento.hora
  const profissionalId = req.body.profissionalId ?? agendamento.profissionalId
  const servicoId = req.body.servicoId ?? agendamento.servicoId
  if (typeof profissionalId !== 'string' || typeof servicoId !== 'string' || !await hasAvailableProfessionalAndService(profissionalId, servicoId)) {
    return res.status(400).json({ error: 'Profissional ou serviço indisponível.' })
  }

  const horarioDisponivel = await validarDisponibilidade(profissionalId, servicoId, data, hora, agendamento.id)
  if (!horarioDisponivel) return res.status(409).json({ error: 'Este horário não está disponível para a duração do serviço.' })

  return res.json(await prisma.agendamento.update({
    where: { id: agendamento.id },
    data: { profissionalId, servicoId, data, hora, status: req.body.status ?? agendamento.status, observacao: req.body.observacao ?? agendamento.observacao },
  }))
})

router.delete('/:id', requireAdmin, async (req, res) => {
  const agendamento = await prisma.agendamento.findUnique({ where: { id: req.params.id } })
  if (!agendamento) return res.status(404).json({ error: 'Agendamento não encontrado.' })
  await prisma.agendamento.delete({ where: { id: agendamento.id } })
  return res.status(204).send()
})

export default router
