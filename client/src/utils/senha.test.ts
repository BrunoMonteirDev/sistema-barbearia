import { describe, expect, it } from 'vitest'
import { gerarSenhaForte, validarSenha } from './senha'

describe('senha', () => {
  it('gera senhas que passam pelas regras de segurança', () => {
    Array.from({ length: 100 }, () => gerarSenhaForte()).forEach((senha) => expect(validarSenha(senha)).toBeNull())
  })

  it('rejeita senha curta e sequencial', () => expect(validarSenha('Aa!1234567')).not.toBeNull())
  it('aceita uma senha segura', () => expect(validarSenha('Segura!8Kxw')).toBeNull())
})
