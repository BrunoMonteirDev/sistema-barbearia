import { useState, useEffect } from 'react'
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Phone
} from 'lucide-react'
import { postgres } from '@/lib/postgres'

interface Stats {
  agendamentosHoje: number
  clientesTotal: number
  faturamentoMes: number
  agendamentosConfirmados: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    agendamentosHoje: 0,
    clientesTotal: 0,
    faturamentoMes: 0,
    agendamentosConfirmados: 0,
  })

  const [recentAgendamentos, setRecentAgendamentos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  function getTodayLocal() {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      const today = getTodayLocal()

      // âœ… AGENDAMENTOS DE HOJE
      const { count: agendamentosHoje } = await postgres
        .from("agendamentos")
        .select("*", { count: "exact", head: true })
        .eq("data", today)
        .in("status", ["Confirmado", "Agendado"])

      // âœ… TOTAL DE CLIENTES
      const { count: clientesTotal } = await postgres
        .from("usuarios")
        .select("*", { count: "exact", head: true })

      // âœ… CONFIRMADOS
      const { count: agendamentosConfirmados } = await postgres
        .from("agendamentos")
        .select("*", { count: "exact", head: true })
        .eq("status", "Confirmado")
        .gte("data", today)

      // âœ… PRÃ“XIMOS AGENDAMENTOS (SÃ“ CONFIRMADOS E AGENDADOS)
      const { data: agendamentosRaw } = await postgres
        .from("agendamentos")
        .select("*")
        .gte("data", today)
        .in("status", ["Confirmado", "Agendado"])
        .order("data", { ascending: true })
        .order("hora", { ascending: true })
        .limit(5)

      const safeAgendamentos = agendamentosRaw || []

      const clientesIds = safeAgendamentos.map(a => a.cliente_id)
      const funcionariosIds = safeAgendamentos.map(a => a.funcionario_id).filter(Boolean)
      const servicosIds = safeAgendamentos.map(a => a.servico_id)

      const { data: clientes } = await postgres
        .from("usuarios")
        .select("id, nome, telefone")
        .in("id", clientesIds)

      const { data: funcionariosRaw } = await postgres
        .from("funcionarios")
        .select("id, usuario_id")
        .in("id", funcionariosIds)

      const funcionariosUsuarioIds = funcionariosRaw?.map(f => f.usuario_id) || []

      const { data: funcionariosUsuarios } = await postgres
        .from("usuarios")
        .select("id, nome")
        .in("id", funcionariosUsuarioIds)

      const { data: servicos } = await postgres
        .from("servicos")
        .select("id, nome, preco")
        .in("id", servicosIds)

      const joined = safeAgendamentos.map(ag => {
        const func = funcionariosRaw?.find(f => f.id === ag.funcionario_id)
        const funcUser = funcionariosUsuarios?.find(u => u.id === func?.usuario_id)

        return {
          ...ag,
          cliente: clientes?.find(c => c.id === ag.cliente_id) || null,
          funcionario: funcUser || null,
          servico: servicos?.find(s => s.id === ag.servico_id) || null,
        }
      })

      setStats({
        agendamentosHoje: agendamentosHoje || 0,
        clientesTotal: clientesTotal || 0,
        faturamentoMes: 0,
        agendamentosConfirmados: agendamentosConfirmados || 0,
      })

      setRecentAgendamentos(joined)
      setLoading(false)

    } catch (err) {
      console.error("âŒ ERRO NO DASHBOARD:", err)
      setLoading(false)
    }
  }

  function statusBadge(status: string) {
    switch (status) {
      case "Confirmado":
        return "bg-green-100 text-green-700"
      case "Cancelado":
        return "bg-red-100 text-red-700"
      case "Agendado":
      case "Pendente":
      default:
        return "bg-yellow-100 text-yellow-700"
    }
  }

  const statCards = [
    { title: 'Agendamentos Hoje', value: stats.agendamentosHoje, icon: Calendar },
    { title: 'Total de Clientes', value: stats.clientesTotal, icon: Users },
    { title: 'Confirmados', value: stats.agendamentosConfirmados, icon: CheckCircle },
    { title: 'Faturamento do MÃªs', value: `R$ ${stats.faturamentoMes.toFixed(2).replace('.', ',')}`, icon: DollarSign },
  ]

  function agendamentoBg(data: string) {
    const hoje = getTodayLocal()

    if (data === hoje) {
      return "bg-blue-50 border border-blue-200"
    }

    return "bg-gray-50 border border-gray-200"
  }


  return (
    <div className="space-y-6">

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <p className="text-3xl font-bold text-secondary-500 mt-1">{stat.value}</p>
              </div>
              <stat.icon className="h-6 w-6 text-primary-500" />
            </div>
          </div>
        ))}
      </div>

      {/* PRÃ“XIMOS AGENDAMENTOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-secondary-500 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary-500" />
            PrÃ³ximos Agendamentos
          </h3>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-b-2 border-primary-500 rounded-full"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {recentAgendamentos.map((ag: any) => (
                <div
                  key={ag.id}
                  className={`flex items-center justify-between p-4 rounded-lg ${agendamentoBg(ag.data)}`}

                >

                  <div>
                    <p className="font-medium text-secondary-500">
                      {ag.cliente?.nome}
                    </p>

                    <p className="text-sm text-gray-500">
                      {ag.servico?.nome}
                    </p>

                    <p className="text-xs text-gray-400">
                      {ag.data} Ã s {ag.hora} â€” {ag.funcionario?.nome}
                    </p>

                    <span
                      className={`inline-block mt-1 px-3 py-1 text-xs font-medium rounded-full ${statusBadge(ag.status)}`}
                    >
                      {ag.status}
                    </span>
                  </div>

                  {/* âœ… BOTÃƒO WHATSAPP SEMPRE VISÃVEL */}
                  <a
                    href={
                      ag.cliente?.telefone
                        ? `https://wa.me/55${ag.cliente.telefone.replace(/\D/g, "")}`
                        : "#"
                    }
                    target="_blank"
                    onClick={(e) => {
                      if (!ag.cliente?.telefone) {
                        e.preventDefault()
                        alert("Cliente sem telefone cadastrado.")
                      }
                    }}
                    className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition"
                  >
                    <Phone className="h-5 w-5" />
                  </a>

                </div>
              ))}
            </div>
          )}
        </div>

        {/* RESUMO */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-secondary-500 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary-500" />
            Resumo do Dia
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between bg-blue-50 p-4 rounded">
              <span>Agendamentos Hoje</span>
              <span className="font-bold text-blue-600">{stats.agendamentosHoje}</span>
            </div>

            <div className="flex justify-between bg-green-50 p-4 rounded">
              <span>Confirmados</span>
              <span className="font-bold text-green-600">{stats.agendamentosConfirmados}</span>
            </div>

            <div className="flex justify-between bg-purple-50 p-4 rounded">
              <span>Clientes</span>
              <span className="font-bold text-purple-600">{stats.clientesTotal}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}

