/** Papel do módulo: Valida e coordena o cadastro e a remoção de bloqueios de datas na agenda. */
import { prisma } from "../lib/prisma.js";
import { isValidDate } from "./validacao-agendamento.service.js";

export class BloqueioDataError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const bloqueioDataService = {
  listar() {
    return prisma.bloqueioData.findMany({ orderBy: { data: "asc" } });
  },

  async criar({ data, motivo }) {
    if (!isValidDate(data)) {
      throw new BloqueioDataError(400, "Informe uma data válida.");
    }
    const descricao = typeof motivo === "string" ? motivo.trim() : "";
    if (!descricao || descricao.length > 180) {
      throw new BloqueioDataError(
        400,
        "Informe um motivo com até 180 caracteres.",
      );
    }

    return prisma.$transaction(async (tx) => {
      await tx.$executeRaw`
        SELECT pg_advisory_xact_lock(hashtextextended(${`data:${data}`}, 0))
      `;
      const existentes = await tx.agendamento.count({
        where: { data, status: { in: ["PENDENTE", "CONFIRMADO", "ATRASADO"] } },
      });
      if (existentes > 0) {
        throw new BloqueioDataError(
          409,
          "Existem reservas ativas nessa data. Cancele-as antes de bloquear o dia.",
        );
      }
      try {
        return await tx.bloqueioData.create({ data: { data, motivo: descricao } });
      } catch (error) {
        if (error && typeof error === "object" && error.code === "P2002") {
          throw new BloqueioDataError(409, "Esta data já está bloqueada.");
        }
        throw error;
      }
    });
  },

  async remover(id) {
    const resultado = await prisma.bloqueioData.deleteMany({ where: { id } });
    if (resultado.count === 0) {
      throw new BloqueioDataError(404, "Bloqueio não encontrado.");
    }
  },
};
