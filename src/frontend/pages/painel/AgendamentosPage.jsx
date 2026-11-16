import "./AgendamentosPage.css";
import { useMemo, useState } from "react";
import { CalendarPlus, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { ConfirmDialog } from "@/components/ui/modal";
import { ModalAgendamento } from "./ModalAgendamento";
import { AgendaDiaria, AgendaSemanal } from "./VisualizacoesAgenda";
import { ListaAgendamentos } from "./ListaAgendamentos";
import { rotuloSemana } from "./agendaVisualizacao";
import { FiltrosAgenda } from "./FiltrosAgenda";
import { NovoAgendamentoWizard } from "./NovoAgendamentoWizard";
import { useAgendaAdministrativa } from "./useAgendaAdministrativa";

export default function AgendamentosPage() {
  const { agendamentos, clientes, profissionais, servicos, carregarAgendamentos } = useAgendaAdministrativa();
  const [filtros, setFiltros] = useState({ cliente: "", profissional: "", data: "", status: "" });
  const [modal, setModal] = useState(null);
  const [selecionado, setSelecionado] = useState(null);
  const [acaoPendente, setAcaoPendente] = useState(null);
  const [visualizacao, setVisualizacao] = useState("lista");
  const filtradosPorCampo = useMemo(() => agendamentos.filter((item) =>
    (!filtros.cliente || item.usuario?.id === filtros.cliente) &&
    (!filtros.profissional || item.profissional?.id === filtros.profissional) &&
    (!filtros.status || item.status === filtros.status)), [agendamentos, filtros.cliente, filtros.profissional, filtros.status]);
  const filtrados = useMemo(() => filtradosPorCampo.filter((item) => !filtros.data || item.data === filtros.data), [filtradosPorCampo, filtros.data]);
  const dataAgenda = filtros.data || new Date().toLocaleDateString("en-CA");
  const mudarDia = (dias) => {
    const data = new Date(`${dataAgenda}T12:00:00`);
    data.setDate(data.getDate() + dias);
    setFiltros((atual) => ({ ...atual, data: data.toLocaleDateString("en-CA") }));
  };
  const fecharModal = () => { setModal(null); setSelecionado(null); };
  const atualizarStatus = async (item, status) => {
    try {
      await api.agendamentos.status(item.id, status);
      toast.success(status === "CONFIRMADO" ? "Agendamento confirmado." : "Agendamento concluído.");
      carregarAgendamentos();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível atualizar o agendamento.");
    }
  };
  const confirmarAcao = async () => {
    if (!acaoPendente) return;
    try {
      await api.agendamentos.cancel(acaoPendente.id);
      toast.success("Agendamento cancelado. Crie um novo agendamento para escolher outra data ou horário.");
      setAcaoPendente(null);
      carregarAgendamentos();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível cancelar o agendamento.");
    }
  };
  const visualizar = (item) => { setSelecionado(item); setModal("visualizar"); };
  const atualizarFiltro = (campo, valor) => setFiltros((atual) => ({ ...atual, [campo]: valor }));
  return (
    <section className="pagina-agendamentos">
      <div className="cabecalho-agendamentos">
        <div><h1 className="titulo-agendamentos">Agendamentos</h1><p className="descricao-agendamentos">Gerencie os horários da barbearia.</p></div>
        <button onClick={() => setModal("novo")} className="botao-principal-agenda botao-novo-agendamento"><CalendarPlus className="icone-grande-agenda" />Novo agendamento</button>
      </div>
      <FiltrosAgenda filtros={filtros} clientes={clientes} profissionais={profissionais} alterarFiltro={atualizarFiltro} />
      <div className="barra-visualizacao-agenda">
        <div className="modos-visualizacao-agenda">
          <button type="button" onClick={() => setVisualizacao("lista")} className={`botao-visualizacao-agenda ${visualizacao === "lista" ? "selecionado" : ""}`}>Lista</button>
          <button type="button" onClick={() => setVisualizacao("agenda")} className={`botao-visualizacao-agenda ${visualizacao === "agenda" ? "selecionado" : ""}`}><CalendarDays className="icone-agenda" />Dia</button>
          <button type="button" onClick={() => setVisualizacao("semana")} className={`botao-visualizacao-agenda ${visualizacao === "semana" ? "selecionado" : ""}`}>Semana</button>
        </div>
        {visualizacao !== "lista" && <div className="navegacao-periodo-agenda">
          <button type="button" aria-label={visualizacao === "semana" ? "Semana anterior" : "Dia anterior"} onClick={() => mudarDia(visualizacao === "semana" ? -7 : -1)} className="botao-periodo-agenda"><ChevronLeft className="icone-grande-agenda" /></button>
          <strong className="rotulo-periodo-agenda">{visualizacao === "semana" ? rotuloSemana(dataAgenda) : new Date(`${dataAgenda}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}</strong>
          <button type="button" aria-label={visualizacao === "semana" ? "Próxima semana" : "Próximo dia"} onClick={() => mudarDia(visualizacao === "semana" ? 7 : 1)} className="botao-periodo-agenda"><ChevronRight className="icone-grande-agenda" /></button>
        </div>}
      </div>
      {visualizacao === "agenda" && <AgendaDiaria items={filtradosPorCampo.filter((item) => item.data === dataAgenda)} profissionais={profissionais.filter((item) => !filtros.profissional || item.id === filtros.profissional)} onView={visualizar} onConfirm={(item) => void atualizarStatus(item, "CONFIRMADO")} onConclude={(item) => void atualizarStatus(item, "CONCLUIDO")} />}
      {visualizacao === "semana" && <AgendaSemanal items={filtradosPorCampo} dataReferencia={dataAgenda} onView={visualizar} onConfirm={(item) => void atualizarStatus(item, "CONFIRMADO")} onConclude={(item) => void atualizarStatus(item, "CONCLUIDO")} />}
      {visualizacao === "lista" && <ListaAgendamentos agendamentos={filtrados} confirmar={(item) => void atualizarStatus(item, "CONFIRMADO")} concluir={(item) => void atualizarStatus(item, "CONCLUIDO")} visualizar={visualizar} cancelar={(item) => setAcaoPendente(item)} />}
      {modal === "novo" && <NovoAgendamentoWizard clientes={clientes} profissionais={profissionais} servicos={servicos} onClose={fecharModal} onCreated={() => { fecharModal(); carregarAgendamentos(); }} />}
      {modal === "visualizar" && <ModalAgendamento agendamento={selecionado} fechar={fecharModal} />}
      {acaoPendente && <ConfirmDialog title="Cancelar agendamento" message={`Deseja cancelar o agendamento de ${acaoPendente.usuario?.nome ?? "cliente"}? Para escolher outra data ou horário, será necessário criar um novo agendamento.`} confirmLabel="Cancelar agendamento" danger onConfirm={() => void confirmarAcao()} onClose={() => setAcaoPendente(null)} />}
    </section>
  );
}
