import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'

export const CONFIRMACAO_REPETICAO_EXPIRACAO_SEGUNDOS = 60
const TIPO_TOKEN = 'CONFIRMACAO_REPETICAO'
const statusAtivos = ['PENDENTE', 'CONFIRMADO', 'ATRASADO']

type Tentativa = { usuarioId: string; servicoId: string; profissionalId: string; data: string; hora: string }
type Payload = Tentativa & { tipo: typeof TIPO_TOKEN }

const segredo = () => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET não foi configurado.')
  return process.env.JWT_SECRET
}
export async function detectarPossivelRepeticaoAgendamento(tentativa: Tentativa, ignorarAgendamentoId?: string) {
  const encontrados = await prisma.agendamento.findMany({
    where: { usuarioId: tentativa.usuarioId, data: tentativa.data, status: { in: statusAtivos }, ...(ignorarAgendamentoId ? { id: { not: ignorarAgendamentoId } } : {}) },
    include: { servico: { select: { nome: true } }, profissional: { select: { nome: true } } },
  })
  const agendamentosRelacionados = encontrados
    .map(item => ({ id: item.id, data: item.data, hora: item.hora, servico: item.servico.nome, profissional: item.profissional.nome, status: item.status }))
  return { possuiPossivelRepeticao: agendamentosRelacionados.length > 0, agendamentosRelacionados }
}

export function criarTokenConfirmacaoRepeticao(tentativa: Tentativa) {
  return jwt.sign({ tipo: TIPO_TOKEN, ...tentativa }, segredo(), { expiresIn: CONFIRMACAO_REPETICAO_EXPIRACAO_SEGUNDOS })
}

export function validarTokenConfirmacaoRepeticao(token: unknown, tentativa: Tentativa) {
  if (typeof token !== 'string') return 'AUSENTE' as const
  try {
    const payload = jwt.verify(token, segredo()) as Partial<Payload>
    return payload.tipo === TIPO_TOKEN && payload.usuarioId === tentativa.usuarioId && payload.servicoId === tentativa.servicoId && payload.profissionalId === tentativa.profissionalId && payload.data === tentativa.data && payload.hora === tentativa.hora
      ? 'VALIDO' as const : 'INVALIDO' as const
  } catch (error) {
    return error instanceof jwt.TokenExpiredError ? 'EXPIRADO' as const : 'INVALIDO' as const
  }
}
