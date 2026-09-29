import { AgendamentoRepository } from './agendamento.repository'
import { buscarAgendamento, validarAcessoAgendamento, type AutorAgendamento } from './consulta-agendamento.service'
import { regrasAgendamento, respeitaAntecedencia } from './regras-agendamento.service'
import { isValidDate, isValidTime, isValidStatus, validarHorarioFuturo, ValidacaoAgendamentoError } from './validacao-agendamento.service'

import { executarComLockAgenda, HorarioIndisponivelError } from './bloqueio-agenda.service'
import { validarDisponibilidade } from './horarios.service'

const repository = new AgendamentoRepository()

type AgendamentoExistente = {
  id: string
  usuarioId: string
  profissionalId: string
  servicoId: string
  data: string
  hora: string
  status: string
  observacao?: string | null
}

export async function cancelarAgendamento(agendamento: AgendamentoExistente, autorId: string) {
  const atualizado = await repository.atualizar(agendamento.id, { status: 'CANCELADO' })
  await repository.registrarHistorico({
    agendamentoId: agendamento.id,
    autorId,
    tipo: 'CANCELAMENTO',
    dadosAnteriores: { status: agendamento.status },
    dadosNovos: { status: 'CANCELADO' },
  })
  return atualizado
}

export async function remarcarAgendamento(
  agendamento: AgendamentoExistente,
  dados: { data: string; hora: string; profissionalId: string; servicoId: string },
  autorId: string,
) {
  const atualizado = await executarComLockAgenda(dados.profissionalId, dados.data, async transacao => {
    const disponivel = await validarDisponibilidade(
      dados.profissionalId,
      dados.servicoId,
      dados.data,
      dados.hora,
      agendamento.id,
      transacao,
    )
    if (!disponivel) throw new HorarioIndisponivelError()

    return new AgendamentoRepository(transacao).atualizar(agendamento.id, dados)
  })

  await repository.registrarHistorico({
    agendamentoId: agendamento.id,
    autorId,
    tipo: 'REMARCACAO',
    dadosAnteriores: {
      data: agendamento.data,
      hora: agendamento.hora,
      profissionalId: agendamento.profissionalId,
      servicoId: agendamento.servicoId,
    },
    dadosNovos: dados,
  })
  return atualizado
}

export async function atualizarStatusAgendamento(agendamento: AgendamentoExistente, status: string, autorId: string) {
  const atualizado = await repository.atualizar(agendamento.id, { status })
  await repository.registrarHistorico({
    agendamentoId: agendamento.id,
    autorId,
    tipo: 'ATUALIZACAO_STATUS',
    dadosAnteriores: { status: agendamento.status },
    dadosNovos: { status },
  })
  return atualizado
}

type DadosAlteracaoAgendamento = {
  data?: string
  hora?: string
  profissionalId?: string
  servicoId?: string
  status?: string
  observacao?: string | null
}

async function verificarProfissionalEServico(profissionalId: string, servicoId: string) {
  const [profissional, servico] = await Promise.all([
    repository.buscarProfissionalAtivo(profissionalId),
    repository.buscarServicoAtivo(servicoId),
  ])
  return Boolean(profissional && servico)
}

export async function prepararCancelamento(id: string, autor: AutorAgendamento) {
  const agendamento = await buscarAgendamento(id)
  validarAcessoAgendamento(agendamento, autor, 'Sem permissão para cancelar este agendamento.')
  if (autor.nivel !== 'Administrador') {
    const regras = await regrasAgendamento()
    if (!respeitaAntecedencia(agendamento.data, agendamento.hora, regras.antecedenciaCancelamentoHoras)) {
      throw new ValidacaoAgendamentoError('dadosInvalidos', `Cancelamento permitido com pelo menos ${regras.antecedenciaCancelamentoHoras} horas de antecedência.`)
    }
  }
  return agendamento
}

export async function prepararRemarcacao(id: string, corpo: DadosAlteracaoAgendamento, autor: AutorAgendamento) {
  const agendamento = await buscarAgendamento(id)
  validarAcessoAgendamento(agendamento, autor)
  if (autor.nivel !== 'Administrador') {
    const regras = await regrasAgendamento()
    if (!respeitaAntecedencia(agendamento.data, agendamento.hora, regras.antecedenciaRemarcacaoHoras)) {
      throw new ValidacaoAgendamentoError('dadosInvalidos', `Remarcação permitida com pelo menos ${regras.antecedenciaRemarcacaoHoras} horas de antecedência.`)
    }
  }
  const { data, hora } = corpo
  const profissionalId = typeof corpo.profissionalId === 'string' ? corpo.profissionalId : agendamento.profissionalId
  const servicoId = typeof corpo.servicoId === 'string' ? corpo.servicoId : agendamento.servicoId
  if (!isValidDate(data) || !isValidTime(hora) || !(await verificarProfissionalEServico(profissionalId, servicoId))) {
    throw new ValidacaoAgendamentoError('dadosInvalidos', 'Dados da remarcação inválidos.')
  }
  validarHorarioFuturo(data, hora)
  return { agendamento, dados: { data, hora, profissionalId, servicoId } }
}

export async function prepararAtualizacaoAdministrativa(id: string, corpo: DadosAlteracaoAgendamento) {
  const agendamento = await buscarAgendamento(id)
  if (
    (corpo.data !== undefined && !isValidDate(corpo.data)) ||
    (corpo.hora !== undefined && !isValidTime(corpo.hora)) ||
    (corpo.status !== undefined && !isValidStatus(corpo.status))
  ) {
    throw new ValidacaoAgendamentoError('dadosInvalidos', 'Dados de agendamento inválidos.')
  }
  const data = corpo.data ?? agendamento.data
  const hora = corpo.hora ?? agendamento.hora
  const profissionalId = corpo.profissionalId ?? agendamento.profissionalId
  const servicoId = corpo.servicoId ?? agendamento.servicoId
  if (typeof profissionalId !== 'string' || typeof servicoId !== 'string' || !(await verificarProfissionalEServico(profissionalId, servicoId))) {
    throw new ValidacaoAgendamentoError('dadosInvalidos', 'Profissional ou serviço indisponível.')
  }
  const alteraHorario = (['data', 'hora', 'profissionalId', 'servicoId'] as const).some(campo => corpo[campo] !== undefined)
  if (alteraHorario) validarHorarioFuturo(data, hora)
  const dadosNovos = {
    profissionalId, servicoId, data, hora,
    status: corpo.status ?? agendamento.status,
    observacao: corpo.observacao ?? agendamento.observacao,
  }
  return { agendamento, dadosNovos }
}

export async function atualizarAgendamentoAdministrativamente(
  agendamento: AgendamentoExistente,
  dadosNovos: { profissionalId: string; servicoId: string; data: string; hora: string; status: string; observacao: string | null },
  autorId: string,
) {
  const { profissionalId, servicoId, data, hora } = dadosNovos
  const atualizado = await executarComLockAgenda(profissionalId, data, async tx => {
    if (!(await validarDisponibilidade(profissionalId, servicoId, data, hora, agendamento.id, tx))) throw new HorarioIndisponivelError()
    return new AgendamentoRepository(tx).atualizar(agendamento.id, dadosNovos)
  })
  // Mantém o histórico fora da transação, como no fluxo anterior.
  await repository.registrarHistorico({
    agendamentoId: agendamento.id, autorId, tipo: 'ATUALIZACAO_ADMINISTRATIVA',
    dadosAnteriores: {
      profissionalId: agendamento.profissionalId, servicoId: agendamento.servicoId,
      data: agendamento.data, hora: agendamento.hora, status: agendamento.status,
      observacao: agendamento.observacao,
    },
    dadosNovos,
  })
  return atualizado
}

export async function excluirAgendamento(id: string) {
  const agendamento = await buscarAgendamento(id)
  await repository.remover(agendamento.id)
}
