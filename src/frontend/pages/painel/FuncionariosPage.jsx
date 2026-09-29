import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import "./FuncionariosPage.css";
import { api } from "@/lib/api";
import { ConfirmDialog, Modal } from "@/components/ui/modal";
import { formatarTelefoneBrasileiro } from "@/utils/telefone";
import { EditorHorariosFuncionario } from "./EditorHorariosFuncionario";
import { TabelaFuncionarios } from "./TabelaFuncionarios";
const initialForm = {
  nome: "",
  telefone: "",
  email: "",
  ativo: true,
};
export default function FuncionariosPage() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dados");
  const [diaSelecionado, setDiaSelecionado] = useState(1);
  const [diaOrigem, setDiaOrigem] = useState(1);
  const [copiarDeFuncionarioId, setCopiarDeFuncionarioId] = useState("");
  const [disponibilidade, setDisponibilidade] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const load = async () => {
    try {
      setLoading(true);
      setFuncionarios(await api.profissionais.listAdmin());
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os funcionários.",
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);
  const closeForm = () => {
    setForm(initialForm);
    setEditing(null);
    setFormOpen(false);
    setActiveTab("dados");
    setDisponibilidade({});
    setCopiarDeFuncionarioId("");
  };
  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };
  const openEdit = async (funcionario) => {
    setEditing(funcionario);
    setForm({
      nome: funcionario.nome,
      telefone: formatarTelefoneBrasileiro(funcionario.telefone ?? ""),
      email: funcionario.email ?? "",
      ativo: funcionario.ativo,
    });
    setActiveTab("dados");
    setDiaSelecionado(1);
    setDiaOrigem(2);
    setFormOpen(true);
    try {
      setDisponibilidade(
        await api.profissionais.disponibilidade(funcionario.id),
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar horários.",
      );
    }
  };
  const save = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      if (editing) {
        await api.profissionais.update(editing.id, form);
        await api.profissionais.salvarDisponibilidade(
          editing.id,
          disponibilidade,
        );
      } else {
        await api.profissionais.create(form);
      }
      toast.success(
        editing
          ? "Funcionário atualizado com sucesso."
          : "Funcionário cadastrado com sucesso.",
      );
      closeForm();
      await load();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o funcionário.",
      );
    } finally {
      setSaving(false);
    }
  };
  const remove = async () => {
    if (!removing) return;
    try {
      await api.profissionais.remove(removing.id);
      toast.success("Funcionário desativado com sucesso.");
      setRemoving(null);
      await load();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível desativar o funcionário.",
      );
    }
  };
  const setDia = (horas) => {
    setDisponibilidade((atual) => ({
      ...atual,
      [diaSelecionado]: [...horas].sort(),
    }));
  };
  const toggleBloco = (hora) => {
    const atuais = disponibilidade[diaSelecionado] ?? [];
    const novosHorarios = atuais.includes(hora)
      ? atuais.filter((horario) => horario !== hora)
      : [...atuais, hora];
    setDia(novosHorarios);
  };
  const copiarDiaSelecionado = () => {
    if (diaOrigem === diaSelecionado) {
      toast.error(
        "Escolha um dia de origem diferente do dia que está sendo editado.",
      );
      return;
    }
    const horariosOrigem = disponibilidade[diaOrigem] ?? [];
    if (horariosOrigem.length === 0) {
      toast.error("O dia de origem não possui horários marcados para copiar.");
      return;
    }
    setDia(horariosOrigem);
    toast.success("Horários copiados para o dia selecionado.");
  };
  const copiarHorariosDeFuncionario = async () => {
    if (!copiarDeFuncionarioId) return;
    try {
      const horariosOrigem = await api.profissionais.disponibilidade(
        copiarDeFuncionarioId,
      );
      setDisponibilidade(horariosOrigem);
      toast.success("Semana de horários copiada com sucesso.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível copiar os horários.",
      );
    }
  };
  const abrirCadastro = () => {
    setEditing(null);
    setForm(initialForm);
    setFormOpen(true);
  };
  const selecionarDia = (novoDia) => {
    setDiaSelecionado(novoDia);
    if (novoDia === diaOrigem) setDiaOrigem((novoDia + 1) % 7);
  };
  const classeAba = (aba) =>
    activeTab === aba
      ? "aba-profissional aba-profissional-ativa"
      : "aba-profissional";
  return (
    <section className="pagina-profissionais">
      <div className="cabecalho-profissionais">
        <h1 className="titulo-profissionais">Funcionários</h1>
        <button
          type="button"
          onClick={abrirCadastro}
          className="botao-principal-profissional"
        >
          Adicionar funcionário
        </button>
      </div>

      <TabelaFuncionarios
        funcionarios={funcionarios}
        carregando={loading}
        editar={(funcionario) => void openEdit(funcionario)}
        desativar={setRemoving}
      />

      {formOpen && (
        <Modal
          title={editing ? "Editar funcionário" : "Adicionar funcionário"}
          onClose={closeForm}
        >
          <form onSubmit={save} className="formulario-profissional">
            {editing && (
              <div className="abas-profissional">
                <button
                  type="button"
                  onClick={() => setActiveTab("dados")}
                  className={classeAba("dados")}
                >
                  Dados
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("horarios")}
                  className={classeAba("horarios")}
                >
                  Horários de atendimento
                </button>
              </div>
            )}

            {activeTab === "dados" && (
              <>
                <label className="rotulo-profissional">
                  Nome
                  <input
                    required
                    className="campo-profissional campo-dados-profissional"
                    value={form.nome}
                    onChange={(event) =>
                      updateField("nome", event.target.value)
                    }
                  />
                </label>
                <label className="rotulo-profissional">
                  Telefone
                  <input
                    required
                    inputMode="tel"
                    autoComplete="tel"
                    maxLength={15}
                    className="campo-profissional campo-dados-profissional"
                    placeholder="(00) 00000-0000"
                    value={form.telefone ?? ""}
                    onChange={(event) =>
                      updateField(
                        "telefone",
                        formatarTelefoneBrasileiro(event.target.value),
                      )
                    }
                  />
                </label>
                <label className="rotulo-profissional">
                  E-mail
                  <input
                    required
                    type="email"
                    className="campo-profissional campo-dados-profissional"
                    value={form.email ?? ""}
                    onChange={(event) =>
                      updateField("email", event.target.value)
                    }
                  />
                </label>
                <label className="status-profissional">
                  <input
                    type="checkbox"
                    checked={form.ativo}
                    onChange={(event) =>
                      updateField("ativo", event.target.checked)
                    }
                  />
                  Funcionário ativo
                </label>
              </>
            )}

            {activeTab === "horarios" && (
              <EditorHorariosFuncionario
                funcionarios={funcionarios}
                funcionarioEditado={editing}
                disponibilidade={disponibilidade}
                diaSelecionado={diaSelecionado}
                diaOrigem={diaOrigem}
                copiarDeFuncionarioId={copiarDeFuncionarioId}
                selecionarDia={selecionarDia}
                selecionarOrigem={setDiaOrigem}
                selecionarFuncionarioOrigem={setCopiarDeFuncionarioId}
                marcarDia={setDia}
                alternarHorario={toggleBloco}
                copiarDia={copiarDiaSelecionado}
                copiarSemana={() => void copiarHorariosDeFuncionario()}
              />
            )}

            <div className="acoes-formulario-profissional">
              <button
                type="button"
                onClick={closeForm}
                className="botao-cancelar-profissional"
              >
                Cancelar
              </button>
              <button
                disabled={saving}
                className="botao-principal-profissional"
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {removing && (
        <ConfirmDialog
          title="Desativar funcionário"
          message={`Deseja desativar ${removing.nome}? O histórico de atendimentos será preservado.`}
          confirmLabel="Desativar"
          danger
          onConfirm={() => void remove()}
          onClose={() => setRemoving(null)}
        />
      )}
    </section>
  );
}
