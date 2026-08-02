import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ me: vi.fn(), updateMe: vi.fn(), excluirMinhaConta: vi.fn(), signOut: vi.fn() }))
vi.mock('@/lib/api', () => ({ api: { usuarios: { me: mocks.me, updateMe: mocks.updateMe, excluirMinhaConta: mocks.excluirMinhaConta } } }))
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ signOut: mocks.signOut }) }))
vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }))
vi.mock('@/components/layout/Sidebar', () => ({ default: () => <aside />, }))

import MinhaContaPage from './MinhaContaPage'

describe('MinhaContaPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.me.mockResolvedValue({ id: 'u-1', nome: 'Cliente', email: 'cliente@teste.com', telefone: null, nivel: 'Cliente' })
  })

  it('só habilita a exclusão após a confirmação textual e encerra a sessão', async () => {
    mocks.excluirMinhaConta.mockResolvedValue({ success: true })
    render(<MinhaContaPage />)
    const botao = await screen.findByRole('button', { name: 'Excluir minha conta' })
    expect(botao).toBeDisabled()
    fireEvent.change(screen.getByLabelText('Confirmação de exclusão'), { target: { value: 'EXCLUIR MINHA CONTA' } })
    expect(botao).toBeEnabled()
    fireEvent.click(botao)
    await waitFor(() => expect(mocks.excluirMinhaConta).toHaveBeenCalledWith('EXCLUIR MINHA CONTA'))
    expect(mocks.signOut).toHaveBeenCalledOnce()
  })
})
