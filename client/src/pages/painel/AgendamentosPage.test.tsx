import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AgendaDiaria, AgendaSemanal } from "./AgendamentosPage";

describe("AgendaDiaria", () => {
  it("renderiza o bloco no profissional e horário corretos e confirma pendência", () => {
    const onEdit = vi.fn();
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    const onConclude = vi.fn().mockResolvedValue(undefined);
    render(<AgendaDiaria profissionais={[{ id: "p1", nome: "Carlos", ativo: true }, { id: "p2", nome: "João", ativo: true }]} items={[{ id: "ag-1", data: "2026-08-20", hora: "10:00", status: "PENDENTE", usuario: { id: "u1", nome: "Bruno", email: "bruno@teste.com", nivel: "Cliente" }, profissional: { id: "p1", nome: "Carlos", ativo: true }, servico: { id: "s1", nome: "Corte", preco: 40, duracao: 60, ativo: true } }]} onEdit={onEdit} onConfirm={onConfirm} onConclude={onConclude} />);

    expect(screen.getByText("Carlos")).toBeInTheDocument();
    expect(screen.getByText("João")).toBeInTheDocument();
    expect(screen.getByText("Bruno")).toBeInTheDocument();
    expect(screen.getByText("Corte · 60 min")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ id: "ag-1" }));
    fireEvent.click(screen.getByText("Bruno"));
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: "ag-1" }));
  });
});

describe("AgendaSemanal", () => {
  it("organiza atendimentos na semana da data de referência", () => {
    const onEdit = vi.fn();
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    render(<AgendaSemanal dataReferencia="2026-08-20" items={[{ id: "ag-semana", data: "2026-08-20", hora: "14:30", status: "PENDENTE", usuario: { id: "u1", nome: "Ana", email: "ana@teste.com", nivel: "Cliente" }, profissional: { id: "p1", nome: "Carlos", ativo: true }, servico: { id: "s1", nome: "Barba", preco: 30, duracao: 30, ativo: true } }]} onEdit={onEdit} onConfirm={onConfirm} onConclude={vi.fn().mockResolvedValue(undefined)} />);
    expect(screen.getByText("14:30 · Ana")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ id: "ag-semana" }));
  });
});
