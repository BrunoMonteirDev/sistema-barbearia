import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ findFirst: vi.fn(), update: vi.fn(), create: vi.fn() }))
vi.mock('../lib/prisma', () => ({ prisma: { configuracao: mocks } }))

import { evolutionService } from './evolution.service'

describe('regras de envio automatico', () => {
  beforeEach(() => vi.clearAllMocks())

  it('mantem o envio automatico e todos os eventos desativados por padrao', async () => {
    mocks.findFirst.mockResolvedValue(null)
    await expect(evolutionService.regrasEnvioAutomatico()).resolves.toEqual({
      ativo: false,
      regras: {
        criacao: false, remarcacao: false, cancelamento: false, pendente: false,
        confirmado: false, concluido: false, atrasado: false, lembrete: false,
        antecedenciaLembreteMinutos: 60,
      },
    })
  })

  it('rejeita antecedencia de lembrete fora dos limites definidos', async () => {
    await expect(evolutionService.atualizarRegrasEnvioAutomatico({ antecedenciaLembreteMinutos: 4 })).rejects.toThrow('5 minutos e 7 dias')
    await expect(evolutionService.atualizarRegrasEnvioAutomatico({ antecedenciaLembreteMinutos: 10081 })).rejects.toThrow('5 minutos e 7 dias')
  })

  it('persiste cada evento escolhido pelo administrador', async () => {
    mocks.findFirst.mockResolvedValueOnce({ id: 'config-1' }).mockResolvedValueOnce({
      envioAutomaticoWhatsapp: true,
      regrasEnvioAutomatico: { criacao: true, confirmado: true, antecedenciaLembreteMinutos: 90 },
    })
    mocks.update.mockResolvedValue({})

    const resultado = await evolutionService.atualizarRegrasEnvioAutomatico({
      criacao: true, remarcacao: false, cancelamento: false, pendente: false,
      confirmado: true, concluido: false, atrasado: false, lembrete: true,
      antecedenciaLembreteMinutos: 90,
    })

    expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'config-1' },
      data: { regrasEnvioAutomatico: expect.objectContaining({ criacao: true, confirmado: true, lembrete: true, antecedenciaLembreteMinutos: 90 }) },
    }))
    expect(resultado.regras.antecedenciaLembreteMinutos).toBe(90)
  })
})
