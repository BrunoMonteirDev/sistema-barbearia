import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ disponibilidade: vi.fn(), create: vi.fn(), criarCliente: vi.fn(), onClose: vi.fn(), onCreated: vi.fn() }));

vi.mock("@/lib/api", () => ({
  api: {
    agendamentos: { disponibilidade: mocks.disponibilidade, create: mocks.create },
    usuarios: { create: mocks.criarCliente },
  },
}));
vi.mock("react-hot-toast", () => ({ default: { error: vi.fn(), success: vi.fn() } }));

import { NovoAgendamentoWizard } from "./NovoAgendamentoWizard";

describe("NovoAgendamentoWizard", () => {
  it("conduz o administrador por cliente, profissional, serviÃ§o, horÃ¡rio e revisÃ£o", async () => {
    mocks.disponibilidade.mockResolvedValue({ horarios: ["10:00"] });
    render(<NovoAgendamentoWizard clientes={[{ id: "cli-1", nome: "Bruno", email: "bruno@teste.com", nivel: "Cliente" }]} profissionais={[{ id: "prof-1", nome: "Carlos", ativo: true }]} servicos={[{ id: "serv-1", nome: "Corte", preco: 40, duracao: 60, ativo: true }]} onClose={mocks.onClose} onCreated={mocks.onCreated} />);

    expect(screen.getByText("Etapa 1 de 5")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Bruno"));
    fireEvent.click(screen.getByRole("button", { name: "AvanÃ§ar" }));
    fireEvent.click(await screen.findByText("Carlos"));
    fireEvent.click(screen.getByRole("button", { name: "AvanÃ§ar" }));
    fireEvent.click(await screen.findByText("Corte"));
    fireEvent.click(screen.getByRole("button", { name: "AvanÃ§ar" }));
    fireEvent.change(screen.getByLabelText("Ou escolha outra data"), { target: { value: "2026-08-20" } });
    fireEvent.click(await screen.findByText("10:00"));
    fireEvent.click(screen.getByRole("button", { name: "Revisar agendamento" }));

    expect(await screen.findByRole("heading", { name: "Revise o agendamento" })).toBeInTheDocument();
    expect(screen.getByText("Bruno")).toBeInTheDocument();
    expect(screen.getByText("Carlos")).toBeInTheDocument();
    await waitFor(() => expect(mocks.disponibilidade).toHaveBeenCalledWith("prof-1", "serv-1", "2026-08-20"));
  });
});
