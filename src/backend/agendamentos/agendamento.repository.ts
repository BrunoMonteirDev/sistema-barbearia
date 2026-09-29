import type { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'

export class AgendamentoRepository {
  constructor(private readonly banco: Prisma.TransactionClient = prisma) {}

  listar(usuarioId?: string) {
    return this.banco.agendamento.findMany({
      where: usuarioId === undefined ? undefined : { usuarioId },
      include: { usuario: true, profissional: true, servico: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  buscarPorId(id: string) {
    return this.banco.agendamento.findUnique({ where: { id } })
  }

  buscarProfissionalAtivo(id: string) {
    return this.banco.profissional.findFirst({ where: { id, ativo: true } })
  }

  buscarServicoAtivo(id: string) {
    return this.banco.servico.findFirst({ where: { id, ativo: true } })
  }

  buscarUsuarioAtivo(id: string) {
    return this.banco.usuario.findFirst({ where: { id, ativo: true } })
  }

  criar(data: Prisma.AgendamentoUncheckedCreateInput) {
    return this.banco.agendamento.create({ data })
  }

  atualizar(id: string, data: Prisma.AgendamentoUncheckedUpdateInput) {
    return this.banco.agendamento.update({ where: { id }, data })
  }

  remover(id: string) {
    return this.banco.agendamento.delete({ where: { id } })
  }

  registrarHistorico(data: Prisma.HistoricoAgendamentoUncheckedCreateInput) {
    return this.banco.historicoAgendamento.create({ data })
  }

  buscarHistorico(agendamentoId: string) {
    return this.banco.historicoAgendamento.findMany({
      where: { agendamentoId },
      orderBy: { createdAt: 'desc' },
    })
  }
}
