import { describe, expect, it } from 'vitest'
import { formatarTelefoneBrasileiro } from './telefone'

describe('formatarTelefoneBrasileiro', () => {
  it('formata celular com nono dígito', () => expect(formatarTelefoneBrasileiro('41999998888')).toBe('(41) 99999-8888'))
  it('formata telefone fixo', () => expect(formatarTelefoneBrasileiro('4133334444')).toBe('(41) 3333-4444'))
  it('remove caracteres não numéricos', () => expect(formatarTelefoneBrasileiro('(41) 99999-8888')).toBe('(41) 99999-8888'))
})
