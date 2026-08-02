import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(), update: vi.fn(), historyCreate: vi.fn(),
  profissionalFindFirst: vi.fn(), servicoFindFirst: vi.fn(),
  respeitaAntecedencia: vi.fn(), regrasAgendamento: vi.fn(), validarDisponibilidade: vi.fn(),
  podeEnviar: vi.fn(), enviarNotificacao: vi.fn(), enviarSeAutomatico: vi.fn(),
}));

vi.mock("../lib/prisma", () => ({ prisma: {
  agendamento: { findUnique: mocks.findUnique, update: mocks.update, findMany: vi.fn(), create: vi.fn(), updateMany: vi.fn(), delete: vi.fn() },
  historicoAgendamento: { create: mocks.historyCreate, findMany: vi.fn() },
  profissional: { findFirst: mocks.profissionalFindFirst, findMany: vi.fn() },
  servico: { findFirst: mocks.servicoFindFirst },
  usuario: { findFirst: vi.fn() }, configuracao: { findFirst: vi.fn(), create: vi.fn() },
} }));
vi.mock("../services/horarios.service", () => ({
  isValidBlock: (hora: unknown) => typeof hora === "string" && /^\d{2}:(00|30)$/.test(hora),
  validarDisponibilidade: mocks.validarDisponibilidade,
  listarHorariosDisponiveis: vi.fn(), obterBlocos: vi.fn(), escolherPrimeiroProfissionalDisponivel: vi.fn(),
}));
vi.mock("../services/regras-agendamento.service", () => ({
  atualizarAtrasados: vi.fn(), regrasAgendamento: mocks.regrasAgendamento, respeitaAntecedencia: mocks.respeitaAntecedencia,
}));
vi.mock('../services/notificacao.service', () => ({ notificacaoService: { podeEnviar: mocks.podeEnviar, enviar: mocks.enviarNotificacao, enviarSeAutomatico: mocks.enviarSeAutomatico } }));

import agendamentosRoutes from "./agendamentos";

const existente = { id: "ag-1", usuarioId: "cliente-1", profissionalId: "pro-1", servicoId: "ser-1", data: "2026-08-20", hora: "10:00", status: "CONFIRMADO" };
const app = express();
app.use(express.json());
app.use((req, _res, next) => { req.auth = { sub: req.header("x-user") || "cliente-1", nivel: req.header("x-role") === "admin" ? "Administrador" : "Cliente" }; next(); });
app.use("/agendamentos", agendamentosRoutes);

describe("rotas de agendamento", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findUnique.mockResolvedValue(existente);
    mocks.enviarSeAutomatico.mockResolvedValue(null);
    mocks.regrasAgendamento.mockResolvedValue({ antecedenciaCancelamentoHoras: 24, antecedenciaRemarcacaoHoras: 24, toleranciaAtrasoMinutos: 0 });
  });

  it("bloqueia cancelamento do cliente fora da antecedência", async () => {
    mocks.respeitaAntecedencia.mockReturnValue(false);
    await request(app).patch("/agendamentos/ag-1/cancelar").expect(400);
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("permite cancelamento do administrador sem antecedência e registra histórico", async () => {
    mocks.update.mockResolvedValue({ ...existente, status: "CANCELADO" });
    await request(app).patch("/agendamentos/ag-1/cancelar").set("x-role", "admin").expect(200);
    expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({ data: { status: "CANCELADO" } }));
    expect(mocks.historyCreate).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ tipo: "CANCELAMENTO" }) }));
    expect(mocks.enviarSeAutomatico).toHaveBeenCalledWith("ag-1", "CANCELAMENTO");
  });

  it("rejeita remarcação quando o novo horário possui conflito", async () => {
    mocks.respeitaAntecedencia.mockReturnValue(true);
    mocks.profissionalFindFirst.mockResolvedValue({ id: "pro-1" });
    mocks.servicoFindFirst.mockResolvedValue({ id: "ser-1" });
    mocks.validarDisponibilidade.mockResolvedValue(false);
    await request(app).patch("/agendamentos/ag-1/remarcar").send({ data: "2026-08-21", hora: "10:30" }).expect(409);
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("remarca quando há disponibilidade e registra o evento", async () => {
    mocks.respeitaAntecedencia.mockReturnValue(true);
    mocks.profissionalFindFirst.mockResolvedValue({ id: "pro-1" });
    mocks.servicoFindFirst.mockResolvedValue({ id: "ser-1" });
    mocks.validarDisponibilidade.mockResolvedValue(true);
    mocks.update.mockResolvedValue({ ...existente, data: "2026-08-21", hora: "10:30" });
    await request(app).patch("/agendamentos/ag-1/remarcar").send({ data: "2026-08-21", hora: "10:30" }).expect(200);
    expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ data: "2026-08-21", hora: "10:30" }) }));
    expect(mocks.historyCreate).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ tipo: "REMARCACAO" }) }));
    expect(mocks.enviarSeAutomatico).toHaveBeenCalledWith("ag-1", "REMARCACAO");
  });
  it("retorna erro quando a Evolution rejeita uma notificacao manual", async () => {
    mocks.enviarNotificacao.mockResolvedValue({ status: "FALHOU", erro: "instance requires property text" });
    await request(app).post("/agendamentos/ag-1/notificar").set("x-role", "admin").send({ tipo: "ATUALIZACAO" }).expect(502);
  });

  it("confirma o envio somente quando a Evolution aceitar a mensagem", async () => {
    mocks.enviarNotificacao.mockResolvedValue({ status: "ENVIADA" });
    await request(app).post("/agendamentos/ag-1/notificar").set("x-role", "admin").send({ tipo: "ATUALIZACAO" }).expect(201);
  });
});
