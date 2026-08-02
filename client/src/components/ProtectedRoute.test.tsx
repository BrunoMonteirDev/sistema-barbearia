import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ go: vi.fn(), auth: { user: null as { nivel: string; cadastroConcluido?: boolean } | null, loading: false } }))
vi.mock('wouter', () => ({ useLocation: () => ['/', mocks.go] }))
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => mocks.auth }))

import { AdminRoute, UserRoute } from './ProtectedRoute'

describe('UserRoute', () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.auth.loading = false; mocks.auth.user = null })
  it('envia cadastro Google pendente para a conclusão', () => {
    mocks.auth.user = { nivel: 'Cliente', cadastroConcluido: false }
    render(<UserRoute component={() => <p>Área privada</p>} />)
    expect(mocks.go).toHaveBeenCalledWith('/concluir-cadastro')
  })
  it('permite cliente com cadastro concluído', () => {
    mocks.auth.user = { nivel: 'Cliente', cadastroConcluido: true }
    render(<UserRoute component={() => <p>Área privada</p>} />)
    expect(mocks.go).not.toHaveBeenCalled()
  })
  it('redireciona visitante sem sessao para o login', () => {
    render(<UserRoute component={() => <p>Área privada</p>} />)
    expect(mocks.go).toHaveBeenCalledWith('/login')
  })
  it('redireciona usuario sem perfil de cliente para o painel', () => {
    mocks.auth.user = { nivel: 'Administrador', cadastroConcluido: true }
    render(<UserRoute component={() => <p>Área privada</p>} />)
    expect(mocks.go).toHaveBeenCalledWith('/painel')
  })
  it('nao renderiza nem redireciona enquanto a sessao carrega', () => {
    mocks.auth.loading = true
    render(<UserRoute component={() => <p>Área privada</p>} />)
    expect(screen.queryByText('Área privada')).not.toBeInTheDocument()
    expect(mocks.go).not.toHaveBeenCalled()
  })
})

describe('AdminRoute', () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.auth.loading = false; mocks.auth.user = null })
  it('restringe o painel a administradores', () => {
    mocks.auth.user = { nivel: 'Cliente', cadastroConcluido: true }
    render(<AdminRoute component={() => <p>Painel administrativo</p>} />)
    expect(mocks.go).toHaveBeenCalledWith('/minha-conta')
  })
  it('renderiza o painel para administrador autenticado', () => {
    mocks.auth.user = { nivel: 'Administrador', cadastroConcluido: true }
    render(<AdminRoute component={() => <p>Painel administrativo</p>} />)
    expect(screen.getByText('Painel administrativo')).toBeInTheDocument()
  })
})
