import type { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'

export class NotificacaoRepository {
  listarAgendamentosParaLembrete(datas: string[]) {
    return prisma.agendamento.findMany({
      where: { data: { in: datas }, status: { in: ['PENDENTE', 'CONFIRMADO'] } },
    })
  }

  buscarLembreteEnviado(agendamentoId: string) {
    return prisma.notificacaoAgendamento.findFirst({
      where: { agendamentoId, tipo: 'LEMBRETE', status: 'ENVIADA' },
    })
  }

  buscarAgendamentoComUsuario(agendamentoId: string) {
    return prisma.agendamento.findUnique({
      where: { id: agendamentoId },
      include: { usuario: true },
    })
  }

  buscarAgendamentoParaMensagem(agendamentoId: string) {
    return prisma.agendamento.findUnique({
      where: { id: agendamentoId },
      include: { usuario: true, profissional: true, servico: true },
    })
  }

  registrar(data: Prisma.NotificacaoAgendamentoUncheckedCreateInput) {
    return prisma.notificacaoAgendamento.create({ data })
  }
}
