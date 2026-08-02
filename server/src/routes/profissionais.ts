import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authenticate, requireAdmin } from '../middlewares/auth'
import { isValidBlock } from '../services/horarios.service'

const router = Router()

function getPayload(body: Record<string, unknown>) {
  return {
    nome: typeof body.nome === 'string' ? body.nome.trim() : '',
    telefone: typeof body.telefone === 'string' ? body.telefone.trim() : null,
    email: typeof body.email === 'string' ? body.email.trim().toLowerCase() : null,
    ativo: typeof body.ativo === 'boolean' ? body.ativo : true,
  }
}

function hasValidData(data: ReturnType<typeof getPayload>) {
  return Boolean(data.nome && data.telefone && data.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
}

router.get('/', async (_req, res) => {
  try {
    const profissionais = await prisma.profissional.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' } })
    return res.json(profissionais)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao listar profissionais.' })
  }
})

router.get('/admin', authenticate, requireAdmin, async (_req, res) => {
  try {
    const profissionais = await prisma.profissional.findMany({ orderBy: { nome: 'asc' } })
    return res.json(profissionais)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao listar profissionais.' })
  }
})

router.get('/:id/disponibilidade', authenticate, requireAdmin, async (req, res) => {
  try {
    const horarios = await prisma.disponibilidadeProfissional.findMany({
      where: { profissionalId: String(req.params.id) },
      orderBy: [{ diaSemana: 'asc' }, { hora: 'asc' }],
    })
    const disponibilidade = horarios.reduce<Record<number, string[]>>((acc, item) => {
      acc[item.diaSemana] = [...(acc[item.diaSemana] ?? []), item.hora]
      return acc
    }, {})
    return res.json(disponibilidade)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao listar horários do funcionário.' })
  }
})

router.put('/:id/disponibilidade', authenticate, requireAdmin, async (req, res) => {
  try {
    const disponibilidade = req.body.disponibilidade
    if (!disponibilidade || typeof disponibilidade !== 'object' || Array.isArray(disponibilidade)) {
      return res.status(400).json({ error: 'Disponibilidade inválida.' })
    }

    const profissionalId = String(req.params.id)
    const profissional = await prisma.profissional.findUnique({ where: { id: profissionalId } })
    if (!profissional) return res.status(404).json({ error: 'Funcionário não encontrado.' })

    const blocos = Object.entries(disponibilidade).flatMap(([dia, horas]) => {
      const diaSemana = Number(dia)
      if (!Number.isInteger(diaSemana) || diaSemana < 0 || diaSemana > 6 || !Array.isArray(horas)) return []
      return [...new Set(horas)].filter(isValidBlock).map(hora => ({ profissionalId, diaSemana, hora }))
    })

    await prisma.$transaction([
      prisma.disponibilidadeProfissional.deleteMany({ where: { profissionalId } }),
      ...(blocos.length ? [prisma.disponibilidadeProfissional.createMany({ data: blocos })] : []),
    ])

    return res.json({ ok: true })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao salvar horários do funcionário.' })
  }
})

router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const data = getPayload(req.body)
    if (!hasValidData(data)) return res.status(400).json({ error: 'Informe nome, telefone e e-mail válidos.' })
    const profissional = await prisma.profissional.create({ data })
    return res.status(201).json(profissional)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Não foi possível cadastrar o funcionário.' })
  }
})

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const data = getPayload(req.body)
    if (!hasValidData(data)) return res.status(400).json({ error: 'Informe nome, telefone e e-mail válidos.' })
    const profissional = await prisma.profissional.update({ where: { id: String(req.params.id) }, data })
    return res.json(profissional)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Não foi possível atualizar o funcionário.' })
  }
})

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const profissional = await prisma.profissional.update({ where: { id: String(req.params.id) }, data: { ativo: false } })
    return res.json(profissional)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Não foi possível excluir o funcionário.' })
  }
})

export default router
