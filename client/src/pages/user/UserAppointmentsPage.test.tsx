import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ list: vi.fn(), disponibilidade: vi.fn(), remarcar: vi.fn() }));

vi.mock("@/lib/api", () => ({
  api: { agendamentos: { list: mocks.list, disponibilidade: mocks.disponibilidade, remarcar: mocks.remarcar, cancel: vi.fn(), historico: vi.fn() } },
}));
vi.mock("./MinhaContaPage", () => ({ UserLayout: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock("react-hot-toast", () => ({ default: { error: vi.fn(), success: vi.fn() } }));

import UserAppointmentsPage from "./UserAppointmentsPage";

describe("UserAppointmentsPage", () => {
  it("abre a remarcação e envia a nova data e horário", async () => {
    mocks.list.mockResolvedValue([{ id: "ag-1", data: "2026-08-20", hora: "10:00", status: "CONFIRMADO", profissional: { id: "pro-1", nome: "Carlos" }, servico: { id: "ser-1", nome: "Corte clássico" } }]);
    mocks.disponibilidade.mockResolvedValue({ horarios: ["10:00", "10:30"] });
    mocks.remarcar.mockResolvedValue({});
    render(<UserAppointmentsPage />);

    await screen.findByText("Corte clássico");
    fireEvent.click(screen.getByRole("button", { name: /remarcar/i }));
    await screen.findByRole("dialog", { name: /remarcar agendamento/i });
    fireEvent.change(screen.getByLabelText("Nova data"), { target: { value: "2026-08-21" } });
    await screen.findByText("10:30");
    fireEvent.click(screen.getByText("10:30"));
    fireEvent.click(screen.getByRole("button", { name: /confirmar remarcação/i }));

    await waitFor(() => expect(mocks.remarcar).toHaveBeenCalledWith("ag-1", { data: "2026-08-21", hora: "10:30" }));
  });
});
