import { useEffect, useState, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import { Copy, Eraser, ListChecks } from 'lucide-react'
import { api, type DisponibilidadeFuncionario, type Profissional } from '@/lib/api'
import { ConfirmDialog, Modal } from '@/components/ui/modal'
import { DIAS_SEMANA, obterBlocos } from '@/utils/horarios'
import { formatarTelefoneBrasileiro } from '@/utils/telefone'

type FuncionarioForm = Pick<Profissional, 'nome' | 'telefone' | 'email' | 'ativo'>

const initialForm: FuncionarioForm = { nome: '', telefone: '', email: '', ativo: true }
const blocos = obterBlocos('00:00', '24:00')

export default function FuncionariosPage() {
  const [funcionarios, setFuncionarios] = useState<Profissional[]>([])
  const [form, setForm] = useState<FuncionarioForm>(initialForm)
  const [editing, setEditing] = useState<Profissional | null>(null)
  const [removing, setRemoving] = useState<Profissional | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'dados' | 'horarios'>('dados')
  const [diaSelecionado, setDiaSelecionado] = useState(1)
  const [diaOrigem, setDiaOrigem] = useState(1)
  const [copiarDeFuncionarioId, setCopiarDeFuncionarioId] = useState('')
  const [disponibilidade, setDisponibilidade] = useState<DisponibilidadeFuncionario>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      setFuncionarios(await api.profissionais.listAdmin())
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível carregar os funcionários.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  const closeForm = () => {
    setForm(initialForm)
    setEditing(null)
    setFormOpen(false)
    setActiveTab('dados')
    setDisponibilidade({})
    setCopiarDeFuncionarioId('')
  }

  const updateField = <K extends keyof FuncionarioForm>(field: K, value: FuncionarioForm[K]) => {
    setForm(current => ({ ...current, [field]: value }))
  }

  const openEdit = async (funcionario: Profissional) => {
    setEditing(funcionario)
    setForm({ nome: funcionario.nome, telefone: formatarTelefoneBrasileiro(funcionario.telefone ?? ''), email: funcionario.email ?? '', ativo: funcionario.ativo })
    setActiveTab('dados')
    setDiaSelecionado(1)
    setDiaOrigem(2)
    setFormOpen(true)
    try {
      setDisponibilidade(await api.profissionais.disponibilidade(funcionario.id))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível carregar horários.')
    }
  }

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      setSaving(true)
      if (editing) {
        await api.profissionais.update(editing.id, form)
        await api.profissionais.salvarDisponibilidade(editing.id, disponibilidade)
      } else {
        await api.profissionais.create(form)
      }
      toast.success(editing ? 'Funcionário atualizado com sucesso.' : 'Funcionário cadastrado com sucesso.')
      closeForm()
      await load()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível salvar o funcionário.')
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!removing) return
    try {
      await api.profissionais.remove(removing.id)
      toast.success('Funcionário desativado com sucesso.')
      setRemoving(null)
      await load()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível desativar o funcionário.')
    }
  }

  const setDia = (horas: string[]) => setDisponibilidade(current => ({ ...current, [diaSelecionado]: [...horas].sort() }))

  const toggleBloco = (hora: string) => {
    const atuais = disponibilidade[diaSelecionado] ?? []
    setDia(atuais.includes(hora) ? atuais.filter(item => item !== hora) : [...atuais, hora])
  }

  const copiarDiaSelecionado = () => {
    if (diaOrigem === diaSelecionado) {
      toast.error('Escolha um dia de origem diferente do dia que está sendo editado.')
      return
    }

    const horariosOrigem = disponibilidade[diaOrigem] ?? []
    if (horariosOrigem.length === 0) {
      toast.error('O dia de origem não possui horários marcados para copiar.')
      return
    }

    setDia(horariosOrigem)
    toast.success('Horários copiados para o dia selecionado.')
  }

  const copiarHorariosDeFuncionario = async () => {
    if (!copiarDeFuncionarioId) return
    try {
      const horariosOrigem = await api.profissionais.disponibilidade(copiarDeFuncionarioId)
      setDisponibilidade(horariosOrigem)
      toast.success('Semana de horários copiada com sucesso.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível copiar os horários.')
    }
  }

  const nomeDiaSelecionado = DIAS_SEMANA.find(dia => dia.value === diaSelecionado)?.label
  const nomeDiaOrigem = DIAS_SEMANA.find(dia => dia.value === diaOrigem)?.label
  const horariosDoDia = disponibilidade[diaSelecionado] ?? []

  return <section className="space-y-5">
    <div className="flex items-center justify-between gap-4">
      <h1 className="text-2xl font-bold">Funcionários</h1>
      <button type="button" onClick={() => { setEditing(null); setForm(initialForm); setFormOpen(true) }} className="btn-primary">Adicionar funcionário</button>
    </div>

    <div className="overflow-x-auto rounded bg-white shadow">
      <table className="min-w-full text-left">
        <thead className="border-b bg-gray-50 text-sm text-gray-600"><tr><th className="px-4 py-3">Nome</th><th className="px-4 py-3">Telefone</th><th className="px-4 py-3">E-mail</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Ações</th></tr></thead>
        <tbody className="divide-y">
          {loading ? <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Carregando funcionários...</td></tr> : funcionarios.length === 0 ? <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Nenhum funcionário cadastrado.</td></tr> : funcionarios.map(funcionario => <tr key={funcionario.id}>
            <td className="px-4 py-3 font-medium">{funcionario.nome}</td><td className="px-4 py-3">{funcionario.telefone ?? '—'}</td><td className="px-4 py-3">{funcionario.email ?? '—'}</td><td className="px-4 py-3">{funcionario.ativo ? 'Ativo' : 'Inativo'}</td>
            <td className="px-4 py-3"><div className="flex gap-3"><button type="button" onClick={() => { void openEdit(funcionario) }} className="text-secondary-500 hover:underline">Editar</button><button type="button" onClick={() => setRemoving(funcionario)} className="text-red-600 hover:underline">Desativar</button></div></td>
          </tr>)}
        </tbody>
      </table>
    </div>

    {formOpen && <Modal title={editing ? 'Editar funcionário' : 'Adicionar funcionário'} onClose={closeForm}>
      <form onSubmit={save} className="space-y-4">
        {editing && <div className="flex gap-2 border-b"><button type="button" onClick={() => setActiveTab('dados')} className={`px-3 py-2 text-sm font-medium ${activeTab === 'dados' ? 'border-b-2 border-secondary-500 text-secondary-600' : 'text-gray-600'}`}>Dados</button><button type="button" onClick={() => setActiveTab('horarios')} className={`px-3 py-2 text-sm font-medium ${activeTab === 'horarios' ? 'border-b-2 border-secondary-500 text-secondary-600' : 'text-gray-600'}`}>Horários de atendimento</button></div>}

        {activeTab === 'dados' ? <>
          <label className="block text-sm font-medium">Nome<input required className="input-field mt-1 w-full" value={form.nome} onChange={event => updateField('nome', event.target.value)} /></label>
          <label className="block text-sm font-medium">Telefone<input required inputMode="tel" autoComplete="tel" maxLength={15} className="input-field mt-1 w-full" placeholder="(00) 00000-0000" value={form.telefone ?? ''} onChange={event => updateField('telefone', formatarTelefoneBrasileiro(event.target.value))} /></label>
          <label className="block text-sm font-medium">E-mail<input required type="email" className="input-field mt-1 w-full" value={form.email ?? ''} onChange={event => updateField('email', event.target.value)} /></label>
          <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={form.ativo} onChange={event => updateField('ativo', event.target.checked)} />Funcionário ativo</label>
        </> : <div className="space-y-4">
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-950"><strong>{blocos.length} horários disponíveis</strong> em blocos de 30 minutos, de 00:00 a 23:30.</div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm font-semibold text-gray-900"><span className="flex min-h-10 items-end">1. Dia de destino<br />(que você está editando)</span><select aria-label="Dia de destino" className="input-field w-full" value={diaSelecionado} onChange={event => { const novoDia = Number(event.target.value); setDiaSelecionado(novoDia); if (novoDia === diaOrigem) setDiaOrigem((novoDia + 1) % 7) }}>{DIAS_SEMANA.map(dia => <option key={dia.value} value={dia.value}>{dia.label}</option>)}</select></label>
            <label className="flex flex-col gap-1 text-sm font-semibold text-gray-900"><span className="flex min-h-10 items-end">2. Copiar horários de:</span><select aria-label="Copiar horários de" className="input-field w-full" value={diaOrigem} onChange={event => setDiaOrigem(Number(event.target.value))}>{DIAS_SEMANA.map(dia => <option key={dia.value} value={dia.value}>{dia.label}</option>)}</select></label>
          </div>
          <p className="rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-800">Você está editando os horários de <strong>{nomeDiaSelecionado}</strong>. Para repetir uma jornada, use <strong>{nomeDiaOrigem}</strong> como modelo: os horários dele serão copiados para <strong>{nomeDiaSelecionado}</strong>.</p>
          <div className="grid gap-2 sm:grid-cols-3"><button type="button" onClick={() => setDia(blocos)} className="inline-flex items-center justify-center gap-1 rounded bg-secondary-700 px-3 py-2 text-sm font-semibold text-white hover:bg-secondary-800"><ListChecks className="h-4 w-4" />Marcar tudo</button><button type="button" onClick={() => setDia([])} disabled={horariosDoDia.length === 0} className="inline-flex items-center justify-center gap-1 rounded border border-gray-400 bg-white px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"><Eraser className="h-4 w-4" />Desmarcar tudo</button><button type="button" onClick={copiarDiaSelecionado} disabled={diaOrigem === diaSelecionado} className="inline-flex items-center justify-center gap-1 rounded border border-primary-500 bg-white px-3 py-2 text-sm font-semibold text-primary-800 hover:bg-primary-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"><Copy className="h-4 w-4" />Copiar dia</button></div>
          <div className="rounded-lg border border-gray-300 bg-white p-3"><p className="mb-2 text-sm font-semibold text-gray-900">Copiar a semana inteira de outro funcionário</p><div className="flex flex-col gap-2 sm:flex-row"><select className="input-field min-w-0 flex-1" value={copiarDeFuncionarioId} onChange={event => setCopiarDeFuncionarioId(event.target.value)}><option value="">Selecione um funcionário</option>{funcionarios.filter(funcionario => funcionario.id !== editing?.id).map(funcionario => <option key={funcionario.id} value={funcionario.id}>{funcionario.nome}</option>)}</select><button type="button" onClick={() => { void copiarHorariosDeFuncionario() }} disabled={!copiarDeFuncionarioId} className="inline-flex items-center justify-center gap-1 rounded bg-primary-700 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"><Copy className="h-4 w-4" />Copiar semana</button></div></div>
          <div className="grid grid-cols-3 gap-2 rounded-lg border-2 border-gray-300 bg-gray-50 p-3 sm:grid-cols-4"><p className="col-span-full text-xs font-medium text-gray-700">{horariosDoDia.length} horários marcados em {nomeDiaSelecionado}.</p>{blocos.map(hora => <label key={hora} className="flex cursor-pointer items-center gap-2 rounded border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-primary-50"><input type="checkbox" checked={horariosDoDia.includes(hora)} onChange={() => toggleBloco(hora)} />{hora}</label>)}</div>
        </div>}

        <div className="flex justify-end gap-3"><button type="button" onClick={closeForm} className="rounded px-4 py-2 text-gray-700 hover:bg-gray-100">Cancelar</button><button disabled={saving} className="btn-primary">{saving ? 'Salvando...' : 'Salvar'}</button></div>
      </form>
    </Modal>}

    {removing && <ConfirmDialog title="Desativar funcionário" message={`Deseja desativar ${removing.nome}? O histórico de atendimentos será preservado.`} confirmLabel="Desativar" danger onConfirm={() => { void remove() }} onClose={() => setRemoving(null)} />}
  </section>
}
