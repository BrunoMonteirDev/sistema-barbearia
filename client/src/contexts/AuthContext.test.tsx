import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  get: vi.fn(), set: vi.fn(), clear: vi.fn(),
  me: vi.fn(), login: vi.fn(), google: vi.fn(), register: vi.fn(),
}))

vi.mock('@/lib/api', () => ({
  authStorage: { get: mocks.get, set: mocks.set, clear: mocks.clear },
  api: {
    usuarios: { me: mocks.me },
    auth: { login: mocks.login, google: mocks.google, register: mocks.register },
  },
}))

import { AuthProvider, useAuth } from './AuthContext'

function Probe() {
  const auth = useAuth()
  return <>
    <p>{auth.loading ? 'carregando' : auth.user?.nome ?? 'sem sessao'}</p>
    <button onClick={() => void auth.signIn('cliente@teste.local', 'Senha@123')}>login</button>
    <button onClick={() => void auth.signInGoogle('token-google')}>google</button>
    <button onClick={() => void auth.signUp('Novo', 'novo@teste.local', 'Senha@123')}>cadastro</button>
    <button onClick={auth.signOut}>sair</button>
  </>
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.get.mockReturnValue(null)
  })

  it('nao consulta o perfil quando nao existe token salvo', async () => {
    render(<AuthProvider><Probe /></AuthProvider>)
    await screen.findByText('sem sessao')
    expect(mocks.me).not.toHaveBeenCalled()
  })

  it('restaura a sessao existente e limpa token invalido', async () => {
    mocks.get.mockReturnValue('token-antigo')
    mocks.me.mockRejectedValue(new Error('expirado'))
    render(<AuthProvider><Probe /></AuthProvider>)
    await waitFor(() => expect(mocks.clear).toHaveBeenCalled())
    expect(screen.getByText('sem sessao')).toBeInTheDocument()
  })

  it('persiste e disponibiliza usuario apos login local, Google e cadastro', async () => {
    mocks.login.mockResolvedValue({ token: 'local', user: { id: '1', nome: 'Local' } })
    mocks.google.mockResolvedValue({ token: 'google', user: { id: '2', nome: 'Google' } })
    mocks.register.mockResolvedValue({ token: 'novo', user: { id: '3', nome: 'Novo' } })
    render(<AuthProvider><Probe /></AuthProvider>)
    await screen.findByText('sem sessao')

    fireEvent.click(screen.getByRole('button', { name: 'login' }))
    await screen.findByText('Local')
    expect(mocks.set).toHaveBeenLastCalledWith('local')
    fireEvent.click(screen.getByRole('button', { name: 'google' }))
    await screen.findByText('Google')
    expect(mocks.set).toHaveBeenLastCalledWith('google')
    fireEvent.click(screen.getByRole('button', { name: 'cadastro' }))
    await screen.findByText('Novo')
    expect(mocks.set).toHaveBeenLastCalledWith('novo')
  })

  it('encerra a sessao localmente', async () => {
    mocks.login.mockResolvedValue({ token: 'local', user: { id: '1', nome: 'Local' } })
    render(<AuthProvider><Probe /></AuthProvider>)
    await screen.findByText('sem sessao')
    fireEvent.click(screen.getByRole('button', { name: 'login' }))
    await screen.findByText('Local')
    fireEvent.click(screen.getByRole('button', { name: 'sair' }))
    expect(mocks.clear).toHaveBeenCalled()
    expect(screen.getByText('sem sessao')).toBeInTheDocument()
  })
})
