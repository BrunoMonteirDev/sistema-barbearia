import { prisma } from "../lib/prisma.js";
export class NotificacaoRepository {
  listarAgendamentosParaLembrete(datas) {
    return prisma.agendamento.findMany({
      where: {
        data: { in: datas },
        status: { in: ["PENDENTE", "CONFIRMADO"] },
      },
    });
  }
  buscarLembreteEnviado(agendamentoId) {
    return prisma.notificacaoAgendamento.findFirst({
      where: { agendamentoId, tipo: "LEMBRETE", status: "ENVIADA" },
    });
  }
  buscarAgendamentoComUsuario(agendamentoId) {
    return prisma.agendamento.findUnique({
      where: { id: agendamentoId },
      include: { usuario: true },
    });
  }
  buscarAgendamentoParaMensagem(agendamentoId) {
    return prisma.agendamento.findUnique({
      where: { id: agendamentoId },
      include: { usuario: true, profissional: true, servico: true },
    });
  }
  registrar(data) {
    return prisma.notificacaoAgendamento.create({ data });
  }
}
