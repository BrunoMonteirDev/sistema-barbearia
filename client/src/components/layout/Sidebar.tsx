import type { LucideIcon } from 'lucide-react'
import { LogOut, Scissors } from 'lucide-react'
import { Link, useLocation } from 'wouter'

export interface SidebarItem {
  href: string
  label: string
  icon?: LucideIcon
  exact?: boolean
}

interface SidebarProps {
  items: SidebarItem[]
  onSignOut: () => void
  title?: string
}

export default function Sidebar({ items, onSignOut, title = 'Barbearia' }: SidebarProps) {
  const [location] = useLocation()

  return (
    <aside className="w-full shrink-0 bg-secondary-500 text-white md:min-h-screen md:w-64">
      <Link href="/" className="flex items-center gap-2 border-b border-secondary-400 px-5 py-5">
        <Scissors className="h-6 w-6" aria-hidden="true" />
        <span className="text-lg font-bold">{title}</span>
      </Link>
      <nav aria-label="Navegação do painel" className="flex gap-1 overflow-x-auto p-3 md:flex-col md:overflow-visible">
        {items.map((item) => {
          const isActive = item.exact ? location === item.href : location === item.href || location.startsWith(`${item.href}/`)
          const Icon = item.icon
          return <Link key={item.href} href={item.href} className={`flex shrink-0 items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${isActive ? 'bg-primary-500 text-white' : 'text-gray-200 hover:bg-secondary-400 hover:text-white'}`}>{Icon && <Icon className="h-5 w-5" aria-hidden="true" />}{item.label}</Link>
        })}
      </nav>
      <div className="border-t border-secondary-400 p-3 md:mt-auto">
        <button type="button" onClick={onSignOut} className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-200 transition-colors hover:bg-secondary-400 hover:text-white"><LogOut className="h-5 w-5" aria-hidden="true" />Sair</button>
      </div>
    </aside>
  )
}
