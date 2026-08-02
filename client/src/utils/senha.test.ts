import { describe, expect, it } from 'vitest'
import { gerarSenhaForte, validarSenha } from './senha'

describe('senha', () => {
  it('gera senha que passa pelas regras', () => expect(validarSenha(gerarSenhaForte())).toBeNull())
  it('rejeita senha curta e sequencial', () => expect(validarSenha('Aa!1234567')).not.toBeNull())
  it('aceita uma senha segura', () => expect(validarSenha('Segura!8Kxw')).toBeNull())
})
