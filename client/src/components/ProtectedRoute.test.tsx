import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ go: vi.fn(), auth: { user: null as { nivel: string; cadastroConcluido?: boolean } | null, loading: false } }))
vi.mock('wouter', () => ({ useLocation: () => ['/', mocks.go] }))
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => mocks.auth }))

import { UserRoute } from './ProtectedRoute'

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
})
