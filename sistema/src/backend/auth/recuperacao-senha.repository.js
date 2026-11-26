/** Persiste o código e serializa reenvios e tentativas no PostgreSQL. */
import { prisma } from "../lib/prisma.js";
import { INTERVALO_RECUPERACAO_SEGUNDOS, MAX_TENTATIVAS_CODIGO } from "./recuperacao-senha.service.js";

export class RecuperacaoSenhaRepository {
  constructor(db = prisma) {
    this.db = db;
  }

  async buscarConta(email) {
    // Não escolhe uma conta arbitrária se cadastros antigos diferem só em maiúsculas.
    const contas = await this.db.usuario.findMany({
      where: { email: { equals: email, mode: "insensitive" }, ativo: true },
      select: { id: true, email: true, senhaHash: true, versaoSessao: true, recuperacaoTokenHash: true },
      take: 2,
    });
    return contas.length === 1 && contas[0].senhaHash ? contas[0] : null;
  }

  async salvarCodigo(usuario, codigoHash, expiraEm, agora) {
    // O UPDATE condicional garante o minuto de intervalo mesmo entre processos
    // diferentes, após reinício e sob solicitações simultâneas.
    const resultado = await this.db.usuario.updateMany({
      where: {
        id: usuario.id, email: usuario.email, ativo: true, versaoSessao: usuario.versaoSessao,
        OR: [
          { recuperacaoSolicitadaEm: null },
          { recuperacaoSolicitadaEm: { lte: new Date(agora.getTime() - INTERVALO_RECUPERACAO_SEGUNDOS * 1000) } },
        ],
      },
      data: {
        recuperacaoTokenHash: codigoHash, recuperacaoExpiraEm: expiraEm,
        recuperacaoSolicitadaEm: agora, recuperacaoTentativas: 0,
      },
    });
    return resultado.count === 1;
  }

  async descartarCodigo(usuarioId, codigoHash) {
    // Falha de envio não pode apagar um código mais recente nem liberar o intervalo.
    await this.db.usuario.updateMany({
      where: { id: usuarioId, recuperacaoTokenHash: codigoHash },
      data: { recuperacaoTokenHash: null, recuperacaoExpiraEm: null },
    });
  }

  async redefinir(usuario, codigoHash, senhaHash, agora) {
    return this.db.$transaction(async (tx) => {
      const where = {
        id: usuario.id, email: usuario.email, ativo: true, versaoSessao: usuario.versaoSessao,
        recuperacaoExpiraEm: { gt: agora }, recuperacaoTokenHash: { not: null },
      };
      // Este UPDATE bloqueia a linha até o commit. Tentativas erradas também são
      // persistidas, e requisições concorrentes não conseguem exceder o limite.
      const tentativa = await tx.usuario.updateMany({
        where: { ...where, recuperacaoTentativas: { lt: MAX_TENTATIVAS_CODIGO } },
        data: { recuperacaoTentativas: { increment: 1 } },
      });
      if (tentativa.count !== 1) return false;
      const resultado = await tx.usuario.updateMany({
        where: { ...where, recuperacaoTokenHash: codigoHash },
        data: {
          senhaHash, recuperacaoTokenHash: null, recuperacaoExpiraEm: null,
          recuperacaoTentativas: 0, versaoSessao: { increment: 1 },
        },
      });
      return resultado.count === 1;
    });
  }
}
