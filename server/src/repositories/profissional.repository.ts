import { prisma } from '../lib/prisma'

export type DadosProfissional = {
  nome: string
  telefone: string | null
  email: string | null
  ativo: boolean
}

export type BlocoDisponibilidadeProfissional = {
  profissionalId: string
  diaSemana: number
  hora: string
}

export class ProfissionalRepository {
  listarAtivos() {
    return prisma.profissional.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' } })
  }

  listarTodos() {
    return prisma.profissional.findMany({ orderBy: { nome: 'asc' } })
  }

  buscarPorId(id: string) {
    return prisma.profissional.findUnique({ where: { id } })
  }

  criar(dados: DadosProfissional) {
    return prisma.profissional.create({ data: dados })
  }

  atualizar(id: string, dados: DadosProfissional) {
    return prisma.profissional.update({ where: { id }, data: dados })
  }

  desativar(id: string) {
    return prisma.profissional.update({ where: { id }, data: { ativo: false } })
  }

  listarDisponibilidade(profissionalId: string) {
    return prisma.disponibilidadeProfissional.findMany({
      where: { profissionalId },
      orderBy: [{ diaSemana: 'asc' }, { hora: 'asc' }],
    })
  }

  substituirDisponibilidade(profissionalId: string, blocos: BlocoDisponibilidadeProfissional[]) {
    return prisma.$transaction([
      prisma.disponibilidadeProfissional.deleteMany({ where: { profissionalId } }),
      ...(blocos.length ? [prisma.disponibilidadeProfissional.createMany({ data: blocos })] : []),
    ])
  }
}
