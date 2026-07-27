import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    const configuracao = await prisma.configuracao.findFirst()
    return res.json(configuracao)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao buscar configuração.' })
  }
})

router.put('/', async (req, res) => {
  try {
    const atual = await prisma.configuracao.findFirst()
    const configuracao = atual
      ? await prisma.configuracao.update({ where: { id: atual.id }, data: req.body })
      : await prisma.configuracao.create({ data: req.body })

    return res.status(201).json(configuracao)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao salvar configuração.' })
  }
})

export default router
