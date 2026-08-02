import { render, screen } from '@testing-library/react'
import type { AnchorHTMLAttributes } from 'react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('wouter', () => ({
  useLocation: () => ['/painel/agendamentos'],
  Link: ({ href, children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => <a href={href} {...props}>{children}</a>,
}))

import Sidebar from './Sidebar'

describe('Sidebar', () => {
  it('informa a pagina atual para tecnologias assistivas', () => {
    render(<Sidebar onSignOut={vi.fn()} items={[{ href: '/painel', label: 'Dashboard', exact: true }, { href: '/painel/agendamentos', label: 'Agendamentos' }]} />)
    expect(screen.getByRole('link', { name: 'Agendamentos' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute('aria-current')
  })
})
