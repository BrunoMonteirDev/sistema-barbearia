import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useLocation } from 'wouter'
import toast from 'react-hot-toast'
import { api, type Profissional, type Servico } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { arredondarDuracaoParaBloco } from '@/utils/horarios'

const SEM_PREFERENCIA = 'sem-preferencia'

export default function AgendarPage() {
  const { user } = useAuth()
  const [, go] = useLocation()
  const [servicos, setServicos] = useState<Servico[]>([])
  const [profissionais, setProfissionais] = useState<Profissional[]>([])
  const [horarios, setHorarios] = useState<string[]>([])
  const [loadingHorarios, setLoadingHorarios] = useState(false)
  const [form, setForm] = useState({ profissionalId: '', servicoId: '', data: '', hora: '' })

  useEffect(() => {
    Promise.all([api.servicos.list(), api.profissionais.list()])
      .then(([servicosData, profissionaisData]) => { setServicos(servicosData); setProfissionais(profissionaisData) })
      .catch(error => toast.error(error instanceof Error ? error.message : 'Não foi possível carregar dados do agendamento.'))
  }, [])

  const servicoSelecionado = useMemo(() => servicos.find(servico => servico.id === form.servicoId), [servicos, form.servicoId])
  const podeBuscarHorarios = Boolean(form.profissionalId && form.servicoId && form.data)

  useEffect(() => {
    setForm(current => ({ ...current, hora: '' }))
    setHorarios([])
    if (!podeBuscarHorarios) return

    setLoadingHorarios(true)
    api.agendamentos.disponibilidade(form.profissionalId, form.servicoId, form.data)
      .then(data => setHorarios(data.horarios))
      .catch(error => toast.error(error instanceof Error ? error.message : 'Não foi possível carregar horários.'))
      .finally(() => setLoadingHorarios(false))
  }, [form.profissionalId, form.servicoId, form.data, podeBuscarHorarios])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!user) return go('/login')
    if (!horarios.includes(form.hora)) {
      toast.error('Selecione um horário disponível.')
      return
    }

    try {
      await api.agendamentos.create(form)
      toast.success('Agendamento criado.')
      go('/minha-conta')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível agendar.')
    }
  }

  return <main className="mx-auto max-w-2xl p-6">
    <h1 className="mb-6 text-2xl font-bold">Agendar atendimento</h1>
    <form onSubmit={submit} className="space-y-6">
      <section className="rounded bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold">1. Funcionário</h2>
        <select required className="input-field" value={form.profissionalId} onChange={event => setForm({ ...form, profissionalId: event.target.value, servicoId: '', hora: '' })}>
          <option value="">Escolha uma opção</option>
          <option value={SEM_PREFERENCIA}>Não tenho preferência</option>
          {profissionais.map(profissional => <option key={profissional.id} value={profissional.id}>{profissional.nome}</option>)}
        </select>
      </section>

      <section className="rounded bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold">2. Serviço</h2>
        <select required disabled={!form.profissionalId} className="input-field disabled:bg-gray-100" value={form.servicoId} onChange={event => setForm({ ...form, servicoId: event.target.value, hora: '' })}>
          <option value="">Escolha o serviço</option>
          {servicos.map(servico => <option key={servico.id} value={servico.id}>{servico.nome} - R$ {Number(servico.preco).toFixed(2)} - {arredondarDuracaoParaBloco(servico.duracao)} min</option>)}
        </select>
      </section>

      <section className="rounded bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold">3. Horário</h2>
        <div className="space-y-4">
          <input className="input-field" required type="date" value={form.data} onChange={event => setForm({ ...form, data: event.target.value, hora: '' })} />

          <div>
            {loadingHorarios ? <p className="text-sm text-gray-500">Carregando horários...</p> : !podeBuscarHorarios ? <p className="text-sm text-gray-500">Escolha funcionário, serviço e data para ver os horários.</p> : horarios.length === 0 ? <p className="text-sm text-gray-500">Nenhum horário disponível nesta data.</p> : <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {horarios.map(hora => <button key={hora} type="button" onClick={() => setForm({ ...form, hora })} className={`rounded border px-3 py-2 text-sm ${form.hora === hora ? 'border-secondary-500 bg-secondary-50 text-secondary-700' : 'border-gray-200 hover:bg-gray-50'}`}>{hora}</button>)}
            </div>}
          </div>

          {servicoSelecionado && <p className="text-sm text-gray-500">Duração considerada: {arredondarDuracaoParaBloco(servicoSelecionado.duracao)} minutos.</p>}
        </div>
      </section>

      <button className="btn-primary w-full">Confirmar agendamento</button>
    </form>
  </main>
}
