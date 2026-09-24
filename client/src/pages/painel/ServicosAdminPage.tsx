import { useEffect, useState, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import { api, type Servico } from '@/lib/api'
import { ConfirmDialog, Modal } from '@/components/ui/modal'
import './ServicosAdminPage.css'

type ServicoForm = { nome: string; descricao: string; preco: string; duracao: string; ativo: boolean }
const emptyForm: ServicoForm = { nome: '', descricao: '', preco: '', duracao: '30', ativo: true }

export default function ServicosAdminPage() {
  const [items, setItems] = useState<Servico[]>([])
  const [form, setForm] = useState<ServicoForm>(emptyForm)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Servico | null>(null)
  const [deactivating, setDeactivating] = useState<Servico | null>(null)
  const [saving, setSaving] = useState(false)
  const load = () => { void api.servicos.list().then(setItems).catch(error => toast.error(error.message)) }
  useEffect(load, [])

  const closeForm = () => { setEditing(null); setForm(emptyForm); setFormOpen(false) }
  const openEdit = (service: Servico) => { setEditing(service); setForm({ nome: service.nome, descricao: service.descricao ?? '', preco: String(service.preco), duracao: String(service.duracao), ativo: service.ativo }); setFormOpen(true) }
  const save = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); try { setSaving(true); const data = { nome: form.nome, descricao: form.descricao || null, preco: Number(form.preco), duracao: Number(form.duracao), ativo: form.ativo }; if (editing) await api.servicos.update(editing.id, data); else await api.servicos.create(data); toast.success(editing ? 'Serviço atualizado com sucesso.' : 'Serviço cadastrado com sucesso.'); closeForm(); load() } catch (error) { toast.error(error instanceof Error ? error.message : 'Não foi possível salvar o serviço.') } finally { setSaving(false) } }
  const deactivate = async () => { if (!deactivating) return; try { await api.servicos.remove(deactivating.id); toast.success('Serviço desativado com sucesso.'); setDeactivating(null); load() } catch (error) { toast.error(error instanceof Error ? error.message : 'Não foi possível desativar o serviço.') } }

  return (
    <section className="pagina-servicos">
      <div className="cabecalho-servicos">
        <h1 className="titulo-servicos">Serviços</h1>
        <button
          type="button"
          onClick={() => { setEditing(null); setForm(emptyForm); setFormOpen(true) }}
          className="botao-principal-servico"
        >
          Adicionar serviço
        </button>
      </div>

      <div className="lista-servicos">
        {items.length === 0
          ? <p className="mensagem-lista-vazia">Nenhum serviço cadastrado.</p>
          : items.map(service => (
            <div className="cartao-servico" key={service.id}>
              <span className="resumo-servico">
                <strong>{service.nome}</strong>
                <small className="detalhes-servico">
                  R$ {Number(service.preco).toFixed(2)} · {service.duracao} min
                </small>
              </span>
              <div className="acoes-servico">
                <button
                  type="button"
                  onClick={() => openEdit(service)}
                  className="botao-editar-servico"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => setDeactivating(service)}
                  className="botao-desativar-servico"
                >
                  Desativar
                </button>
              </div>
            </div>
          ))}
      </div>

      {formOpen && (
        <Modal title={editing ? 'Editar serviço' : 'Adicionar serviço'} onClose={closeForm}>
          <form onSubmit={save} className="formulario-servico">
            <label className="rotulo-campo-servico">
              Nome
              <input
                required
                className="campo-servico"
                value={form.nome}
                onChange={event => setForm(current => ({ ...current, nome: event.target.value }))}
              />
            </label>

            <label className="rotulo-campo-servico">
              Descrição
              <textarea
                className="campo-servico"
                value={form.descricao}
                onChange={event => setForm(current => ({ ...current, descricao: event.target.value }))}
              />
            </label>

            <div className="campos-servico-em-linha">
              <label className="rotulo-campo-servico">
                Preço
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  className="campo-servico"
                  value={form.preco}
                  onChange={event => setForm(current => ({ ...current, preco: event.target.value }))}
                />
              </label>
              <label className="rotulo-campo-servico">
                Duração (minutos)
                <input
                  required
                  type="number"
                  min="1"
                  className="campo-servico"
                  value={form.duracao}
                  onChange={event => setForm(current => ({ ...current, duracao: event.target.value }))}
                />
              </label>
            </div>

            <label className="opcao-status-servico">
              <input
                type="checkbox"
                checked={form.ativo}
                onChange={event => setForm(current => ({ ...current, ativo: event.target.checked }))}
              />
              Serviço ativo
            </label>

            <div className="acoes-formulario-servico">
              <button type="button" onClick={closeForm} className="botao-cancelar-servico">
                Cancelar
              </button>
              <button disabled={saving} className="botao-principal-servico">
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deactivating && (
        <ConfirmDialog
          title="Desativar serviço"
          message={`Deseja desativar o serviço ${deactivating.nome}?`}
          confirmLabel="Desativar"
          danger
          onConfirm={() => { void deactivate() }}
          onClose={() => setDeactivating(null)}
        />
      )}
    </section>
  )
}
