import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()
const camposRegras = ['antecedenciaCancelamentoHoras', 'antecedenciaRemarcacaoHoras', 'toleranciaAtrasoMinutos'] as const

function dadosContatoValidos(body: Record<string, unknown>) {
  const telefoneWhatsApp = typeof body.telefoneWhatsApp === 'string' ? body.telefoneWhatsApp.replace(/\D/g, '') : ''
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const instagram = typeof body.instagram === 'string' ? body.instagram.trim() : ''
  if (telefoneWhatsApp.length < 10 || telefoneWhatsApp.length > 11) return { erro: 'Informe um WhatsApp brasileiro válido com DDD.' } as const
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { erro: 'Informe um e-mail de contato válido.' } as const
  if (instagram) {
    try {
      const url = new URL(instagram)
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Protocolo inválido')
    } catch {
      return { erro: 'Informe o link completo do Instagram ou deixe o campo vazio.' } as const
    }
  }
  return { dados: { telefoneWhatsApp, email, instagram: instagram || null } } as const
}

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
    const resultado = dadosContatoValidos(req.body as Record<string, unknown>)
    if ('erro' in resultado) return res.status(400).json({ error: resultado.erro })
    const atual = await prisma.configuracao.findFirst()
    const configuracao = atual
      ? await prisma.configuracao.update({ where: { id: atual.id }, data: resultado.dados })
      : await prisma.configuracao.create({ data: resultado.dados })

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
