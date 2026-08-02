import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  agendamentos: vi.fn(),
  usuarios: vi.fn(),
  profissionais: vi.fn(),
  evolution: vi.fn(),
}))

vi.mock('@/lib/api', () => ({
  api: {
    agendamentos: { list: mocks.agendamentos },
    usuarios: { list: mocks.usuarios },
    profissionais: { listAdmin: mocks.profissionais },
    evolution: { status: mocks.evolution },
  },
}))
vi.mock('react-hot-toast', () => ({ default: { error: vi.fn() } }))

import DashboardPage from './DashboardPage'

describe('DashboardPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('apresenta os indicadores administrativos e a conexao WhatsApp', async () => {
    mocks.agendamentos.mockResolvedValue([])
    mocks.usuarios.mockResolvedValue([
      { id: 'cliente', nome: 'Cliente', nivel: 'Cliente' },
      { id: 'admin', nome: 'Admin', nivel: 'Administrador' },
    ])
    mocks.profissionais.mockResolvedValue([{ id: 'pro-1', nome: 'Carlos', ativo: true }])
    mocks.evolution.mockResolvedValue({ configurada: true, disponivel: true, instanciaCriada: true, conectada: true, nomeExibicao: 'Barbearia', instancia: 'barbearia', estado: 'open' })

    render(<DashboardPage />)

    await screen.findByText('WhatsApp conectado')
    expect(screen.getByText('Agenda de hoje')).toBeInTheDocument()
    expect(screen.getByText('Clientes ativos')).toBeInTheDocument()
    expect(screen.getByText('1 profissionais ativos')).toBeInTheDocument()
    expect(screen.getByText('Nenhum atendimento agendado.')).toBeInTheDocument()
  })

  it('informa indisponibilidade do WhatsApp sem bloquear o dashboard', async () => {
    mocks.agendamentos.mockResolvedValue([])
    mocks.usuarios.mockResolvedValue([])
    mocks.profissionais.mockResolvedValue([])
    mocks.evolution.mockRejectedValue(new Error('offline'))

    render(<DashboardPage />)

    await waitFor(() => expect(screen.getByText('WhatsApp indisponivel')).toBeInTheDocument())
    expect(screen.getByText('Nao foi possivel consultar a Evolution.')).toBeInTheDocument()
    expect(screen.getByText('0 profissionais ativos')).toBeInTheDocument()
  })
})
