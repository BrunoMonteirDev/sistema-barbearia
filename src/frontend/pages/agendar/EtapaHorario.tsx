import { AlertTriangle, ChevronLeft, ChevronRight, Clock3 } from "lucide-react";
import { ResumoAgendamentosCliente } from "@/components/ResumoAgendamentosCliente";
import { arredondarDuracaoParaBloco } from "@/utils/horarios";
import {
  anoAtual,
  anosDisponiveis,
  diasDaSemana,
  formatarDataLocal,
  hoje,
  mesAtual,
  nomesDosMeses,
  useAgendamentoPublico,
} from "./useAgendamentoPublico";

type AgendaPublica = ReturnType<typeof useAgendamentoPublico>;

export function EtapaHorario({ agenda }: { agenda: AgendaPublica }) {
  const {
    servicoSelecionado,
    form,
    horarios,
    horariosComAvisoAntecedencia,
    confirmacaoHorarioProximo,
    setConfirmacaoHorarioProximo,
    carregandoHorarios,
    mesExibido,
    setMesExibido,
    diasDoCalendario,
    mesesDisponiveis,
    mesAnteriorBloqueado,
    selecionarData,
    selecionarHorario,
  } = agenda;

  const periodos = [
    { nome: "Manhã", horas: horarios.filter((hora) => hora < "12:00") },
    {
      nome: "Tarde",
      horas: horarios.filter((hora) => hora >= "12:00" && hora < "18:00"),
    },
    { nome: "Noite", horas: horarios.filter((hora) => hora >= "18:00") },
  ];

  let descricaoFalada = "Escolha o horário.";
  if (servicoSelecionado) {
    descricaoFalada += ` Serviço selecionado: ${servicoSelecionado.nome}. Duração do serviço: ${arredondarDuracaoParaBloco(servicoSelecionado.duracao)} minutos.`;
  }
  if (form.data) {
    descricaoFalada += ` Data selecionada: ${new Date(`${form.data}T12:00:00`).toLocaleDateString("pt-BR")}.`;
  }
  if (horarios.length) {
    descricaoFalada += ` Horários disponíveis: ${horarios.join(", ")}.`;
  }

  function mudarMes(diferenca: number) {
    setMesExibido((atual) => new Date(atual.getFullYear(), atual.getMonth() + diferenca, 1));
  }

  function selecionarAno(ano: number) {
    setMesExibido((atual) => {
      const mes = ano === anoAtual ? Math.max(atual.getMonth(), mesAtual) : atual.getMonth();
      return new Date(ano, mes, 1);
    });
  }

  return (
    <div className="layout-horarios-agendamento">
      <section data-speech-text={descricaoFalada}>
        <h2 className="titulo-secao-agendamento">Escolha o horário</h2>
        <p className="descricao-secao-agendamento">
          Selecione uma data para visualizar os horários disponíveis.
        </p>
        <div className="selecao-horarios-agendamento">
          <div>
            <div className="calendario-agendamento">
              <div className="cabecalho-calendario-agendamento">
                <button
                  type="button"
                  aria-label="Mês anterior"
                  disabled={mesAnteriorBloqueado}
                  onClick={() => mudarMes(-1)}
                  className="botao-mes-agendamento"
                >
                  <ChevronLeft className="icone-calendario-agendamento" />
                </button>
                <div className="seletores-calendario-agendamento">
                  <label
                    className="rotulo-acessivel-agendamento"
                    htmlFor="mes-calendario"
                  >
                    Mês
                  </label>
                  <select
                    id="mes-calendario"
                    aria-label="Selecionar mês"
                    value={mesExibido.getMonth()}
                    onChange={(event) =>
                      setMesExibido(
                        (atual) => new Date(atual.getFullYear(), Number(event.target.value), 1),
                      )
                    }
                    className="seletor-calendario-agendamento"
                  >
                    {mesesDisponiveis.map(({ nome, indice }) => (
                      <option
                        key={nome}
                        value={indice}
                      >
                        {nome}
                      </option>
                    ))}
                  </select>
                  <label
                    className="rotulo-acessivel-agendamento"
                    htmlFor="ano-calendario"
                  >
                    Ano
                  </label>
                  <select
                    id="ano-calendario"
                    aria-label="Selecionar ano"
                    value={mesExibido.getFullYear()}
                    onChange={(event) => selecionarAno(Number(event.target.value))}
                    className="seletor-calendario-agendamento"
                  >
                    {anosDisponiveis.map((ano) => (
                      <option
                        key={ano}
                        value={ano}
                      >
                        {ano}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  aria-label="Próximo mês"
                  onClick={() => mudarMes(1)}
                  className="botao-mes-agendamento"
                >
                  <ChevronRight className="icone-calendario-agendamento" />
                </button>
              </div>
              <div
                className="grade-calendario-agendamento"
                role="grid"
                aria-label={`Calendário de ${nomesDosMeses[mesExibido.getMonth()]} de ${mesExibido.getFullYear()}`}
              >
                {diasDaSemana.map((dia, indice) => (
                  <span
                    key={dia}
                    className={`dia-semana-agendamento ${indice < 6 ? "com-divisoria" : ""}`}
                  >
                    {dia}
                  </span>
                ))}
                {diasDoCalendario.map((data, indice) => {
                  if (!data) {
                    return (
                      <span
                        key={`vazio-${indice}`}
                        aria-hidden="true"
                        className={`dia-vazio-agendamento ${indice % 7 < 6 ? "com-divisoria" : ""}`}
                      />
                    );
                  }

                  const valor = formatarDataLocal(data);
                  const indisponivel = valor < hoje;
                  return (
                    <button
                      key={valor}
                      type="button"
                      disabled={indisponivel}
                      aria-label={data.toLocaleDateString("pt-BR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                      onClick={() => selecionarData(valor)}
                      className={`dia-calendario-agendamento ${indice % 7 < 6 ? "com-divisoria" : ""} ${form.data === valor ? "selecionado" : ""}`}
                    >
                      {data.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
            {servicoSelecionado && (
              <p className="duracao-agendamento">
                Duração do serviço:{" "}
                <strong>{arredondarDuracaoParaBloco(servicoSelecionado.duracao)} minutos</strong>.
              </p>
            )}
          </div>
          <div className="painel-horarios-agendamento">
            <p className="titulo-horarios-agendamento">Horários disponíveis</p>
            {carregandoHorarios && (
              <p className="mensagem-horarios-agendamento">Carregando horários...</p>
            )}
            {!carregandoHorarios && !form.data && (
              <p className="mensagem-horarios-agendamento">Escolha uma data para continuar.</p>
            )}
            {!carregandoHorarios && form.data && horarios.length === 0 && (
              <p className="aviso-horarios-agendamento">Não há horários disponíveis nesta data.</p>
            )}
            {!carregandoHorarios && form.data && horarios.length > 0 && (
              <div className="periodos-agendamento">
                {periodos.map((periodo) => {
                  if (periodo.horas.length === 0) return null;

                  return (
                    <div key={periodo.nome}>
                      <p className="titulo-periodo-agendamento">
                        <Clock3 className="icone-periodo-agendamento" />
                        {periodo.nome}
                      </p>
                      <div className="lista-horarios-agendamento">
                        {periodo.horas.map((hora) => (
                          <button
                            key={hora}
                            type="button"
                            aria-label={`Horário disponível: ${hora}`}
                            aria-pressed={form.hora === hora}
                            onClick={() => selecionarHorario(hora)}
                            className={`botao-horario-agendamento ${form.hora === hora ? "selecionado" : ""}`}
                          >
                            {hora}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {form.hora && horariosComAvisoAntecedencia.includes(form.hora) && (
              <div
                role="alert"
                className="aviso-horarios-agendamento aviso-antecedencia-agendamento"
              >
                <p className="texto-aviso-agendamento">
                  <AlertTriangle className="icone-aviso-agendamento" />
                  <span>
                    Este horário está próximo do momento atual. Você ainda pode agendar, mas
                    confirme se conseguirá chegar a tempo.
                  </span>
                </p>
                {form.data === hoje && (
                  <label className="confirmacao-antecedencia-agendamento">
                    <input
                      type="checkbox"
                      checked={confirmacaoHorarioProximo}
                      onChange={(event) => setConfirmacaoHorarioProximo(event.target.checked)}
                      className="checkbox-confirmacao-agendamento"
                    />
                    <span>Confirmo que consigo comparecer ao atendimento em cima da hora.</span>
                  </label>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
      <ResumoAgendamentosCliente />
    </div>
  );
}
