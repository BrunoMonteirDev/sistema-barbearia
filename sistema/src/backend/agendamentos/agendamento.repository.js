/** Papel do módulo: Centraliza as consultas e gravações de agendamentos e do histórico usando o Prisma. */
import { prisma } from "../lib/prisma.js";
import { usuarioPublicoSelect } from "../usuarios/usuario.dto.js";
export class AgendamentoRepository {
  banco;
  constructor(banco = prisma) {
    this.banco = banco;
  }
  listar(usuarioId) {
    return this.banco.agendamento.findMany({
      where: usuarioId === undefined ? undefined : { usuarioId },
      include: {
        usuario: { select: usuarioPublicoSelect },
        profissional: true,
        servico: true,
      },
      // A listagem geral fica em ordem cronológica pelo dia e pelo horário do atendimento.
      orderBy: [{ data: "asc" }, { hora: "asc" }],
    });
  }
  buscarPorId(id) {
    return this.banco.agendamento.findUnique({ where: { id } });
  }
  buscarProfissionalAtivo(id) {
    return this.banco.profissional.findFirst({ where: { id, ativo: true } });
  }
  buscarServicoAtivo(id) {
    return this.banco.servico.findFirst({ where: { id, ativo: true } });
  }
  buscarUsuarioAtivo(id) {
    return this.banco.usuario.findFirst({ where: { id, ativo: true } });
  }
  criar(data) {
    return this.banco.agendamento.create({ data });
  }
  atualizar(id, data) {
    return this.banco.agendamento.update({ where: { id }, data });
  }
  registrarHistorico(data) {
    return this.banco.historicoAgendamento.create({ data });
  }
  buscarHistorico(agendamentoId) {
    return this.banco.historicoAgendamento.findMany({
      where: { agendamentoId },
      orderBy: { createdAt: "desc" },
    });
  }
}
