import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { requireAdmin } from '../middlewares/auth'

const router = Router()
const appointmentStatuses = ['PENDENTE', 'CONFIRMADO', 'CONCLUIDO', 'CANCELADO']

function isValidDate(value: unknown) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

function isValidTime(value: unknown) {
  if (typeof value !== 'string' || !/^\d{2}:\d{2}$/.test(value)) return false
  const [hour, minute] = value.split(':').map(Number)
  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59
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
    const { profissionalId, servicoId, data, hora, observacao } = req.body
    if (typeof profissionalId !== 'string' || typeof servicoId !== 'string' || !isValidDate(data) || !isValidTime(hora)) {
      return res.status(400).json({ error: 'Profissional, serviço, data e hora válidos são obrigatórios.' })
    }

    const usuarioId = req.auth!.nivel === 'Administrador' && typeof req.body.usuarioId === 'string' ? req.body.usuarioId : req.auth!.sub
    const [disponivel, usuario] = await Promise.all([
      hasAvailableProfessionalAndService(profissionalId, servicoId),
      prisma.usuario.findFirst({ where: { id: usuarioId, ativo: true } }),
    ])
    if (!disponivel || !usuario) return res.status(400).json({ error: 'Cliente, profissional ou serviço indisponível.' })

    const conflito = await prisma.agendamento.findFirst({ where: { profissionalId, data, hora, status: { not: 'CANCELADO' } } })
    if (conflito) return res.status(409).json({ error: 'Este horário já está reservado.' })

    const agendamento = await prisma.agendamento.create({ data: { usuarioId, profissionalId, servicoId, data, hora, observacao } })
    return res.status(201).json(agendamento)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao criar agendamento.' })
  }
})

router.get('/disponibilidade', async (req, res) => {
  const { profissionalId, data } = req.query
  if (typeof profissionalId !== 'string' || !isValidDate(data)) return res.status(400).json({ error: 'Profissional e data válidos são obrigatórios.' })
  const ocupados = await prisma.agendamento.findMany({ where: { profissionalId, data, status: { not: 'CANCELADO' } }, select: { hora: true } })
  return res.json({ ocupados: ocupados.map(({ hora }) => hora) })
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

  const conflito = await prisma.agendamento.findFirst({ where: { profissionalId, data, hora, status: { not: 'CANCELADO' }, id: { not: agendamento.id } } })
  if (conflito) return res.status(409).json({ error: 'Este horário já está reservado.' })

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
