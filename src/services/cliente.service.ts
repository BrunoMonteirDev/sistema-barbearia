import { prisma } from '@/lib/prisma'
import { booleanValue, optionalText, requiredText } from './validation'

export async function listClientes(search: string, skip: number, take: number, order: 'nome' | 'createdAt') {
  const where = { nivel: 'Cliente', ...(search ? { OR: [{ nome: { contains: search, mode: 'insensitive' as const } }, { email: { contains: search, mode: 'insensitive' as const } }] } : {}) }
  const [items, total] = await Promise.all([prisma.usuario.findMany({ where, skip, take, orderBy: { [order]: 'asc' }, select: { id: true, nome: true, telefone: true, email: true, dataNascimento: true, ativo: true } }), prisma.usuario.count({ where })])
  return { items, total }
}

export function clienteData(body: unknown) {
  const input = body as Record<string, unknown>
  const date = optionalText(input.dataNascimento)
  if (date && Number.isNaN(new Date(date).getTime())) throw new Error('Informe uma data de nascimento válida.')
  return { nome: requiredText(input.nome, 'Nome'), email: requiredText(input.email, 'E-mail').toLowerCase(), telefone: optionalText(input.telefone), dataNascimento: date ? new Date(`${date}T00:00:00`) : null, ativo: booleanValue(input.ativo), nivel: 'Cliente' }
}

export async function canDeleteCliente(id: string) { return (await prisma.agendamento.count({ where: { usuarioId: id } })) === 0 }
