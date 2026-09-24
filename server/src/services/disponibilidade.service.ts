import { DisponibilidadeRepository } from '../repositories/disponibilidade.repository'
import {
  escolherPrimeiroProfissionalDisponivel,
  listarBlocosConfiguradosParaData,
  listarHorariosDisponiveis,
} from './horarios.service'
import {
  horarioAgendamentoJaPassou,
  regrasAgendamento,
  respeitaAntecedenciaMinimaAgendamento,
} from './regras-agendamento.service'

export class ParametrosDisponibilidadeInvalidosError extends Error {}
export class AutenticacaoDisponibilidadeObrigatoriaError extends Error {}
export class ConsultaDisponibilidadeProibidaError extends Error {}

type UsuarioConsulta = { sub: string; nivel: string }

function dataValida(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
}

export class DisponibilidadeService {
  constructor(private readonly disponibilidadeRepository: DisponibilidadeRepository) {}

  async consultar(
    profissionalId: unknown,
    servicoId: unknown,
    data: unknown,
    ignorarAgendamentoId: unknown,
    usuario?: UsuarioConsulta,
  ) {
    if (typeof profissionalId !== 'string' || typeof servicoId !== 'string' || !dataValida(data)) {
      throw new ParametrosDisponibilidadeInvalidosError('Profissional, serviço e data válidos são obrigatórios.')
    }

    const regras = await regrasAgendamento()
    const horarioPermitido = (hora: string) =>
      !horarioAgendamentoJaPassou(data, hora) &&
      respeitaAntecedenciaMinimaAgendamento(data, hora, regras.antecedenciaAgendamentoMinutos)

    if (profissionalId === 'sem-preferencia') {
      const horarios: string[] = []
      for (const hora of await listarBlocosConfiguradosParaData(data)) {
        if (!horarioPermitido(hora)) continue
        if (await escolherPrimeiroProfissionalDisponivel(servicoId, data, hora)) {
          horarios.push(hora)
        }
      }
      return { horarios }
    }

    let agendamentoIgnorado: string | undefined
    if (typeof ignorarAgendamentoId === 'string') {
      if (!usuario) {
        throw new AutenticacaoDisponibilidadeObrigatoriaError('Autenticação obrigatória para remarcar um agendamento.')
      }
      const agendamento = await this.disponibilidadeRepository.buscarAgendamentoPorId(ignorarAgendamentoId)
      if (!agendamento || (usuario.nivel !== 'Administrador' && agendamento.usuarioId !== usuario.sub)) {
        throw new ConsultaDisponibilidadeProibidaError('Sem permissão para remarcar este agendamento.')
      }
      agendamentoIgnorado = agendamento.id
    }
    const horarios = await listarHorariosDisponiveis(profissionalId, servicoId, data, agendamentoIgnorado)
    return { horarios: horarios.filter(horarioPermitido) }
  }
}
