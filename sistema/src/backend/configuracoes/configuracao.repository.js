/** Papel do módulo: Faz a leitura e a persistência dos dados de configuração no PostgreSQL por meio do Prisma. */
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
