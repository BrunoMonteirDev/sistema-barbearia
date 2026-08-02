import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ findMany: vi.fn(), create: vi.fn(), update: vi.fn() }));
vi.mock("../lib/prisma", () => ({ prisma: { servico: mocks } }));
vi.mock("../middlewares/auth", () => ({ authenticate: (_req: unknown, _res: unknown, next: () => void) => next(), requireAdmin: (_req: unknown, _res: unknown, next: () => void) => next() }));

import servicosRoutes from "./servicos";

const app = express();
app.use(express.json());
app.use("/servicos", servicosRoutes);

describe("rotas de serviços", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lista apenas serviços ativos para o público", async () => {
    mocks.findMany.mockResolvedValue([{ id: "s1", nome: "Corte clássico", ativo: true }]);
    const response = await request(app).get("/servicos");
    expect(response.status).toBe(200);
    expect(mocks.findMany).toHaveBeenCalledWith({ where: { ativo: true }, orderBy: { nome: "asc" } });
  });

  it("cria serviço administrativo", async () => {
    const dados = { nome: "Barba", descricao: "Acabamento", preco: 35, duracao: 30, ativo: true };
    mocks.create.mockResolvedValue({ id: "s2", ...dados });
    const response = await request(app).post("/servicos").send(dados);
    expect(response.status).toBe(201);
    expect(mocks.create).toHaveBeenCalledWith({ data: dados });
  });

  it("edita os dados de um serviço", async () => {
    mocks.update.mockResolvedValue({ id: "s1", nome: "Corte premium" });
    await request(app).put("/servicos/s1").send({ nome: "Corte premium", preco: 50 }).expect(200);
    expect(mocks.update).toHaveBeenCalledWith({ where: { id: "s1" }, data: { nome: "Corte premium", preco: 50 } });
  });

  it("desativa serviço sem removê-lo do histórico", async () => {
    mocks.update.mockResolvedValue({ id: "s1", ativo: false });
    await request(app).delete("/servicos/s1").expect(200, { id: "s1", ativo: false });
    expect(mocks.update).toHaveBeenCalledWith({ where: { id: "s1" }, data: { ativo: false } });
  });
});
