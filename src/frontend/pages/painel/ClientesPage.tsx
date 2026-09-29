import "./ClientesPage.css";
import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { api, type Usuario } from "@/lib/api";
import { ConfirmDialog, Modal } from "@/components/ui/modal";
import { formatarTelefoneBrasileiro } from "@/utils/telefone";
import { gerarSenhaForte, validarSenha } from "@/utils/senha";

type ClienteForm = {
  nome: string;
  email: string;
  telefone: string;
  senha: string;
  ativo: boolean;
};
const emptyForm: ClienteForm = {
  nome: "",
  email: "",
  telefone: "",
  senha: "",
  ativo: true,
};

export default function ClientesPage() {
  const [items, setItems] = useState<Usuario[]>([]);
  const [form, setForm] = useState<ClienteForm>(emptyForm);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [deactivating, setDeactivating] = useState<Usuario | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    void api.usuarios
      .list()
      .then((users) => setItems(users.filter((user) => user.nivel === "Cliente")))
      .catch((error) => toast.error(error.message));
  };
  useEffect(load, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, senha: gerarSenhaForte() });
    setFormOpen(true);
  };
  const openEdit = (user: Usuario) => {
    setEditing(user);
    setForm({
      nome: user.nome,
      email: user.email,
      telefone: formatarTelefoneBrasileiro(user.telefone ?? ""),
      senha: "",
      ativo: user.ativo ?? true,
    });
    setFormOpen(true);
  };
  const closeForm = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(false);
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const erroSenha = form.senha ? validarSenha(form.senha) : null;
    if (erroSenha) return toast.error(erroSenha);
    try {
      setSaving(true);
      if (editing) await api.usuarios.update(editing.id, { ...form, nivel: "Cliente" });
      else await api.usuarios.create({ ...form, nivel: "Cliente" });
      toast.success(
        editing ? "Cliente atualizado com sucesso." : "Cliente cadastrado com sucesso.",
      );
      closeForm();
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar o cliente.");
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async () => {
    if (!deactivating) return;
    try {
      await api.usuarios.remove(deactivating.id);
      toast.success("Cliente desativado com sucesso.");
      setDeactivating(null);
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível desativar o cliente.");
    }
  };

  return (
    <section className="pagina-clientes">
      <div className="cabecalho-clientes">
        <h1 className="titulo-clientes">Clientes</h1>
        <button
          type="button"
          onClick={openCreate}
          className="botao-principal-cliente"
        >
          Adicionar cliente
        </button>
      </div>
      <div className="lista-clientes">
        {items.length === 0 ? (
          <p className="mensagem-lista-clientes">Nenhum cliente cadastrado.</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="cartao-cliente"
            >
              <span>
                <strong>{item.nome}</strong>
                <small className="contato-cliente">{item.telefone || item.email}</small>
              </span>
              <div className="acoes-cliente">
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  className="botao-editar-cliente"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => setDeactivating(item)}
                  className="botao-desativar-cliente"
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
          title={editing ? "Editar cliente" : "Adicionar cliente"}
          onClose={closeForm}
        >
          <form
            onSubmit={save}
            className="formulario-cliente"
          >
            <label className="rotulo-cliente">
              Nome
              <input
                required
                className="campo-cliente"
                value={form.nome}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    nome: event.target.value,
                  }))
                }
              />
            </label>
            <label className="rotulo-cliente">
              E-mail <span className="indicacao-opcional-cliente">(opcional)</span>
              <input
                type="email"
                className="campo-cliente"
                placeholder="E-mail para acesso ao sistema"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
              />
            </label>
            <label className="rotulo-cliente">
              Telefone
              <input
                inputMode="tel"
                autoComplete="tel"
                maxLength={15}
                className="campo-cliente"
                placeholder="(00) 00000-0000"
                value={form.telefone}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    telefone: formatarTelefoneBrasileiro(event.target.value),
                  }))
                }
              />
            </label>
            <label className="rotulo-cliente">
              {editing ? "Nova senha (opcional)" : "Senha de acesso"}
              <button
                type="button"
                className="botao-gerar-senha-cliente"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    senha: gerarSenhaForte(),
                  }))
                }
              >
                {form.senha ? "Gerar outra" : "Gerar senha forte"}
              </button>
              <input
                required={!editing}
                type="text"
                className="campo-cliente campo-senha-cliente"
                placeholder={editing ? "Deixe em branco para manter a senha atual" : ""}
                value={form.senha}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    senha: event.target.value,
                  }))
                }
              />
              <p className="orientacao-senha-cliente">
                Mínimo 10 caracteres, com maiúscula, minúscula, número e símbolo. Sem sequências
                como 123.
              </p>
            </label>
            <label className="status-cliente">
              <input
                type="checkbox"
                checked={form.ativo}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    ativo: event.target.checked,
                  }))
                }
              />
              Cliente ativo
            </label>
            <div className="acoes-formulario-cliente">
              <button
                type="button"
                onClick={closeForm}
                className="botao-cancelar-cliente"
              >
                Cancelar
              </button>
              <button
                disabled={saving}
                className="botao-principal-cliente"
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {deactivating && (
        <ConfirmDialog
          title="Desativar cliente"
          message={`Deseja desativar ${deactivating.nome}? O histórico será preservado.`}
          confirmLabel="Desativar"
          danger
          onConfirm={() => {
            void deactivate();
          }}
          onClose={() => setDeactivating(null)}
        />
      )}
    </section>
  );
}
