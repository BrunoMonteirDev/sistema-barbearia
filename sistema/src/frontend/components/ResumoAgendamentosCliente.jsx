import "./ResumoAgendamentosCliente.css";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
const limiteProximos = 3;
const limiteRecentes = 2;
const statusLabels = {
  PENDENTE: "Pendente",
  CONFIRMADO: "Confirmado",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
  ATRASADO: "Atrasado",
};
function inicioDoAgendamento(item) {
  return new Date(`${item.data}T${item.hora}:00`);
}
function formatarData(data) {
  return new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}
function CardAgendamento({ item }) {
  return (
    <article className="cartao-resumo-cliente">
      <p className="servico-resumo-cliente">
        {item.servico?.nome ?? "Serviço"}
      </p>
      <p className="descricao-resumo-cliente">
        {formatarData(item.data)} · {item.hora}
      </p>
      <p className="profissional-resumo-cliente">
        {item.profissional?.nome ?? "Profissional"}
      </p>
      <span className="status-resumo-cliente">
        {statusLabels[item.status] ?? item.status}
      </span>
    </article>
  );
}
export function ResumoAgendamentosCliente() {
  const { user } = useAuth();
  const [agendamentos, setAgendamentos] = useState([]);
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
    void api.agendamentos
      .list()
      .then((items) => {
        if (ativo) setAgendamentos(items);
      })
      .catch(() => {
        if (ativo) setErro(true);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [user]);
  const { proximos, recentes } = useMemo(() => {
    const agora = new Date();
    const futuros = agendamentos.filter(
      (item) => inicioDoAgendamento(item) > agora,
    );
    return {
      proximos: futuros
        .filter((item) => item.status !== "CANCELADO")
        .sort(
          (a, b) =>
            inicioDoAgendamento(a).getTime() - inicioDoAgendamento(b).getTime(),
        )
        .slice(0, limiteProximos),
      recentes: agendamentos
        .filter((item) => inicioDoAgendamento(item) <= agora)
        .sort(
          (a, b) =>
            inicioDoAgendamento(b).getTime() - inicioDoAgendamento(a).getTime(),
        )
        .slice(0, limiteRecentes),
    };
  }, [agendamentos]);
  return (
    <aside
      className="resumo-agendamentos-cliente"
      aria-labelledby="titulo-resumo-agendamentos"
    >
      <h2 id="titulo-resumo-agendamentos" className="titulo-resumo-cliente">
        Seus agendamentos
      </h2>
      <p className="descricao-resumo-cliente">
        Acompanhe seus próximos horários.
      </p>

      {!user ? (
        <p className="mensagem-resumo-cliente">
          Entre na sua conta para acompanhar seus agendamentos.
        </p>
      ) : carregando ? (
        <div
          className="carregamento-resumo-cliente"
          aria-label="Carregando seus agendamentos"
        >
          <div>
            <p className="subtitulo-resumo-cliente">Próximos</p>
            <div className="esqueleto-resumo-cliente" />
          </div>
          <div>
            <p className="subtitulo-resumo-cliente">Recentes</p>
            <div className="esqueleto-resumo-cliente" />
          </div>
        </div>
      ) : erro ? (
        <p className="mensagem-resumo-cliente">
          Não foi possível carregar seus agendamentos agora.
        </p>
      ) : (
        <div className="secoes-resumo-cliente">
          <section aria-labelledby="titulo-proximos">
            <h3 id="titulo-proximos" className="subtitulo-resumo-cliente">
              Próximos
            </h3>
            {proximos.length ? (
              <div className="lista-resumo-cliente">
                {proximos.map((item) => (
                  <CardAgendamento key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <p className="mensagem-futuros-resumo-cliente">
                Nenhum agendamento futuro. Escolha uma data e um horário para
                fazer sua reserva.
              </p>
            )}
          </section>
          <section aria-labelledby="titulo-recentes">
            <h3 id="titulo-recentes" className="subtitulo-resumo-cliente">
              Recentes
            </h3>
            {recentes.length ? (
              <div className="lista-resumo-cliente">
                {recentes.map((item) => (
                  <CardAgendamento key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <p className="mensagem-recentes-resumo-cliente">
                Nenhum atendimento recente.
              </p>
            )}
          </section>
          <Link
            href="/minha-conta/agendamentos"
            className="link-resumo-cliente"
          >
            Ver todos <ArrowRight className="icone-resumo-cliente" />
          </Link>
        </div>
      )}
    </aside>
  );
}
