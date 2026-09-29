import { prisma } from "../lib/prisma.js";
export class AgendamentoRepository {
  banco;
  constructor(banco = prisma) {
    this.banco = banco;
  }
  listar(usuarioId) {
    return this.banco.agendamento.findMany({
      where: usuarioId === undefined ? undefined : { usuarioId },
      include: { usuario: true, profissional: true, servico: true },
      orderBy: { createdAt: "desc" },
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
  remover(id) {
    return this.banco.agendamento.delete({ where: { id } });
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
