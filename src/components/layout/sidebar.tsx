'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export interface SidebarItem { href: string; label: string }

export function Sidebar({ items, title }: { items: SidebarItem[]; title: string }) {
  const pathname = usePathname()
  return <aside className="w-full bg-slate-900 text-white md:min-h-screen md:w-64"><div className="border-b border-slate-700 px-6 py-5"><p className="text-lg font-semibold">{title}</p><p className="text-sm text-slate-300">Área administrativa</p></div><nav aria-label="Navegação administrativa" className="flex gap-1 overflow-x-auto p-3 md:flex-col md:overflow-visible">{items.map((item) => <Link className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${pathname === item.href ? 'bg-white text-slate-900' : 'text-slate-200 hover:bg-slate-800 hover:text-white'}`} href={item.href} key={item.href}>{item.label}</Link>)}</nav></aside>
}
