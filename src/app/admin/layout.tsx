import { Sidebar, type SidebarItem } from '@/components/layout/sidebar'

const sidebarItems: SidebarItem[] = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/agendamentos', label: 'Agendamentos' },
  { href: '/admin/clientes', label: 'Clientes' },
  { href: '/admin/servicos', label: 'Serviços' },
  { href: '/admin/profissionais', label: 'Profissionais' },
]

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="min-h-screen bg-slate-50 md:flex"><Sidebar items={sidebarItems} title="Barbearia Web" /><main className="min-w-0 flex-1 p-6">{children}</main></div>
}
