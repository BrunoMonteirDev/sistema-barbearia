import { prisma } from '@/lib/prisma'
import { booleanValue, positiveNumber, requiredText } from './validation'

export async function listServicos(search: string, skip: number, take: number) {
  const where = search ? { nome: { contains: search, mode: 'insensitive' as const } } : {}
  const [items, total] = await Promise.all([prisma.servico.findMany({ where, skip, take, orderBy: { nome: 'asc' } }), prisma.servico.count({ where })])
  return { items, total }
}

export function servicoData(body: unknown) {
  const input = body as Record<string, unknown>
  return { nome: requiredText(input.nome, 'Nome'), duracao: positiveNumber(input.duracao, 'Duração'), preco: positiveNumber(input.preco, 'Valor'), ativo: booleanValue(input.ativo) }
}

export async function canDeleteServico(id: string) { return (await prisma.agendamento.count({ where: { servicoId: id } })) === 0 }
