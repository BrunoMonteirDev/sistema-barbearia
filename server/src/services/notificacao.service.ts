import { prisma } from '../lib/prisma'

type TipoNotificacao = 'CRIACAO' | 'REMARCACAO' | 'CANCELAMENTO'

function numeroWhatsApp(valor: string | null | undefined) {
  const digitos = valor?.replace(/\D/g, '') ?? ''
  return digitos ? (digitos.startsWith('55') ? digitos : `55${digitos}`) : null
}

function mensagem(tipo: TipoNotificacao, agendamento: { data: string; hora: string; profissional: { nome: string }; servico: { nome: string } }) {
  const acao = tipo === 'CRIACAO' ? 'confirmado' : tipo === 'REMARCACAO' ? 'remarcado' : 'cancelado'
  return `Seu agendamento foi ${acao}: ${agendamento.servico.nome} com ${agendamento.profissional.nome}, em ${agendamento.data} às ${agendamento.hora}.`
}

export const notificacaoService = {
  async enviar(agendamentoId: string, tipo: TipoNotificacao) {
    const agendamento = await prisma.agendamento.findUnique({ where: { id: agendamentoId }, include: { usuario: true, profissional: true, servico: true } })
    if (!agendamento) return
    const destino = numeroWhatsApp(agendamento.usuario.telefone)
    if (!destino) return prisma.notificacaoAgendamento.create({ data: { agendamentoId, tipo, status: 'IGNORADA', erro: 'Cliente sem telefone.' } })
    const url = process.env.QUEPASA_API_URL
    const token = process.env.QUEPASA_API_TOKEN
    if (!url || !token) return prisma.notificacaoAgendamento.create({ data: { agendamentoId, tipo, destino, status: 'PENDENTE_CONFIGURACAO', erro: 'Quepasa não configurado.' } })
    try {
      const resposta = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify({ to: destino, message: mensagem(tipo, agendamento) }) })
      if (!resposta.ok) throw new Error(`Quepasa respondeu ${resposta.status}.`)
      return prisma.notificacaoAgendamento.create({ data: { agendamentoId, tipo, destino, status: 'ENVIADA' } })
    } catch (error) {
      return prisma.notificacaoAgendamento.create({ data: { agendamentoId, tipo, destino, status: 'FALHOU', erro: error instanceof Error ? error.message : 'Falha desconhecida.' } })
    }
  },
}
