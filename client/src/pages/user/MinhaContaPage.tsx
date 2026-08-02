import { useEffect, useState, type FormEvent } from 'react'
import { useLocation } from 'wouter'
import toast from 'react-hot-toast'
import { api, type Usuario } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import Sidebar, { type SidebarItem } from '@/components/layout/Sidebar'
import { formatarTelefoneBrasileiro } from '@/utils/telefone'

const sidebarItems: SidebarItem[] = [{ href: '/minha-conta', label: 'Minha conta', exact: true }, { href: '/minha-conta/agendamentos', label: 'Meus agendamentos' }]

export function UserLayout({ children }: { children: React.ReactNode }) {
  const { signOut } = useAuth(); const [, go] = useLocation()
  return <div className="min-h-screen bg-gray-100 md:flex"><Sidebar items={sidebarItems} onSignOut={() => { signOut(); go('/') }} title="Barbearia" /><main className="min-w-0 flex-1 p-6">{children}</main></div>
}

export default function MinhaContaPage() {
  const [form, setForm] = useState<Usuario | null>(null)
  const [saving, setSaving] = useState(false)
  const [confirmacaoExclusao, setConfirmacaoExclusao] = useState('')
  const [excluindo, setExcluindo] = useState(false)
  const { signOut } = useAuth(); const [, go] = useLocation()
  useEffect(() => { void api.usuarios.me().then(setForm).catch(error => toast.error(error.message)) }, [])
  const save = async (event: FormEvent) => { event.preventDefault(); if (!form) return; try { setSaving(true); await api.usuarios.updateMe({ nome: form.nome, telefone: form.telefone ?? null }); toast.success('Dados atualizados.') } catch (error) { toast.error(error instanceof Error ? error.message : 'Não foi possível atualizar seus dados.') } finally { setSaving(false) } }
  const excluir = async (event: FormEvent) => { event.preventDefault(); try { setExcluindo(true); await api.usuarios.excluirMinhaConta(confirmacaoExclusao); signOut(); toast.success('Conta excluída com sucesso.'); go('/') } catch (error) { toast.error(error instanceof Error ? error.message : 'Não foi possível excluir a conta.') } finally { setExcluindo(false) } }
  return <UserLayout><div className="mx-auto max-w-2xl"><header className="mb-6"><p className="text-sm font-semibold text-primary-700">Perfil</p><h1 className="text-3xl font-bold text-slate-950">Minha conta</h1><p className="mt-1 text-slate-600">Mantenha seus dados de contato atualizados.</p></header>{!form ? <p className="text-slate-600">Carregando dados...</p> : <><form onSubmit={save} className="space-y-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"><label className="block text-sm font-semibold text-slate-800">Nome<input required className="input-field mt-1" value={form.nome} onChange={event => setForm(current => current ? { ...current, nome: event.target.value } : current)} /></label><label className="block text-sm font-semibold text-slate-800">E-mail<input disabled className="input-field mt-1" value={form.email} /><span className="mt-1 block text-xs font-normal text-slate-500">O e-mail de acesso não pode ser alterado por aqui.</span></label><label className="block text-sm font-semibold text-slate-800">Telefone<input inputMode="tel" className="input-field mt-1" value={form.telefone ?? ''} onChange={event => setForm(current => current ? { ...current, telefone: formatarTelefoneBrasileiro(event.target.value) } : current)} /></label><div className="flex justify-end"><button disabled={saving} className="btn-primary">{saving ? 'Salvando...' : 'Salvar alterações'}</button></div></form><section className="mt-6 rounded-lg border border-red-200 bg-red-50 p-6"><h2 className="text-lg font-bold text-red-900">Excluir conta</h2><p className="mt-1 text-sm leading-6 text-red-800">Esta ação desativa seu acesso e encerra sua sessão. O histórico de agendamentos pode ser mantido quando necessário. Digite <strong>EXCLUIR MINHA CONTA</strong> para confirmar.</p><form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={excluir}><label className="sr-only" htmlFor="confirmacao-exclusao">Confirmação de exclusão</label><input id="confirmacao-exclusao" className="input-field flex-1" value={confirmacaoExclusao} onChange={event => setConfirmacaoExclusao(event.target.value)} placeholder="EXCLUIR MINHA CONTA" /><button disabled={excluindo || confirmacaoExclusao.trim().toUpperCase() !== 'EXCLUIR MINHA CONTA'} className="rounded-lg bg-red-700 px-4 py-2 font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50">{excluindo ? 'Excluindo...' : 'Excluir minha conta'}</button></form></section></>}</div></UserLayout>
}
