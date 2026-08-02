import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ findUnique: vi.fn(), create: vi.fn() }))
const evolutionMocks = vi.hoisted(() => ({ configurada: vi.fn(), enviarTexto: vi.fn(), obterModelosMensagens: vi.fn(), envioAutomaticoAtivo: vi.fn() }))
vi.mock('../lib/prisma', () => ({ prisma: { agendamento: { findUnique: mocks.findUnique }, notificacaoAgendamento: { create: mocks.create } } }))
vi.mock('./evolution.service', () => ({ evolutionService: evolutionMocks }))

import { notificacaoService } from './notificacao.service'

describe('notificacaoService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    evolutionMocks.configurada.mockReturnValue(false)
    evolutionMocks.envioAutomaticoAtivo.mockResolvedValue(false)
  })

  it('records a pending configuration without interrupting the operation', async () => {
    mocks.findUnique.mockResolvedValue({ id: 'ag-1', data: '2026-08-10', hora: '10:00', usuario: { telefone: '(44) 99999-9999' }, profissional: { nome: 'Carlos' }, servico: { nome: 'Corte' } })
    await notificacaoService.enviar('ag-1', 'CRIACAO')
    expect(mocks.create).toHaveBeenCalledWith({ data: expect.objectContaining({ agendamentoId: 'ag-1', destino: '+5544999999999', status: 'PENDENTE_CONFIGURACAO' }) })
  })

  it('records an ignored notification when the customer has no phone', async () => {
    mocks.findUnique.mockResolvedValue({ id: 'ag-1', usuario: { telefone: null }, profissional: { nome: 'Carlos' }, servico: { nome: 'Corte' } })
    await notificacaoService.enviar('ag-1', 'CANCELAMENTO')
    expect(mocks.create).toHaveBeenCalledWith({ data: expect.objectContaining({ status: 'IGNORADA' }) })
  })

  it('does not send automatically when the event is disabled', async () => {
    const enviar = vi.spyOn(notificacaoService, 'enviar').mockResolvedValue(undefined)
    await notificacaoService.enviarSeAutomatico('ag-1', 'CONFIRMADO')
    expect(evolutionMocks.envioAutomaticoAtivo).toHaveBeenCalledWith('confirmado')
    expect(enviar).not.toHaveBeenCalled()
  })

  it('sends only an explicitly enabled automatic event', async () => {
    evolutionMocks.envioAutomaticoAtivo.mockResolvedValue(true)
    const enviar = vi.spyOn(notificacaoService, 'enviar').mockResolvedValue(undefined)
    await notificacaoService.enviarSeAutomatico('ag-1', 'CONFIRMADO')
    expect(enviar).toHaveBeenCalledWith('ag-1', 'CONFIRMADO')
  })
})
