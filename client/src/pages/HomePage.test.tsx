import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { publico } = vi.hoisted(() => ({ publico: vi.fn() }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: null, signOut: vi.fn() }) }));
vi.mock("@/lib/api", () => ({ api: { configuracoes: { publico } } }));

import HomePage from "./HomePage";

describe("HomePage", () => {
  it("usa o WhatsApp configurado pelo painel", async () => {
    publico.mockResolvedValue({ telefoneWhatsApp: "(44) 99999-9999" });
    render(<HomePage />);

    expect(await screen.findByRole("link", { name: "WhatsApp" })).toHaveAttribute("href", "https://wa.me/5544999999999");
  });

  it("não oferece link fixo quando o WhatsApp não foi configurado", async () => {
    publico.mockResolvedValue({ telefoneWhatsApp: null });
    render(<HomePage />);

    expect(await screen.findByText("WhatsApp indisponível")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "WhatsApp" })).not.toBeInTheDocument();
  });
});
