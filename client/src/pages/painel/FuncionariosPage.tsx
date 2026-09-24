import { useEffect, useState, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import './FuncionariosPage.css'
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

  return <section className="pagina-profissionais">
    <div className="cabecalho-profissionais">
      <h1 className="titulo-profissionais">Funcionários</h1>
      <button type="button" onClick={() => { setEditing(null); setForm(initialForm); setFormOpen(true) }} className="botao-principal-profissional">Adicionar funcionário</button>
    </div>

    <div className="lista-profissionais">
      <table className="tabela-profissionais">
        <thead className="cabecalho-tabela-profissionais"><tr><th className="celula-profissional">Nome</th><th className="celula-profissional">Telefone</th><th className="celula-profissional">E-mail</th><th className="celula-profissional">Status</th><th className="celula-profissional">Ações</th></tr></thead>
        <tbody className="corpo-tabela-profissionais">
          {loading ? <tr><td colSpan={5} className="mensagem-lista-profissionais">Carregando funcionários...</td></tr> : funcionarios.length === 0 ? <tr><td colSpan={5} className="mensagem-lista-profissionais">Nenhum funcionário cadastrado.</td></tr> : funcionarios.map(funcionario => <tr key={funcionario.id}>
            <td className="celula-profissional nome-profissional">{funcionario.nome}</td><td className="celula-profissional">{funcionario.telefone ?? '—'}</td><td className="celula-profissional">{funcionario.email ?? '—'}</td><td className="celula-profissional">{funcionario.ativo ? 'Ativo' : 'Inativo'}</td>
            <td className="celula-profissional"><div className="acoes-profissional"><button type="button" onClick={() => { void openEdit(funcionario) }} className="botao-editar-profissional">Editar</button><button type="button" onClick={() => setRemoving(funcionario)} className="botao-desativar-profissional">Desativar</button></div></td>
          </tr>)}
        </tbody>
      </table>
    </div>

    {formOpen && <Modal title={editing ? 'Editar funcionário' : 'Adicionar funcionário'} onClose={closeForm}>
      <form onSubmit={save} className="formulario-profissional">
        {editing && <div className="abas-profissional"><button type="button" onClick={() => setActiveTab('dados')} className={activeTab === 'dados' ? 'aba-profissional aba-profissional-ativa' : 'aba-profissional'}>Dados</button><button type="button" onClick={() => setActiveTab('horarios')} className={activeTab === 'horarios' ? 'aba-profissional aba-profissional-ativa' : 'aba-profissional'}>Horários de atendimento</button></div>}

        {activeTab === 'dados' ? <>
          <label className="rotulo-profissional">Nome<input required className="campo-profissional campo-dados-profissional" value={form.nome} onChange={event => updateField('nome', event.target.value)} /></label>
          <label className="rotulo-profissional">Telefone<input required inputMode="tel" autoComplete="tel" maxLength={15} className="campo-profissional campo-dados-profissional" placeholder="(00) 00000-0000" value={form.telefone ?? ''} onChange={event => updateField('telefone', formatarTelefoneBrasileiro(event.target.value))} /></label>
          <label className="rotulo-profissional">E-mail<input required type="email" className="campo-profissional campo-dados-profissional" value={form.email ?? ''} onChange={event => updateField('email', event.target.value)} /></label>
          <label className="status-profissional"><input type="checkbox" checked={form.ativo} onChange={event => updateField('ativo', event.target.checked)} />Funcionário ativo</label>
        </> : <div className="disponibilidade-profissional">
          <div className="aviso-disponibilidade-profissional"><strong>{blocos.length} horários disponíveis</strong> em blocos de 30 minutos, de 00:00 a 23:30.</div>
          <div className="selecao-dias-profissional">
            <label className="rotulo-dia-profissional"><span className="titulo-dia-profissional">1. Dia de destino<br />(que você está editando)</span><select aria-label="Dia de destino" className="campo-profissional" value={diaSelecionado} onChange={event => { const novoDia = Number(event.target.value); setDiaSelecionado(novoDia); if (novoDia === diaOrigem) setDiaOrigem((novoDia + 1) % 7) }}>{DIAS_SEMANA.map(dia => <option key={dia.value} value={dia.value}>{dia.label}</option>)}</select></label>
            <label className="rotulo-dia-profissional"><span className="titulo-dia-profissional">2. Copiar horários de:</span><select aria-label="Copiar horários de" className="campo-profissional" value={diaOrigem} onChange={event => setDiaOrigem(Number(event.target.value))}>{DIAS_SEMANA.map(dia => <option key={dia.value} value={dia.value}>{dia.label}</option>)}</select></label>
          </div>
          <p className="orientacao-disponibilidade-profissional">Você está editando os horários de <strong>{nomeDiaSelecionado}</strong>. Para repetir uma jornada, use <strong>{nomeDiaOrigem}</strong> como modelo: os horários dele serão copiados para <strong>{nomeDiaSelecionado}</strong>.</p>
          <div className="acoes-disponibilidade-profissional"><button type="button" onClick={() => setDia(blocos)} className="botao-marcar-profissional"><ListChecks className="icone-profissional" />Marcar tudo</button><button type="button" onClick={() => setDia([])} disabled={horariosDoDia.length === 0} className="botao-desmarcar-profissional"><Eraser className="icone-profissional" />Desmarcar tudo</button><button type="button" onClick={copiarDiaSelecionado} disabled={diaOrigem === diaSelecionado} className="botao-copiar-dia-profissional"><Copy className="icone-profissional" />Copiar dia</button></div>
          <div className="copiar-semana-profissional"><p className="titulo-copiar-semana-profissional">Copiar a semana inteira de outro funcionário</p><div className="acoes-copiar-semana-profissional"><select className="campo-profissional campo-origem-profissional" value={copiarDeFuncionarioId} onChange={event => setCopiarDeFuncionarioId(event.target.value)}><option value="">Selecione um funcionário</option>{funcionarios.filter(funcionario => funcionario.id !== editing?.id).map(funcionario => <option key={funcionario.id} value={funcionario.id}>{funcionario.nome}</option>)}</select><button type="button" onClick={() => { void copiarHorariosDeFuncionario() }} disabled={!copiarDeFuncionarioId} className="botao-copiar-semana-profissional"><Copy className="icone-profissional" />Copiar semana</button></div></div>
          <div className="grade-horarios-profissional"><p className="resumo-horarios-profissional">{horariosDoDia.length} horários marcados em {nomeDiaSelecionado}.</p>{blocos.map(hora => <label key={hora} className="horario-profissional"><input type="checkbox" checked={horariosDoDia.includes(hora)} onChange={() => toggleBloco(hora)} />{hora}</label>)}</div>
        </div>}

        <div className="acoes-formulario-profissional"><button type="button" onClick={closeForm} className="botao-cancelar-profissional">Cancelar</button><button disabled={saving} className="botao-principal-profissional">{saving ? 'Salvando...' : 'Salvar'}</button></div>
      </form>
    </Modal>}

    {removing && <ConfirmDialog title="Desativar funcionário" message={`Deseja desativar ${removing.nome}? O histórico de atendimentos será preservado.`} confirmLabel="Desativar" danger onConfirm={() => { void remove() }} onClose={() => setRemoving(null)} />}
  </section>
}
