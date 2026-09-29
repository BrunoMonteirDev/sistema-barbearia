import type { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'

export class UsuarioRepository {
  listarAtivos() {
    return prisma.usuario.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' }
    })
  }

  buscarPorEmail(email: string) {
    return prisma.usuario.findUnique({ where: { email } })
  }

  buscarPorGoogleSubject(googleSubject: string) {
    return prisma.usuario.findUnique({ where: { googleSubject } })
  }

  buscarPorId(id: string) {
    return prisma.usuario.findUnique({ where: { id } })
  }

  criar(dados: Prisma.UsuarioCreateInput) {
    return prisma.usuario.create({ data: dados })
  }

  atualizar(id: string, dados: Prisma.UsuarioUpdateInput) {
    return prisma.usuario.update({ where: { id }, data: dados })
  }

  desativar(id: string) {
    return prisma.usuario.update({ where: { id }, data: { ativo: false } })
  }
}
