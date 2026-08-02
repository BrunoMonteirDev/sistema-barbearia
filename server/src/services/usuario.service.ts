import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'

export const usuarioService = {
  async listar() {
    return prisma.usuario.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' }
    })
  },

  async buscarPorEmail(email: string) {
    return prisma.usuario.findUnique({ where: { email } })
  },

  async buscarPorId(id: string) {
    return prisma.usuario.findUnique({ where: { id } })
  },

  async criar(dados: {
    nome: string
    email: string
    telefone?: string | null
    senha?: string
    nivel?: string
    ativo?: boolean
    dataNascimento?: Date | null
  }) {
    const senhaHash = dados.senha ? await bcrypt.hash(dados.senha, 10) : null

    return prisma.usuario.create({
      data: {
        nome: dados.nome,
        email: dados.email,
        telefone: dados.telefone ?? null,
        senhaHash,
        nivel: dados.nivel ?? 'Cliente',
        ativo: dados.ativo ?? true,
        dataNascimento: dados.dataNascimento ?? null
      }
    })
  },

  async atualizar(id: string, dados: Record<string, unknown>) {
    const { senha, ...dadosUsuario } = dados
    const senhaHash = typeof senha === 'string' && senha ? await bcrypt.hash(senha, 10) : undefined
    return prisma.usuario.update({
      where: { id },
      data: { ...dadosUsuario, ...(senhaHash ? { senhaHash } : {}) }
    })
  },

  async atualizarPerfil(id: string, dados: { nome?: string; telefone?: string; dataNascimento?: string | null }) {
    return prisma.usuario.update({
      where: { id },
      data: {
        nome: dados.nome,
        telefone: dados.telefone,
        dataNascimento: dados.dataNascimento ? new Date(dados.dataNascimento) : null
      }
    })
  },

  async remover(id: string) {
    return prisma.usuario.update({
      where: { id },
      data: { ativo: false }
    })
  }
}
