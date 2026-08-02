import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Scissors,
  UserRound,
} from "lucide-react";
import { useLocation } from "wouter";
import toast from "react-hot-toast";
import { api, type Profissional, type Servico } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { arredondarDuracaoParaBloco } from "@/utils/horarios";

const SEM_PREFERENCIA = "sem-preferencia";
const hoje = new Date().toLocaleDateString("en-CA");
const nomesDosMeses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const diasDaSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const anoAtual = new Date().getFullYear();
const mesAtual = new Date().getMonth();
const anosDisponiveis = Array.from({ length: 6 }, (_, indice) => anoAtual + indice);

function formatarDataLocal(data: Date) {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;
}

export default function AgendarPage() {
  const { user } = useAuth();
  const [, go] = useLocation();
  const voltarParaAgendamentos = new URLSearchParams(window.location.search).get("origem") === "meus-agendamentos";
  const dadosDaRevisao = useMemo(() => {
    const parametros = new URLSearchParams(window.location.search);
    const profissionalId = parametros.get("profissionalId");
    const servicoId = parametros.get("servicoId");
    const data = parametros.get("data");
    const hora = parametros.get("hora");
    return parametros.get("revisao") === "1" && profissionalId && servicoId && data && hora
      ? { profissionalId, servicoId, data, hora }
      : null;
  }, []);
  const preservarHorarioInicial = useRef(Boolean(dadosDaRevisao));
  const [etapa, setEtapa] = useState(dadosDaRevisao ? 4 : 1);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [horarios, setHorarios] = useState<string[]>([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [mesExibido, setMesExibido] = useState(() => {
    const dataInicial = dadosDaRevisao?.data ? new Date(`${dadosDaRevisao.data}T12:00:00`) : new Date();
    return new Date(dataInicial.getFullYear(), dataInicial.getMonth(), 1);
  });
  const [form, setForm] = useState(dadosDaRevisao ?? {
    profissionalId: "", servicoId: "", data: "", hora: "",
  });

  useEffect(() => {
    void Promise.all([api.servicos.list(), api.profissionais.list()])
      .then(([servicosData, profissionaisData]) => {
        setServicos(servicosData);
        setProfissionais(profissionaisData);
      })
      .catch((error) =>
        toast.error(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar dados do agendamento.",
        ),
      );
  }, []);

  const servicoSelecionado = useMemo(
    () => servicos.find((servico) => servico.id === form.servicoId),
    [servicos, form.servicoId],
  );
  const diasDoCalendario = useMemo(() => {
    const primeiroDia = new Date(mesExibido.getFullYear(), mesExibido.getMonth(), 1);
    const quantidadeDeDias = new Date(mesExibido.getFullYear(), mesExibido.getMonth() + 1, 0).getDate();
    return Array.from({ length: primeiroDia.getDay() + quantidadeDeDias }, (_, indice) => {
      const dia = indice - primeiroDia.getDay() + 1;
      return dia > 0 ? new Date(mesExibido.getFullYear(), mesExibido.getMonth(), dia) : null;
    });
  }, [mesExibido]);
  const mesesDisponiveis = useMemo(
    () => nomesDosMeses.map((nome, indice) => ({ nome, indice })).filter(({ indice }) => mesExibido.getFullYear() !== anoAtual || indice >= mesAtual),
    [mesExibido],
  );
  const mesAnteriorBloqueado = mesExibido.getFullYear() === new Date().getFullYear() && mesExibido.getMonth() === new Date().getMonth();
  useEffect(() => {
    if (preservarHorarioInicial.current) preservarHorarioInicial.current = false;
    else setForm((current) => ({ ...current, hora: "" }));
    setHorarios([]);
    if (!form.profissionalId || !form.servicoId || !form.data) return;
    setLoadingHorarios(true);
    api.agendamentos
      .disponibilidade(form.profissionalId, form.servicoId, form.data)
      .then((data) => setHorarios(data.horarios))
      .catch((error) =>
        toast.error(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar horários.",
        ),
      )
      .finally(() => setLoadingHorarios(false));
  }, [form.profissionalId, form.servicoId, form.data]);

  const avancar = () => {
    if (etapa === 1 && !form.profissionalId)
      return toast.error("Escolha um profissional para continuar.");
    if (etapa === 2 && !form.servicoId)
      return toast.error("Escolha um serviço para continuar.");
    if (etapa === 3 && !form.hora)
      return toast.error("Selecione um horário disponível para continuar.");
    setEtapa((current) => current + 1);
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (etapa !== 4) {
      toast.error("Revise os dados do agendamento antes de confirmar.");
      return;
    }
    const retornoDaRevisao = `/agendamento?${new URLSearchParams({
      revisao: "1",
      profissionalId: form.profissionalId,
      servicoId: form.servicoId,
      data: form.data,
      hora: form.hora,
    }).toString()}`;
    if (!user) {
      return go(`/login?retorno=${encodeURIComponent(retornoDaRevisao)}`);
    }
    if (user.cadastroConcluido === false) {
      toast.error("Conclua seu cadastro antes de confirmar um agendamento.");
      return go(`/concluir-cadastro?retorno=${encodeURIComponent(retornoDaRevisao)}`);
    }
    if (!horarios.includes(form.hora))
      return toast.error("Selecione um horário disponível.");
    try {
      await api.agendamentos.create(form);
      toast.success("Agendamento criado.");
      go("/minha-conta");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível agendar.",
      );
    }
  };

  const etapas = [
    { titulo: "Profissional", icone: UserRound },
    { titulo: "Serviço", icone: Scissors },
    { titulo: "Horário", icone: CalendarDays },
    { titulo: "Revisão", icone: Check },
  ];
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <p className="text-sm font-semibold text-primary-700">
            Agendamento online
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            Agende seu atendimento
          </h1>
          <p className="mt-2 text-slate-600">
            Escolha as opções abaixo para reservar seu horário.
          </p>
        </header>
        <div className="mb-8">
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span>Etapa {etapa} de 4</span>
            <span>{Math.round((etapa / 4) * 100)}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-primary-600 transition-all duration-300"
              style={{ width: `${(etapa / 4) * 100}%` }}
            />
          </div>
          <div className="mt-4 grid grid-cols-4">
            {etapas.map((item, index) => {
              const Icon = item.icone;
              const ativo = index + 1 <= etapa;
              return (
                <div
                  key={item.titulo}
                  className="flex flex-col items-center gap-2 text-center"
                >
                  <span
                    className={`grid h-9 w-9 place-items-center rounded-full border text-sm ${ativo ? "border-primary-600 bg-primary-600 text-white" : "border-slate-300 bg-white text-slate-400"}`}
                  >
                    {index + 1 < etapa ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </span>
                  <span
                    className={`text-xs font-semibold ${ativo ? "text-slate-900" : "text-slate-400"}`}
                  >
                    {item.titulo}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <form
          onSubmit={submit}
          className="rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="p-6 sm:p-8">
            {etapa === 1 && (
              <section>
                <h2 className="text-xl font-bold text-slate-950">
                  Escolha o profissional
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Você pode escolher alguém específico ou deixar a preferência
                  em aberto.
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <Choice
                    active={form.profissionalId === SEM_PREFERENCIA}
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        profissionalId: SEM_PREFERENCIA,
                        servicoId: "",
                        hora: "",
                      }))
                    }
                    title="Sem preferência"
                    description="Encontraremos um profissional disponível."
                  />
                  {profissionais.map((profissional) => (
                    <Choice
                      key={profissional.id}
                      active={form.profissionalId === profissional.id}
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          profissionalId: profissional.id,
                          servicoId: "",
                          hora: "",
                        }))
                      }
                      title={profissional.nome}
                      description={
                        profissional.especialidade ||
                        "Profissional da barbearia"
                      }
                    />
                  ))}
                </div>
              </section>
            )}
            {etapa === 2 && (
              <section>
                <h2 className="text-xl font-bold text-slate-950">
                  Escolha o serviço
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Selecione o atendimento que você deseja realizar.
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {servicos.map((servico) => (
                    <Choice
                      key={servico.id}
                      active={form.servicoId === servico.id}
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          servicoId: servico.id,
                          hora: "",
                        }))
                      }
                      title={servico.nome}
                      description={`${Number(servico.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} · ${arredondarDuracaoParaBloco(servico.duracao)} min`}
                    />
                  ))}
                </div>
              </section>
            )}
            {etapa === 3 && (
              <section>
                <h2 className="text-xl font-bold text-slate-950">
                  Escolha o horário
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Selecione uma data para visualizar os horários disponíveis.
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] sm:items-start">
                  <div>
                <div className="rounded-xl border border-slate-200 p-3 sm:p-4">
                  <div className="flex items-center justify-between gap-3">
                    <button type="button" aria-label="Mês anterior" disabled={mesAnteriorBloqueado} onClick={() => setMesExibido(atual => new Date(atual.getFullYear(), atual.getMonth() - 1, 1))} className="rounded-md p-2 text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="h-5 w-5" /></button>
                    <div className="flex items-center gap-2">
                      <label className="sr-only" htmlFor="mes-calendario">Mês</label>
                      <select id="mes-calendario" aria-label="Selecionar mês" value={mesExibido.getMonth()} onChange={event => setMesExibido(atual => new Date(atual.getFullYear(), Number(event.target.value), 1))} className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm font-bold text-slate-900 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-200">
                        {mesesDisponiveis.map(({ nome, indice }) => <option key={nome} value={indice}>{nome}</option>)}
                      </select>
                      <label className="sr-only" htmlFor="ano-calendario">Ano</label>
                      <select id="ano-calendario" aria-label="Selecionar ano" value={mesExibido.getFullYear()} onChange={event => setMesExibido(atual => { const ano = Number(event.target.value); return new Date(ano, ano === anoAtual ? Math.max(atual.getMonth(), mesAtual) : atual.getMonth(), 1) })} className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm font-bold text-slate-900 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-200">
                        {anosDisponiveis.map(ano => <option key={ano} value={ano}>{ano}</option>)}
                      </select>
                    </div>
                    <button type="button" aria-label="Próximo mês" onClick={() => setMesExibido(atual => new Date(atual.getFullYear(), atual.getMonth() + 1, 1))} className="rounded-md p-2 text-slate-700 hover:bg-slate-100"><ChevronRight className="h-5 w-5" /></button>
                  </div>
                  <div className="mt-4 grid grid-cols-7 overflow-hidden rounded-lg border border-slate-200 text-center" role="grid" aria-label={`Calendário de ${nomesDosMeses[mesExibido.getMonth()]} de ${mesExibido.getFullYear()}`}>
                    {diasDaSemana.map((dia, indice) => <span key={dia} className={`border-b border-slate-200 bg-slate-50 py-2 text-xs font-bold uppercase text-slate-500 ${indice < 6 ? "border-r" : ""}`}>{dia}</span>)}
                    {diasDoCalendario.map((data, indice) => data ? (() => {
                      const valor = formatarDataLocal(data);
                      const indisponivel = valor < hoje;
                      return <button key={valor} type="button" disabled={indisponivel} aria-label={data.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })} onClick={() => setForm(atual => ({ ...atual, data: valor, hora: "" }))} className={`aspect-square border-b border-slate-200 text-sm font-semibold transition-colors ${indice % 7 < 6 ? "border-r" : ""} ${form.data === valor ? "bg-primary-700 text-white" : "text-slate-800 hover:bg-secondary-50"} disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent`}>{data.getDate()}</button>;
                    })() : <span key={`vazio-${indice}`} aria-hidden="true" className={`border-b border-slate-200 ${indice % 7 < 6 ? "border-r" : ""}`} />)}
                  </div>
                </div>
                {servicoSelecionado && (
                  <p className="mt-3 rounded-md bg-slate-50 p-2.5 text-sm text-slate-700">
                    Duração do serviço:{" "}
                    <strong>
                      {arredondarDuracaoParaBloco(servicoSelecionado.duracao)}{" "}
                      minutos
                    </strong>
                    .
                  </p>
                )}
                  </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                  <p className="mb-3 text-sm font-bold text-slate-900">Horários disponíveis</p>
                  {loadingHorarios ? (
                    <p className="text-sm text-slate-600">
                      Carregando horários...
                    </p>
                  ) : !form.data ? (
                    <p className="text-sm text-slate-600">
                      Escolha uma data para continuar.
                    </p>
                  ) : horarios.length === 0 ? (
                    <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                      Não há horários disponíveis nesta data.
                    </p>
                  ) : (
                    <div className="space-y-3">{[['Manhã', horarios.filter(hora => hora < '12:00')], ['Tarde', horarios.filter(hora => hora >= '12:00' && hora < '18:00')], ['Noite', horarios.filter(hora => hora >= '18:00')]].map(([periodo, lista]) => (Array.isArray(lista) && lista.length > 0 && <div key={String(periodo)}><p className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700"><Clock3 className="h-4 w-4 text-secondary-600" />{periodo}</p><div className="grid grid-cols-3 gap-1.5">{lista.map((hora) => (
                        <button
                          key={hora}
                          type="button"
                          onClick={() =>
                            setForm((current) => ({ ...current, hora }))
                          }
                          className={`rounded-md border px-2 py-2 text-sm font-semibold transition-colors ${form.hora === hora ? "border-primary-700 bg-primary-700 text-white" : "border-slate-300 bg-white text-slate-800 hover:border-secondary-500 hover:bg-secondary-50"}`}
                        >
                          {hora}
                        </button>
                      ))}</div></div>))}</div>
                  )}
                </div>
                </div>
              </section>
            )}
            {etapa === 4 && (
              <section aria-labelledby="titulo-revisao">
                <h2 id="titulo-revisao" className="text-xl font-bold text-slate-950">
                  Revise seu agendamento
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Confira os dados antes de confirmar a sua reserva.
                </p>
                <dl className="mt-6 divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200">
                  <ResumoItem label="Profissional" valor={form.profissionalId === SEM_PREFERENCIA ? "Sem preferência" : profissionais.find((profissional) => profissional.id === form.profissionalId)?.nome ?? "-"} />
                  <ResumoItem label="Serviço" valor={servicoSelecionado?.nome ?? "-"} />
                  <ResumoItem label="Data" valor={form.data ? new Date(`${form.data}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }) : "-"} />
                  <ResumoItem label="Horário" valor={form.hora || "-"} />
                  <ResumoItem label="Duração" valor={servicoSelecionado ? `${arredondarDuracaoParaBloco(servicoSelecionado.duracao)} minutos` : "-"} />
                  <ResumoItem label="Valor" valor={servicoSelecionado ? Number(servicoSelecionado.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "-"} />
                </dl>
              </section>
            )}
          </div>
          <footer className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4 sm:px-8">
            {etapa === 1 ? <button type="button" onClick={() => go(voltarParaAgendamentos ? "/minha-conta/agendamentos" : "/")} className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">Cancelar agendamento</button> : <button type="button" onClick={() => setEtapa((current) => current - 1)} className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"><ArrowLeft className="h-4 w-4" />Voltar</button>}
            {etapa < 4 ? (
              <button
                type="button"
                onClick={avancar}
                className="btn-primary gap-2"
              >
                {etapa === 3 ? "Revisar agendamento" : "Avançar"}
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button type="submit" className="btn-primary gap-2" disabled={!form.hora}>
                Confirmar agendamento
                <Check className="h-4 w-4" />
              </button>
            )}
          </footer>
        </form>
      </div>
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
      className={`flex items-start justify-between rounded-lg border p-4 text-left transition-colors ${active ? "border-primary-600 bg-primary-50 ring-1 ring-primary-600" : "border-slate-200 bg-white hover:border-secondary-400 hover:bg-slate-50"}`}
    >
      <span>
        <span className="block font-semibold text-slate-950">{title}</span>
        <span className="mt-1 block text-sm text-slate-600">{description}</span>
      </span>
      {active && (
        <span className="grid h-5 w-5 place-items-center rounded-full bg-primary-600 text-white">
          <Check className="h-3 w-3" />
        </span>
      )}
    </button>
  );
}

function ResumoItem({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex items-center justify-between gap-6 px-4 py-3 text-sm sm:px-5">
      <dt className="font-medium text-slate-600">{label}</dt>
      <dd className="text-right font-semibold capitalize text-slate-950">{valor}</dd>
    </div>
  );
}
