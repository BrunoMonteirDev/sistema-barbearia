import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ regras: vi.fn(), salvarRegras: vi.fn() }));

vi.mock("@/lib/api", () => ({
  api: { configuracoes: { regras: mocks.regras, salvarRegras: mocks.salvarRegras } },
}));
vi.mock("react-hot-toast", () => ({ default: { error: vi.fn(), success: vi.fn() } }));

import RegrasNegocioPage from "./RegrasNegocioPage";

describe("RegrasNegocioPage", () => {
  it("exibe e salva a antecedência mínima para novos agendamentos", async () => {
    mocks.regras.mockResolvedValue({
      antecedenciaCancelamentoHoras: 24,
      antecedenciaRemarcacaoHoras: 24,
      antecedenciaAgendamentoMinutos: 30,
      toleranciaAtrasoMinutos: 0,
    });
    mocks.salvarRegras.mockResolvedValue({});

    render(<RegrasNegocioPage />);

    const campo = await screen.findByRole("spinbutton", { name: /Antecedência mínima para novos agendamentos/ });
    expect(campo).toHaveValue(30);
    fireEvent.change(campo, { target: { value: "45" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar regras" }));

    await waitFor(() => expect(mocks.salvarRegras).toHaveBeenCalledWith({
      antecedenciaCancelamentoHoras: 24,
      antecedenciaRemarcacaoHoras: 24,
      antecedenciaAgendamentoMinutos: 45,
      toleranciaAtrasoMinutos: 0,
    }));
  });
});
