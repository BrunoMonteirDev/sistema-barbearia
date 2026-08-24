import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { api, type Agendamento } from "@/lib/api";

const limiteProximos = 3;
const limiteRecentes = 2;

const statusLabels: Record<string, string> = {
  PENDENTE: "Pendente",
  CONFIRMADO: "Confirmado",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
  ATRASADO: "Atrasado",
};

function inicioDoAgendamento(item: Agendamento) {
  return new Date(`${item.data}T${item.hora}:00`);
}

function formatarData(data: string) {
  return new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

function CardAgendamento({ item }: { item: Agendamento }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="truncate text-sm font-semibold text-slate-900">{item.servico?.nome ?? "Serviço"}</p>
      <p className="mt-1 text-sm text-slate-600">{formatarData(item.data)} · {item.hora}</p>
      <p className="mt-0.5 truncate text-sm text-slate-600">{item.profissional?.nome ?? "Profissional"}</p>
      <span className="mt-2 inline-flex rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
        {statusLabels[item.status] ?? item.status}
      </span>
    </article>
  );
}

export function ResumoAgendamentosCliente() {
  const { user } = useAuth();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [carregando, setCarregando] = useState(Boolean(user));
  const [erro, setErro] = useState(false);

  useEffect(() => {
    if (!user) {
      setAgendamentos([]);
      setCarregando(false);
      setErro(false);
      return;
    }

    let ativo = true;
    setCarregando(true);
    setErro(false);
    void api.agendamentos.list()
      .then(items => { if (ativo) setAgendamentos(items); })
      .catch(() => { if (ativo) setErro(true); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [user]);

  const { proximos, recentes } = useMemo(() => {
    const agora = new Date();
    const futuros = agendamentos.filter(item => inicioDoAgendamento(item) > agora);
    return {
      proximos: futuros
        .filter(item => item.status !== "CANCELADO")
        .sort((a, b) => inicioDoAgendamento(a).getTime() - inicioDoAgendamento(b).getTime())
        .slice(0, limiteProximos),
      recentes: agendamentos
        .filter(item => inicioDoAgendamento(item) <= agora)
        .sort((a, b) => inicioDoAgendamento(b).getTime() - inicioDoAgendamento(a).getTime())
        .slice(0, limiteRecentes),
    };
  }, [agendamentos]);

  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="titulo-resumo-agendamentos">
      <h2 id="titulo-resumo-agendamentos" className="text-lg font-bold text-slate-950">Seus agendamentos</h2>
      <p className="mt-1 text-sm text-slate-600">Acompanhe seus próximos horários.</p>

      {!user ? <p className="mt-5 text-sm text-slate-600">Entre na sua conta para acompanhar seus agendamentos.</p> : carregando ? (
        <div className="mt-5 space-y-4" aria-label="Carregando seus agendamentos">
          <div><p className="text-sm font-bold text-slate-900">Próximos</p><div className="mt-2 h-20 animate-pulse rounded-lg bg-slate-100" /></div>
          <div><p className="text-sm font-bold text-slate-900">Recentes</p><div className="mt-2 h-20 animate-pulse rounded-lg bg-slate-100" /></div>
        </div>
      ) : erro ? <p className="mt-5 text-sm text-slate-600">Não foi possível carregar seus agendamentos agora.</p> : (
        <div className="mt-5 space-y-5">
          <section aria-labelledby="titulo-proximos">
            <h3 id="titulo-proximos" className="text-sm font-bold text-slate-900">Próximos</h3>
            {proximos.length ? <div className="mt-2 space-y-2">{proximos.map(item => <CardAgendamento key={item.id} item={item} />)}</div> : <p className="mt-2 text-sm leading-6 text-slate-600">Nenhum agendamento futuro. Escolha uma data e um horário para fazer sua reserva.</p>}
          </section>
          <section aria-labelledby="titulo-recentes">
            <h3 id="titulo-recentes" className="text-sm font-bold text-slate-900">Recentes</h3>
            {recentes.length ? <div className="mt-2 space-y-2">{recentes.map(item => <CardAgendamento key={item.id} item={item} />)}</div> : <p className="mt-2 text-sm text-slate-600">Nenhum atendimento recente.</p>}
          </section>
          <Link href="/minha-conta/agendamentos" className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:text-primary-900">
            Ver todos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </aside>
  );
}
