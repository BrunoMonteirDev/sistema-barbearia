import type { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'

export type AgendaDbClient = Prisma.TransactionClient | typeof prisma

export class DisponibilidadeRepository {
  constructor(private readonly db: AgendaDbClient = prisma) {}

  buscarServicoAtivo(servicoId: string) {
    return this.db.servico.findFirst({ where: { id: servicoId, ativo: true } })
  }

  listarHorariosDoDia(profissionalId: string, diaSemana: number) {
    return this.db.disponibilidadeProfissional.findMany({
      where: { profissionalId, diaSemana },
      orderBy: { hora: 'asc' },
    })
  }

  listarAgendamentosDoDia(profissionalId: string, data: string, ignorarAgendamentoId?: string) {
    return this.db.agendamento.findMany({
      where: {
        profissionalId,
        data,
        status: { not: 'CANCELADO' },
        ...(ignorarAgendamentoId ? { id: { not: ignorarAgendamentoId } } : {}),
      },
      include: { servico: true },
    })
  }

  listarProfissionaisAtivos() {
    return this.db.profissional.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' } })
  }

  listarBlocosConfigurados(diaSemana: number) {
    return this.db.disponibilidadeProfissional.findMany({
      where: { diaSemana, profissional: { ativo: true } },
      select: { hora: true },
      distinct: ['hora'],
      orderBy: { hora: 'asc' },
    })
  }

  buscarAgendamentoPorId(id: string) {
    return this.db.agendamento.findUnique({ where: { id } })
  }
}
