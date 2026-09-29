import { OAuth2Client } from 'google-auth-library'
import type { UsuarioService } from '../usuarios/usuario.service'
import { compararSenha, validarSenha } from './senha.service'
import { signToken } from '../middlewares/auth'

type UsuarioAutenticado = {
  id: string
  nome: string
  email: string
  nivel: string
  cadastroConcluido?: boolean
}

function mapearUsuarioAutenticado(usuario: UsuarioAutenticado) {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    nivel: usuario.nivel,
    cadastroConcluido: usuario.cadastroConcluido ?? true
  }
}

export class AuthService {
  constructor(private readonly usuarioService: UsuarioService) {}

  async autenticarUsuario(email: string, senha: string) {
    const usuario = await this.usuarioService.buscarPorEmail(email)

    if (!usuario || usuario.ativo === false || !usuario.senhaHash) return null

    const senhaValida = await compararSenha(senha, usuario.senhaHash)
    return senhaValida ? usuario : null
  }

  async cadastrarUsuario(dados: { nome: string; email: string; senha: string; telefone?: string }) {
    const erroSenha = validarSenha(dados.senha)
    if (erroSenha) return { erro: erroSenha } as const

    const existente = await this.usuarioService.buscarPorEmail(dados.email)
    if (existente) return { erro: 'Este email já está cadastrado.', conflito: true } as const

    const usuario = await this.usuarioService.criar({
      nome: dados.nome,
      email: dados.email,
      telefone: dados.telefone,
      senha: dados.senha,
      nivel: 'Cliente'
    })

    return { usuario } as const
  }

  async autenticarComGoogle(idToken: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID
    if (!clientId) return { erro: 'Login com Google ainda não foi configurado.', motivo: 'googleNaoConfigurado' } as const

    const ticket = await new OAuth2Client(clientId).verifyIdToken({ idToken, audience: clientId })
    const perfil = ticket.getPayload()
    if (!perfil?.sub || !perfil.email || !perfil.email_verified) {
      return { erro: 'A conta Google precisa ter e-mail verificado.', motivo: 'emailNaoVerificado' } as const
    }

    let usuario = await this.usuarioService.buscarPorGoogleSubject(perfil.sub)
    if (usuario?.ativo === false) {
      usuario = await this.usuarioService.atualizar(usuario.id, {
        ativo: true,
        provedorAuth: 'GOOGLE',
        fotoUrl: perfil.picture ?? null,
        cadastroConcluido: false
      })
    } else if (!usuario) {
      const existente = await this.usuarioService.buscarPorEmail(perfil.email.toLowerCase())
      if (existente) {
        usuario = await this.usuarioService.atualizar(existente.id, {
          ativo: true,
          provedorAuth: 'GOOGLE',
          googleSubject: perfil.sub,
          fotoUrl: perfil.picture ?? null,
          cadastroConcluido: existente.ativo === false ? false : (existente.cadastroConcluido ?? true)
        })
      } else {
        usuario = await this.usuarioService.criar({
          nome: perfil.name?.trim() || perfil.email.split('@')[0],
          email: perfil.email.toLowerCase(),
          nivel: 'Cliente',
          provedorAuth: 'GOOGLE',
          googleSubject: perfil.sub,
          fotoUrl: perfil.picture ?? null,
          cadastroConcluido: false
        })
      }
    }

    return { usuario } as const
  }

  criarSessao(usuario: UsuarioAutenticado) {
    return { token: signToken(usuario), user: mapearUsuarioAutenticado(usuario) }
  }
}
