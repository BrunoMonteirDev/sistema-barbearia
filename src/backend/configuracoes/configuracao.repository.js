import { prisma } from "../lib/prisma.js";
export class ConfiguracaoRepository {
  buscar() {
    return prisma.configuracao.findFirst();
  }
  criar(data) {
    return prisma.configuracao.create({ data });
  }
  atualizar(id, data) {
    return prisma.configuracao.update({ where: { id }, data });
  }
}
