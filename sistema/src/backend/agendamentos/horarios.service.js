/** Papel do módulo: Calcula blocos de 30 minutos, duração dos serviços e sobreposição entre atendimentos. */
import { prisma } from "../lib/prisma.js";
import { DisponibilidadeRepository } from "./disponibilidade.repository.js";
export const BLOCK_MINUTES = 30;

// Durações que não são múltiplas de 30 ocupam o próximo bloco inteiro da agenda.
export function arredondarDuracaoParaBloco(duracao) {
  if (!Number.isFinite(duracao) || duracao <= 0) return BLOCK_MINUTES;
  return Math.ceil(duracao / BLOCK_MINUTES) * BLOCK_MINUTES;
}
function validarBlocoDeHorario(value) {
  if (typeof value !== "string" || !/^\d{2}:\d{2}$/.test(value)) return false;
  const [hour, minute] = value.split(":").map(Number);
  return hour >= 0 && hour <= 23 && (minute === 0 || minute === 30);
}
function converterHorarioParaMinutos(value) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}
function converterMinutosParaHorario(value) {
  const hour = Math.floor(value / 60)
    .toString()
    .padStart(2, "0");
  const minute = (value % 60).toString().padStart(2, "0");
  return `${hour}:${minute}`;
}
function obterDiaDaSemana(data) {
  const [year, month, day] = data.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}
export function calcularBlocosDoServico(hora, duracao) {
  const quantidade = arredondarDuracaoParaBloco(duracao) / BLOCK_MINUTES;
  const inicio = converterHorarioParaMinutos(hora);
  return Array.from({ length: quantidade }, (_, index) =>
    converterMinutosParaHorario(inicio + index * BLOCK_MINUTES),
  );
}
export function temBlocosConsecutivos(disponiveis, inicio, duracao) {
  const set = new Set(disponiveis);
  return calcularBlocosDoServico(inicio, duracao).every((bloco) =>
    set.has(bloco),
  );
}
export function temConflito(inicioA, duracaoA, inicioB, duracaoB) {
  // Há conflito quando os intervalos se cruzam, mesmo que os horários de início sejam diferentes.
  const aInicio = converterHorarioParaMinutos(inicioA);
  const aFim = aInicio + arredondarDuracaoParaBloco(duracaoA);
  const bInicio = converterHorarioParaMinutos(inicioB);
  const bFim = bInicio + arredondarDuracaoParaBloco(duracaoB);
  return aInicio < bFim && bInicio < aFim;
}
/** Calcula os in?cios dispon?veis considerando a dura??o do servi?o e os agendamentos ativos. */
export async function listarHorariosDisponiveis(
  profissionalId,
  servicoId,
  data,
  db = prisma,
) {
  const repository = new DisponibilidadeRepository(db);
  if (await repository.buscarBloqueioData(data)) return [];
  const servico = await repository.buscarServicoAtivo(servicoId);
  if (!servico) return [];
  const diaSemana = obterDiaDaSemana(data);
  const disponibilidade = await repository.listarHorariosDoDia(
    profissionalId,
    diaSemana,
  );
  const blocosConfigurados = disponibilidade.map((item) => item.hora);
  const agendamentos = await repository.listarAgendamentosDoDia(
    profissionalId,
    data,
  );
  return blocosConfigurados.filter((hora) => {
    if (!temBlocosConsecutivos(blocosConfigurados, hora, servico.duracao))
      return false;
    return !agendamentos.some((agendamento) =>
      temConflito(
        hora,
        servico.duracao,
        agendamento.hora,
        agendamento.servico.duracao,
      ),
    );
  });
}
export async function validarDisponibilidade(
  profissionalId,
  servicoId,
  data,
  hora,
  db = prisma,
) {
  const horarios = await listarHorariosDisponiveis(
    profissionalId,
    servicoId,
    data,
    db,
  );
  return horarios.includes(hora);
}
export async function escolherPrimeiroProfissionalDisponivel(
  servicoId,
  data,
  hora,
) {
  const repository = new DisponibilidadeRepository();
  const profissionais = await repository.listarProfissionaisAtivos();
  for (const profissional of profissionais) {
    if (await validarDisponibilidade(profissional.id, servicoId, data, hora))
      return profissional.id;
  }
  return null;
}
/** Retorna somente os inícios de blocos configurados por profissionais ativos. */
export async function listarBlocosConfiguradosParaData(data) {
  const repository = new DisponibilidadeRepository();
  const disponibilidade = await repository.listarBlocosConfigurados(
    obterDiaDaSemana(data),
  );
  return disponibilidade.map((item) => item.hora);
}
// Nome público utilizado pelos serviços de validação e pelos testes existentes.
export const isValidBlock = validarBlocoDeHorario;
