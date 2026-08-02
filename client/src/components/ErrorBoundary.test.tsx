import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ErrorBoundary } from './ErrorBoundary'

function ComponenteComErro(): never {
  throw new Error('falha de teste')
}

describe('ErrorBoundary', () => {
  it('substitui falha de renderizacao por uma tela recuperavel', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    render(<ErrorBoundary><ComponenteComErro /></ErrorBoundary>)
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível abrir esta tela')
    expect(screen.getByRole('link', { name: 'Voltar ao início' })).toHaveAttribute('href', '/')
  })
})
