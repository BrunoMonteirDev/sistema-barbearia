import { prisma } from '../lib/prisma'

export async function regrasAgendamento() {
  const config = await prisma.configuracao.findFirst()
  return {
    antecedenciaCancelamentoHoras: config?.antecedenciaCancelamentoHoras ?? 24,
    antecedenciaRemarcacaoHoras: config?.antecedenciaRemarcacaoHoras ?? 24,
    toleranciaAtrasoMinutos: config?.toleranciaAtrasoMinutos ?? 0,
  }
}

export function inicioAtendimento(data: string, hora: string) { return new Date(`${data}T${hora}:00`) }
export function respeitaAntecedencia(data: string, hora: string, horas: number) { return inicioAtendimento(data, hora).getTime() - Date.now() >= horas * 3600000 }

export async function atualizarAtrasados() {
  const { toleranciaAtrasoMinutos } = await regrasAgendamento()
  const limite = new Date(Date.now() - toleranciaAtrasoMinutos * 60000)
  const ativos = await prisma.agendamento.findMany({ where: { status: { in: ['PENDENTE', 'CONFIRMADO'] } } })
  const ids = ativos.filter(item => inicioAtendimento(item.data, item.hora) < limite).map(item => item.id)
  if (ids.length) await prisma.agendamento.updateMany({ where: { id: { in: ids } }, data: { status: 'ATRASADO' } })
}
