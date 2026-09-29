import { NotificacaoRepository } from './notificacao.repository'
import { evolutionService } from '../evolution/evolution.service'
import { montarMensagemNotificacao } from './mensagem-notificacao.service'

const notificacaoRepository = new NotificacaoRepository()

export type TipoNotificacao = 'CRIACAO' | 'REMARCACAO' | 'CANCELAMENTO' | 'ATUALIZACAO' | 'PENDENTE' | 'CONFIRMADO' | 'CONCLUIDO' | 'ATRASADO' | 'LEMBRETE'

function numeroWhatsApp(valor: string | null | undefined) {
  const digitos = valor?.replace(/\D/g, '') ?? ''
  if (!digitos) return null
  const numeroComDdi = digitos.startsWith('55') ? digitos : `55${digitos}`
  return `+${numeroComDdi}`
}

export const notificacaoService = {
  async processarLembretes() {
    const regras = await evolutionService.regrasEnvioAutomatico()
    if (!regras.ativo || !regras.regras.lembrete) return
    const agora = Date.now()
    const alvo = agora + regras.regras.antecedenciaLembreteMinutos * 60_000
    const datas = [new Date(alvo - 60_000), new Date(alvo + 60_000)].map(data => data.toLocaleDateString('en-CA'))
    const agendamentos = await notificacaoRepository.listarAgendamentosParaLembrete(datas)
    for (const agendamento of agendamentos) {
      const inicio = new Date(`${agendamento.data}T${agendamento.hora}:00`).getTime()
      if (Math.abs(inicio - alvo) > 60_000) continue
      const jaEnviado = await notificacaoRepository.buscarLembreteEnviado(agendamento.id)
      if (!jaEnviado) await this.enviar(agendamento.id, 'LEMBRETE')
    }
  },
  async enviarSeAutomatico(agendamentoId: string, tipo: TipoNotificacao) {
    const regra = tipo === 'LEMBRETE' ? 'lembrete' : tipo.toLowerCase() as 'criacao' | 'remarcacao' | 'cancelamento' | 'pendente' | 'confirmado' | 'concluido' | 'atrasado' | 'atualizacao'
    if (!(await evolutionService.envioAutomaticoAtivo(regra === 'atualizacao' ? undefined : regra))) return null
    return this.enviar(agendamentoId, tipo)
  },
  async podeEnviar(agendamentoId: string) {
    const agendamento = await notificacaoRepository.buscarAgendamentoComUsuario(agendamentoId)
    if (!agendamento) throw new Error('Agendamento não encontrado.')
    if (!numeroWhatsApp(agendamento.usuario.telefone)) throw new Error('O cliente não possui telefone cadastrado para receber WhatsApp.')
  },
  async enviar(agendamentoId: string, tipo: TipoNotificacao) {
    const agendamento = await notificacaoRepository.buscarAgendamentoParaMensagem(agendamentoId)
    if (!agendamento) return
    const destino = numeroWhatsApp(agendamento.usuario.telefone)
    if (!destino) return notificacaoRepository.registrar({ agendamentoId, tipo, status: 'IGNORADA', erro: 'Cliente sem telefone.' })
    if (!evolutionService.configurada()) return notificacaoRepository.registrar({ agendamentoId, tipo, destino, status: 'PENDENTE_CONFIGURACAO', erro: 'Evolution API não configurada.' })
    try {
      await evolutionService.enviarTexto(destino, await montarMensagemNotificacao(tipo, agendamento))
      return notificacaoRepository.registrar({ agendamentoId, tipo, destino, status: 'ENVIADA' })
    } catch (error) {
      return notificacaoRepository.registrar({ agendamentoId, tipo, destino, status: 'FALHOU', erro: error instanceof Error ? error.message : 'Falha desconhecida.' })
    }
  },
}
