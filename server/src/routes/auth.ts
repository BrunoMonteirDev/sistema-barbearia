import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { usuarioService } from '../services/usuario.service'
import { signToken } from '../middlewares/auth'

const router = Router()

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios.' })
    }

    const usuario = await usuarioService.buscarPorEmail(email)

    if (!usuario || !usuario.senhaHash) {
      return res.status(401).json({ error: 'Credenciais inválidas.' })
    }

    const senhaValida = await bcrypt.compare(password, usuario.senhaHash)

    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas.' })
    }

    return res.json({ token: signToken(usuario), user: { id: usuario.id, nome: usuario.nome, email: usuario.email, nivel: usuario.nivel } })
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

    return res.status(201).json({ token: signToken(usuario), user: { id: usuario.id, nome: usuario.nome, email: usuario.email, nivel: usuario.nivel } })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro interno ao cadastrar usuário.' })
  }
})

export default router
