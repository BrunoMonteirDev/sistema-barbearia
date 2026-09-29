import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { api, type Servico } from "@/lib/api";
import { ConfirmDialog, Modal } from "@/components/ui/modal";
import "./ServicosAdminPage.css";

type ServicoForm = {
  nome: string;
  descricao: string;
  preco: string;
  duracao: string;
  ativo: boolean;
};
const emptyForm: ServicoForm = { nome: "", descricao: "", preco: "", duracao: "30", ativo: true };

export default function ServicosAdminPage() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [form, setForm] = useState<ServicoForm>(emptyForm);
  const [formOpen, setFormOpen] = useState(false);
  const [servicoEmEdicao, setServicoEmEdicao] = useState<Servico | null>(null);
  const [servicoParaDesativar, setServicoParaDesativar] = useState<Servico | null>(null);
  const [saving, setSaving] = useState(false);
  const carregarServicos = () => {
    void api.servicos
      .list()
      .then(setServicos)
      .catch((error) => toast.error(error.message));
  };
  useEffect(carregarServicos, []);

  const fecharFormulario = () => {
    setServicoEmEdicao(null);
    setForm(emptyForm);
    setFormOpen(false);
  };
  const editarServico = (servico: Servico) => {
    setServicoEmEdicao(servico);
    setForm({
      nome: servico.nome,
      descricao: servico.descricao ?? "",
      preco: String(servico.preco),
      duracao: String(servico.duracao),
      ativo: servico.ativo,
    });
    setFormOpen(true);
  };
  const salvarServico = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setSaving(true);
      const dados = {
        nome: form.nome,
        descricao: form.descricao || null,
        preco: Number(form.preco),
        duracao: Number(form.duracao),
        ativo: form.ativo,
      };
      if (servicoEmEdicao) await api.servicos.update(servicoEmEdicao.id, dados);
      else await api.servicos.create(dados);
      toast.success(
        servicoEmEdicao ? "Serviço atualizado com sucesso." : "Serviço cadastrado com sucesso.",
      );
      fecharFormulario();
      carregarServicos();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar o serviço.");
    } finally {
      setSaving(false);
    }
  };
  const desativarServico = async () => {
    if (!servicoParaDesativar) return;
    try {
      await api.servicos.remove(servicoParaDesativar.id);
      toast.success("Serviço desativado com sucesso.");
      setServicoParaDesativar(null);
      carregarServicos();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível desativar o serviço.");
    }
  };

  return (
    <section className="pagina-servicos">
      <div className="cabecalho-servicos">
        <h1 className="titulo-servicos">Serviços</h1>
        <button
          type="button"
          onClick={() => {
            setServicoEmEdicao(null);
            setForm(emptyForm);
            setFormOpen(true);
          }}
          className="botao-principal-servico"
        >
          Adicionar serviço
        </button>
      </div>

      <div className="lista-servicos">
        {servicos.length === 0 ? (
          <p className="mensagem-lista-vazia">Nenhum serviço cadastrado.</p>
        ) : (
          servicos.map((servico) => (
            <div
              className="cartao-servico"
              key={servico.id}
            >
              <span className="resumo-servico">
                <strong>{servico.nome}</strong>
                <small className="detalhes-servico">
                  R$ {Number(servico.preco).toFixed(2)} · {servico.duracao} min
                </small>
              </span>
              <div className="acoes-servico">
                <button
                  type="button"
                  onClick={() => editarServico(servico)}
                  className="botao-editar-servico"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => setServicoParaDesativar(servico)}
                  className="botao-desativar-servico"
                >
                  Desativar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {formOpen && (
        <Modal
          title={servicoEmEdicao ? "Editar serviço" : "Adicionar serviço"}
          onClose={fecharFormulario}
        >
          <form
            onSubmit={salvarServico}
            className="formulario-servico"
          >
            <label className="rotulo-campo-servico">
              Nome
              <input
                required
                className="campo-servico"
                value={form.nome}
                onChange={(event) =>
                  setForm((current) => ({ ...current, nome: event.target.value }))
                }
              />
            </label>

            <label className="rotulo-campo-servico">
              Descrição
              <textarea
                className="campo-servico"
                value={form.descricao}
                onChange={(event) =>
                  setForm((current) => ({ ...current, descricao: event.target.value }))
                }
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
                  onChange={(event) =>
                    setForm((current) => ({ ...current, preco: event.target.value }))
                  }
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
                  onChange={(event) =>
                    setForm((current) => ({ ...current, duracao: event.target.value }))
                  }
                />
              </label>
            </div>

            <label className="opcao-status-servico">
              <input
                type="checkbox"
                checked={form.ativo}
                onChange={(event) =>
                  setForm((current) => ({ ...current, ativo: event.target.checked }))
                }
              />
              Serviço ativo
            </label>

            <div className="acoes-formulario-servico">
              <button
                type="button"
                onClick={fecharFormulario}
                className="botao-cancelar-servico"
              >
                Cancelar
              </button>
              <button
                disabled={saving}
                className="botao-principal-servico"
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {servicoParaDesativar && (
        <ConfirmDialog
          title="Desativar serviço"
          message={`Deseja desativar o serviço ${servicoParaDesativar.nome}?`}
          confirmLabel="Desativar"
          danger
          onConfirm={() => {
            void desativarServico();
          }}
          onClose={() => setServicoParaDesativar(null)}
        />
      )}
    </section>
  );
}
