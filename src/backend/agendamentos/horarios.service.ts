import { prisma } from '../lib/prisma'
import { DisponibilidadeRepository, type AgendaDbClient } from './disponibilidade.repository'

export const BLOCK_MINUTES = 30

export function arredondarDuracaoParaBloco(duracao: number) {
  if (!Number.isFinite(duracao) || duracao <= 0) return BLOCK_MINUTES
  return Math.ceil(duracao / BLOCK_MINUTES) * BLOCK_MINUTES
}

function validarBlocoDeHorario(value: unknown) {
  if (typeof value !== 'string' || !/^\d{2}:\d{2}$/.test(value)) return false
  const [hour, minute] = value.split(':').map(Number)
  return hour >= 0 && hour <= 23 && (minute === 0 || minute === 30)
}

function converterHorarioParaMinutos(value: string) {
  const [hour, minute] = value.split(':').map(Number)
  return hour * 60 + minute
}

function converterMinutosParaHorario(value: number) {
  const hour = Math.floor(value / 60).toString().padStart(2, '0')
  const minute = (value % 60).toString().padStart(2, '0')
  return `${hour}:${minute}`
}

function obterDiaDaSemana(data: string) {
  const [year, month, day] = data.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay()
}

export function calcularBlocosDoServico(hora: string, duracao: number) {
  const quantidade = arredondarDuracaoParaBloco(duracao) / BLOCK_MINUTES
  const inicio = converterHorarioParaMinutos(hora)
  return Array.from({ length: quantidade }, (_, index) => converterMinutosParaHorario(inicio + index * BLOCK_MINUTES))
}

export function temBlocosConsecutivos(disponiveis: string[], inicio: string, duracao: number) {
  const set = new Set(disponiveis)
  return calcularBlocosDoServico(inicio, duracao).every(bloco => set.has(bloco))
}

export function temConflito(inicioA: string, duracaoA: number, inicioB: string, duracaoB: number) {
  const aInicio = converterHorarioParaMinutos(inicioA)
  const aFim = aInicio + arredondarDuracaoParaBloco(duracaoA)
  const bInicio = converterHorarioParaMinutos(inicioB)
  const bFim = bInicio + arredondarDuracaoParaBloco(duracaoB)
  return aInicio < bFim && bInicio < aFim
}

/**
 * Calcula os horários em que um serviço cabe integralmente na jornada do profissional.
 * Reservas canceladas não bloqueiam o horário; na remarcação, o próprio agendamento pode
 * ser ignorado para não gerar conflito consigo mesmo.
 */
export async function listarHorariosDisponiveis(profissionalId: string, servicoId: string, data: string, ignorarAgendamentoId?: string, db: AgendaDbClient = prisma) {
  const repository = new DisponibilidadeRepository(db)
  const servico = await repository.buscarServicoAtivo(servicoId)
  if (!servico) return []

  const diaSemana = obterDiaDaSemana(data)
  const disponibilidade = await repository.listarHorariosDoDia(profissionalId, diaSemana)
  const blocosConfigurados = disponibilidade.map(item => item.hora)

  const agendamentos = await repository.listarAgendamentosDoDia(profissionalId, data, ignorarAgendamentoId)

  return blocosConfigurados.filter(hora => {
    if (!temBlocosConsecutivos(blocosConfigurados, hora, servico.duracao)) return false
    return !agendamentos.some(agendamento => temConflito(hora, servico.duracao, agendamento.hora, agendamento.servico.duracao))
  })
}

export async function validarDisponibilidade(profissionalId: string, servicoId: string, data: string, hora: string, ignorarAgendamentoId?: string, db: AgendaDbClient = prisma) {
  const horarios = await listarHorariosDisponiveis(profissionalId, servicoId, data, ignorarAgendamentoId, db)
  return horarios.includes(hora)
}

export async function escolherPrimeiroProfissionalDisponivel(servicoId: string, data: string, hora: string) {
  const repository = new DisponibilidadeRepository()
  const profissionais = await repository.listarProfissionaisAtivos()
  for (const profissional of profissionais) {
    if (await validarDisponibilidade(profissional.id, servicoId, data, hora)) return profissional.id
  }
  return null
}

/** Retorna somente os inícios de blocos configurados por profissionais ativos. */
export async function listarBlocosConfiguradosParaData(data: string) {
  const repository = new DisponibilidadeRepository()
  const disponibilidade = await repository.listarBlocosConfigurados(obterDiaDaSemana(data))
  return disponibilidade.map(item => item.hora)
}

// Nome público utilizado pelos serviços de validação e pelos testes existentes.
export const isValidBlock = validarBlocoDeHorario
