/** Papel do módulo: Busca, cria, atualiza e desativa serviços no banco de dados. */
import { prisma } from "../lib/prisma.js";
export class ServicoRepository {
  listarAtivos() {
    return prisma.servico.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
    });
  }
  criar(dados) {
    return prisma.servico.create({ data: dados });
  }
  atualizar(id, dados) {
    return prisma.servico.update({ where: { id }, data: dados });
  }
  desativar(id) {
    return prisma.servico.update({ where: { id }, data: { ativo: false } });
  }
}
