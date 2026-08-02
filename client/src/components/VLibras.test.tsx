import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const localizacao = vi.hoisted(() => ({ valor: "/" }));
vi.mock("wouter", () => ({ useLocation: () => [localizacao.valor] }));

import { VLibras } from "./VLibras";

describe("VLibras", () => {
  afterEach(() => {
    document.getElementById("vlibras-plugin")?.remove();
    delete document.documentElement.dataset.vlibrasInicializado;
  });

  it("carrega o plugin nas páginas públicas", () => {
    localizacao.valor = "/";
    const { container } = render(<VLibras />);
    expect(container.querySelector("[vw]")).toBeInTheDocument();
    expect(document.getElementById("vlibras-plugin")).toHaveAttribute("src", "https://vlibras.gov.br/app/vlibras-plugin.js");
  });

  it("não exibe o widget no painel administrativo", () => {
    localizacao.valor = "/painel";
    const { container } = render(<VLibras />);
    expect(container).toBeEmptyDOMElement();
    expect(document.getElementById("vlibras-plugin")).toBeNull();
  });
});
