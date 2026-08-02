import { describe, expect, it } from 'vitest'
import { destinoAposLoginGoogle } from './LoginPage'

describe('destinoAposLoginGoogle', () => {
  it('envia conta pendente para a conclusao de cadastro', () => {
    expect(destinoAposLoginGoogle(false)).toBe('/concluir-cadastro')
  })

  it('envia conta completa para minha conta', () => {
    expect(destinoAposLoginGoogle(true)).toBe('/minha-conta')
  })
})
