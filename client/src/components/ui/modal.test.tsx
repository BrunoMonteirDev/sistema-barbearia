import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Modal } from "./modal";

describe("Modal", () => {
  it("recebe foco, prende Tab, fecha com Esc e devolve o foco", () => {
    const origem = document.createElement("button");
    document.body.appendChild(origem);
    origem.focus();
    const onClose = vi.fn();
    const { unmount } = render(<Modal title="Confirmação" onClose={onClose} footer={<button type="button">Confirmar</button>}><button type="button">Conteúdo</button></Modal>);
    const fechar = screen.getByRole("button", { name: "Fechar janela" });
    expect(fechar).toHaveFocus();

    const confirmar = screen.getByRole("button", { name: "Confirmar" });
    confirmar.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(fechar).toHaveFocus();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
    unmount();
    expect(origem).toHaveFocus();
    origem.remove();
  });
});
