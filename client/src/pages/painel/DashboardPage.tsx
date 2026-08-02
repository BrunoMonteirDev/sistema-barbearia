import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, CalendarPlus, CheckCircle2, ChevronRight, CircleDollarSign, Clock3, ListTodo, Scissors, UsersRound } from 'lucide-react'
import { Link } from 'wouter'
import toast from 'react-hot-toast'
import { api, type Agendamento, type Profissional, type Usuario } from '@/lib/api'

type DashboardData = { agendamentos: Agendamento[]; clientes: Usuario[]; profissionais: Profissional[] }

const statusLabel: Record<string, string> = { PENDENTE: 'Pendente', CONFIRMADO: 'Confirmado', CONCLUIDO: 'Concluído', CANCELADO: 'Cancelado' }
const statusClass: Record<string, string> = { PENDENTE: 'bg-amber-100 text-amber-900', CONFIRMADO: 'bg-blue-100 text-blue-900', CONCLUIDO: 'bg-emerald-100 text-emerald-900', CANCELADO: 'bg-red-100 text-red-900' }

function hoje() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date())
}

function moeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({ agendamentos: [], clientes: [], profissionais: [] })
  const [loading, setLoading] = useState(true)
  const dataHoje = hoje()

  useEffect(() => {
    void Promise.all([api.agendamentos.list(), api.usuarios.list(), api.profissionais.listAdmin()])
      .then(([agendamentos, usuarios, profissionais]) => setData({ agendamentos, clientes: usuarios.filter(usuario => usuario.nivel === 'Cliente'), profissionais }))
      .catch(error => toast.error(error instanceof Error ? error.message : 'Não foi possível carregar o dashboard.'))
      .finally(() => setLoading(false))
  }, [])

  const resumo = useMemo(() => {
    const ativosHoje = data.agendamentos.filter(item => item.data === dataHoje && item.status !== 'CANCELADO')
    const concluidosMes = data.agendamentos.filter(item => item.status === 'CONCLUIDO' && item.data.startsWith(dataHoje.slice(0, 7)))
    const faturamento = concluidosMes.reduce((total, item) => total + Number(item.servico?.preco ?? 0), 0)
    const proximos = data.agendamentos
      .filter(item => item.data >= dataHoje && item.status !== 'CANCELADO')
      .sort((a, b) => `${a.data}${a.hora}`.localeCompare(`${b.data}${b.hora}`))
      .slice(0, 6)
    return {
      hoje: ativosHoje.length,
      confirmados: ativosHoje.filter(item => item.status === 'CONFIRMADO').length,
      pendentes: ativosHoje.filter(item => item.status === 'PENDENTE').length,
      faturamento,
      proximos,
    }
  }, [data, dataHoje])

  const cards = [
    { label: 'Agenda de hoje', value: resumo.hoje, help: `${resumo.confirmados} confirmados`, icon: CalendarDays, color: 'bg-blue-50 text-blue-800' },
    { label: 'Pendentes hoje', value: resumo.pendentes, help: 'Aguardando confirmação', icon: Clock3, color: 'bg-amber-50 text-amber-900' },
    { label: 'Clientes ativos', value: data.clientes.length, help: 'Clientes cadastrados', icon: UsersRound, color: 'bg-violet-50 text-violet-900' },
    { label: 'Faturamento do mês', value: moeda(resumo.faturamento), help: 'Somente concluídos', icon: CircleDollarSign, color: 'bg-emerald-50 text-emerald-900' },
  ]

  return <section className="mx-auto max-w-7xl space-y-6">
    <header className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end">
      <div><p className="mb-1 text-sm font-medium text-primary-700">Visão geral</p><h1 className="text-3xl font-bold tracking-tight text-slate-900">Bom trabalho. Veja como está o dia.</h1><p className="mt-1 text-sm text-slate-600">Acompanhe agenda, clientes e resultados da barbearia.</p></div>
      <div className="flex flex-wrap gap-2"><Link href="/painel/agendamentos" className="inline-flex items-center justify-center gap-2 rounded-md border border-secondary-300 bg-white px-4 py-2.5 text-sm font-semibold text-secondary-800 shadow-sm transition-colors hover:bg-secondary-50"><ListTodo className="h-4 w-4" />Organizar agenda</Link><Link href="/painel/agendamentos" className="btn-primary gap-2"><CalendarPlus className="h-4 w-4" />Novo agendamento</Link></div>
    </header>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(card => <article key={card.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-slate-600">{card.label}</p><p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{loading ? '—' : card.value}</p><p className="mt-1 text-xs text-slate-500">{card.help}</p></div><span className={`grid h-10 w-10 place-items-center rounded-md ${card.color}`}><card.icon className="h-5 w-5" /></span></div></article>)}
    </div>

    <div className="grid gap-6 lg:grid-cols-[1.65fr_1fr]">
      <article className="rounded-lg border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><h2 className="font-semibold text-slate-900">Próximos atendimentos</h2><p className="text-sm text-slate-500">A partir de hoje</p></div><Link href="/painel/agendamentos" className="inline-flex items-center gap-1 text-sm font-semibold text-secondary-700 hover:text-secondary-900">Ver agenda <ChevronRight className="h-4 w-4" /></Link></div>
        <div className="divide-y divide-slate-100">{loading ? <p className="p-8 text-center text-sm text-slate-500">Carregando agenda...</p> : resumo.proximos.length === 0 ? <div className="p-10 text-center"><CalendarDays className="mx-auto mb-3 h-8 w-8 text-slate-400" /><p className="font-medium text-slate-700">Nenhum atendimento agendado.</p><p className="mt-1 text-sm text-slate-500">Use o botão acima para criar um agendamento.</p></div> : resumo.proximos.map(item => <div key={item.id} className="flex items-center gap-4 px-5 py-4"><div className="w-14 shrink-0 rounded-md border border-slate-200 bg-slate-50 py-1.5 text-center"><p className="text-sm font-bold text-slate-900">{item.hora}</p><p className="text-[11px] font-medium uppercase text-slate-500">{item.data === dataHoje ? 'Hoje' : item.data.slice(8, 10) + '/' + item.data.slice(5, 7)}</p></div><div className="min-w-0 flex-1"><p className="truncate font-semibold text-slate-900">{item.usuario?.nome ?? 'Cliente não informado'}</p><p className="truncate text-sm text-slate-600">{item.servico?.nome ?? 'Serviço'} · {item.profissional?.nome ?? 'Profissional'}</p></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass[item.status] ?? 'bg-slate-100 text-slate-700'}`}>{statusLabel[item.status] ?? item.status}</span></div>)}</div>
      </article>

      <aside className="space-y-6"><article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-semibold text-slate-900">Equipe</h2><p className="mt-1 text-sm text-slate-600">{loading ? 'Carregando...' : `${data.profissionais.filter(item => item.ativo).length} profissionais ativos`}</p><div className="mt-5 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-md bg-secondary-50 text-secondary-700"><Scissors className="h-5 w-5" /></span><div><p className="text-sm font-medium text-slate-800">Gerencie disponibilidade</p><Link href="/painel/profissionais" className="text-sm font-semibold text-primary-700 hover:text-primary-900">Ver profissionais</Link></div></div></article>
        <article className="rounded-lg border border-slate-200 bg-slate-900 p-5 text-white shadow-sm"><CheckCircle2 className="h-6 w-6 text-emerald-300" /><h2 className="mt-4 font-semibold">Resumo de hoje</h2><p className="mt-1 text-sm text-slate-300">{loading ? 'Atualizando informações...' : resumo.confirmados ? `${resumo.confirmados} atendimento(s) confirmado(s) para hoje.` : 'Ainda não há atendimentos confirmados para hoje.'}</p><Link href="/painel/agendamentos" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-white underline underline-offset-4 hover:text-slate-200">Organizar agenda <ChevronRight className="h-4 w-4" /></Link></article>
      </aside>
    </div>
  </section>
}
