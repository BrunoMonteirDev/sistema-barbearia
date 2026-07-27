import { prisma } from '@/lib/prisma'
import { booleanValue, optionalText, requiredText } from './validation'

export async function listProfissionais(search: string, skip: number, take: number) {
  const where = search ? { nome: { contains: search, mode: 'insensitive' as const } } : {}
  const [items, total] = await Promise.all([prisma.profissional.findMany({ where, skip, take, orderBy: { nome: 'asc' } }), prisma.profissional.count({ where })])
  return { items, total }
}

export function profissionalData(body: unknown) {
  const input = body as Record<string, unknown>
  return { nome: requiredText(input.nome, 'Nome'), especialidade: optionalText(input.especialidade), ativo: booleanValue(input.ativo) }
}

export async function canDeleteProfissional(id: string) { return (await prisma.agendamento.count({ where: { profissionalId: id } })) === 0 }
