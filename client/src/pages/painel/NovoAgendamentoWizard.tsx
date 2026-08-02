import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock3, Scissors, UserRound, UsersRound } from "lucide-react";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui/modal";
import { api, type Profissional, type Servico, type Usuario } from "@/lib/api";
import { arredondarDuracaoParaBloco } from "@/utils/horarios";
import { formatarTelefoneBrasileiro } from "@/utils/telefone";

const hoje = new Date().toLocaleDateString("en-CA");

type Props = {
  clientes: Usuario[];
  profissionais: Profissional[];
  servicos: Servico[];
  onClose: () => void;
  onCreated: () => void;
};

export function NovoAgendamentoWizard({ clientes, profissionais, servicos, onClose, onCreated }: Props) {
  const [etapa, setEtapa] = useState(1);
  const [busca, setBusca] = useState("");
  const [criarCliente, setCriarCliente] = useState(false);
  const [novoCliente, setNovoCliente] = useState({ nome: "", telefone: "" });
  const [clienteId, setClienteId] = useState("");
  const [profissionalId, setProfissionalId] = useState("");
  const [servicoId, setServicoId] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [horarios, setHorarios] = useState<string[]>([]);
  const [carregandoHorarios, setCarregandoHorarios] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const clientesFiltrados = useMemo(() => clientes.filter((cliente) => `${cliente.nome} ${cliente.telefone ?? ""}`.toLowerCase().includes(busca.toLowerCase())), [busca, clientes]);
  const clienteSelecionado = clientes.find((cliente) => cliente.id === clienteId);
  const profissionalSelecionado = profissionais.find((profissional) => profissional.id === profissionalId);
  const servicoSelecionado = servicos.find((servico) => servico.id === servicoId);
  const proximosDias = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const dia = new Date();
    dia.setDate(dia.getDate() + index);
    return { valor: dia.toLocaleDateString("en-CA"), semana: dia.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""), numero: dia.getDate() };
  }), []);

  useEffect(() => {
    setHora("");
    setHorarios([]);
    if (!profissionalId || !servicoId || !data) return;
    setCarregandoHorarios(true);
    api.agendamentos.disponibilidade(profissionalId, servicoId, data)
      .then((resultado) => setHorarios(resultado.horarios))
      .catch((error) => toast.error(error instanceof Error ? error.message : "NÃ£o foi possÃ­vel carregar os horÃ¡rios."))
      .finally(() => setCarregandoHorarios(false));
  }, [profissionalId, servicoId, data]);

  const avancar = () => {
    if (etapa === 1 && !clienteId && !(criarCliente && novoCliente.nome.trim())) return toast.error("Selecione ou cadastre um cliente para continuar.");
    if (etapa === 2 && !profissionalId) return toast.error("Escolha um profissional para continuar.");
    if (etapa === 3 && !servicoId) return toast.error("Escolha um serviÃ§o para continuar.");
    if (etapa === 4 && !hora) return toast.error("Selecione um horÃ¡rio disponÃ­vel para continuar.");
    setEtapa((atual) => atual + 1);
  };

  const confirmar = async () => {
    if (!horarios.includes(hora)) return toast.error("Selecione um horÃ¡rio disponÃ­vel.");
    setSalvando(true);
    try {
      let usuarioId = clienteId;
      if (criarCliente) {
        const cliente = await api.usuarios.create({ nome: novoCliente.nome.trim(), telefone: novoCliente.telefone || undefined, nivel: "Cliente", ativo: true });
        usuarioId = cliente.id;
      }
      await api.agendamentos.create({ usuarioId, profissionalId, servicoId, data, hora });
      toast.success("Agendamento criado.");
      onCreated();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "NÃ£o foi possÃ­vel criar o agendamento.");
    } finally {
      setSalvando(false);
    }
  };

  const etapas = [
    { titulo: "Cliente", icone: UsersRound }, { titulo: "Profissional", icone: UserRound }, { titulo: "ServiÃ§o", icone: Scissors }, { titulo: "HorÃ¡rio", icone: CalendarDays }, { titulo: "RevisÃ£o", icone: Check },
  ];

  return <Modal title="Novo agendamento" onClose={onClose} size="wide" footer={<div className="flex w-full items-center justify-between gap-3">
    {etapa === 1 ? <button type="button" onClick={onClose} className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">Cancelar</button> : <button type="button" onClick={() => setEtapa((atual) => atual - 1)} className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"><ArrowLeft className="h-4 w-4" />Voltar</button>}
    {etapa < 5 ? <button type="button" onClick={avancar} className="btn-primary gap-2">{etapa === 4 ? "Revisar agendamento" : "AvanÃ§ar"}<ArrowRight className="h-4 w-4" /></button> : <button type="button" onClick={() => void confirmar()} disabled={salvando} className="btn-primary gap-2">Confirmar agendamento<Check className="h-4 w-4" /></button>}
  </div>}>
    <div className="mb-6">
      <div className="flex justify-between text-xs font-semibold text-slate-600"><span>Etapa {etapa} de 5</span><span>{Math.round((etapa / 5) * 100)}%</span></div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-primary-600 transition-all duration-300" style={{ width: `${(etapa / 5) * 100}%` }} /></div>
      <div className="mt-4 grid grid-cols-5">{etapas.map((item, index) => { const Icon = item.icone; const ativo = index + 1 <= etapa; return <div key={item.titulo} className="flex flex-col items-center gap-1 text-center"><span className={`grid h-8 w-8 place-items-center rounded-full border text-sm ${ativo ? "border-primary-600 bg-primary-600 text-white" : "border-slate-300 bg-white text-slate-400"}`}>{index + 1 < etapa ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}</span><span className={`hidden text-[11px] font-semibold sm:block ${ativo ? "text-slate-900" : "text-slate-400"}`}>{item.titulo}</span></div>; })}</div>
    </div>
    {etapa === 1 && <section><h3 className="text-xl font-bold text-slate-950">Escolha o cliente</h3><p className="mt-1 text-sm text-slate-600">Pesquise um cliente existente ou cadastre-o rapidamente para esta agenda.</p>{criarCliente ? <div className="mt-5 grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2"><label className="label">Nome<input autoFocus className="input-field mt-1" value={novoCliente.nome} onChange={(event) => setNovoCliente((atual) => ({ ...atual, nome: event.target.value }))} /></label><label className="label">Telefone <span className="font-normal">(opcional)</span><input inputMode="tel" maxLength={15} className="input-field mt-1" placeholder="(00) 00000-0000" value={novoCliente.telefone} onChange={(event) => setNovoCliente((atual) => ({ ...atual, telefone: formatarTelefoneBrasileiro(event.target.value) }))} /></label><button type="button" className="justify-self-start text-sm font-semibold text-primary-700 hover:underline sm:col-span-2" onClick={() => { setCriarCliente(false); setNovoCliente({ nome: "", telefone: "" }); }}>Selecionar cliente existente</button></div> : <><label className="label mt-5">Pesquisar cliente<input className="input-field mt-1" placeholder="Nome ou telefone" value={busca} onChange={(event) => setBusca(event.target.value)} /></label><div className="mt-3 grid max-h-56 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">{clientesFiltrados.map((cliente) => <Choice key={cliente.id} active={clienteId === cliente.id} onClick={() => setClienteId(cliente.id)} title={cliente.nome} description={cliente.telefone || "Cliente cadastrado"} />)}{clientesFiltrados.length === 0 && <p className="text-sm text-slate-600">Nenhum cliente encontrado.</p>}</div><button type="button" onClick={() => { setCriarCliente(true); setClienteId(""); }} className="mt-4 rounded-md border border-primary-300 px-3 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-50">+ Cadastrar novo cliente</button></>}</section>}
    {etapa === 2 && <section><h3 className="text-xl font-bold text-slate-950">Escolha o profissional</h3><p className="mt-1 text-sm text-slate-600">Selecione quem realizarÃ¡ o atendimento.</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{profissionais.filter((profissional) => profissional.ativo).map((profissional) => <Choice key={profissional.id} active={profissionalId === profissional.id} onClick={() => { setProfissionalId(profissional.id); setHora(""); }} title={profissional.nome} description={profissional.especialidade || "Profissional da barbearia"} />)}</div></section>}
    {etapa === 3 && <section><h3 className="text-xl font-bold text-slate-950">Escolha o serviÃ§o</h3><p className="mt-1 text-sm text-slate-600">Selecione o atendimento que serÃ¡ realizado.</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{servicos.filter((servico) => servico.ativo).map((servico) => <Choice key={servico.id} active={servicoId === servico.id} onClick={() => { setServicoId(servico.id); setHora(""); }} title={servico.nome} description={`${Number(servico.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} · ${arredondarDuracaoParaBloco(servico.duracao)} min`} />)}</div></section>}
    {etapa === 4 && <section><h3 className="text-xl font-bold text-slate-950">Escolha o horÃ¡rio</h3><p className="mt-1 text-sm text-slate-600">Selecione uma data e um horÃ¡rio disponÃ­vel.</p><p className="mt-5 text-sm font-semibold text-slate-800">Selecione uma data</p><div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-7">{proximosDias.map((dia) => <button key={dia.valor} type="button" onClick={() => setData(dia.valor)} className={`rounded-lg border px-2 py-3 text-center ${data === dia.valor ? "border-primary-700 bg-primary-700 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-secondary-500"}`}><span className="block text-xs font-semibold uppercase">{dia.semana}</span><span className="mt-1 block text-lg font-bold">{dia.numero}</span></button>)}</div><label className="label mt-4">Ou escolha outra data<input min={hoje} className="input-field mt-1" type="date" value={data} onChange={(event) => setData(event.target.value)} /></label>{servicoSelecionado && <p className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-700">DuraÃ§Ã£o do serviÃ§o: <strong>{arredondarDuracaoParaBloco(servicoSelecionado.duracao)} minutos</strong>.</p>}<div className="mt-5">{carregandoHorarios ? <p className="text-sm text-slate-600">Carregando horÃ¡rios...</p> : !data ? <p className="text-sm text-slate-600">Escolha uma data para continuar.</p> : horarios.length === 0 ? <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">NÃ£o hÃ¡ horÃ¡rios disponÃ­veis nesta data.</p> : <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">{horarios.map((item) => <button key={item} type="button" onClick={() => setHora(item)} className={`rounded-md border px-3 py-2.5 text-sm font-semibold ${hora === item ? "border-primary-700 bg-primary-700 text-white" : "border-slate-300 bg-white text-slate-800 hover:border-secondary-500"}`}><Clock3 className="mr-1 inline h-4 w-4" />{item}</button>)}</div>}</div></section>}
    {etapa === 5 && <section><h3 className="text-xl font-bold text-slate-950">Revise o agendamento</h3><p className="mt-1 text-sm text-slate-600">Confira os dados antes de confirmar a reserva.</p><dl className="mt-6 divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200"><ResumoItem label="Cliente" valor={criarCliente ? novoCliente.nome : clienteSelecionado?.nome || "-"} /><ResumoItem label="Profissional" valor={profissionalSelecionado?.nome || "-"} /><ResumoItem label="ServiÃ§o" valor={servicoSelecionado?.nome || "-"} /><ResumoItem label="Data" valor={data ? new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }) : "-"} /><ResumoItem label="HorÃ¡rio" valor={hora || "-"} /><ResumoItem label="DuraÃ§Ã£o" valor={servicoSelecionado ? `${arredondarDuracaoParaBloco(servicoSelecionado.duracao)} minutos` : "-"} /><ResumoItem label="Valor" valor={servicoSelecionado ? Number(servicoSelecionado.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "-"} /></dl></section>}
  </Modal>;
}

function Choice({ active, onClick, title, description }: { active: boolean; onClick: () => void; title: string; description: string }) {
  return <button type="button" onClick={onClick} className={`flex items-start justify-between rounded-lg border p-4 text-left transition-colors ${active ? "border-primary-600 bg-primary-50 ring-1 ring-primary-600" : "border-slate-200 bg-white hover:border-secondary-400 hover:bg-slate-50"}`}><span><span className="block font-semibold text-slate-950">{title}</span><span className="mt-1 block text-sm text-slate-600">{description}</span></span>{active && <span className="grid h-5 w-5 place-items-center rounded-full bg-primary-600 text-white"><Check className="h-3 w-3" /></span>}</button>;
}

function ResumoItem({ label, valor }: { label: string; valor: string }) {
  return <div className="flex items-center justify-between gap-6 px-4 py-3 text-sm sm:px-5"><dt className="font-medium text-slate-600">{label}</dt><dd className="text-right font-semibold capitalize text-slate-950">{valor}</dd></div>;
}
