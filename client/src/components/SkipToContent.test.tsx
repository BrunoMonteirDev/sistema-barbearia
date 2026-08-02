import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SkipToContent } from './SkipToContent'

describe('SkipToContent', () => {
  it('oferece atalho de teclado para o conteudo principal', () => {
    render(<SkipToContent />)
    expect(screen.getByRole('link', { name: 'Pular para o conteúdo principal' })).toHaveAttribute('href', '#conteudo-principal')
  })
})
