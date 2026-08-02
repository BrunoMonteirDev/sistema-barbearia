import { useEffect, useState, type ReactNode } from "react";
import { Link } from "wouter";
import toast from "react-hot-toast";
import { CalendarPlus, History, Pencil } from "lucide-react";
import { api, type Agendamento } from "@/lib/api";
import { UserLayout } from "./MinhaContaPage";

type Historico = {
  id: string;
  tipo: string;
  createdAt: string;
  dadosAnteriores?: Record<string, unknown> | null;
  dadosNovos?: Record<string, unknown> | null;
};

const hoje = new Date().toLocaleDateString("en-CA");
const podeAlterar = (status: string) => ["PENDENTE", "CONFIRMADO"].includes(status);

export default function UserAppointmentsPage() {
  const [items, setItems] = useState<Agendamento[]>([]);
  const [remarcando, setRemarcando] = useState<Agendamento | null>(null);
  const [historico, setHistorico] = useState<{ item: Agendamento; eventos: Historico[] } | null>(null);
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [horarios, setHorarios] = useState<string[]>([]);
  const [carregandoHorarios, setCarregandoHorarios] = useState(false);

  const load = () => {
    void api.agendamentos.list().then(setItems).catch((error) => toast.error(error.message));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!remarcando || !data || !remarcando.profissional?.id || !remarcando.servico?.id) {
      setHorarios([]);
      return;
    }
    setHora("");
    setCarregandoHorarios(true);
    void api.agendamentos
      .disponibilidade(remarcando.profissional.id, remarcando.servico.id, data, remarcando.id)
      .then(({ horarios: disponiveis }) => setHorarios(disponiveis))
      .catch((error) => toast.error(error instanceof Error ? error.message : "Não foi possível carregar os horários."))
      .finally(() => setCarregandoHorarios(false));
  }, [data, remarcando]);

  const cancelar = async (item: Agendamento) => {
    try {
      await api.agendamentos.cancel(item.id);
      toast.success("Agendamento cancelado.");
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível cancelar o agendamento.");
    }
  };

  const abrirRemarcacao = (item: Agendamento) => {
    setRemarcando(item);
    setData(item.data);
    setHora("");
  };

  const confirmarRemarcacao = async () => {
    if (!remarcando || !data || !hora) return toast.error("Escolha uma data e um horário disponíveis.");
    try {
      await api.agendamentos.remarcar(remarcando.id, { data, hora });
      toast.success("Agendamento remarcado.");
      setRemarcando(null);
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível remarcar o agendamento.");
    }
  };

  const abrirHistorico = async (item: Agendamento) => {
    try {
      const eventos = await api.agendamentos.historico(item.id) as Historico[];
      setHistorico({ item, eventos });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível carregar o histórico.");
    }
  };

  return (
    <UserLayout>
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-primary-700">Agenda</p>
            <h1 className="text-3xl font-bold text-slate-950">Meus agendamentos</h1>
          </div>
          <Link href="/agendamento?origem=meus-agendamentos" className="btn-primary gap-2"><CalendarPlus className="h-4 w-4" />Novo agendamento</Link>
        </header>
        <div className="divide-y rounded-lg border border-slate-200 bg-white shadow-sm">
          {items.length === 0 ? <p className="p-8 text-center text-slate-600">Você ainda não possui agendamentos.</p> : items.map((item) => (
            <div key={item.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-slate-900">{item.servico?.nome ?? "Serviço"}</p>
                <p className="text-sm text-slate-600">{formatarData(item.data)} às {item.hora} · {item.profissional?.nome ?? "Profissional"}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{item.status}</span>
                <button type="button" onClick={() => void abrirHistorico(item)} className="rounded-md border border-slate-300 p-2 text-slate-700 hover:bg-slate-50" aria-label="Ver histórico"><History className="h-4 w-4" /></button>
                {podeAlterar(item.status) && <button type="button" onClick={() => abrirRemarcacao(item)} className="inline-flex items-center gap-1 rounded-md border border-primary-300 px-3 py-2 text-xs font-semibold text-primary-800 hover:bg-primary-50"><Pencil className="h-3.5 w-3.5" />Remarcar</button>}
                {podeAlterar(item.status) && <button type="button" onClick={() => void cancelar(item)} className="rounded-md border border-red-300 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50">Cancelar</button>}
              </div>
            </div>
          ))}
        </div>
      </div>
      {remarcando && <Dialog titulo="Remarcar agendamento" aoFechar={() => setRemarcando(null)}>
        <p className="text-sm text-slate-600">{remarcando.servico?.nome} com {remarcando.profissional?.nome}. Escolha uma nova data e horário.</p>
        <label className="mt-5 block text-sm font-semibold text-slate-800">Nova data<input className="input-field mt-1" type="date" min={hoje} value={data} onChange={(event) => setData(event.target.value)} /></label>
        <div className="mt-5"><p className="text-sm font-semibold text-slate-800">Horários disponíveis</p>{carregandoHorarios ? <p className="mt-2 text-sm text-slate-600">Carregando horários...</p> : horarios.length ? <div className="mt-2 grid grid-cols-3 gap-2">{horarios.map((itemHora) => <button key={itemHora} type="button" onClick={() => setHora(itemHora)} className={`rounded-md border px-3 py-2 text-sm font-semibold ${hora === itemHora ? "border-primary-700 bg-primary-700 text-white" : "border-slate-300 text-slate-800 hover:bg-slate-50"}`}>{itemHora}</button>)}</div> : <p className="mt-2 text-sm text-slate-600">Selecione uma data com horários disponíveis.</p>}</div>
        <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setRemarcando(null)} className="btn-secondary">Voltar</button><button type="button" disabled={!hora} onClick={() => void confirmarRemarcacao()} className="btn-primary">Confirmar remarcação</button></div>
      </Dialog>}
      {historico && <Dialog titulo="Histórico do agendamento" aoFechar={() => setHistorico(null)}>
        <p className="text-sm text-slate-600">{historico.item.servico?.nome} · {formatarData(historico.item.data)} às {historico.item.hora}</p>
        <ol className="mt-5 space-y-3">{historico.eventos.length ? historico.eventos.map((evento) => <li key={evento.id} className="rounded-md border border-slate-200 p-3"><p className="font-semibold text-slate-900">{rotuloEvento(evento.tipo)}</p><p className="mt-1 text-sm text-slate-600">{new Date(evento.createdAt).toLocaleString("pt-BR")}</p></li>) : <li className="text-sm text-slate-600">Ainda não há alterações registradas.</li>}</ol>
      </Dialog>}
    </UserLayout>
  );
}

function Dialog({ titulo, aoFechar, children }: { titulo: string; aoFechar: () => void; children: ReactNode }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4" role="presentation" onMouseDown={aoFechar}><section role="dialog" aria-modal="true" aria-label={titulo} className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl" onMouseDown={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-4"><h2 className="text-xl font-bold text-slate-950">{titulo}</h2><button type="button" onClick={aoFechar} className="rounded p-1 text-slate-500 hover:bg-slate-100" aria-label="Fechar">×</button></div>{children}</section></div>;
}

function formatarData(data: string) { return new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR"); }
function rotuloEvento(tipo: string) { return ({ CANCELAMENTO: "Cancelamento", REMARCACAO: "Remarcação" } as Record<string, string>)[tipo] ?? tipo; }
