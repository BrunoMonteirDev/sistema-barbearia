import type { MouseEvent } from "react";
import type { Agendamento, Profissional } from "@/lib/api";
import { datasDaSemana, statusLabels, statusStyle } from "./agendaVisualizacao";

type AcoesAgendamento = {
  onEdit: (agendamento: Agendamento) => void;
  onConfirm: (agendamento: Agendamento) => Promise<void>;
  onConclude: (agendamento: Agendamento) => Promise<void>;
};

function CartaoAgendamento({
  agendamento,
  titulo,
  descricao,
  onEdit,
  onConfirm,
  onConclude,
}: AcoesAgendamento & {
  agendamento: Agendamento;
  titulo: string;
  descricao: string;
}) {
  function confirmar(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    void onConfirm(agendamento);
  }

  function concluir(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    void onConclude(agendamento);
  }

  return (
    <article
      onClick={() => onEdit(agendamento)}
      className={`cartao-agendamento-admin ${statusStyle[agendamento.status] ?? "status-cartao-desconhecido"}`}
    >
      <p className="titulo-cartao-agenda">{titulo}</p>
      <p className="descricao-cartao-agenda">{descricao}</p>
      <p className="rotulo-status-cartao-agenda">
        {statusLabels[agendamento.status] ?? agendamento.status}
      </p>
      {agendamento.status === "PENDENTE" && (
        <button
          type="button"
          onClick={confirmar}
          className="botao-confirmar-cartao-agenda"
        >
          Confirmar
        </button>
      )}
      {["CONFIRMADO", "ATRASADO"].includes(agendamento.status) && (
        <button
          type="button"
          onClick={concluir}
          className="botao-concluir-cartao-agenda"
        >
          Concluir
        </button>
      )}
    </article>
  );
}

export function AgendaDiaria({
  items,
  profissionais,
  ...acoes
}: AcoesAgendamento & {
  items: Agendamento[];
  profissionais: Profissional[];
}) {
  const horarios = Array.from({ length: 24 }, (_, index) => {
    const minutos = 8 * 60 + index * 30;
    return `${String(Math.floor(minutos / 60)).padStart(2, "0")}:${String(minutos % 60).padStart(2, "0")}`;
  });
  const colunas = `72px repeat(${profissionais.length}, minmax(180px, 1fr))`;

  if (!profissionais.length) {
    return (
      <div className="mensagem-agenda-vazia">Não há profissionais para exibir nesta agenda.</div>
    );
  }

  return (
    <div className="agenda-diaria-admin">
      <div className="grade-diaria-agenda">
        <div
          className="cabecalho-grade-agenda"
          style={{ gridTemplateColumns: colunas }}
        >
          <div className="titulo-horario-grade-agenda">Hora</div>
          {profissionais.map((profissional) => (
            <div
              key={profissional.id}
              className="profissional-grade-agenda"
            >
              {profissional.nome}
            </div>
          ))}
        </div>
        {horarios.map((hora) => (
          <div
            key={hora}
            className="linha-grade-agenda"
            style={{ gridTemplateColumns: colunas }}
          >
            <div className="horario-grade-agenda">{hora}</div>
            {profissionais.map((profissional) => {
              const agendamentos = items.filter(
                (agendamento) =>
                  agendamento.profissional?.id === profissional.id && agendamento.hora === hora,
              );

              return (
                <div
                  key={profissional.id}
                  className="celula-grade-agenda"
                >
                  {agendamentos.map((agendamento) => (
                    <CartaoAgendamento
                      key={agendamento.id}
                      agendamento={agendamento}
                      titulo={agendamento.usuario?.nome ?? "Cliente"}
                      descricao={`${agendamento.servico?.nome ?? "Serviço"} · ${agendamento.servico?.duracao ?? 0} min`}
                      {...acoes}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AgendaSemanal({
  items,
  dataReferencia,
  ...acoes
}: AcoesAgendamento & {
  items: Agendamento[];
  dataReferencia: string;
}) {
  return (
    <div className="agenda-semanal-admin">
      {datasDaSemana(dataReferencia).map((data) => {
        const agendamentosDoDia = items
          .filter((agendamento) => agendamento.data === data)
          .sort((primeiro, segundo) => primeiro.hora.localeCompare(segundo.hora));
        const tituloDia = new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR", {
          weekday: "short",
          day: "2-digit",
        });

        return (
          <section
            key={data}
            className="dia-semana-agenda"
          >
            <h3 className="titulo-dia-semana-agenda">{tituloDia}</h3>
            <div className="lista-dia-semana-agenda">
              {agendamentosDoDia.length > 0 ? (
                agendamentosDoDia.map((agendamento) => (
                  <CartaoAgendamento
                    key={agendamento.id}
                    agendamento={agendamento}
                    titulo={`${agendamento.hora} · ${agendamento.usuario?.nome ?? "Cliente"}`}
                    descricao={`${agendamento.profissional?.nome ?? "Profissional"} · ${agendamento.servico?.nome ?? "Serviço"}`}
                    {...acoes}
                  />
                ))
              ) : (
                <p className="mensagem-dia-vazio-agenda">Sem agendamentos.</p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
