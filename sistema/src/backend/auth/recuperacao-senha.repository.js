/** Persiste o token de recuperação e consome o link junto com a troca de senha. */
import { prisma } from "../lib/prisma.js";

export class RecuperacaoSenhaRepository {
  constructor(db = prisma) {
    this.db = db;
  }

  async buscarConta(email) {
    // Cadastros antigos podem ter maiúsculas. Uma correspondência ambígua não
    // deve permitir que a recuperação escolha a conta errada.
    const contas = await this.db.usuario.findMany({
      where: { email: { equals: email, mode: "insensitive" }, ativo: true },
      select: { id: true, email: true, senhaHash: true, versaoSessao: true },
      take: 2,
    });
    return contas.length === 1 && contas[0].senhaHash ? contas[0] : null;
  }

  async salvarToken(usuario, tokenHash, expiraEm) {
    const resultado = await this.db.usuario.updateMany({
      where: { id: usuario.id, ativo: true, versaoSessao: usuario.versaoSessao },
      data: { recuperacaoTokenHash: tokenHash, recuperacaoExpiraEm: expiraEm },
    });
    return resultado.count === 1;
  }

  async descartarToken(tokenHash) {
    // Uma falha de envio não pode apagar um link mais recente de outra solicitação.
    await this.db.usuario.updateMany({
      where: { recuperacaoTokenHash: tokenHash },
      data: { recuperacaoTokenHash: null, recuperacaoExpiraEm: null },
    });
  }

  async redefinir(tokenHash, senhaHash, agora) {
    // Um único UPDATE verifica o prazo, troca a senha e apaga o token. Mesmo
    // com dois pedidos simultâneos, somente um consegue consumir o mesmo link.
    const resultado = await this.db.usuario.updateMany({
      where: {
        recuperacaoTokenHash: tokenHash,
        recuperacaoExpiraEm: { gt: agora },
        ativo: true,
      },
      data: {
        senhaHash,
        recuperacaoTokenHash: null,
        recuperacaoExpiraEm: null,
        versaoSessao: { increment: 1 },
      },
    });
    return resultado.count === 1;
  }
}
