import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AcessibilidadeControls } from "./AcessibilidadeControls";

describe("AcessibilidadeControls", () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
  });

  it("persiste e aplica preferências de acessibilidade", () => {
    render(<AcessibilidadeControls />);
    fireEvent.click(screen.getByRole("button", { name: "Acessibilidade" }));
    fireEvent.click(screen.getByRole("switch", { name: /alto contraste/i }));
    fireEvent.click(screen.getByRole("switch", { name: /texto maior/i }));
    fireEvent.click(screen.getByRole("switch", { name: /reduzir animações/i }));

    expect(document.documentElement).toHaveClass("acessibilidade-alto-contraste", "acessibilidade-fonte-grande", "acessibilidade-reduzir-animacoes");
    expect(JSON.parse(localStorage.getItem("barbearia.acessibilidade") ?? "{}")).toEqual({ altoContraste: true, fonteGrande: true, reduzirAnimacoes: true });
  });
});
