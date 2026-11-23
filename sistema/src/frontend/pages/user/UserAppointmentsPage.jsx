/** Papel do módulo: Mostra os agendamentos do cliente e permite consultar ou cancelar reservas permitidas. */
import "./UserAppointmentsPage.css";
import { Link } from "wouter";
import { CalendarPlus, History } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { UserLayout } from "./UserLayout";
import { useAgendamentosCliente } from "./useAgendamentosCliente";

export default function UserAppointmentsPage() {
  const { agendamentos, historico, setHistorico, cancelarAgendamento, abrirHistorico } = useAgendamentosCliente();
  return (
    <UserLayout>
      <div className="pagina-agendamentos-cliente">
        <header className="cabecalho-agendamentos-cliente">
          <div>
            <p className="identificacao-agendamentos-cliente">Agenda</p>
            <h1 className="titulo-agendamentos-cliente">Meus agendamentos</h1>
          </div>
          <Link href="/agendamento?origem=meus-agendamentos" className="botao-principal-agendamentos-cliente novo-agendamento-cliente">
            <CalendarPlus className="icone-agendamentos-cliente" /> Novo agendamento
          </Link>
        </header>
        <div className="lista-agendamentos-cliente">
          {agendamentos.length === 0 ? (
            <p className="mensagem-sem-agendamentos-cliente">Você ainda não possui agendamentos.</p>
          ) : agendamentos.map((item) => (
            <div key={item.id} className="cartao-agendamento-cliente">
              <div>
                <p className="titulo-item-agendamentos-cliente">{item.servico?.nome ?? "Serviço"}</p>
                <p className="descricao-agendamentos-cliente">{formatarData(item.data)} às {item.hora} · {item.profissional?.nome ?? "Profissional"}</p>
              </div>
              <div className="acoes-agendamento-cliente">
                <span className="status-agendamento-cliente">{item.status}</span>
                <button type="button" onClick={() => void abrirHistorico(item)} className="botao-historico-agendamento-cliente" aria-label="Ver histórico">
                  <History className="icone-agendamentos-cliente" />
                </button>
                {["PENDENTE", "CONFIRMADO"].includes(item.status) && (
                  <button type="button" onClick={() => void cancelarAgendamento(item)} className="botao-cancelar-agendamento-cliente">Cancelar</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {historico && (
        <Modal title="Histórico do agendamento" onClose={() => setHistorico(null)}>
          <p className="descricao-agendamentos-cliente">{historico.item.servico?.nome} · {formatarData(historico.item.data)} às {historico.item.hora}</p>
          <ol className="historico-agendamento-cliente">
            {historico.eventos.length ? historico.eventos.map((evento) => (
              <li key={evento.id} className="evento-historico-agendamento-cliente">
                <p className="titulo-item-agendamentos-cliente">{rotuloEvento(evento.tipo)}</p>
                <p className="data-historico-agendamento-cliente">{new Date(evento.createdAt).toLocaleString("pt-BR")}</p>
              </li>
            )) : <li className="descricao-agendamentos-cliente">Ainda não há alterações registradas.</li>}
          </ol>
        </Modal>
      )}
    </UserLayout>
  );
}

function formatarData(data) {
  return new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR");
}

function rotuloEvento(tipo) {
  return ({ CANCELAMENTO: "Cancelamento", REMARCACAO: "Remarcação" })[tipo] ?? tipo;
}
