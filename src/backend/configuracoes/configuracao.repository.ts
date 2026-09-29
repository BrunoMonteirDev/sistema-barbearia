import type { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'

export class ConfiguracaoRepository {
  buscar() {
    return prisma.configuracao.findFirst()
  }

  criar(data: Prisma.ConfiguracaoCreateInput) {
    return prisma.configuracao.create({ data })
  }

  atualizar(id: string, data: Prisma.ConfiguracaoUpdateInput) {
    return prisma.configuracao.update({ where: { id }, data })
  }
}
