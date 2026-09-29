import { isValidBlock } from "./horarios.service.js";
import { horarioAgendamentoJaPassou } from "./regras-agendamento.service.js";
const appointmentStatuses = [
  "PENDENTE",
  "CONFIRMADO",
  "CONCLUIDO",
  "CANCELADO",
  "ATRASADO",
];
const horarioPassadoError =
  "Este horário acabou de iniciar ou já passou. Escolha outro horário disponível.";
export function isValidDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}
export function isValidTime(value) {
  return isValidBlock(value);
}
export function isValidStatus(value) {
  return typeof value === "string" && appointmentStatuses.includes(value);
}
export class ValidacaoAgendamentoError extends Error {
  motivo;
  constructor(motivo, mensagem) {
    super(mensagem);
    this.motivo = motivo;
  }
}
export function validarHorarioFuturo(data, hora) {
  if (horarioAgendamentoJaPassou(data, hora)) {
    throw new ValidacaoAgendamentoError("horarioPassado", horarioPassadoError);
  }
}
export function validarDadosCriacao(dados) {
  const { profissionalId, servicoId, data, hora } = dados;
  if (
    (profissionalId !== "sem-preferencia" &&
      typeof profissionalId !== "string") ||
    typeof servicoId !== "string" ||
    !isValidDate(data) ||
    !isValidTime(hora)
  ) {
    throw new ValidacaoAgendamentoError(
      "dadosInvalidos",
      "Profissional, serviço, data e hora em blocos de 30 minutos são obrigatórios.",
    );
  }
  validarHorarioFuturo(data, hora);
}
export function validarStatus(status) {
  if (!isValidStatus(status))
    throw new ValidacaoAgendamentoError("dadosInvalidos", "Status inválido.");
}
