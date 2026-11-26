/** Papel do módulo: Implementa cancelamento, mudança de status, regras de acesso e gravação do histórico de alterações. */
import { AgendamentoRepository } from "./agendamento.repository.js";
import { buscarAgendamento, validarAcessoAgendamento } from "./consulta-agendamento.service.js";
import { regrasAgendamento, respeitaAntecedencia } from "./regras-agendamento.service.js";
import { ValidacaoAgendamentoError } from "./validacao-agendamento.service.js";

const repository = new AgendamentoRepository();

export async function cancelarAgendamento(agendamento, autorId) {
  const atualizado = await repository.atualizar(agendamento.id, { status: "CANCELADO" });
  await repository.registrarHistorico({
    agendamentoId: agendamento.id,
    autorId,
    tipo: "CANCELAMENTO",
    dadosAnteriores: { status: agendamento.status },
    dadosNovos: { status: "CANCELADO" },
  });
  return atualizado;
}

export async function atualizarStatusAgendamento(agendamento, status, autorId) {
  if (status === "CANCELADO") {
    throw new ValidacaoAgendamentoError(
      "dadosInvalidos",
      "Use a ação de cancelamento para cancelar este agendamento.",
    );
  }
  if (agendamento.status === "CANCELADO") {
    throw new ValidacaoAgendamentoError(
      "dadosInvalidos",
      "Agendamentos cancelados não podem ser reativados. Crie um novo agendamento.",
    );
  }
  const atualizado = await repository.atualizar(agendamento.id, { status });
  await repository.registrarHistorico({
    agendamentoId: agendamento.id,
    autorId,
    tipo: "ATUALIZACAO_STATUS",
    dadosAnteriores: { status: agendamento.status },
    dadosNovos: { status },
  });
  return atualizado;
}

export async function prepararCancelamento(id, autor) {
  const agendamento = await buscarAgendamento(id);
  validarAcessoAgendamento(agendamento, autor, "Sem permissão para cancelar este agendamento.");
  if (agendamento.status === "CANCELADO") {
    throw new ValidacaoAgendamentoError("dadosInvalidos", "Este agendamento já está cancelado.");
  }
  if (autor.nivel === "Administrador") return agendamento;

  const regras = await regrasAgendamento();
  if (!respeitaAntecedencia(agendamento.data, agendamento.hora, regras.antecedenciaCancelamentoHoras)) {
    throw new ValidacaoAgendamentoError(
      "dadosInvalidos",
      `Cancelamento permitido com pelo menos ${regras.antecedenciaCancelamentoHoras} horas de antecedência.`,
    );
  }
  return agendamento;
}
