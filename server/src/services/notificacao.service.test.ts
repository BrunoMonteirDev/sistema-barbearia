import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), findFirst: vi.fn() }))
const evolutionMocks = vi.hoisted(() => ({ configurada: vi.fn(), enviarTexto: vi.fn(), obterModelosMensagens: vi.fn(), envioAutomaticoAtivo: vi.fn(), regrasEnvioAutomatico: vi.fn() }))
vi.mock('../lib/prisma', () => ({ prisma: { agendamento: { findUnique: mocks.findUnique, findMany: mocks.findMany }, notificacaoAgendamento: { create: mocks.create, findFirst: mocks.findFirst } } }))
vi.mock('./evolution.service', () => ({ evolutionService: evolutionMocks }))

import { notificacaoService } from './notificacao.service'

describe('notificacaoService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    evolutionMocks.configurada.mockReturnValue(false)
    evolutionMocks.envioAutomaticoAtivo.mockResolvedValue(false)
    evolutionMocks.regrasEnvioAutomatico.mockResolvedValue({ ativo: false, regras: { lembrete: false, antecedenciaLembreteMinutos: 60 } })
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

  it('does nothing when the appointment no longer exists', async () => {
    mocks.findUnique.mockResolvedValue(null)

    await expect(notificacaoService.enviar('inexistente', 'CRIACAO')).resolves.toBeUndefined()
    expect(mocks.create).not.toHaveBeenCalled()
  })

  it('sends the resolved template and records a delivered notification', async () => {
    evolutionMocks.configurada.mockReturnValue(true)
    evolutionMocks.obterModelosMensagens.mockResolvedValue({
      criacao: 'Olá, {{cliente}}: {{servico}} com {{profissional}} em {{data}} às {{hora}}.',
    })
    mocks.findUnique.mockResolvedValue({
      id: 'ag-1', data: '2026-08-10', hora: '10:00',
      usuario: { nome: 'Ana', telefone: '44999999999' },
      profissional: { nome: 'Carlos' }, servico: { nome: 'Corte' },
    })

    await notificacaoService.enviar('ag-1', 'CRIACAO')

    expect(evolutionMocks.enviarTexto).toHaveBeenCalledWith('+5544999999999', 'Olá, Ana: Corte com Carlos em 2026-08-10 às 10:00.')
    expect(mocks.create).toHaveBeenCalledWith({ data: expect.objectContaining({ status: 'ENVIADA' }) })
  })

  it('records a failure from the external provider without throwing', async () => {
    evolutionMocks.configurada.mockReturnValue(true)
    evolutionMocks.obterModelosMensagens.mockResolvedValue({ criacao: 'Olá {{cliente}}' })
    evolutionMocks.enviarTexto.mockRejectedValue(new Error('Evolution indisponível'))
    mocks.findUnique.mockResolvedValue({
      id: 'ag-1', data: '2026-08-10', hora: '10:00',
      usuario: { nome: 'Ana', telefone: '44999999999' },
      profissional: { nome: 'Carlos' }, servico: { nome: 'Corte' },
    })

    await expect(notificacaoService.enviar('ag-1', 'CRIACAO')).resolves.toBeUndefined()
    expect(mocks.create).toHaveBeenCalledWith({ data: expect.objectContaining({ status: 'FALHOU', erro: 'Evolution indisponível' }) })
  })

  it('validates whether the customer can receive WhatsApp', async () => {
    mocks.findUnique.mockResolvedValueOnce(null)
    await expect(notificacaoService.podeEnviar('inexistente')).rejects.toThrow('Agendamento não encontrado')

    mocks.findUnique.mockResolvedValueOnce({ usuario: { telefone: null } })
    await expect(notificacaoService.podeEnviar('ag-1')).rejects.toThrow('não possui telefone')

    mocks.findUnique.mockResolvedValueOnce({ usuario: { telefone: '(44) 99999-9999' } })
    await expect(notificacaoService.podeEnviar('ag-1')).resolves.toBeUndefined()
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

  it('sends a reminder at the configured time and only once', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2030-08-05T09:00:00'))
    evolutionMocks.regrasEnvioAutomatico.mockResolvedValue({ ativo: true, regras: { lembrete: true, antecedenciaLembreteMinutos: 60 } })
    mocks.findMany.mockResolvedValue([{ id: 'ag-1', data: '2030-08-05', hora: '10:00' }])
    mocks.findFirst.mockResolvedValue(null)
    const enviar = vi.spyOn(notificacaoService, 'enviar').mockResolvedValue(undefined)

    await notificacaoService.processarLembretes()

    expect(enviar).toHaveBeenCalledWith('ag-1', 'LEMBRETE')
    vi.useRealTimers()
  })

  it('does not look for appointments when reminders are disabled', async () => {
    await notificacaoService.processarLembretes()
    expect(mocks.findMany).not.toHaveBeenCalled()
  })

  it('ignores appointments outside the reminder window', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2030-08-05T09:00:00'))
    evolutionMocks.regrasEnvioAutomatico.mockResolvedValue({ ativo: true, regras: { lembrete: true, antecedenciaLembreteMinutos: 60 } })
    mocks.findMany.mockResolvedValue([{ id: 'ag-1', data: '2030-08-05', hora: '13:00' }])
    const enviar = vi.spyOn(notificacaoService, 'enviar').mockResolvedValue(undefined)

    await notificacaoService.processarLembretes()

    expect(enviar).not.toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('does not repeat a delivered reminder', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2030-08-05T09:00:00'))
    evolutionMocks.regrasEnvioAutomatico.mockResolvedValue({ ativo: true, regras: { lembrete: true, antecedenciaLembreteMinutos: 60 } })
    mocks.findMany.mockResolvedValue([{ id: 'ag-1', data: '2030-08-05', hora: '10:00' }])
    mocks.findFirst.mockResolvedValue({ id: 'notificacao-ja-enviada' })
    const enviar = vi.spyOn(notificacaoService, 'enviar').mockResolvedValue(undefined)

    await notificacaoService.processarLembretes()

    expect(enviar).not.toHaveBeenCalled()
    vi.useRealTimers()
  })
})
