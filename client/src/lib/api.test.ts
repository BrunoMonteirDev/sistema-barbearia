import { afterEach, describe, expect, it, vi } from "vitest";
import { api, authStorage } from "./api";

describe("cliente da API", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    authStorage.clear();
  });

  it("envia token e ignora o próprio agendamento ao consultar disponibilidade", async () => {
    authStorage.set("token-de-teste");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ horarios: ["10:00"] }) });
    vi.stubGlobal("fetch", fetchMock);

    await expect(api.agendamentos.disponibilidade("pro 1", "serv 1", "2026-08-20", "ag 1")).resolves.toEqual({ horarios: ["10:00"] });
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/api/agendamentos/disponibilidade?profissionalId=pro+1&servicoId=serv+1&data=2026-08-20&ignorarAgendamentoId=ag+1"), expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer token-de-teste" }) }));
  });

  it("consulta a configuração pública sem autenticação", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ telefoneWhatsApp: "44999999999" }) });
    vi.stubGlobal("fetch", fetchMock);

    await expect(api.configuracoes.publico()).resolves.toEqual({ telefoneWhatsApp: "44999999999" });
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/api/configuracoes-publicas"), expect.objectContaining({ headers: { "Content-Type": "application/json" } }));
  });

  it("propaga a mensagem de erro retornada pela API", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: "Horário indisponível" }) }));
    await expect(api.agendamentos.remarcar("ag-1", { data: "2026-08-20", hora: "10:00" })).rejects.toThrow("Horário indisponível");
  });
});
