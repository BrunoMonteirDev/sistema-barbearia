import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  list: vi.fn(),
  user: { id: "cliente-1", nome: "Cliente" } as { id: string; nome: string } | null,
}));

vi.mock("@/lib/api", () => ({ api: { agendamentos: { list: mocks.list } } }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: mocks.user }) }));

import { ResumoAgendamentosCliente } from "./ResumoAgendamentosCliente";

const agendamento = (id: string, data: string, hora: string, status = "CONFIRMADO") => ({
  id, data, hora, status,
  servico: { id: `serv-${id}`, nome: `Serviço ${id}`, duracao: 30, preco: 30, ativo: true },
  profissional: { id: `prof-${id}`, nome: `Profissional ${id}`, ativo: true },
});

async function concluirCarregamento() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe("ResumoAgendamentosCliente", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-18T15:00:00"));
    vi.clearAllMocks();
    mocks.user = { id: "cliente-1", nome: "Cliente" };
  });

  afterEach(() => vi.useRealTimers());

  it("mostra os próximos em ordem, omite cancelados e respeita o limite", async () => {
    mocks.list.mockResolvedValue([
      agendamento("distante", "2026-08-21", "10:00"),
      agendamento("cancelado", "2026-08-18", "16:00", "CANCELADO"),
      agendamento("proximo", "2026-08-18", "16:00", "PENDENTE"),
      agendamento("segundo", "2026-08-19", "10:00"),
      agendamento("terceiro", "2026-08-20", "10:00"),
      agendamento("quarto", "2026-08-20", "11:00"),
    ]);
    render(<ResumoAgendamentosCliente />);

    await concluirCarregamento();
    expect(screen.getByText("Serviço proximo")).toBeInTheDocument();
    const proximos = screen.getByRole("heading", { name: "Próximos" }).parentElement!;
    expect(proximos).toHaveTextContent("Serviço proximo");
    expect(proximos).toHaveTextContent("Profissional proximo");
    expect(proximos).toHaveTextContent("Pendente");
    expect(proximos).not.toHaveTextContent("Serviço cancelado");
    expect(proximos).not.toHaveTextContent("Serviço quarto");
    const cards = proximos.querySelectorAll("article");
    expect(cards).toHaveLength(3);
    expect(cards[0]).toHaveTextContent("Serviço proximo");
  });

  it("mostra recentes do mais recente para o mais antigo", async () => {
    mocks.list.mockResolvedValue([
      agendamento("antigo", "2026-08-17", "12:00", "CONCLUIDO"),
      agendamento("recente", "2026-08-18", "14:00", "ATRASADO"),
      agendamento("cancelado", "2026-08-17", "16:00", "CANCELADO"),
    ]);
    render(<ResumoAgendamentosCliente />);

    await concluirCarregamento();
    expect(screen.getByText("Serviço recente")).toBeInTheDocument();
    const recentes = screen.getByRole("heading", { name: "Recentes" }).parentElement!;
    const cards = recentes.querySelectorAll("article");
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveTextContent("Serviço recente");
    expect(cards[1]).toHaveTextContent("Serviço cancelado");
    expect(recentes).not.toHaveTextContent("Serviço antigo");
  });

  it("mostra os estados vazios", async () => {
    mocks.list.mockResolvedValue([]);
    render(<ResumoAgendamentosCliente />);

    await concluirCarregamento();
    expect(screen.getByText(/Nenhum agendamento futuro/i)).toBeInTheDocument();
    expect(screen.getByText("Nenhum atendimento recente.")).toBeInTheDocument();
  });

  it("mostra loading local enquanto busca os agendamentos", () => {
    mocks.list.mockReturnValue(new Promise(() => undefined));
    render(<ResumoAgendamentosCliente />);

    expect(screen.getByLabelText("Carregando seus agendamentos")).toBeInTheDocument();
    expect(screen.queryByText("Não foi possível carregar seus agendamentos agora.")).not.toBeInTheDocument();
  });

  it("mostra um erro discreto sem impedir a renderização", async () => {
    mocks.list.mockRejectedValue(new Error("falha"));
    render(<ResumoAgendamentosCliente />);

    await concluirCarregamento();
    expect(screen.getByText("Não foi possível carregar seus agendamentos agora.")).toBeInTheDocument();
  });

  it("direciona para a página existente com todos os agendamentos", async () => {
    mocks.list.mockResolvedValue([]);
    render(<ResumoAgendamentosCliente />);

    await concluirCarregamento();
    expect(screen.getByRole("link", { name: /ver todos/i }).getAttribute("href")).toBe("/minha-conta/agendamentos");
  });

  it("não busca dados sem uma sessão autenticada", () => {
    mocks.user = null;
    render(<ResumoAgendamentosCliente />);

    expect(screen.getByText("Entre na sua conta para acompanhar seus agendamentos.")).toBeInTheDocument();
    expect(mocks.list).not.toHaveBeenCalled();
  });
});
