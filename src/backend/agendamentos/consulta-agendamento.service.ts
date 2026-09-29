import { AgendamentoRepository } from './agendamento.repository'
import { atualizarAtrasados } from './regras-agendamento.service'
import { ValidacaoAgendamentoError } from './validacao-agendamento.service'

export type AutorAgendamento = { sub: string; nivel: string }

const repository = new AgendamentoRepository()

export async function listarAgendamentos(autor: AutorAgendamento) {
  await atualizarAtrasados()
  return repository.listar(autor.nivel === 'Administrador' ? undefined : autor.sub)
}

export async function buscarAgendamento(id: string) {
  const agendamento = await repository.buscarPorId(id)
  if (!agendamento) throw new ValidacaoAgendamentoError('naoEncontrado', 'Agendamento não encontrado.')
  return agendamento
}

export function validarAcessoAgendamento(
  agendamento: { usuarioId: string },
  autor: AutorAgendamento,
  mensagem = 'Sem permissão.',
) {
  if (autor.nivel !== 'Administrador' && agendamento.usuarioId !== autor.sub) {
    throw new ValidacaoAgendamentoError('semPermissao', mensagem)
  }
}

export async function consultarHistoricoAgendamento(id: string, autor: AutorAgendamento) {
  const agendamento = await buscarAgendamento(id)
  validarAcessoAgendamento(agendamento, autor)
  return repository.buscarHistorico(agendamento.id)
}
