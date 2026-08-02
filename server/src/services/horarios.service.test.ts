import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMocks = vi.hoisted(() => ({
  servico: { findFirst: vi.fn() },
  disponibilidadeProfissional: { findMany: vi.fn() },
  agendamento: { findMany: vi.fn() },
  profissional: { findMany: vi.fn() },
}));

vi.mock("../lib/prisma", () => ({ prisma: prismaMocks }));

import {
  arredondarDuracaoParaBloco,
  calcularBlocosDoServico,
  escolherPrimeiroProfissionalDisponivel,
  isValidBlock,
  listarHorariosDisponiveis,
  temBlocosConsecutivos,
  temConflito,
  validarDisponibilidade,
} from "./horarios.service";

describe("horarios.service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("arredonda a duração para blocos de 30 minutos", () => {
    expect(arredondarDuracaoParaBloco(1)).toBe(30);
    expect(arredondarDuracaoParaBloco(60)).toBe(60);
    expect(arredondarDuracaoParaBloco(61)).toBe(90);
    expect(arredondarDuracaoParaBloco(0)).toBe(30);
    expect(calcularBlocosDoServico("09:30", 61)).toEqual(["09:30", "10:00", "10:30"]);
  });

  it("valida blocos e jornadas consecutivas", () => {
    expect(isValidBlock("23:30")).toBe(true);
    expect(isValidBlock("24:00")).toBe(false);
    expect(isValidBlock("10:15")).toBe(false);
    expect(temBlocosConsecutivos(["08:00", "08:30", "09:00"], "08:00", 60)).toBe(true);
    expect(temBlocosConsecutivos(["08:00", "09:00"], "08:00", 60)).toBe(false);
  });

  it("detecta conflitos inclusive quando os horários só se sobrepõem parcialmente", () => {
    expect(temConflito("09:00", 60, "09:30", 30)).toBe(true);
    expect(temConflito("09:00", 30, "09:30", 30)).toBe(false);
  });

  it("remove horários ocupados, mas mantém cancelados e respeita a duração", async () => {
    prismaMocks.servico.findFirst.mockResolvedValue({ id: "servico", duracao: 60 });
    prismaMocks.disponibilidadeProfissional.findMany.mockResolvedValue([
      { hora: "08:00" }, { hora: "08:30" }, { hora: "09:00" }, { hora: "09:30" },
    ]);
    prismaMocks.agendamento.findMany.mockResolvedValue([
      { id: "ocupado", hora: "08:30", servico: { duracao: 30 } },
    ]);

    await expect(listarHorariosDisponiveis("profissional", "servico", "2026-08-03")).resolves.toEqual(["09:00"]);
    await expect(validarDisponibilidade("profissional", "servico", "2026-08-03", "08:00")).resolves.toBe(false);
  });

  it("ignora o próprio agendamento ao listar horários de remarcação", async () => {
    prismaMocks.servico.findFirst.mockResolvedValue({ id: "servico", duracao: 30 });
    prismaMocks.disponibilidadeProfissional.findMany.mockResolvedValue([{ hora: "10:00" }]);
    prismaMocks.agendamento.findMany.mockResolvedValue([]);

    await expect(listarHorariosDisponiveis("profissional", "servico", "2026-08-03", "agendamento-atual")).resolves.toEqual(["10:00"]);
    expect(prismaMocks.agendamento.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ id: { not: "agendamento-atual" } }) }));
  });

  it("escolhe o primeiro profissional com disponibilidade", async () => {
    prismaMocks.profissional.findMany.mockResolvedValue([{ id: "p1" }, { id: "p2" }]);
    prismaMocks.servico.findFirst.mockResolvedValue({ duracao: 30 });
    prismaMocks.disponibilidadeProfissional.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ hora: "10:00" }]);
    prismaMocks.agendamento.findMany.mockResolvedValue([]);

    await expect(escolherPrimeiroProfissionalDisponivel("servico", "2026-08-03", "10:00")).resolves.toBe("p2");
  });
});
