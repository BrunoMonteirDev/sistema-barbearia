import { isValidBlock } from './horarios.service'
import { horarioAgendamentoJaPassou } from './regras-agendamento.service'

const appointmentStatuses = [
  "PENDENTE",
  "CONFIRMADO",
  "CONCLUIDO",
  "CANCELADO",
  "ATRASADO",
];
const horarioPassadoError = "Este horário acabou de iniciar ou já passou. Escolha outro horário disponível.";
export function isValidDate(value: unknown): value is string {
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

export function isValidTime(value: unknown): value is string {
  return isValidBlock(value);
}

export function isValidStatus(value: unknown) {
  return typeof value === "string" && appointmentStatuses.includes(value);
}


export class ValidacaoAgendamentoError extends Error {
  constructor(
    public readonly motivo: 'dadosInvalidos' | 'naoEncontrado' | 'semPermissao' | 'horarioPassado',
    mensagem: string,
  ) {
    super(mensagem)
  }
}

export function validarHorarioFuturo(data: string, hora: string) {
  if (horarioAgendamentoJaPassou(data, hora)) {
    throw new ValidacaoAgendamentoError('horarioPassado', horarioPassadoError)
  }
}

export function validarDadosCriacao(dados: { profissionalId: string; servicoId: string; data: string; hora: string }) {
  const { profissionalId, servicoId, data, hora } = dados
  if (
    (profissionalId !== 'sem-preferencia' && typeof profissionalId !== 'string') ||
    typeof servicoId !== 'string' || !isValidDate(data) || !isValidTime(hora)
  ) {
    throw new ValidacaoAgendamentoError('dadosInvalidos', 'Profissional, serviço, data e hora em blocos de 30 minutos são obrigatórios.')
  }
  validarHorarioFuturo(data, hora)
}

export function validarStatus(status: unknown) {
  if (!isValidStatus(status)) throw new ValidacaoAgendamentoError('dadosInvalidos', 'Status inválido.')
}
