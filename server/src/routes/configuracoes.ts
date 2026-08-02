import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()
const camposRegras = ['antecedenciaCancelamentoHoras', 'antecedenciaRemarcacaoHoras', 'toleranciaAtrasoMinutos'] as const

async function obterOuCriar() {
  return (await prisma.configuracao.findFirst()) ?? prisma.configuracao.create({ data: {} })
}

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

router.get('/regras', async (_req, res) => {
  const config = await obterOuCriar()
  return res.json(Object.fromEntries(camposRegras.map(campo => [campo, config[campo]])))
})

router.put('/regras', async (req, res) => {
  const dados = Object.fromEntries(camposRegras.map(campo => [campo, req.body[campo]])) as Record<string, unknown>
  if (Object.values(dados).some(valor => !Number.isInteger(valor) || Number(valor) < 0 || Number(valor) > 720)) {
    return res.status(400).json({ error: 'As regras devem ser números inteiros entre 0 e 720.' })
  }
  const config = await obterOuCriar()
  const atualizado = await prisma.configuracao.update({ where: { id: config.id }, data: dados })
  return res.json(Object.fromEntries(camposRegras.map(campo => [campo, atualizado[campo]])))
})

export default router
