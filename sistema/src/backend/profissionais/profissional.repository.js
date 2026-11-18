import { prisma } from "../lib/prisma.js";
export class ProfissionalRepository {
  listarAtivos() {
    return prisma.profissional.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
    });
  }
  listarTodos() {
    return prisma.profissional.findMany({ orderBy: { nome: "asc" } });
  }
  buscarPorId(id) {
    return prisma.profissional.findUnique({ where: { id } });
  }
  criar(dados) {
    return prisma.profissional.create({ data: dados });
  }
  atualizar(id, dados) {
    return prisma.profissional.update({ where: { id }, data: dados });
  }
  desativar(id) {
    return prisma.profissional.update({
      where: { id },
      data: { ativo: false },
    });
  }
  listarDisponibilidade(profissionalId) {
    return prisma.disponibilidadeProfissional.findMany({
      where: { profissionalId },
      orderBy: [{ diaSemana: "asc" }, { hora: "asc" }],
    });
  }
  substituirDisponibilidade(profissionalId, blocos) {
    return prisma.$transaction([
      prisma.disponibilidadeProfissional.deleteMany({
        where: { profissionalId },
      }),
      ...(blocos.length
        ? [prisma.disponibilidadeProfissional.createMany({ data: blocos })]
        : []),
    ]);
  }
}
