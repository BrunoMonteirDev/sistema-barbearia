import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(),
  disponibilidadeFindMany: vi.fn(), deleteMany: vi.fn(), createMany: vi.fn(), transaction: vi.fn(),
}));

vi.mock("../lib/prisma", () => ({ prisma: {
  profissional: { findMany: mocks.findMany, findUnique: mocks.findUnique, create: mocks.create, update: mocks.update },
  disponibilidadeProfissional: { findMany: mocks.disponibilidadeFindMany, deleteMany: mocks.deleteMany, createMany: mocks.createMany },
  $transaction: mocks.transaction,
} }));
vi.mock("../middlewares/auth", () => ({ authenticate: (_req: unknown, _res: unknown, next: () => void) => next(), requireAdmin: (_req: unknown, _res: unknown, next: () => void) => next() }));
vi.mock("../services/horarios.service", () => ({ isValidBlock: (hora: unknown) => hora === "08:00" || hora === "08:30" }));

import profissionaisRoutes from "./profissionais";

const app = express();
app.use(express.json());
app.use("/profissionais", profissionaisRoutes);

describe("rotas de profissionais", () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.transaction.mockResolvedValue([]); });

  it("lista somente profissionais ativos para a área pública", async () => {
    mocks.findMany.mockResolvedValue([{ id: "p1", nome: "Carlos", ativo: true }]);
    const response = await request(app).get("/profissionais");
    expect(response.status).toBe(200);
    expect(mocks.findMany).toHaveBeenCalledWith({ where: { ativo: true }, orderBy: { nome: "asc" } });
  });

  it("rejeita disponibilidade em formato inválido", async () => {
    await request(app).put("/profissionais/p1/disponibilidade").send({ disponibilidade: [] }).expect(400);
  });

  it("rejeita dia ou horário inválido sem apagar a disponibilidade atual", async () => {
    mocks.findUnique.mockResolvedValue({ id: "p1" });
    await request(app).put("/profissionais/p1/disponibilidade").send({ disponibilidade: { 1: ["10:15"] } }).expect(400);
    await request(app).put("/profissionais/p1/disponibilidade").send({ disponibilidade: { 9: ["08:00"] } }).expect(400);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("rejeita disponibilidade para profissional inexistente", async () => {
    mocks.findUnique.mockResolvedValue(null);
    await request(app).put("/profissionais/p1/disponibilidade").send({ disponibilidade: { 1: ["08:00"] } }).expect(404);
  });

  it("substitui a disponibilidade com blocos válidos e sem duplicidade", async () => {
    mocks.findUnique.mockResolvedValue({ id: "p1" });
    mocks.deleteMany.mockReturnValue({});
    mocks.createMany.mockReturnValue({});
    await request(app).put("/profissionais/p1/disponibilidade").send({ disponibilidade: { 1: ["08:00", "08:00", "08:30"] } }).expect(200, { ok: true });
    expect(mocks.createMany).toHaveBeenCalledWith({ data: [{ profissionalId: "p1", diaSemana: 1, hora: "08:00" }, { profissionalId: "p1", diaSemana: 1, hora: "08:30" }] });
  });

  it("valida nome, telefone e e-mail ao cadastrar profissional", async () => {
    await request(app).post("/profissionais").send({ nome: "Carlos" }).expect(400);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("normaliza e cria profissional com dados válidos", async () => {
    mocks.create.mockResolvedValue({ id: "p1", nome: "Carlos", email: "carlos@teste.com", ativo: true });
    const response = await request(app).post("/profissionais").send({ nome: " Carlos ", telefone: "(44) 99999-9999", email: "CARLOS@TESTE.COM" });
    expect(response.status).toBe(201);
    expect(mocks.create).toHaveBeenCalledWith({ data: { nome: "Carlos", telefone: "44999999999", email: "carlos@teste.com", ativo: true } });
  });
});
