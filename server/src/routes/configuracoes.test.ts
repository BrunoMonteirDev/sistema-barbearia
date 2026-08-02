import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ findFirst: vi.fn(), create: vi.fn(), update: vi.fn() }));
vi.mock("../lib/prisma", () => ({ prisma: { configuracao: mocks } }));

import configuracoesRoutes from "./configuracoes";

const app = express();
app.use(express.json());
app.use("/configuracoes", configuracoesRoutes);

describe("regras de negócio configuráveis", () => {
  beforeEach(() => vi.clearAllMocks());

  it("cria a configuração ao consultar regras pela primeira vez", async () => {
    mocks.findFirst.mockResolvedValue(null);
    mocks.create.mockResolvedValue({ id: "config-1", antecedenciaCancelamentoHoras: 24, antecedenciaRemarcacaoHoras: 24, toleranciaAtrasoMinutos: 0 });

    const response = await request(app).get("/configuracoes/regras");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ antecedenciaCancelamentoHoras: 24, antecedenciaRemarcacaoHoras: 24, toleranciaAtrasoMinutos: 0 });
    expect(mocks.create).toHaveBeenCalledWith({ data: {} });
  });

  it("rejeita regras negativas, fracionadas ou acima do limite", async () => {
    const response = await request(app).put("/configuracoes/regras").send({ antecedenciaCancelamentoHoras: -1, antecedenciaRemarcacaoHoras: 24.5, toleranciaAtrasoMinutos: 721 });
    expect(response.status).toBe(400);
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("salva regras válidas e retorna somente os campos permitidos", async () => {
    mocks.findFirst.mockResolvedValue({ id: "config-1" });
    mocks.update.mockResolvedValue({ id: "config-1", antecedenciaCancelamentoHoras: 48, antecedenciaRemarcacaoHoras: 36, toleranciaAtrasoMinutos: 15, telefoneWhatsApp: "44999999999" });

    const response = await request(app).put("/configuracoes/regras").send({ antecedenciaCancelamentoHoras: 48, antecedenciaRemarcacaoHoras: 36, toleranciaAtrasoMinutos: 15, telefoneWhatsApp: "não deve ser salvo aqui" });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ antecedenciaCancelamentoHoras: 48, antecedenciaRemarcacaoHoras: 36, toleranciaAtrasoMinutos: 15 });
    expect(mocks.update).toHaveBeenCalledWith({ where: { id: "config-1" }, data: { antecedenciaCancelamentoHoras: 48, antecedenciaRemarcacaoHoras: 36, toleranciaAtrasoMinutos: 15 } });
  });
});
