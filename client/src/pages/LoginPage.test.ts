import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  go: vi.fn(),
  signInGoogle: vi.fn(),
  auth: { user: null as { cadastroConcluido?: boolean } | null },
}))

vi.mock('wouter', () => ({ useLocation: () => ['/', mocks.go] }))
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ signIn: vi.fn(), signUp: vi.fn(), signInGoogle: mocks.signInGoogle, user: mocks.auth.user }) }))
vi.mock('@/components/GoogleLoginButton', () => ({ GoogleLoginButton: ({ onCredential }: { onCredential: (token: string) => void }) => createElement('button', { type: 'button', onClick: () => onCredential('token-google') }, 'Google') }))

import LoginPage, { destinoAposLoginGoogle } from './LoginPage'

describe('destinoAposLoginGoogle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.auth.user = null
  })
  it('envia conta pendente para a conclusao de cadastro', () => {
    expect(destinoAposLoginGoogle(false)).toBe('/concluir-cadastro')
  })

  it('envia conta completa para minha conta', () => {
    expect(destinoAposLoginGoogle(true)).toBe('/minha-conta')
  })

  it('aguarda o usuario estar no contexto antes de navegar para concluir cadastro', async () => {
    mocks.signInGoogle.mockResolvedValue({ cadastroConcluido: false })
    const tela = render(createElement(LoginPage))

    fireEvent.click(screen.getByRole('button', { name: 'Google' }))
    await waitFor(() => expect(mocks.signInGoogle).toHaveBeenCalledWith('token-google'))
    expect(mocks.go).not.toHaveBeenCalled()

    mocks.auth.user = { cadastroConcluido: false }
    tela.rerender(createElement(LoginPage))
    await waitFor(() => expect(mocks.go).toHaveBeenCalledWith('/concluir-cadastro'))
  })
})
