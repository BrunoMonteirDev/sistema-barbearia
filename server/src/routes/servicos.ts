import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authenticate, requireAdmin } from '../middlewares/auth'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    const servicos = await prisma.servico.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' }
    })

    return res.json(servicos)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao listar serviços.' })
  }
})

router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const servico = await prisma.servico.create({ data: req.body })
    return res.status(201).json(servico)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao criar serviço.' })
  }
})

router.put<{ id: string }>('/:id', authenticate, requireAdmin, async (req, res) => {
  const servico = await prisma.servico.update({ where: { id: req.params.id }, data: req.body })
  return res.json(servico)
})

router.delete<{ id: string }>('/:id', authenticate, requireAdmin, async (req, res) => {
  const servico = await prisma.servico.update({ where: { id: req.params.id }, data: { ativo: false } })
  return res.json(servico)
})

export default router
