import { prisma } from "../lib/prisma.js";
export class UsuarioRepository {
  listarAtivos() {
    return prisma.usuario.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
    });
  }
  buscarPorEmail(email) {
    return prisma.usuario.findUnique({ where: { email } });
  }
  buscarPorGoogleSubject(googleSubject) {
    return prisma.usuario.findUnique({ where: { googleSubject } });
  }
  buscarPorId(id) {
    return prisma.usuario.findUnique({ where: { id } });
  }
  criar(dados) {
    return prisma.usuario.create({ data: dados });
  }
  atualizar(id, dados) {
    return prisma.usuario.update({ where: { id }, data: dados });
  }
  desativar(id) {
    return prisma.usuario.update({ where: { id }, data: { ativo: false } });
  }
}
