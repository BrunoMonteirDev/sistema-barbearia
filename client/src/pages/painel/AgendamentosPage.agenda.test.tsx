import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AgendaDiaria, AgendaSemanal } from './AgendamentosPage'
import type { Agendamento } from '@/lib/api'

const profissional = { id: 'prof-1', nome: 'Carlos', ativo: true }
const pendente = { id: 'ag-1', data: '2026-08-03', hora: '08:00', status: 'PENDENTE', profissional, usuario: { id: 'cli-1', nome: 'Bruno', email: 'bruno@teste.com', nivel: 'Cliente' }, servico: { id: 'ser-1', nome: 'Corte clássico', duracao: 60, preco: 40, ativo: true } }

describe('agenda administrativa', () => {
  it('mostra o bloco do agendamento no horário e profissional corretos', () => {
    render(<AgendaDiaria items={[pendente as Agendamento]} profissionais={[profissional]} onEdit={vi.fn()} onConfirm={vi.fn()} onConclude={vi.fn()} />)
    expect(screen.getByText('Bruno')).toBeInTheDocument()
    expect(screen.getByText(/Corte clássico.*60 min/)).toBeInTheDocument()
    expect(screen.getByText('Pendente')).toBeInTheDocument()
  })

  it('executa a confirmação rápida do atendimento pendente', () => {
    const onConfirm = vi.fn()
    render(<AgendaDiaria items={[pendente as Agendamento]} profissionais={[profissional]} onEdit={vi.fn()} onConfirm={onConfirm} onConclude={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }))
    expect(onConfirm).toHaveBeenCalledWith(pendente)
  })

  it('exibe na semana somente os blocos da data correspondente', () => {
    render(<AgendaSemanal items={[pendente as Agendamento]} dataReferencia="2026-08-03" onEdit={vi.fn()} onConfirm={vi.fn()} onConclude={vi.fn()} />)
    expect(screen.getByText(/08:00.*Bruno/)).toBeInTheDocument()
    expect(screen.getByText(/Carlos.*Corte clássico/)).toBeInTheDocument()
  })
})
