import { afterEach, describe, expect, it, vi } from 'vitest'
import { horarioAgendamentoJaPassou, inicioAtendimento, respeitaAntecedencia, respeitaAntecedenciaMinimaAgendamento } from './regras-agendamento.service'

describe('regras de agendamento', () => {
  afterEach(() => vi.useRealTimers())

  it('cria corretamente a data e hora local do atendimento', () => {
    expect(inicioAtendimento('2030-01-02', '10:30').getHours()).toBe(10)
  })
  it('aceita horários que respeitam a antecedência', () => {
    expect(respeitaAntecedencia('2030-01-02', '10:30', 24)).toBe(true)
  })
  it('recusa horários sem antecedência suficiente', () => {
    expect(respeitaAntecedencia('2020-01-02', '10:30', 24)).toBe(false)
  })
  it('identifica somente datas e horários anteriores ao momento atual', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2030-08-05T15:20:00'))

    expect(horarioAgendamentoJaPassou('2030-08-04', '16:00')).toBe(true)
    expect(horarioAgendamentoJaPassou('2030-08-05', '15:00')).toBe(true)
    expect(horarioAgendamentoJaPassou('2030-08-05', '15:30')).toBe(false)
    expect(horarioAgendamentoJaPassou('2030-08-06', '10:00')).toBe(false)
  })
  it('exige a antecedência mínima e aceita o limite exato', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2030-08-05T14:40:00'))

    expect(respeitaAntecedenciaMinimaAgendamento('2030-08-05', '15:00', 30)).toBe(false)
    expect(respeitaAntecedenciaMinimaAgendamento('2030-08-05', '15:30', 30)).toBe(true)

    vi.setSystemTime(new Date('2030-08-05T14:30:00'))
    expect(respeitaAntecedenciaMinimaAgendamento('2030-08-05', '15:00', 30)).toBe(true)
    expect(respeitaAntecedenciaMinimaAgendamento('2030-08-05', '15:00', 0)).toBe(true)
  })
})
