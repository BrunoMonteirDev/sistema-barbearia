import { prisma } from "../lib/prisma.js";
export class EvolutionRepository {
  buscarConfiguracao() {
    return prisma.configuracao.findFirst();
  }
  buscarNomeExibicao() {
    return prisma.configuracao.findFirst({
      select: { evolutionNomeExibicao: true },
    });
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
    });
  }
  buscarRegrasEnvioAutomatico() {
    return prisma.configuracao.findFirst({
      select: { envioAutomaticoWhatsapp: true, regrasEnvioAutomatico: true },
    });
  }
  criarConfiguracao(data) {
    return prisma.configuracao.create({ data });
  }
  atualizarConfiguracao(id, data) {
    return prisma.configuracao.update({ where: { id }, data });
  }
}
