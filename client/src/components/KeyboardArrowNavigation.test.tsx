import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { KeyboardArrowNavigation } from "./KeyboardArrowNavigation";

describe("KeyboardArrowNavigation", () => {
  it("move o foco entre controles com as setas", () => {
    render(<><KeyboardArrowNavigation /><button>Primeiro</button><button>Segundo</button><a href="#terceiro">Terceiro</a></>);
    screen.getByRole("button", { name: "Primeiro" }).focus();

    fireEvent.keyDown(document, { key: "ArrowRight" });
    expect(screen.getByRole("button", { name: "Segundo" })).toHaveFocus();
    fireEvent.keyDown(document, { key: "ArrowDown" });
    expect(screen.getByRole("link", { name: "Terceiro" })).toHaveFocus();
    fireEvent.keyDown(document, { key: "ArrowLeft" });
    expect(screen.getByRole("button", { name: "Segundo" })).toHaveFocus();
  });

  it("preserva as setas para edição de campos", () => {
    render(<><KeyboardArrowNavigation /><input aria-label="Nome" /><button>Próximo</button></>);
    const campo = screen.getByRole("textbox", { name: "Nome" });
    campo.focus();

    fireEvent.keyDown(campo, { key: "ArrowRight" });
    expect(campo).toHaveFocus();
  });
});
