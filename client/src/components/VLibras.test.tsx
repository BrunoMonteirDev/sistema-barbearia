import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const localizacao = vi.hoisted(() => ({ valor: "/" }));
vi.mock("wouter", () => ({ useLocation: () => [localizacao.valor] }));

import { VLibras } from "./VLibras";

describe("VLibras", () => {
  afterEach(() => {
    document.getElementById("vlibras-plugin")?.remove();
    delete document.documentElement.dataset.vlibrasInicializado;
    delete window.VLibras;
  });

  it("carrega o plugin nas páginas públicas", () => {
    localizacao.valor = "/";
    const { container } = render(<VLibras />);
    expect(container.querySelector("[vw]")).toBeInTheDocument();
    expect(container.querySelector("[vw-access-button]")).toHaveClass("active");
    expect(container.querySelector("[vw-plugin-wrapper]")).toBeInTheDocument();
    expect(document.getElementById("vlibras-plugin")).toHaveAttribute("src", "https://vlibras.gov.br/app/vlibras-plugin.js");
  });

  it("não exibe o widget no painel administrativo", () => {
    localizacao.valor = "/painel";
    const { container } = render(<VLibras />);
    expect(container).toBeEmptyDOMElement();
    expect(document.getElementById("vlibras-plugin")).toBeNull();
  });

  it("inicializa o widget quando o script é incluído depois do carregamento da SPA", () => {
    localizacao.valor = "/";
    const Widget = vi.fn();
    window.VLibras = { Widget: Widget as unknown as new (config: { rootPath: string; position: string }) => unknown };

    render(<VLibras />);

    expect(Widget).toHaveBeenCalledWith({ rootPath: "https://vlibras.gov.br/app", position: "BR" });
  });
});
