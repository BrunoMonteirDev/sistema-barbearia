import type { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'

export class HorarioIndisponivelError extends Error {
  constructor() {
    super('Este horário não está disponível para a duração do serviço.')
  }
}

/**
 * Serializa alterações da agenda de um profissional em uma data. O lock é
 * transacional: o PostgreSQL o libera automaticamente no commit ou rollback,
 * inclusive quando há mais de uma instância da API.
 */
export async function executarComLockAgenda<T>(
  profissionalId: string,
  data: string,
  operacao: (tx: Prisma.TransactionClient) => Promise<T>,
) {
  return prisma.$transaction(async tx => {
    await tx.$executeRaw`
      SELECT pg_advisory_xact_lock(hashtextextended(${`${profissionalId}:${data}`}, 0))
    `
    return operacao(tx)
  })
}
