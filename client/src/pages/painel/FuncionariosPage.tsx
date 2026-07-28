import { useEffect, useState, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import { api, type DisponibilidadeFuncionario, type Profissional } from '@/lib/api'
import { ConfirmDialog, Modal } from '@/components/ui/modal'
import { DIAS_SEMANA, obterBlocos } from '@/utils/horarios'

type FuncionarioForm = Pick<Profissional, 'nome' | 'telefone' | 'email' | 'ativo'>

const initialForm: FuncionarioForm = { nome: '', telefone: '', email: '', ativo: true }
const blocos = obterBlocos()

export default function FuncionariosPage() {
  const [funcionarios, setFuncionarios] = useState<Profissional[]>([])
  const [form, setForm] = useState<FuncionarioForm>(initialForm)
  const [editing, setEditing] = useState<Profissional | null>(null)
  const [removing, setRemoving] = useState<Profissional | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'dados' | 'horarios'>('dados')
  const [diaSelecionado, setDiaSelecionado] = useState(1)
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
  }

  const updateField = <K extends keyof FuncionarioForm>(field: K, value: FuncionarioForm[K]) => {
    setForm(current => ({ ...current, [field]: value }))
  }

  const openEdit = async (funcionario: Profissional) => {
    setEditing(funcionario)
    setForm({ nome: funcionario.nome, telefone: funcionario.telefone ?? '', email: funcionario.email ?? '', ativo: funcionario.ativo })
    setActiveTab('dados')
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

  const toggleBloco = (hora: string) => {
    setDisponibilidade(current => {
      const atuais = current[diaSelecionado] ?? []
      const novoDia = atuais.includes(hora) ? atuais.filter(item => item !== hora) : [...atuais, hora].sort()
      return { ...current, [diaSelecionado]: novoDia }
    })
  }

  return <section className="space-y-5">
    <div className="flex items-center justify-between gap-4">
      <h1 className="text-2xl font-bold">Funcionários</h1>
      <button type="button" onClick={() => { setEditing(null); setForm(initialForm); setFormOpen(true) }} className="btn-primary">Adicionar funcionário</button>
    </div>

    <div className="overflow-x-auto rounded bg-white shadow">
      <table className="min-w-full text-left">
        <thead className="border-b bg-gray-50 text-sm text-gray-600">
          <tr><th className="px-4 py-3">Nome</th><th className="px-4 py-3">Telefone</th><th className="px-4 py-3">E-mail</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Ações</th></tr>
        </thead>
        <tbody className="divide-y">
          {loading ? <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Carregando funcionários...</td></tr> : funcionarios.length === 0 ? <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Nenhum funcionário cadastrado.</td></tr> : funcionarios.map(funcionario => <tr key={funcionario.id}>
            <td className="px-4 py-3 font-medium">{funcionario.nome}</td>
            <td className="px-4 py-3">{funcionario.telefone ?? '—'}</td>
            <td className="px-4 py-3">{funcionario.email ?? '—'}</td>
            <td className="px-4 py-3">{funcionario.ativo ? 'Ativo' : 'Inativo'}</td>
            <td className="px-4 py-3"><div className="flex gap-3"><button type="button" onClick={() => { void openEdit(funcionario) }} className="text-secondary-500 hover:underline">Editar</button><button type="button" onClick={() => setRemoving(funcionario)} className="text-red-600 hover:underline">Desativar</button></div></td>
          </tr>)}
        </tbody>
      </table>
    </div>

    {formOpen && <Modal title={editing ? 'Editar funcionário' : 'Adicionar funcionário'} onClose={closeForm}>
      <form onSubmit={save} className="space-y-4">
        {editing && <div className="flex gap-2 border-b">
          <button type="button" onClick={() => setActiveTab('dados')} className={`px-3 py-2 text-sm font-medium ${activeTab === 'dados' ? 'border-b-2 border-secondary-500 text-secondary-600' : 'text-gray-600'}`}>Dados</button>
          <button type="button" onClick={() => setActiveTab('horarios')} className={`px-3 py-2 text-sm font-medium ${activeTab === 'horarios' ? 'border-b-2 border-secondary-500 text-secondary-600' : 'text-gray-600'}`}>Horários de Atendimento</button>
        </div>}

        {activeTab === 'dados' ? <>
          <label className="block text-sm font-medium">Nome<input required className="input-field mt-1 w-full" value={form.nome} onChange={event => updateField('nome', event.target.value)} /></label>
          <label className="block text-sm font-medium">Telefone<input required className="input-field mt-1 w-full" value={form.telefone ?? ''} onChange={event => updateField('telefone', event.target.value)} /></label>
          <label className="block text-sm font-medium">E-mail<input required type="email" className="input-field mt-1 w-full" value={form.email ?? ''} onChange={event => updateField('email', event.target.value)} /></label>
          <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={form.ativo} onChange={event => updateField('ativo', event.target.checked)} />Funcionário ativo</label>
        </> : <div className="space-y-4">
          <label className="block text-sm font-medium">Dia da semana<select className="input-field mt-1 w-full" value={diaSelecionado} onChange={event => setDiaSelecionado(Number(event.target.value))}>{DIAS_SEMANA.map(dia => <option key={dia.value} value={dia.value}>{dia.label}</option>)}</select></label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {blocos.map(hora => <label key={hora} className="flex items-center gap-2 rounded border border-gray-200 px-3 py-2 text-sm">
              <input type="checkbox" checked={(disponibilidade[diaSelecionado] ?? []).includes(hora)} onChange={() => toggleBloco(hora)} />
              {hora}
            </label>)}
          </div>
        </div>}

        <div className="flex justify-end gap-3"><button type="button" onClick={closeForm} className="rounded px-4 py-2 text-gray-700 hover:bg-gray-100">Cancelar</button><button disabled={saving} className="btn-primary">{saving ? 'Salvando...' : 'Salvar'}</button></div>
      </form>
    </Modal>}

    {removing && <ConfirmDialog title="Desativar funcionário" message={`Deseja desativar ${removing.nome}? O histórico de atendimentos será preservado.`} confirmLabel="Desativar" danger onConfirm={() => { void remove() }} onClose={() => setRemoving(null)} />}
  </section>
}
