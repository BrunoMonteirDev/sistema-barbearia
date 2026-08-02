import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  servicos: vi.fn(), profissionais: vi.fn(), disponibilidade: vi.fn(), create: vi.fn(), go: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  api: {
    servicos: { list: mocks.servicos },
    profissionais: { list: mocks.profissionais },
    agendamentos: { disponibilidade: mocks.disponibilidade, create: mocks.create },
  },
}));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: { id: "cliente-1", nome: "Cliente" } }) }));
vi.mock("wouter", () => ({ useLocation: () => ["/agendamento", mocks.go] }));
vi.mock("react-hot-toast", () => ({ default: { error: vi.fn(), success: vi.fn() } }));

import AgendarPage from "./AgendarPage";

describe("fluxo de agendamento", () => {
  it("exige revisão antes de confirmar o agendamento", async () => {
    mocks.servicos.mockResolvedValue([{ id: "serv-1", nome: "Corte clássico", preco: 40, duracao: 60, ativo: true }]);
    mocks.profissionais.mockResolvedValue([{ id: "prof-1", nome: "Carlos", especialidade: "Barba e cabelo", ativo: true }]);
    mocks.disponibilidade.mockResolvedValue({ horarios: ["10:00"] });
    render(<AgendarPage />);

    await screen.findByText("Carlos");
    fireEvent.click(screen.getByText("Carlos"));
    fireEvent.click(screen.getByRole("button", { name: "Avançar" }));

    await screen.findByText("Corte clássico");
    fireEvent.click(screen.getByText("Corte clássico"));
    fireEvent.click(screen.getByRole("button", { name: "Avançar" }));

    const dataInput = screen.getByLabelText("Ou escolha outra data");
    fireEvent.change(dataInput, { target: { value: "2026-08-20" } });
    await screen.findByText("10:00");
    fireEvent.click(screen.getByText("10:00"));
    fireEvent.click(screen.getByRole("button", { name: "Revisar agendamento" }));

    await screen.findByRole("heading", { name: "Revise seu agendamento" });
    expect(screen.getByText("Carlos")).toBeInTheDocument();
    expect(screen.getByText("Corte clássico")).toBeInTheDocument();
    expect(screen.getByText("10:00")).toBeInTheDocument();
    expect(screen.getByText("R$ 40,00")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirmar agendamento" })).toBeEnabled();

    await waitFor(() => expect(mocks.disponibilidade).toHaveBeenCalledWith("prof-1", "serv-1", "2026-08-20"));
  });
});
