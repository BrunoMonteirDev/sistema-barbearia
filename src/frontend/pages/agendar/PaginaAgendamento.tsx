import "./PaginaAgendamento.css";
import { ArrowLeft, ArrowRight, CalendarDays, Check, Scissors, UserRound } from "lucide-react";
import { ConfirmacaoAgendamentoRepetidoModal } from "@/components/ConfirmacaoAgendamentoRepetidoModal";
import { arredondarDuracaoParaBloco } from "@/utils/horarios";
import { SEM_PREFERENCIA, useAgendamentoPublico } from "./useAgendamentoPublico";
import { EtapaHorario } from "./EtapaHorario";

export default function PaginaAgendamento() {
  const agenda = useAgendamentoPublico();
  const {
    etapa,
    setEtapa,
    servicos,
    profissionais,
    revisaoAceita,
    setRevisaoAceita,
    confirmacaoRepeticao,
    setConfirmacaoRepeticao,
    form,
    servicoSelecionado,
    selecionarProfissional,
    selecionarServico,
    avancarEtapa,
    criarAgendamento,
    confirmarRepeticao,
    voltar,
  } = agenda;

  const etapas = [
    { titulo: "Profissional", icone: UserRound },
    { titulo: "Serviço", icone: Scissors },
    { titulo: "Horário", icone: CalendarDays },
    { titulo: "Revisão", icone: Check },
  ];

  const profissionalDaRevisao = profissionais.find(
    (profissional) => profissional.id === form.profissionalId,
  );
  const nomeProfissional =
    form.profissionalId === SEM_PREFERENCIA
      ? "Sem preferência"
      : (profissionalDaRevisao?.nome ?? "-");
  const dataDaRevisao = form.data
    ? new Date(`${form.data}T12:00:00`).toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "-";
  const duracaoDaRevisao = servicoSelecionado
    ? `${arredondarDuracaoParaBloco(servicoSelecionado.duracao)} minutos`
    : "-";
  const valorDaRevisao = servicoSelecionado
    ? Number(servicoSelecionado.preco).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })
    : "-";

  function enviarFormulario(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void criarAgendamento();
  }

  function voltarEtapa() {
    setEtapa((atual) => atual - 1);
  }

  return (
    <main className="pagina-agendamento">
      <div className="conteudo-agendamento">
        <header className="bloco-introducao-agendamento">
          <p className="identificacao-agendamento">Agendamento online</p>
          <h1 className="titulo-agendamento">Agende seu atendimento</h1>
          <p className="introducao-agendamento">
            Escolha as opções abaixo para reservar seu horário.
          </p>
        </header>
        <div className="bloco-introducao-agendamento">
          <div className="legenda-progresso-agendamento">
            <span>Etapa {etapa} de 4</span>
            <span>{Math.round((etapa / 4) * 100)}%</span>
          </div>
          <div className="trilho-progresso-agendamento">
            <div
              className="barra-progresso-agendamento"
              style={{ width: `${(etapa / 4) * 100}%` }}
            />
          </div>
          <div className="etapas-agendamento">
            {etapas.map((item, index) => {
              const Icon = item.icone;
              const ativo = index + 1 <= etapa;
              return (
                <div
                  key={item.titulo}
                  className="etapa-agendamento"
                >
                  <span className={`indicador-etapa-agendamento ${ativo ? "ativa" : ""}`}>
                    {index + 1 < etapa ? (
                      <Check className="icone-agendamento" />
                    ) : (
                      <Icon className="icone-agendamento" />
                    )}
                  </span>
                  <span className={`nome-etapa-agendamento ${ativo ? "ativa" : ""}`}>
                    {item.titulo}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <form
          onSubmit={enviarFormulario}
          className="formulario-agendamento"
        >
          <div className="secoes-agendamento">
            {etapa === 1 && (
              <section>
                <h2 className="titulo-secao-agendamento">Escolha o profissional</h2>
                <p className="descricao-secao-agendamento">
                  Você pode escolher alguém específico ou deixar a preferência em aberto.
                </p>
                <div className="lista-opcoes-agendamento">
                  <Choice
                    active={form.profissionalId === SEM_PREFERENCIA}
                    onClick={() => selecionarProfissional(SEM_PREFERENCIA)}
                    title="Sem preferência"
                    description="Encontraremos um profissional disponível."
                  />
                  {profissionais.map((profissional) => (
                    <Choice
                      key={profissional.id}
                      active={form.profissionalId === profissional.id}
                      onClick={() => selecionarProfissional(profissional.id)}
                      title={profissional.nome}
                      description={profissional.especialidade || "Profissional da barbearia"}
                    />
                  ))}
                </div>
              </section>
            )}
            {etapa === 2 && (
              <section>
                <h2 className="titulo-secao-agendamento">Escolha o serviço</h2>
                <p className="descricao-secao-agendamento">
                  Selecione o atendimento que você deseja realizar.
                </p>
                <div className="lista-opcoes-agendamento">
                  {servicos.map((servico) => (
                    <Choice
                      key={servico.id}
                      active={form.servicoId === servico.id}
                      onClick={() => selecionarServico(servico.id)}
                      title={servico.nome}
                      description={`${Number(servico.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} · ${arredondarDuracaoParaBloco(servico.duracao)} min`}
                    />
                  ))}
                </div>
              </section>
            )}
            {etapa === 3 && <EtapaHorario agenda={agenda} />}
            {etapa === 4 && (
              <section aria-labelledby="titulo-revisao">
                <h2
                  id="titulo-revisao"
                  className="titulo-secao-agendamento"
                >
                  Revise seu agendamento
                </h2>
                <p className="descricao-secao-agendamento">
                  Confira os dados antes de confirmar a sua reserva.
                </p>
                <dl className="resumo-agendamento">
                  <ResumoItem
                    label="Profissional"
                    valor={nomeProfissional}
                  />
                  <ResumoItem
                    label="Serviço"
                    valor={servicoSelecionado?.nome ?? "-"}
                  />
                  <ResumoItem
                    label="Data"
                    valor={dataDaRevisao}
                  />
                  <ResumoItem
                    label="Horário"
                    valor={form.hora || "-"}
                  />
                  <ResumoItem
                    label="Duração"
                    valor={duracaoDaRevisao}
                  />
                  <ResumoItem
                    label="Valor"
                    valor={valorDaRevisao}
                  />
                </dl>
                <label className="confirmacao-revisao-agendamento">
                  <input
                    type="checkbox"
                    checked={revisaoAceita}
                    onChange={(event) => setRevisaoAceita(event.target.checked)}
                    className="checkbox-confirmacao-agendamento"
                  />
                  <span>Li e confirmei os dados deste agendamento.</span>
                </label>
              </section>
            )}
          </div>
          <footer className="acoes-agendamento">
            {etapa === 1 && (
              <button
                type="button"
                onClick={voltar}
                className="botao-cancelar-agendamento"
              >
                Cancelar agendamento
              </button>
            )}
            {etapa !== 1 && (
              <button
                type="button"
                onClick={voltarEtapa}
                className="botao-voltar-agendamento"
              >
                <ArrowLeft className="icone-agendamento" />
                Voltar
              </button>
            )}
            {etapa < 4 ? (
              <button
                type="button"
                onClick={avancarEtapa}
                className="botao-confirmar-agendamento"
              >
                {etapa === 3 ? "Revisar agendamento" : "Avançar"}
                <ArrowRight className="icone-agendamento" />
              </button>
            ) : (
              <button
                type="submit"
                className="botao-confirmar-agendamento"
                disabled={!form.hora || !revisaoAceita}
              >
                Confirmar agendamento
                <Check className="icone-agendamento" />
              </button>
            )}
          </footer>
        </form>
      </div>
      {confirmacaoRepeticao && (
        <ConfirmacaoAgendamentoRepetidoModal
          relacionados={confirmacaoRepeticao.relacionados}
          onClose={() => setConfirmacaoRepeticao(null)}
          onConfirm={() => void confirmarRepeticao()}
        />
      )}
    </main>
  );
}

function Choice({
  active,
  onClick,
  title,
  description,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cartao-opcao-agendamento ${active ? "selecionado" : ""}`}
    >
      <span>
        <span className="titulo-opcao-agendamento">{title}</span>
        <span className="descricao-opcao-agendamento">{description}</span>
      </span>
      {active && (
        <span className="marca-opcao-agendamento">
          <Check className="icone-selecao-agendamento" />
        </span>
      )}
    </button>
  );
}

function ResumoItem({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="linha-resumo-agendamento">
      <dt className="rotulo-resumo-agendamento">{label}</dt>
      <dd className="valor-resumo-agendamento">{valor}</dd>
    </div>
  );
}
