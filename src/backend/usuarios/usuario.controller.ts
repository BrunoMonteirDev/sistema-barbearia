import type { Request, Response } from 'express'
import type { UsuarioService } from './usuario.service'
import {
  DadosUsuarioInvalidosError,
  prepararDadosUsuario,
  prepararPerfil,
  prepararConclusaoCadastro,
  validarConfirmacaoExclusao,
} from './validacao-usuario.service'

function mapUsuario(usuario: Record<string, unknown>) {
  return {
    ...usuario,
    data_nascimento: usuario.dataNascimento
      ? new Date(usuario.dataNascimento as Date).toISOString()
      : null
  }
}

export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  perfil = async (req: Request, res: Response) => {
    const usuario = await this.usuarioService.buscarPorId(req.auth!.sub)
    if (!usuario || usuario.ativo === false) return res.status(401).json({ error: 'Sessão inválida ou conta desativada.' })
    return res.json(mapUsuario(usuario))
  }

  atualizarPerfil = async (req: Request, res: Response) => {
    try {
      const dados = prepararPerfil(req.body)
      const usuario = await this.usuarioService.atualizarPerfil(req.auth!.sub, dados)
      return res.json(mapUsuario(usuario))
    } catch (error) {
      if (error instanceof DadosUsuarioInvalidosError) return res.status(400).json({ error: error.message })
      throw error
    }
  }

  concluirCadastro = async (req: Request, res: Response) => {
    try {
      const dados = prepararConclusaoCadastro(req.body)
      const usuario = await this.usuarioService.concluirCadastro(req.auth!.sub, dados)
      return res.json(mapUsuario(usuario))
    } catch (error) {
      if (error instanceof DadosUsuarioInvalidosError) return res.status(400).json({ error: error.message })
      throw error
    }
  }

  excluirPropriaConta = async (req: Request, res: Response) => {
    try {
      validarConfirmacaoExclusao(req.body)
      await this.usuarioService.excluirPropriaConta(req.auth!.sub)
      return res.json({ success: true })
    } catch (error) {
      if (error instanceof DadosUsuarioInvalidosError) return res.status(400).json({ error: error.message })
      throw error
    }
  }

  listar = async (_req: Request, res: Response) => {
    try {
      const usuarios = await this.usuarioService.listar()
      return res.json(usuarios.map(mapUsuario))
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao listar usuários.' })
    }
  }

  criar = async (req: Request, res: Response) => {
    try {
      const dados = prepararDadosUsuario(req.body)
      const usuario = await this.usuarioService.criar(dados)
      return res.status(201).json(mapUsuario(usuario))
    } catch (error) {
      if (error instanceof DadosUsuarioInvalidosError) return res.status(400).json({ error: error.message })
      console.error(error)
      return res.status(500).json({ error: 'Erro ao criar usuário.' })
    }
  }

  atualizar = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const dados = prepararDadosUsuario(req.body)
      const usuario = await this.usuarioService.atualizar(req.params.id, dados)
      return res.json(mapUsuario(usuario))
    } catch (error) {
      if (error instanceof DadosUsuarioInvalidosError) return res.status(400).json({ error: error.message })
      console.error(error)
      return res.status(500).json({ error: 'Erro ao atualizar usuário.' })
    }
  }

  desativar = async (req: Request<{ id: string }>, res: Response) => {
    try {
      await this.usuarioService.remover(req.params.id)
      return res.json({ success: true })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao remover usuário.' })
    }
  }
}
