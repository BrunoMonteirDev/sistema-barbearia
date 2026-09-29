import { AgendamentoRepository } from "./agendamento.repository.js";
import { atualizarAtrasados } from "./regras-agendamento.service.js";
import { ValidacaoAgendamentoError } from "./validacao-agendamento.service.js";
const repository = new AgendamentoRepository();
export async function listarAgendamentos(autor) {
  await atualizarAtrasados();
  return repository.listar(
    autor.nivel === "Administrador" ? undefined : autor.sub,
  );
}
export async function buscarAgendamento(id) {
  const agendamento = await repository.buscarPorId(id);
  if (!agendamento)
    throw new ValidacaoAgendamentoError(
      "naoEncontrado",
      "Agendamento não encontrado.",
    );
  return agendamento;
}
export function validarAcessoAgendamento(
  agendamento,
  autor,
  mensagem = "Sem permissão.",
) {
  if (autor.nivel !== "Administrador" && agendamento.usuarioId !== autor.sub) {
    throw new ValidacaoAgendamentoError("semPermissao", mensagem);
  }
}
export async function consultarHistoricoAgendamento(id, autor) {
  const agendamento = await buscarAgendamento(id);
  validarAcessoAgendamento(agendamento, autor);
  return repository.buscarHistorico(agendamento.id);
}
