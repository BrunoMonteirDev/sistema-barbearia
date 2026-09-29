import { UsuarioRepository } from './usuario.repository'
import { gerarHash } from '../auth/senha.service'

export class UsuarioService {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  async listar() {
    return this.usuarioRepository.listarAtivos()
  }

  async buscarPorEmail(email: string) {
    return this.usuarioRepository.buscarPorEmail(email)
  }

  async buscarPorGoogleSubject(googleSubject: string) {
    return this.usuarioRepository.buscarPorGoogleSubject(googleSubject)
  }

  async buscarPorId(id: string) {
    return this.usuarioRepository.buscarPorId(id)
  }

  async criar(dados: {
    nome: string
    email: string
    telefone?: string | null
    senha?: string
    nivel?: string
    ativo?: boolean
    dataNascimento?: Date | null
    provedorAuth?: string
    googleSubject?: string
    cadastroConcluido?: boolean
    fotoUrl?: string | null
  }) {
    const senhaHash = dados.senha ? await gerarHash(dados.senha) : null

    return this.usuarioRepository.criar({
      nome: dados.nome,
      email: dados.email,
      telefone: dados.telefone ?? null,
      senhaHash,
      provedorAuth: dados.provedorAuth ?? 'LOCAL',
      googleSubject: dados.googleSubject,
      cadastroConcluido: dados.cadastroConcluido ?? true,
      fotoUrl: dados.fotoUrl ?? null,
      nivel: dados.nivel ?? 'Cliente',
      ativo: dados.ativo ?? true,
      dataNascimento: dados.dataNascimento ?? null
    })
  }

  async atualizar(id: string, dados: Record<string, unknown>) {
    const { senha, ...dadosUsuario } = dados
    const senhaHash = typeof senha === 'string' && senha ? await gerarHash(senha) : undefined
    return this.usuarioRepository.atualizar(id, { ...dadosUsuario, ...(senhaHash ? { senhaHash } : {}) })
  }

  async atualizarPerfil(id: string, dados: { nome?: string; telefone?: string | null; dataNascimento?: string | null }) {
    const dataNascimento = Object.prototype.hasOwnProperty.call(dados, 'dataNascimento')
      ? (dados.dataNascimento ? new Date(dados.dataNascimento) : null)
      : undefined
    return this.usuarioRepository.atualizar(id, {
      nome: dados.nome,
      telefone: dados.telefone,
      dataNascimento
    })
  }

  async concluirCadastro(id: string, dados: { nome: string; telefone: string }) {
    return this.usuarioRepository.atualizar(id, { nome: dados.nome, telefone: dados.telefone, cadastroConcluido: true })
  }

  async remover(id: string) {
    return this.usuarioRepository.desativar(id)
  }

  async excluirPropriaConta(id: string) {
    return this.usuarioRepository.desativar(id)
  }
}

export const usuarioService = new UsuarioService(new UsuarioRepository())
