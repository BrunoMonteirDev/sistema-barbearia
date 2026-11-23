/** Papel do módulo: Coordena filtros, visualizações e ações administrativas da agenda, incluindo a mensagem opcional de WhatsApp. */
import "./AgendamentosPage.css";
import { useEffect, useMemo, useState } from "react";
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

const duracaoAvisoWhatsApp = 15;

function formatarDataAgendamento(data) {
  return new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR");
}

function criarLinkWhatsApp(agendamento, acao) {
  // O link abre a mensagem preenchida; o administrador decide se quer enviá-la.
  const cliente = agendamento.usuario?.nome?.trim() || "cliente";
  const servico = agendamento.servico?.nome || "seu atendimento";
  const profissional = agendamento.profissional?.nome;
  const data = formatarDataAgendamento(agendamento.data);
  const hora = agendamento.hora;
  let mensagem;

  if (acao === "CANCELADO") {
    mensagem = `Olá, ${cliente}. Seu agendamento de ${servico}, marcado para ${data} às ${hora}, foi cancelado. Se desejar, você pode fazer um novo agendamento.`;
  } else if (acao === "CONCLUIDO") {
    mensagem = `Olá, ${cliente}. Seu atendimento de ${servico}, realizado em ${data} às ${hora}, foi marcado como concluído. Obrigado pela preferência!`;
  } else {
    mensagem = `Olá, ${cliente}. Seu agendamento de ${servico} foi confirmado para ${data} às ${hora}${profissional ? `, com ${profissional}` : ""}.`;
  }

  const telefone = agendamento.usuario?.telefone?.replace(/\D/g, "");
  if (!telefone) return { mensagem, url: null };

  const telefoneComPais = telefone.startsWith("55") ? telefone : `55${telefone}`;
  return {
    mensagem,
    url: `https://wa.me/${telefoneComPais}?text=${encodeURIComponent(mensagem)}`,
  };
}

export default function AgendamentosPage() {
  const { agendamentos, clientes, profissionais, servicos, carregarAgendamentos } = useAgendaAdministrativa();
  const [filtros, setFiltros] = useState({ cliente: "", profissional: "", data: "", status: "" });
  const [modal, setModal] = useState(null);
  const [selecionado, setSelecionado] = useState(null);
  const [acaoPendente, setAcaoPendente] = useState(null);
  const [avisoWhatsApp, setAvisoWhatsApp] = useState(null);
  const [segundosAviso, setSegundosAviso] = useState(duracaoAvisoWhatsApp);
  const [visualizacao, setVisualizacao] = useState("lista");

  useEffect(() => {
    if (!avisoWhatsApp) return undefined;

    // Usa o tempo decorrido para manter contador e barra sincronizados se a aba perder foco.
    const inicio = Date.now();
    const timer = window.setInterval(() => {
      const restante = Math.max(
        0,
        Math.ceil((duracaoAvisoWhatsApp * 1000 - (Date.now() - inicio)) / 1000),
      );
      setSegundosAviso(restante);
      if (restante === 0) {
        setAvisoWhatsApp(null);
        window.clearInterval(timer);
      }
    }, 100);

    return () => window.clearInterval(timer);
  }, [avisoWhatsApp]);

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
      setSegundosAviso(duracaoAvisoWhatsApp);
      setAvisoWhatsApp({ ...criarLinkWhatsApp(item, status), cliente: item.usuario?.nome });
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
      setSegundosAviso(duracaoAvisoWhatsApp);
      setAvisoWhatsApp({ ...criarLinkWhatsApp(acaoPendente, "CANCELADO"), cliente: acaoPendente.usuario?.nome });
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
      {avisoWhatsApp && (
        <aside className="aviso-whatsapp-agendamento" role="status" aria-live="polite">
          <div className="aviso-whatsapp-cabecalho">
            <strong>Mensagem pronta para o WhatsApp</strong>
            <button
              type="button"
              className="aviso-whatsapp-fechar"
              aria-label="Fechar aviso do WhatsApp"
              onClick={() => setAvisoWhatsApp(null)}
            >
              ×
            </button>
          </div>
          <p className="aviso-whatsapp-mensagem">{avisoWhatsApp.mensagem}</p>
          {avisoWhatsApp.url ? (
            <a
              className="aviso-whatsapp-botao"
              href={avisoWhatsApp.url}
              target="_blank"
              rel="noreferrer"
            >
              Abrir WhatsApp{avisoWhatsApp.cliente ? ` de ${avisoWhatsApp.cliente}` : ""}
            </a>
          ) : (
            <p className="aviso-whatsapp-sem-telefone">
              Este cliente ainda não tem telefone cadastrado.
            </p>
          )}
          <div className="aviso-whatsapp-contagem" aria-label={`O aviso fecha em ${segundosAviso} segundos`}>
            <span style={{ width: `${(segundosAviso / duracaoAvisoWhatsApp) * 100}%` }} />
          </div>
          <small className="aviso-whatsapp-segundos">Fechando em {segundosAviso}s</small>
        </aside>
      )}
    </section>
  );
}
