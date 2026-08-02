import { prisma } from '../lib/prisma'
import { evolutionService } from './evolution.service'

export type TipoNotificacao = 'CRIACAO' | 'REMARCACAO' | 'CANCELAMENTO' | 'ATUALIZACAO' | 'PENDENTE' | 'CONFIRMADO' | 'CONCLUIDO' | 'ATRASADO'

function numeroWhatsApp(valor: string | null | undefined) {
  const digitos = valor?.replace(/\D/g, '') ?? ''
  if (!digitos) return null
  const numeroComDdi = digitos.startsWith('55') ? digitos : `55${digitos}`
  return `+${numeroComDdi}`
}

async function mensagem(tipo: TipoNotificacao, agendamento: { data: string; hora: string; usuario: { nome: string }; profissional: { nome: string }; servico: { nome: string } }) {
  const modelos = await evolutionService.obterModelosMensagens()
  const chave = tipo === 'CRIACAO' ? 'criacao' : tipo === 'REMARCACAO' ? 'remarcacao' : tipo === 'CANCELAMENTO' ? 'cancelamento' : tipo === 'PENDENTE' ? 'pendente' : tipo === 'CONFIRMADO' ? 'confirmado' : tipo === 'CONCLUIDO' ? 'concluido' : tipo === 'ATRASADO' ? 'atrasado' : 'atualizacao'
  const modelo = modelos[chave]
  return modelo.replace(/{{cliente}}/g, agendamento.usuario.nome).replace(/{{servico}}/g, agendamento.servico.nome).replace(/{{profissional}}/g, agendamento.profissional.nome).replace(/{{data}}/g, agendamento.data).replace(/{{hora}}/g, agendamento.hora)
}

export const notificacaoService = {
  async podeEnviar(agendamentoId: string) {
    const agendamento = await prisma.agendamento.findUnique({ where: { id: agendamentoId }, include: { usuario: true } })
    if (!agendamento) throw new Error('Agendamento não encontrado.')
    if (!numeroWhatsApp(agendamento.usuario.telefone)) throw new Error('O cliente não possui telefone cadastrado para receber WhatsApp.')
  },
  async enviar(agendamentoId: string, tipo: TipoNotificacao) {
    const agendamento = await prisma.agendamento.findUnique({ where: { id: agendamentoId }, include: { usuario: true, profissional: true, servico: true } })
    if (!agendamento) return
    const destino = numeroWhatsApp(agendamento.usuario.telefone)
    if (!destino) return prisma.notificacaoAgendamento.create({ data: { agendamentoId, tipo, status: 'IGNORADA', erro: 'Cliente sem telefone.' } })
    if (!evolutionService.configurada()) return prisma.notificacaoAgendamento.create({ data: { agendamentoId, tipo, destino, status: 'PENDENTE_CONFIGURACAO', erro: 'Evolution API não configurada.' } })
    try {
      await evolutionService.enviarTexto(destino, await mensagem(tipo, agendamento))
      return prisma.notificacaoAgendamento.create({ data: { agendamentoId, tipo, destino, status: 'ENVIADA' } })
    } catch (error) {
      return prisma.notificacaoAgendamento.create({ data: { agendamentoId, tipo, destino, status: 'FALHOU', erro: error instanceof Error ? error.message : 'Falha desconhecida.' } })
    }
  },
}
