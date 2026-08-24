import express from "express";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), historyCreate: vi.fn(), historyFindMany: vi.fn(),
  profissionalFindFirst: vi.fn(), servicoFindFirst: vi.fn(),
  respeitaAntecedencia: vi.fn(), respeitaAntecedenciaMinimaAgendamento: vi.fn(), regrasAgendamento: vi.fn(), horarioAgendamentoJaPassou: vi.fn(), validarDisponibilidade: vi.fn(),
  usuarioFindFirst: vi.fn(), escolherPrimeiroProfissionalDisponivel: vi.fn(), listarBlocosConfiguradosParaData: vi.fn(), listarHorariosDisponiveis: vi.fn(),
  podeEnviar: vi.fn(), enviarNotificacao: vi.fn(), enviarSeAutomatico: vi.fn(),
  executarComLockAgenda: vi.fn(),
  detectarPossivelRepeticaoAgendamento: vi.fn(), criarTokenConfirmacaoRepeticao: vi.fn(), validarTokenConfirmacaoRepeticao: vi.fn(),
}));

vi.mock("../lib/prisma", () => ({ prisma: {
  agendamento: { findUnique: mocks.findUnique, update: mocks.update, findMany: mocks.findMany, create: mocks.create, updateMany: vi.fn(), delete: mocks.delete },
  historicoAgendamento: { create: mocks.historyCreate, findMany: mocks.historyFindMany },
  profissional: { findFirst: mocks.profissionalFindFirst, findMany: vi.fn() },
  servico: { findFirst: mocks.servicoFindFirst },
  usuario: { findFirst: mocks.usuarioFindFirst }, configuracao: { findFirst: vi.fn(), create: vi.fn() },
} }));
vi.mock("../services/horarios.service", () => ({
  isValidBlock: (hora: unknown) => typeof hora === "string" && /^\d{2}:(00|30)$/.test(hora),
  validarDisponibilidade: mocks.validarDisponibilidade,
  listarHorariosDisponiveis: mocks.listarHorariosDisponiveis, listarBlocosConfiguradosParaData: mocks.listarBlocosConfiguradosParaData, escolherPrimeiroProfissionalDisponivel: mocks.escolherPrimeiroProfissionalDisponivel,
}));
vi.mock("../services/regras-agendamento.service", () => ({
  atualizarAtrasados: vi.fn(), regrasAgendamento: mocks.regrasAgendamento, respeitaAntecedencia: mocks.respeitaAntecedencia, respeitaAntecedenciaMinimaAgendamento: mocks.respeitaAntecedenciaMinimaAgendamento, horarioAgendamentoJaPassou: mocks.horarioAgendamentoJaPassou,
}));
vi.mock('../services/notificacao.service', () => ({ notificacaoService: { podeEnviar: mocks.podeEnviar, enviar: mocks.enviarNotificacao, enviarSeAutomatico: mocks.enviarSeAutomatico } }));
vi.mock('../services/agenda-lock.service', () => ({
  HorarioIndisponivelError: class HorarioIndisponivelError extends Error {},
  executarComLockAgenda: mocks.executarComLockAgenda,
}));
vi.mock('../services/repeticao-agendamento.service', () => ({
  detectarPossivelRepeticaoAgendamento: mocks.detectarPossivelRepeticaoAgendamento,
  criarTokenConfirmacaoRepeticao: mocks.criarTokenConfirmacaoRepeticao,
  validarTokenConfirmacaoRepeticao: mocks.validarTokenConfirmacaoRepeticao,
}));

import agendamentosRoutes from "./agendamentos";

const existente = { id: "ag-1", usuarioId: "cliente-1", profissionalId: "pro-1", servicoId: "ser-1", data: "2026-08-20", hora: "10:00", status: "CONFIRMADO" };
const app = express();
app.use(express.json());
app.use((req, _res, next) => { req.auth = { sub: req.header("x-user") || "cliente-1", nivel: req.header("x-role") === "admin" ? "Administrador" : "Cliente" }; next(); });
app.use("/agendamentos", agendamentosRoutes);

describe("rotas de agendamento", () => {
  afterEach(() => vi.useRealTimers());

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findUnique.mockResolvedValue(existente);
    mocks.profissionalFindFirst.mockResolvedValue({ id: "pro-1" });
    mocks.servicoFindFirst.mockResolvedValue({ id: "ser-1" });
    mocks.usuarioFindFirst.mockResolvedValue({ id: "cliente-1", cadastroConcluido: true });
    mocks.validarDisponibilidade.mockResolvedValue(true);
    mocks.escolherPrimeiroProfissionalDisponivel.mockResolvedValue("pro-1");
    mocks.listarBlocosConfiguradosParaData.mockResolvedValue(["08:00", "08:30"]);
    mocks.enviarSeAutomatico.mockResolvedValue(null);
    mocks.executarComLockAgenda.mockImplementation((_profissionalId, _data, operacao) => operacao({ agendamento: { create: mocks.create, update: mocks.update } }));
    mocks.regrasAgendamento.mockResolvedValue({ antecedenciaCancelamentoHoras: 24, antecedenciaRemarcacaoHoras: 24, antecedenciaAgendamentoMinutos: 30, toleranciaAtrasoMinutos: 0 });
    mocks.horarioAgendamentoJaPassou.mockReturnValue(false);
    mocks.respeitaAntecedenciaMinimaAgendamento.mockReturnValue(true);
    mocks.detectarPossivelRepeticaoAgendamento.mockResolvedValue({ possuiPossivelRepeticao: false, agendamentosRelacionados: [] });
  });

  it("rejeita a criação com dados de data ou horário inválidos", async () => {
    await request(app).post("/agendamentos").send({ profissionalId: "pro-1", servicoId: "ser-1", data: "2026-02-30", hora: "10:15" }).expect(400);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("bloqueia criação em data ou horário já passado e aceita horário futuro", async () => {
    mocks.horarioAgendamentoJaPassou.mockReturnValueOnce(true);
    await request(app).post("/agendamentos").send({ profissionalId: "pro-1", servicoId: "ser-1", data: "2026-08-17", hora: "10:00" }).expect(409);

    mocks.horarioAgendamentoJaPassou.mockReturnValueOnce(true);
    await request(app).post("/agendamentos").send({ profissionalId: "pro-1", servicoId: "ser-1", data: "2026-08-20", hora: "10:00" }).expect(409);

    mocks.create.mockResolvedValue({ id: "ag-futuro" });
    await request(app).post("/agendamentos").send({ profissionalId: "pro-1", servicoId: "ser-1", data: "2026-08-21", hora: "10:00" }).expect(201);
  });

  it("bloqueia criação dentro da antecedência mínima e aceita o limite ou mais", async () => {
    mocks.respeitaAntecedenciaMinimaAgendamento.mockReturnValueOnce(false);
    await request(app).post("/agendamentos").send({ profissionalId: "pro-1", servicoId: "ser-1", data: "2026-08-20", hora: "10:00" }).expect(409);

    mocks.create.mockResolvedValue({ id: "ag-limite" });
    await request(app).post("/agendamentos").send({ profissionalId: "pro-1", servicoId: "ser-1", data: "2026-08-21", hora: "10:00" }).expect(201);
    await request(app).post("/agendamentos").send({ profissionalId: "pro-1", servicoId: "ser-1", data: "2026-08-21", hora: "10:30" }).expect(201);
  });

  it("solicita token para possível repetição e aceita a confirmação válida", async () => {
    mocks.detectarPossivelRepeticaoAgendamento.mockResolvedValue({ possuiPossivelRepeticao: true, agendamentosRelacionados: [{ id: "ag-antigo", hora: "10:00" }] });
    mocks.validarTokenConfirmacaoRepeticao.mockReturnValue("AUSENTE");
    mocks.criarTokenConfirmacaoRepeticao.mockReturnValue("token-60s");
    const primeira = await request(app).post("/agendamentos").send({ profissionalId: "pro-1", servicoId: "ser-1", data: "2026-08-21", hora: "10:30" }).expect(409);
    expect(primeira.body).toMatchObject({ codigo: "CONFIRMACAO_REPETICAO_NECESSARIA", tokenConfirmacaoRepeticao: "token-60s" });

    mocks.validarTokenConfirmacaoRepeticao.mockReturnValue("VALIDO");
    mocks.create.mockResolvedValue({ id: "ag-confirmado" });
    await request(app).post("/agendamentos").send({ profissionalId: "pro-1", servicoId: "ser-1", data: "2026-08-21", hora: "10:30", tokenConfirmacaoRepeticao: "token-60s" }).expect(201);
  });

  it("escolhe um profissional disponível quando não há preferência", async () => {
    mocks.create.mockResolvedValue({ id: "ag-novo" });
    await request(app).post("/agendamentos").send({ profissionalId: "sem-preferencia", servicoId: "ser-1", data: "2026-08-21", hora: "10:30" }).expect(201);
    expect(mocks.escolherPrimeiroProfissionalDisponivel).toHaveBeenCalledWith("ser-1", "2026-08-21", "10:30");
    expect(mocks.create).toHaveBeenCalledWith({ data: expect.objectContaining({ profissionalId: "pro-1", usuarioId: "cliente-1" }) });
    expect(mocks.enviarSeAutomatico).toHaveBeenCalledWith("ag-novo", "CRIACAO");
  });

  it("recusa a criação para cadastro pendente ou horário indisponível", async () => {
    mocks.usuarioFindFirst.mockResolvedValueOnce({ id: "cliente-1", cadastroConcluido: false });
    await request(app).post("/agendamentos").send({ profissionalId: "pro-1", servicoId: "ser-1", data: "2026-08-21", hora: "10:30" }).expect(403);

    mocks.validarDisponibilidade.mockResolvedValueOnce(false);
    await request(app).post("/agendamentos").send({ profissionalId: "pro-1", servicoId: "ser-1", data: "2026-08-21", hora: "10:30" }).expect(409);
  });

  it("traduz conflito concorrente de banco para HTTP 409", async () => {
    mocks.create.mockRejectedValue({ code: "P2002" });
    const resposta = await request(app).post("/agendamentos").send({ profissionalId: "pro-1", servicoId: "ser-1", data: "2026-08-21", hora: "10:30" }).expect(409);
    expect(resposta.body.error).toBe("O horário selecionado não está mais disponível.");
  });

  it("protege o histórico contra outro cliente e retorna os eventos ao dono", async () => {
    await request(app).get("/agendamentos/ag-1/historico").set("x-user", "cliente-2").expect(403);

    mocks.historyFindMany.mockResolvedValue([{ id: "hist-1" }]);
    const resposta = await request(app).get("/agendamentos/ag-1/historico").expect(200);
    expect(resposta.body).toEqual([{ id: "hist-1" }]);
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

  it("padroniza conflito P2002 de remarcação como HTTP 409", async () => {
    mocks.respeitaAntecedencia.mockReturnValue(true);
    mocks.update.mockRejectedValueOnce({ code: "P2002" });

    const resposta = await request(app).patch("/agendamentos/ag-1/remarcar").send({ data: "2026-08-21", hora: "10:30" }).expect(409);
    expect(resposta.body.error).toBe("O horário selecionado não está mais disponível.");
  });

  it("padroniza conflito P2002 de edição administrativa como HTTP 409", async () => {
    mocks.update.mockRejectedValueOnce({ code: "P2002" });

    const resposta = await request(app).put("/agendamentos/ag-1").set("x-role", "admin").send({ hora: "10:30" }).expect(409);
    expect(resposta.body.error).toBe("O horário selecionado não está mais disponível.");
  });
  it("bloqueia remarcação em data ou horário passado", async () => {
    mocks.respeitaAntecedencia.mockReturnValue(true);
    mocks.horarioAgendamentoJaPassou.mockReturnValueOnce(true);
    await request(app).patch("/agendamentos/ag-1/remarcar").send({ data: "2026-08-17", hora: "10:00" }).expect(409);

    mocks.horarioAgendamentoJaPassou.mockReturnValueOnce(true);
    await request(app).patch("/agendamentos/ag-1/remarcar").send({ data: "2026-08-20", hora: "10:00" }).expect(409);
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("bloqueia remarcação e edição administrativa dentro da antecedência mínima", async () => {
    mocks.respeitaAntecedencia.mockReturnValue(true);
    mocks.respeitaAntecedenciaMinimaAgendamento.mockReturnValueOnce(false);
    await request(app).patch("/agendamentos/ag-1/remarcar").send({ data: "2026-08-20", hora: "10:00" }).expect(409);

    mocks.respeitaAntecedenciaMinimaAgendamento.mockReturnValueOnce(false);
    await request(app).put("/agendamentos/ag-1").set("x-role", "admin").send({ hora: "10:00" }).expect(409);
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("bloqueia atualização administrativa em horário passado", async () => {
    mocks.horarioAgendamentoJaPassou.mockReturnValue(true);
    await request(app).put("/agendamentos/ag-1").set("x-role", "admin").send({ hora: "10:00" }).expect(409);
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("remove horários já passados da disponibilidade", async () => {
    mocks.listarHorariosDisponiveis.mockResolvedValue(["15:00", "15:30", "16:00"]);
    mocks.horarioAgendamentoJaPassou.mockImplementation((_data, hora) => hora === "15:00");
    const resposta = await request(app).get("/agendamentos/disponibilidade?profissionalId=pro-1&servicoId=ser-1&data=2026-08-20").expect(200);
    expect(resposta.body).toEqual({ horarios: ["15:30", "16:00"] });
  });
  it("remove horários dentro da antecedência mínima da disponibilidade", async () => {
    mocks.listarHorariosDisponiveis.mockResolvedValue(["15:00", "15:30", "16:00"]);
    mocks.respeitaAntecedenciaMinimaAgendamento.mockImplementation((_data, hora) => hora !== "15:00");
    const resposta = await request(app).get("/agendamentos/disponibilidade?profissionalId=pro-1&servicoId=ser-1&data=2026-08-20").expect(200);
    expect(resposta.body).toEqual({ horarios: ["15:30", "16:00"] });
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
