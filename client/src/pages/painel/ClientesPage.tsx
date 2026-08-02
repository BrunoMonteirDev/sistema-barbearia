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
      .then((users) =>
        setItems(users.filter((user) => user.nivel === "Cliente")),
      )
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
      if (editing)
        await api.usuarios.update(editing.id, { ...form, nivel: "Cliente" });
      else await api.usuarios.create({ ...form, nivel: "Cliente" });
      toast.success(
        editing
          ? "Cliente atualizado com sucesso."
          : "Cliente cadastrado com sucesso.",
      );
      closeForm();
      load();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o cliente.",
      );
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
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível desativar o cliente.",
      );
    }
  };

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <button type="button" onClick={openCreate} className="btn-primary">
          Adicionar cliente
        </button>
      </div>
      <div className="divide-y rounded bg-white shadow">
        {items.length === 0 ? (
          <p className="p-4 text-gray-500">Nenhum cliente cadastrado.</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 p-4"
            >
              <span>
                <strong>{item.nome}</strong>
                <small className="block text-gray-500">
                  {item.telefone || item.email}
                </small>
              </span>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  className="text-secondary-500 hover:underline"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => setDeactivating(item)}
                  className="text-red-600 hover:underline"
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
          <form onSubmit={save} className="space-y-4">
            <label className="block text-sm font-medium">
              Nome
              <input
                required
                className="input-field mt-1 w-full"
                value={form.nome}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    nome: event.target.value,
                  }))
                }
              />
            </label>
            <label className="block text-sm font-medium">
              E-mail{" "}
              <span className="font-normal text-gray-500">(opcional)</span>
              <input
                type="email"
                className="input-field mt-1 w-full"
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
            <label className="block text-sm font-medium">
              Telefone
              <input
                inputMode="tel"
                autoComplete="tel"
                maxLength={15}
                className="input-field mt-1 w-full"
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
            <label className="block text-sm font-medium">
                {editing ? "Nova senha (opcional)" : "Senha de acesso"}
                <button
                  type="button"
                  className="ml-2 text-xs font-semibold text-primary-700 hover:underline"
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
                  className="input-field mt-1 w-full font-mono"
                  placeholder={editing ? "Deixe em branco para manter a senha atual" : ""}
                  value={form.senha}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      senha: event.target.value,
                    }))
                  }
                />
                <p className="mt-1 text-xs text-gray-600">
                  Mínimo 10 caracteres, com maiúscula, minúscula, número e
                  símbolo. Sem sequências como 123.
                </p>
              </label>
            <label className="flex items-center gap-2 text-sm font-medium">
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
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeForm}
                className="rounded px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button disabled={saving} className="btn-primary">
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
