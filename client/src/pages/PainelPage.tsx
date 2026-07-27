import { Route, Switch, useLocation } from 'wouter'
import { useAuth } from '@/contexts/AuthContext'
import Sidebar, { type SidebarItem } from '@/components/layout/Sidebar'
import ClientesPage from './painel/ClientesPage'
import ServicosAdminPage from './painel/ServicosAdminPage'
import FuncionariosPage from './painel/FuncionariosPage'
import AgendamentosPage from './painel/AgendamentosPage'

const sidebarItems: SidebarItem[] = [
  { href: '/painel', label: 'Dashboard', exact: true },
  { href: '/painel/agendamentos', label: 'Agendamentos' },
  { href: '/painel/clientes', label: 'Clientes' },
  { href: '/painel/servicos', label: 'Serviços' },
  { href: '/painel/profissionais', label: 'Profissionais' },
]

export default function PainelPage() {
  const { signOut } = useAuth()
  const [, go] = useLocation()
  const exit = () => { signOut(); go('/') }
  return <div className="min-h-screen bg-gray-100 md:flex"><Sidebar items={sidebarItems} onSignOut={exit} /><main className="min-w-0 flex-1 p-6"><Switch><Route path="/painel" component={() => <h1 className="text-2xl font-bold">Painel administrativo</h1>} /><Route path="/painel/clientes" component={ClientesPage} /><Route path="/painel/servicos" component={ServicosAdminPage} /><Route path="/painel/profissionais" component={FuncionariosPage} /><Route path="/painel/agendamentos" component={AgendamentosPage} /></Switch></main></div>
}
