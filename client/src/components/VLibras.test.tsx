import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const localizacao = vi.hoisted(() => ({ valor: '/' }))
vi.mock('wouter', () => ({ useLocation: () => [localizacao.valor] }))

import { VLibras } from './VLibras'

describe('VLibras', () => {
  afterEach(() => {
    document.getElementById('vlibras-plugin')?.remove()
    delete document.documentElement.dataset.vlibrasInicializado
    delete window.VLibras
  })

  it('carrega o plugin nas páginas públicas', () => {
    localizacao.valor = '/'
    const { container } = render(<VLibras />)
    expect(container.querySelector('[vw]')).toBeInTheDocument()
    expect(container.querySelector('[vw-access-button]')).toHaveClass('active')
    expect(container.querySelector('[vw-plugin-wrapper]')).toBeInTheDocument()
    expect(document.getElementById('vlibras-plugin')).toHaveAttribute('src', 'https://vlibras.gov.br/app/vlibras-plugin.js')
  })

  it('oculta o widget no painel sem desmontar a instância', () => {
    localizacao.valor = '/painel'
    const { container } = render(<VLibras />)
    expect(container.querySelector('[vw]')).toHaveAttribute('hidden')
    expect(document.getElementById('vlibras-plugin')).toBeInTheDocument()
  })

  it('inicializa o widget quando o script é incluído depois do carregamento da SPA', () => {
    localizacao.valor = '/'
    const Widget = vi.fn()
    window.VLibras = { Widget: Widget as unknown as new (config: { rootPath: string; position: string }) => unknown }
    render(<VLibras />)
    expect(Widget).toHaveBeenCalledWith({ rootPath: 'https://vlibras.gov.br/app', position: 'BR' })
  })

  it('mantém o mesmo widget ao alternar entre painel e rota da conta', () => {
    localizacao.valor = '/'
    const Widget = vi.fn()
    window.VLibras = { Widget: Widget as unknown as new (config: { rootPath: string; position: string }) => unknown }
    const { container, rerender } = render(<VLibras />)
    const raiz = container.querySelector('[vw]')
    localizacao.valor = '/painel'
    rerender(<VLibras />)
    expect(raiz).toHaveAttribute('hidden')
    localizacao.valor = '/minha-conta'
    rerender(<VLibras />)
    expect(container.querySelector('[vw]')).toBe(raiz)
    expect(raiz).not.toHaveAttribute('hidden')
    expect(Widget).toHaveBeenCalledTimes(1)
  })
})
