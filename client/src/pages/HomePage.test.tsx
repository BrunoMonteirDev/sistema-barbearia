import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { publico } = vi.hoisted(() => ({ publico: vi.fn() }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: null, signOut: vi.fn() }) }));
vi.mock("@/lib/api", () => ({ api: { configuracoes: { publico } } }));

import HomePage from "./HomePage";

describe("HomePage", () => {
  it("usa o WhatsApp configurado pelo painel", async () => {
    publico.mockResolvedValue({ telefoneWhatsApp: "(44) 99999-9999", email: "contato@teste.com", instagram: "https://instagram.com/barbearia" });
    render(<HomePage />);

    expect(await screen.findByRole("link", { name: "WhatsApp" })).toHaveAttribute("href", "https://wa.me/5544999999999");
  });

  it("não oferece link fixo quando o WhatsApp não foi configurado", async () => {
    publico.mockResolvedValue({ telefoneWhatsApp: null, email: null, instagram: null });
    render(<HomePage />);

    expect(await screen.findByText("WhatsApp indisponível")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "WhatsApp" })).not.toBeInTheDocument();
  });

  it("sincroniza o e-mail, Instagram e WhatsApp configurados no rodapé", async () => {
    publico.mockResolvedValue({ telefoneWhatsApp: "44999999999", email: "oi@barbearia.com", instagram: "https://instagram.com/barbearia" });
    render(<HomePage />);
    expect(await screen.findByRole("link", { name: "Instagram da Barbearia" })).toHaveAttribute("href", "https://instagram.com/barbearia");
    expect(screen.getByRole("link", { name: "Abrir WhatsApp da barbearia" })).toHaveAttribute("href", "https://wa.me/5544999999999");
    expect(screen.getByRole("link", { name: "oi@barbearia.com" })).toHaveAttribute("href", "mailto:oi@barbearia.com");
  });
});
