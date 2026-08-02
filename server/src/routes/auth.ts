import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { OAuth2Client } from 'google-auth-library'
import { usuarioService } from '../services/usuario.service'
import { signToken } from '../middlewares/auth'
import { validarSenha } from '../services/senha.service'

const router = Router()

const mapAuthUser = (usuario: { id: string; nome: string; email: string; nivel: string; cadastroConcluido?: boolean }) => ({
  id: usuario.id,
  nome: usuario.nome,
  email: usuario.email,
  nivel: usuario.nivel,
  cadastroConcluido: usuario.cadastroConcluido ?? true
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios.' })
    }

    const usuario = await usuarioService.buscarPorEmail(email)

    if (!usuario || usuario.ativo === false || !usuario.senhaHash) {
      return res.status(401).json({ error: 'Credenciais inválidas.' })
    }

    const senhaValida = await bcrypt.compare(password, usuario.senhaHash)

    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas.' })
    }

    return res.json({ token: signToken(usuario), user: mapAuthUser(usuario) })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro interno ao autenticar.' })
  }
})

router.post('/register', async (req, res) => {
  try {
    const { nome, email, password, telefone } = req.body

    if (!nome || !email || !password) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' })
    }

    const erroSenha = validarSenha(password)
    if (erroSenha) return res.status(400).json({ error: erroSenha })

    const existente = await usuarioService.buscarPorEmail(email)

    if (existente) {
      return res.status(409).json({ error: 'Este email já está cadastrado.' })
    }

    const usuario = await usuarioService.criar({
      nome,
      email,
      telefone,
      senha: password,
      nivel: 'Cliente'
    })

    return res.status(201).json({ token: signToken(usuario), user: mapAuthUser(usuario) })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro interno ao cadastrar usuário.' })
  }
})

router.post('/google', async (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) return res.status(503).json({ error: 'Login com Google ainda não foi configurado.' })
  if (typeof req.body.idToken !== 'string' || !req.body.idToken) return res.status(400).json({ error: 'Token Google é obrigatório.' })

  try {
    const ticket = await new OAuth2Client(clientId).verifyIdToken({ idToken: req.body.idToken, audience: clientId })
    const perfil = ticket.getPayload()
    if (!perfil?.sub || !perfil.email || !perfil.email_verified) return res.status(401).json({ error: 'A conta Google precisa ter e-mail verificado.' })

    let usuario = await usuarioService.buscarPorGoogleSubject(perfil.sub)
    if (!usuario) {
      const existente = await usuarioService.buscarPorEmail(perfil.email.toLowerCase())
      if (existente) return res.status(409).json({ error: 'Este e-mail já possui conta. Entre com sua senha para vincular o Google futuramente.' })
      usuario = await usuarioService.criar({
        nome: perfil.name?.trim() || perfil.email.split('@')[0],
        email: perfil.email.toLowerCase(),
        nivel: 'Cliente',
        provedorAuth: 'GOOGLE',
        googleSubject: perfil.sub,
        fotoUrl: perfil.picture ?? null,
        cadastroConcluido: false
      })
    }

    return res.status(201).json({ token: signToken(usuario), user: mapAuthUser(usuario) })
  } catch (error) {
    console.error(error)
    return res.status(401).json({ error: 'Não foi possível validar o login com Google.' })
  }
})

export default router
