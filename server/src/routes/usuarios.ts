import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { usuarioService } from '../services/usuario.service'
import { validarSenha } from '../services/senha.service'
import { requireAdmin } from '../middlewares/auth'

const router = Router()

function mapUsuario(usuario: Record<string, unknown>) {
  return {
    ...usuario,
    data_nascimento: usuario.dataNascimento
      ? new Date(usuario.dataNascimento as Date).toISOString()
      : null
  }
}

function normalizePayload(body: Record<string, unknown>) {
  const dataNascimento = body.dataNascimento
    ? new Date(body.dataNascimento as string)
    : body.data_nascimento
      ? new Date(body.data_nascimento as string)
      : null

  return {
    nome: String(body.nome ?? ''),
    email: typeof body.email === 'string' && body.email.trim()
      ? body.email.trim().toLowerCase()
      : `cliente-${randomUUID()}@sem-email.local`,
    telefone: typeof body.telefone === 'string' ? body.telefone : null,
    senha: typeof body.senha === 'string' ? body.senha : undefined,
    nivel: typeof body.nivel === 'string' ? body.nivel : 'Cliente',
    ativo: typeof body.ativo === 'boolean' ? body.ativo : true,
    dataNascimento
  }
}

router.get('/me', async (req, res) => {
  const usuario = await usuarioService.buscarPorId(req.auth!.sub)
  if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado.' })
  return res.json(mapUsuario(usuario))
})

router.put('/me', async (req, res) => {
  const usuario = await usuarioService.atualizarPerfil(req.auth!.sub, req.body)
  return res.json(mapUsuario(usuario))
})

router.put('/me/concluir-cadastro', async (req, res) => {
  const nome = typeof req.body.nome === 'string' ? req.body.nome.trim() : ''
  const telefone = typeof req.body.telefone === 'string' ? req.body.telefone.replace(/\D/g, '') : ''
  if (nome.length < 2 || telefone.length < 10) return res.status(400).json({ error: 'Informe nome e telefone válidos para concluir o cadastro.' })
  const usuario = await usuarioService.concluirCadastro(req.auth!.sub, { nome, telefone })
  return res.json(mapUsuario(usuario))
})

router.delete('/me', async (req, res) => {
  const confirmacao = typeof req.body.confirmacao === 'string' ? req.body.confirmacao.trim().toUpperCase() : ''
  if (confirmacao !== 'EXCLUIR MINHA CONTA') return res.status(400).json({ error: 'Digite EXCLUIR MINHA CONTA para confirmar a exclusão.' })
  await usuarioService.excluirPropriaConta(req.auth!.sub)
  return res.json({ success: true })
})

router.use(requireAdmin)

router.get('/', async (_req, res) => {
  try {
    const usuarios = await usuarioService.listar()
    return res.json(usuarios.map(mapUsuario))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao listar usuários.' })
}
})

router.post('/', async (req, res) => {
  try {
    const dados = normalizePayload(req.body as Record<string, unknown>)
    const erroSenha = dados.senha ? validarSenha(dados.senha) : null
    if (erroSenha) return res.status(400).json({ error: erroSenha })
    const usuario = await usuarioService.criar(dados)
    return res.status(201).json(mapUsuario(usuario))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao criar usuário.' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const dados = normalizePayload(req.body as Record<string, unknown>)
    const erroSenha = dados.senha ? validarSenha(dados.senha) : null
    if (erroSenha) return res.status(400).json({ error: erroSenha })
    const usuario = await usuarioService.atualizar(req.params.id, dados)
    return res.json(mapUsuario(usuario))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao atualizar usuário.' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await usuarioService.remover(req.params.id)
    return res.json({ success: true })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro ao remover usuário.' })
  }
})

export default router
