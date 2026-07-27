import { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import toast from 'react-hot-toast'
import { api, type Agendamento } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import Sidebar, { type SidebarItem } from '@/components/layout/Sidebar'

const sidebarItems: SidebarItem[] = [
  { href: '/minha-conta', label: 'Minha conta', exact: true },
  { href: '/agendamento', label: 'Novo agendamento' },
]

export default function MinhaContaPage() {
  const { user, signOut } = useAuth()
  const [, go] = useLocation()
  const [items, setItems] = useState<Agendamento[]>([])
  const load = () => { void api.agendamentos.list().then(setItems).catch(e => { toast.error(e.message) }) }
  useEffect(load, [])
  const exit = () => { signOut(); go('/') }

  return <div className="min-h-screen bg-gray-100 md:flex"><Sidebar items={sidebarItems} onSignOut={exit} /><main className="min-w-0 flex-1 p-6"><header className="mb-8"><h1 className="text-2xl font-bold">Olá, {user?.nome}</h1><p>{user?.email}</p></header><h2 className="mb-3 text-xl font-semibold">Meus agendamentos</h2><div className="divide-y rounded bg-white shadow">{items.length === 0 && <p className="p-4 text-gray-500">Nenhum agendamento encontrado.</p>}{items.map(a => <div className="flex justify-between p-4" key={a.id}><span>{a.data} {a.hora} — {a.servico?.nome} com {a.profissional?.nome}<small className="block text-gray-500">{a.status}</small></span>{a.status !== 'CANCELADO' && <button className="text-red-600" onClick={async () => { try { await api.agendamentos.cancel(a.id); load() } catch (e) { toast.error(e instanceof Error ? e.message : 'Erro') } }}>Cancelar</button>}</div>)}</div></main></div>
}
