import { prisma } from "../lib/prisma.js";
export class DisponibilidadeRepository {
  db;
  constructor(db = prisma) {
    this.db = db;
  }
  buscarServicoAtivo(servicoId) {
    return this.db.servico.findFirst({ where: { id: servicoId, ativo: true } });
  }
  listarHorariosDoDia(profissionalId, diaSemana) {
    return this.db.disponibilidadeProfissional.findMany({
      where: { profissionalId, diaSemana },
      orderBy: { hora: "asc" },
    });
  }
  listarAgendamentosDoDia(profissionalId, data, ignorarAgendamentoId) {
    return this.db.agendamento.findMany({
      where: {
        profissionalId,
        data,
        status: { not: "CANCELADO" },
        ...(ignorarAgendamentoId ? { id: { not: ignorarAgendamentoId } } : {}),
      },
      include: { servico: true },
    });
  }
  listarProfissionaisAtivos() {
    return this.db.profissional.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
    });
  }
  listarBlocosConfigurados(diaSemana) {
    return this.db.disponibilidadeProfissional.findMany({
      where: { diaSemana, profissional: { ativo: true } },
      select: { hora: true },
      distinct: ["hora"],
      orderBy: { hora: "asc" },
    });
  }
  buscarAgendamentoPorId(id) {
    return this.db.agendamento.findUnique({ where: { id } });
  }
}
