import { useState } from 'react'
import { Link, useLocation } from 'wouter'
import { Menu, X, Scissors, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [location] = useLocation()
  const { user } = useAuth()

  const navItems = [
    { href: '/', label: 'Inicio' },
    { href: '/servicos', label: 'Servicos' },
    { href: '/agendamento', label: 'Agendar' },
  ]

  return (
    <header className="bg-secondary-500 text-white sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <Scissors className="h-6 w-6" />
            <span>Barbearia</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`font-medium transition-colors hover:text-primary-400 ${
                  location === item.href ? 'text-primary-400' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            {user ? (
              <Link href="/painel" className="flex items-center gap-2 btn-primary text-sm">
                <User className="h-4 w-4" />
                {user.nome || 'Painel'}
              </Link>
            ) : (
              <Link href="/login" className="btn-primary text-sm">
                Entrar
              </Link>
            )}
          </nav>

          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-secondary-400">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block py-2 font-medium transition-colors hover:text-primary-400 ${
                  location === item.href ? 'text-primary-400' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={user ? '/painel' : '/login'}
              className="block py-2 font-medium text-primary-400"
              onClick={() => setIsMenuOpen(false)}
            >
              {user ? 'Painel' : 'Entrar'}
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}
