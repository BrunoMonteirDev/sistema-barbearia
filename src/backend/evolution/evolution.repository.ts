import type { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'

export class EvolutionRepository {
  buscarConfiguracao() {
    return prisma.configuracao.findFirst()
  }

  buscarNomeExibicao() {
    return prisma.configuracao.findFirst({ select: { evolutionNomeExibicao: true } })
  }

  buscarModelosMensagens() {
    return prisma.configuracao.findFirst({
      select: {
        mensagemWhatsappCriacao: true,
        mensagemWhatsappRemarcacao: true,
        mensagemWhatsappCancelamento: true,
        mensagemWhatsappAtualizacao: true,
        mensagemWhatsappLembrete: true,
        mensagensWhatsappStatus: true,
      },
    })
  }

  buscarRegrasEnvioAutomatico() {
    return prisma.configuracao.findFirst({
      select: { envioAutomaticoWhatsapp: true, regrasEnvioAutomatico: true },
    })
  }

  criarConfiguracao(data: Prisma.ConfiguracaoCreateInput) {
    return prisma.configuracao.create({ data })
  }

  atualizarConfiguracao(id: string, data: Prisma.ConfiguracaoUpdateInput) {
    return prisma.configuracao.update({ where: { id }, data })
  }
}
