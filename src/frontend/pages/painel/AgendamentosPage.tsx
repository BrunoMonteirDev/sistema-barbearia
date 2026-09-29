import "./AgendamentosPage.css";
import { useMemo, useState } from "react";
import { CalendarPlus, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { api, type Agendamento } from "@/lib/api";
import { ConfirmDialog } from "@/components/ui/modal";
import { ModalAgendamento, type FormularioAgendamento } from "./ModalAgendamento";
import { AgendaDiaria, AgendaSemanal } from "./VisualizacoesAgenda";
import { ListaAgendamentos } from "./ListaAgendamentos";
import { rotuloSemana } from "./agendaVisualizacao";
import { FiltrosAgenda, type FiltrosAgendamento } from "./FiltrosAgenda";
import { NovoAgendamentoWizard } from "./NovoAgendamentoWizard";
import { useAgendaAdministrativa } from "./useAgendaAdministrativa";

const emptyForm: FormularioAgendamento = {
  usuarioId: "",
  profissionalId: "",
  servicoId: "",
  data: "",
  hora: "",
  status: "PENDENTE",
};
function telefoneDestinoWhatsApp(telefone: string | null | undefined) {
  const digitos = telefone?.replace(/\D/g, "") ?? "";
  if (!digitos) return null;
  const nacional = digitos.startsWith("55") ? digitos.slice(2) : digitos;
  if (nacional.length === 11)
    return "+55 (" + nacional.slice(0, 2) + ") " + nacional.slice(2, 7) + "-" + nacional.slice(7);
  if (nacional.length === 10)
    return "+55 (" + nacional.slice(0, 2) + ") " + nacional.slice(2, 6) + "-" + nacional.slice(6);
  return "+55 " + nacional;
}

export default function AgendamentosPage() {
  const {
    agendamentos: items,
    clientes,
    profissionais,
    servicos,
    carregarAgendamentos: load,
  } = useAgendaAdministrativa();
  const [filtros, setFiltros] = useState<FiltrosAgendamento>({
    cliente: "",
    profissional: "",
    data: "",
    status: "",
  });
  const [modal, setModal] = useState<"novo" | "editar" | "visualizar" | null>(null);
  const [selected, setSelected] = useState<Agendamento | null>(null);
  const [form, setForm] = useState<FormularioAgendamento>(emptyForm);
  const [pendingAction, setPendingAction] = useState<{
    type: "cancelar" | "excluir";
    item: Agendamento;
  } | null>(null);
  const [notificationPrompt, setNotificationPrompt] = useState<{
    item: Agendamento;
    tipo:
      | "CRIACAO"
      | "REMARCACAO"
      | "CANCELAMENTO"
      | "ATUALIZACAO"
      | "PENDENTE"
      | "CONFIRMADO"
      | "CONCLUIDO"
      | "ATRASADO";
  } | null>(null);
  const [visualizacao, setVisualizacao] = useState<"lista" | "agenda" | "semana">("lista");

  const filteredByFields = useMemo(
    () =>
      items.filter(
        (item) =>
          (!filtros.cliente || item.usuario?.id === filtros.cliente) &&
          (!filtros.profissional || item.profissional?.id === filtros.profissional) &&
          (!filtros.status || item.status === filtros.status),
      ),
    [filtros.cliente, filtros.profissional, filtros.status, items],
  );
  const filteredItems = useMemo(
    () => filteredByFields.filter((item) => !filtros.data || item.data === filtros.data),
    [filteredByFields, filtros.data],
  );

  const alterarFiltro = (campo: keyof FiltrosAgendamento, valor: string) => {
    setFiltros((atual) => ({ ...atual, [campo]: valor }));
  };

  const dataAgenda = filtros.data || new Date().toLocaleDateString("en-CA");
  const mudarDiaAgenda = (dias: number) => {
    const data = new Date(`${dataAgenda}T12:00:00`);
    data.setDate(data.getDate() + dias);
    setFiltros((current) => ({ ...current, data: data.toLocaleDateString("en-CA") }));
  };

  const openNew = () => {
    setForm(emptyForm);
    setSelected(null);
    setModal("novo");
  };
  const openEdit = (item: Agendamento) => {
    setSelected(item);
    setForm({
      usuarioId: item.usuario?.id ?? "",
      profissionalId: item.profissional?.id ?? "",
      servicoId: item.servico?.id ?? "",
      data: item.data,
      hora: item.hora,
      status: item.status,
    });
    setModal("editar");
  };
  const visualizarAgendamento = (agendamento: Agendamento) => {
    setSelected(agendamento);
    setModal("visualizar");
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
  };
  const setField = (field: keyof FormularioAgendamento, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const save = async () => {
    if (!form.profissionalId || !form.servicoId || !form.data || !form.hora)
      return toast.error("Preencha todos os campos obrigatórios.");
    try {
      if (modal === "editar" && selected) {
        const dadosAtualizados = {
          profissionalId: form.profissionalId,
          servicoId: form.servicoId,
          data: form.data,
          hora: form.hora,
          status: form.status,
        };
        await api.agendamentos.update(selected.id, dadosAtualizados);
      }
      toast.success("Agendamento atualizado.");
      closeModal();
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar.");
    }
  };

  const confirmAction = async () => {
    if (!pendingAction) return;
    try {
      if (pendingAction.type === "cancelar") await api.agendamentos.cancel(pendingAction.item.id);
      else await api.agendamentos.remove(pendingAction.item.id);
      toast.success(
        pendingAction.type === "cancelar" ? "Agendamento cancelado." : "Agendamento excluído.",
      );
      if (pendingAction.type === "cancelar")
        setNotificationPrompt({
          item: { ...pendingAction.item, status: "CANCELADO" },
          tipo: "CANCELAMENTO",
        });
      setPendingAction(null);
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível concluir a ação.");
    }
  };

  const confirmarAgendamento = async (item: Agendamento) => {
    try {
      await api.agendamentos.status(item.id, "CONFIRMADO");
      toast.success("Agendamento confirmado.");
      setNotificationPrompt({ item: { ...item, status: "CONFIRMADO" }, tipo: "CONFIRMADO" });
      load();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível confirmar o agendamento.",
      );
    }
  };

  const concluirAgendamento = async (item: Agendamento) => {
    try {
      await api.agendamentos.status(item.id, "CONCLUIDO");
      toast.success("Agendamento concluído.");
      setNotificationPrompt({ item: { ...item, status: "CONCLUIDO" }, tipo: "CONCLUIDO" });
      load();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível concluir o agendamento.",
      );
    }
  };

  function agendamentoCriado() {
    closeModal();
    load();
  }

  async function enviarNotificacao() {
    if (!notificationPrompt) return;
    const telefone = notificationPrompt.item.usuario?.telefone;

    if (!telefone) {
      toast.error("O cliente não possui telefone cadastrado para receber WhatsApp.");
      setNotificationPrompt(null);
      return;
    }

    try {
      await api.agendamentos.notificar(notificationPrompt.item.id, notificationPrompt.tipo);
      toast.success("Notificação enviada.");
      setNotificationPrompt(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível enviar a notificação.",
      );
    }
  }

  const usuarioNotificacao = notificationPrompt?.item.usuario;
  const telefoneNotificacao = usuarioNotificacao?.telefone;
  const destinoNotificacao = telefoneDestinoWhatsApp(telefoneNotificacao);
  const mensagemNotificacao = telefoneNotificacao
    ? `Deseja avisar ${usuarioNotificacao?.nome ?? "o cliente"} sobre esta atualizacao? ` +
      `Telefone de destino: ${destinoNotificacao}.`
    : "O cliente nao possui telefone cadastrado. Nao e possivel enviar uma notificacao por WhatsApp.";
  const mensagemAcaoPendente = pendingAction
    ? `${pendingAction.type === "cancelar" ? "Deseja cancelar" : "Deseja excluir definitivamente"} ` +
      `o agendamento de ${pendingAction.item.usuario?.nome ?? "cliente"}?`
    : "";

  return (
    <section className="pagina-agendamentos">
      <div className="cabecalho-agendamentos">
        <div>
          <h1 className="titulo-agendamentos">Agendamentos</h1>
          <p className="descricao-agendamentos">Gerencie os horários da barbearia.</p>
        </div>
        <button
          onClick={openNew}
          className="botao-principal-agenda botao-novo-agendamento"
        >
          <CalendarPlus className="icone-grande-agenda" />
          Novo agendamento
        </button>
      </div>
      <FiltrosAgenda
        filtros={filtros}
        clientes={clientes}
        profissionais={profissionais}
        alterarFiltro={alterarFiltro}
      />
      <div className="barra-visualizacao-agenda">
        <div className="modos-visualizacao-agenda">
          <button
            type="button"
            onClick={() => setVisualizacao("lista")}
            className={`botao-visualizacao-agenda ${visualizacao === "lista" ? "selecionado" : ""}`}
          >
            Lista
          </button>
          <button
            type="button"
            onClick={() => setVisualizacao("agenda")}
            className={`botao-visualizacao-agenda ${visualizacao === "agenda" ? "selecionado" : ""}`}
          >
            <CalendarDays className="icone-agenda" />
            Dia
          </button>
          <button
            type="button"
            onClick={() => setVisualizacao("semana")}
            className={`botao-visualizacao-agenda ${visualizacao === "semana" ? "selecionado" : ""}`}
          >
            Semana
          </button>
        </div>
        {visualizacao !== "lista" && (
          <div className="navegacao-periodo-agenda">
            <button
              type="button"
              aria-label={visualizacao === "semana" ? "Semana anterior" : "Dia anterior"}
              onClick={() => mudarDiaAgenda(visualizacao === "semana" ? -7 : -1)}
              className="botao-periodo-agenda"
            >
              <ChevronLeft className="icone-grande-agenda" />
            </button>
            <strong className="rotulo-periodo-agenda">
              {visualizacao === "semana"
                ? rotuloSemana(dataAgenda)
                : new Date(`${dataAgenda}T12:00:00`).toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                  })}
            </strong>
            <button
              type="button"
              aria-label={visualizacao === "semana" ? "Próxima semana" : "Próximo dia"}
              onClick={() => mudarDiaAgenda(visualizacao === "semana" ? 7 : 1)}
              className="botao-periodo-agenda"
            >
              <ChevronRight className="icone-grande-agenda" />
            </button>
          </div>
        )}
      </div>
      {visualizacao === "agenda" && (
        <AgendaDiaria
          items={filteredByFields.filter((agendamento) => agendamento.data === dataAgenda)}
          profissionais={profissionais.filter(
            (profissional) => !filtros.profissional || profissional.id === filtros.profissional,
          )}
          onEdit={openEdit}
          onConfirm={confirmarAgendamento}
          onConclude={concluirAgendamento}
        />
      )}
      {visualizacao === "semana" && (
        <AgendaSemanal
          items={filteredByFields}
          dataReferencia={dataAgenda}
          onEdit={openEdit}
          onConfirm={confirmarAgendamento}
          onConclude={concluirAgendamento}
        />
      )}
      {visualizacao === "lista" && (
        <ListaAgendamentos
          agendamentos={filteredItems}
          confirmar={confirmarAgendamento}
          concluir={concluirAgendamento}
          visualizar={visualizarAgendamento}
          editar={openEdit}
          cancelar={(agendamento) => setPendingAction({ type: "cancelar", item: agendamento })}
          excluir={(agendamento) => setPendingAction({ type: "excluir", item: agendamento })}
        />
      )}
      {modal === "novo" && (
        <NovoAgendamentoWizard
          clientes={clientes}
          profissionais={profissionais}
          servicos={servicos}
          onClose={closeModal}
          onCreated={agendamentoCriado}
        />
      )}
      {modal && modal !== "novo" && (
        <ModalAgendamento
          modo={modal}
          agendamento={selected}
          form={form}
          profissionais={profissionais}
          servicos={servicos}
          alterarCampo={setField}
          fechar={closeModal}
          salvar={save}
        />
      )}
      {pendingAction && (
        <ConfirmDialog
          title={pendingAction.type === "cancelar" ? "Cancelar agendamento" : "Excluir agendamento"}
          message={mensagemAcaoPendente}
          confirmLabel={pendingAction.type === "cancelar" ? "Cancelar agendamento" : "Excluir"}
          danger
          onConfirm={() => {
            void confirmAction();
          }}
          onClose={() => setPendingAction(null)}
        />
      )}
      {notificationPrompt && (
        <ConfirmDialog
          title="Enviar notificacao por WhatsApp?"
          message={mensagemNotificacao}
          confirmLabel="Enviar mensagem"
          cancelLabel={"N\u00e3o enviar mensagem"}
          onConfirm={() => void enviarNotificacao()}
          onClose={() => setNotificationPrompt(null)}
        />
      )}
    </section>
  );
}
