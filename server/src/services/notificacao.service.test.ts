import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ findUnique: vi.fn(), create: vi.fn() }))
vi.mock('../lib/prisma', () => ({ prisma: { agendamento: { findUnique: mocks.findUnique }, notificacaoAgendamento: { create: mocks.create } } }))

import { notificacaoService } from './notificacao.service'

describe('notificacaoService', () => {
  beforeEach(() => { vi.clearAllMocks(); delete process.env.QUEPASA_API_URL; delete process.env.QUEPASA_API_TOKEN })
  it('registra pendência sem impedir o fluxo quando Quepasa não está configurado', async () => {
    mocks.findUnique.mockResolvedValue({ id: 'ag-1', data: '2026-08-10', hora: '10:00', usuario: { telefone: '(44) 99999-9999' }, profissional: { nome: 'Carlos' }, servico: { nome: 'Corte' } })
    await notificacaoService.enviar('ag-1', 'CRIACAO')
    expect(mocks.create).toHaveBeenCalledWith({ data: expect.objectContaining({ agendamentoId: 'ag-1', destino: '5544999999999', status: 'PENDENTE_CONFIGURACAO' }) })
  })
  it('registra notificação ignorada quando o cliente não possui telefone', async () => {
    mocks.findUnique.mockResolvedValue({ id: 'ag-1', usuario: { telefone: null }, profissional: { nome: 'Carlos' }, servico: { nome: 'Corte' } })
    await notificacaoService.enviar('ag-1', 'CANCELAMENTO')
    expect(mocks.create).toHaveBeenCalledWith({ data: expect.objectContaining({ status: 'IGNORADA' }) })
  })
})
