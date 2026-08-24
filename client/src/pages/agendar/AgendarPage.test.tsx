import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  servicos: vi.fn(), profissionais: vi.fn(), disponibilidade: vi.fn(), create: vi.fn(), list: vi.fn(), go: vi.fn(), user: { id: "cliente-1", nome: "Cliente" } as { id: string; nome: string } | null,
}));

vi.mock("@/lib/api", () => ({
  api: {
    servicos: { list: mocks.servicos },
    profissionais: { list: mocks.profissionais },
    agendamentos: { disponibilidade: mocks.disponibilidade, create: mocks.create, list: mocks.list },
  },
}));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: mocks.user }) }));
vi.mock("wouter", () => ({
  useLocation: () => ["/agendamento", mocks.go],
  Link: ({ href, children }: { href: string; children: ReactNode }) => <a href={href}>{children}</a>,
}));
vi.mock("react-hot-toast", () => ({ default: { error: vi.fn(), success: vi.fn() } }));

import AgendarPage from "./AgendarPage";

function dataAtual() {
  const data = new Date();
  return {
    iso: `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`,
    label: data.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" }),
  };
}

describe("fluxo de agendamento", () => {
  afterEach(() => {
    mocks.user = { id: "cliente-1", nome: "Cliente" };
  });

  it("exige revisão antes de confirmar o agendamento", async () => {
    const data = dataAtual();
    mocks.servicos.mockResolvedValue([{ id: "serv-1", nome: "Corte clássico", preco: 40, duracao: 60, ativo: true }]);
    mocks.profissionais.mockResolvedValue([{ id: "prof-1", nome: "Carlos", especialidade: "Barba e cabelo", ativo: true }]);
    mocks.disponibilidade.mockResolvedValue({ horarios: ["10:00"] });
    mocks.list.mockResolvedValue([]);
    render(<AgendarPage />);

    await screen.findByText("Carlos");
    fireEvent.click(screen.getByText("Carlos"));
    fireEvent.click(screen.getByRole("button", { name: "Avançar" }));

    await screen.findByText("Corte clássico");
    fireEvent.click(screen.getByText("Corte clássico"));
    fireEvent.click(screen.getByRole("button", { name: "Avançar" }));

    fireEvent.click(screen.getByRole("button", { name: data.label }));
    await screen.findByText("10:00");
    fireEvent.click(screen.getByText("10:00"));
    fireEvent.submit(screen.getByRole("button", { name: "Revisar agendamento" }).closest("form")!);
    expect(mocks.create).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "Escolha o horário" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Revisar agendamento" }));

    await screen.findByRole("heading", { name: "Revise seu agendamento" });
    expect(screen.getByText("Carlos")).toBeInTheDocument();
    expect(screen.getByText("Corte clássico")).toBeInTheDocument();
    expect(screen.getByText("10:00")).toBeInTheDocument();
    expect(screen.getByText("R$ 40,00")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirmar agendamento" })).toBeDisabled();
    fireEvent.click(screen.getByRole("checkbox", { name: "Li e confirmei os dados deste agendamento." }));
    expect(screen.getByRole("button", { name: "Confirmar agendamento" })).toBeEnabled();

    await waitFor(() => expect(mocks.disponibilidade).toHaveBeenCalledWith("prof-1", "serv-1", data.iso));
  });

  it("solicita autenticação apenas ao aceitar a revisão e preserva o agendamento", async () => {
    const data = dataAtual();
    mocks.user = null;
    mocks.servicos.mockResolvedValue([{ id: "serv-1", nome: "Corte clássico", preco: 40, duracao: 60, ativo: true }]);
    mocks.profissionais.mockResolvedValue([{ id: "prof-1", nome: "Carlos", ativo: true }]);
    mocks.disponibilidade.mockResolvedValue({ horarios: ["10:00"] });
    mocks.list.mockResolvedValue([]);
    render(<AgendarPage />);

    await screen.findByText("Carlos");
    fireEvent.click(screen.getByText("Carlos"));
    fireEvent.click(screen.getByRole("button", { name: "Avançar" }));
    await screen.findByText("Corte clássico");
    fireEvent.click(screen.getByText("Corte clássico"));
    fireEvent.click(screen.getByRole("button", { name: "Avançar" }));
    fireEvent.click(screen.getByRole("button", { name: data.label }));
    await screen.findByText("10:00");
    fireEvent.click(screen.getByText("10:00"));
    fireEvent.click(screen.getByRole("button", { name: "Revisar agendamento" }));

    expect(await screen.findByRole("heading", { name: "Revise seu agendamento" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox", { name: "Li e confirmei os dados deste agendamento." }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar agendamento" }));
    expect(mocks.go).toHaveBeenCalledWith(expect.stringContaining("/login?retorno="));
    expect(mocks.go).toHaveBeenCalledWith(expect.stringContaining("revisao%3D1"));
    expect(mocks.create).not.toHaveBeenCalled();
  });
});
