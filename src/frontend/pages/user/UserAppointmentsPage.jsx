import "./UserAppointmentsPage.css";
import { Link } from "wouter";
import { CalendarPlus, History, Pencil } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { UserLayout } from "./UserLayout";
import { useAgendamentosCliente } from "./useAgendamentosCliente";
const hoje = new Date().toLocaleDateString("en-CA");
const podeAlterar = (status) => ["PENDENTE", "CONFIRMADO"].includes(status);
export default function UserAppointmentsPage() {
  const {
    agendamentos: items,
    remarcando,
    historico,
    data,
    hora,
    horarios,
    carregandoHorarios,
    setRemarcando,
    setHistorico,
    setData,
    setHora,
    cancelarAgendamento: cancelar,
    iniciarRemarcacao: abrirRemarcacao,
    confirmarRemarcacao,
    abrirHistorico,
  } = useAgendamentosCliente();
  return (
    <UserLayout>
      <div className="pagina-agendamentos-cliente">
        <header className="cabecalho-agendamentos-cliente">
          <div>
            <p className="identificacao-agendamentos-cliente">Agenda</p>
            <h1 className="titulo-agendamentos-cliente">Meus agendamentos</h1>
          </div>
          <Link
            href="/agendamento?origem=meus-agendamentos"
            className="botao-principal-agendamentos-cliente novo-agendamento-cliente"
          >
            <CalendarPlus className="icone-agendamentos-cliente" />
            Novo agendamento
          </Link>
        </header>
        <div className="lista-agendamentos-cliente">
          {items.length === 0 ? (
            <p className="mensagem-sem-agendamentos-cliente">
              Você ainda não possui agendamentos.
            </p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="cartao-agendamento-cliente">
                <div>
                  <p className="titulo-item-agendamentos-cliente">
                    {item.servico?.nome ?? "Serviço"}
                  </p>
                  <p className="descricao-agendamentos-cliente">
                    {formatarData(item.data)} às {item.hora} ·{" "}
                    {item.profissional?.nome ?? "Profissional"}
                  </p>
                </div>
                <div className="acoes-agendamento-cliente">
                  <span className="status-agendamento-cliente">
                    {item.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => void abrirHistorico(item)}
                    className="botao-historico-agendamento-cliente"
                    aria-label="Ver histórico"
                  >
                    <History className="icone-agendamentos-cliente" />
                  </button>
                  {podeAlterar(item.status) && (
                    <button
                      type="button"
                      onClick={() => abrirRemarcacao(item)}
                      className="botao-remarcar-agendamento-cliente"
                    >
                      <Pencil className="icone-remarcacao-cliente" />
                      Remarcar
                    </button>
                  )}
                  {podeAlterar(item.status) && (
                    <button
                      type="button"
                      onClick={() => void cancelar(item)}
                      className="botao-cancelar-agendamento-cliente"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {remarcando && (
        <Dialog
          titulo="Remarcar agendamento"
          aoFechar={() => setRemarcando(null)}
        >
          <p className="descricao-agendamentos-cliente">
            {remarcando.servico?.nome} com {remarcando.profissional?.nome}.
            Escolha uma nova data e horário.
          </p>
          <label className="rotulo-data-remarcacao-cliente">
            Nova data
            <input
              className="campo-data-remarcacao-cliente"
              type="date"
              min={hoje}
              value={data}
              onChange={(event) => setData(event.target.value)}
            />
          </label>
          <div className="horarios-remarcacao-cliente">
            <p className="titulo-horarios-remarcacao-cliente">
              Horários disponíveis
            </p>
            {carregandoHorarios ? (
              <p className="mensagem-horarios-remarcacao-cliente">
                Carregando horários...
              </p>
            ) : horarios.length ? (
              <div className="lista-horarios-remarcacao-cliente">
                {horarios.map((itemHora) => (
                  <button
                    key={itemHora}
                    type="button"
                    onClick={() => setHora(itemHora)}
                    className={`botao-horario-remarcacao-cliente ${hora === itemHora ? "selecionado" : ""}`}
                  >
                    {itemHora}
                  </button>
                ))}
              </div>
            ) : (
              <p className="mensagem-horarios-remarcacao-cliente">
                Selecione uma data com horários disponíveis.
              </p>
            )}
          </div>
          <div className="acoes-remarcacao-cliente">
            <button
              type="button"
              onClick={() => setRemarcando(null)}
              className="botao-voltar-remarcacao-cliente"
            >
              Voltar
            </button>
            <button
              type="button"
              disabled={!hora}
              onClick={() => void confirmarRemarcacao()}
              className="botao-principal-agendamentos-cliente"
            >
              Confirmar remarcação
            </button>
          </div>
        </Dialog>
      )}
      {historico && (
        <Dialog
          titulo="Histórico do agendamento"
          aoFechar={() => setHistorico(null)}
        >
          <p className="descricao-agendamentos-cliente">
            {historico.item.servico?.nome} · {formatarData(historico.item.data)}{" "}
            às {historico.item.hora}
          </p>
          <ol className="historico-agendamento-cliente">
            {historico.eventos.length ? (
              historico.eventos.map((evento) => (
                <li
                  key={evento.id}
                  className="evento-historico-agendamento-cliente"
                >
                  <p className="titulo-item-agendamentos-cliente">
                    {rotuloEvento(evento.tipo)}
                  </p>
                  <p className="data-historico-agendamento-cliente">
                    {new Date(evento.createdAt).toLocaleString("pt-BR")}
                  </p>
                </li>
              ))
            ) : (
              <li className="descricao-agendamentos-cliente">
                Ainda não há alterações registradas.
              </li>
            )}
          </ol>
        </Dialog>
      )}
    </UserLayout>
  );
}
function Dialog({ titulo, aoFechar, children }) {
  return (
    <Modal title={titulo} onClose={aoFechar}>
      {children}
    </Modal>
  );
}
function formatarData(data) {
  return new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR");
}
function rotuloEvento(tipo) {
  return (
    { CANCELAMENTO: "Cancelamento", REMARCACAO: "Remarcação" }[tipo] ?? tipo
  );
}
