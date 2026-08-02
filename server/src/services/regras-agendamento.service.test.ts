import { describe, expect, it } from 'vitest'
import { inicioAtendimento, respeitaAntecedencia } from './regras-agendamento.service'

describe('regras de agendamento', () => {
  it('cria corretamente a data e hora local do atendimento', () => {
    expect(inicioAtendimento('2030-01-02', '10:30').getHours()).toBe(10)
  })
  it('aceita horários que respeitam a antecedência', () => {
    expect(respeitaAntecedencia('2030-01-02', '10:30', 24)).toBe(true)
  })
  it('recusa horários sem antecedência suficiente', () => {
    expect(respeitaAntecedencia('2020-01-02', '10:30', 24)).toBe(false)
  })
})
