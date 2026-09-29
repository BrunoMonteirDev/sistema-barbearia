import "./DashboardPage.css";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  ListTodo,
  MessageCircle,
  Scissors,
  UsersRound,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Link } from "wouter";
import toast from "react-hot-toast";
import {
  api,
  type Agendamento,
  type EvolutionStatus,
  type Profissional,
  type Usuario,
} from "@/lib/api";

type DashboardData = {
  agendamentos: Agendamento[];
  clientes: Usuario[];
  profissionais: Profissional[];
};

export const statusLabel: Record<string, string> = {
  PENDENTE: "Pendente",
  CONFIRMADO: "Confirmado",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
  ATRASADO: "Atrasado",
};
export const statusClass: Record<string, string> = {
  PENDENTE: "dashboard-status-pendente",
  CONFIRMADO: "dashboard-status-confirmado",
  CONCLUIDO: "dashboard-status-concluido",
  CANCELADO: "dashboard-status-cancelado",
  ATRASADO: "dashboard-status-atrasado",
};

function hoje() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function estadoWhatsApp(status: EvolutionStatus | null) {
  if (!status)
    return {
      titulo: "Verificando WhatsApp",
      detalhe: "Consultando a integracao.",
      conectado: false,
      classe: "dashboard-conexao-verificando",
    };
  if (!status.configurada)
    return {
      titulo: "WhatsApp nao configurado",
      detalhe: "Configure a integracao para usar notificacoes.",
      conectado: false,
      classe: "dashboard-conexao-alerta",
    };
  if (!status.disponivel)
    return {
      titulo: "WhatsApp indisponivel",
      detalhe: status.mensagem ?? "A Evolution API nao respondeu.",
      conectado: false,
      classe: "dashboard-conexao-indisponivel",
    };
  if (!status.instanciaCriada)
    return {
      titulo: "Instancia nao criada",
      detalhe: "Crie a instancia para conectar o WhatsApp.",
      conectado: false,
      classe: "dashboard-estado-neutro",
    };
  if (status.conectada)
    return {
      titulo: "WhatsApp conectado",
      detalhe: status.nomeExibicao ?? "Pronto para notificacoes.",
      conectado: true,
      classe: "dashboard-conexao-conectada",
    };
  return {
    titulo: "WhatsApp desconectado",
    detalhe: "Reconecte o numero para enviar notificacoes.",
    conectado: false,
    classe: "dashboard-conexao-alerta",
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    agendamentos: [],
    clientes: [],
    profissionais: [],
  });
  const [whatsApp, setWhatsApp] = useState<EvolutionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const dataHoje = hoje();

  useEffect(() => {
    void Promise.all([api.agendamentos.list(), api.usuarios.list(), api.profissionais.listAdmin()])
      .then(([agendamentos, usuarios, profissionais]) =>
        setData({
          agendamentos,
          clientes: usuarios.filter((usuario) => usuario.nivel === "Cliente"),
          profissionais,
        }),
      )
      .catch((error) =>
        toast.error(
          error instanceof Error ? error.message : "Não foi possível carregar o dashboard.",
        ),
      )
      .finally(() => setLoading(false));
    void api.evolution
      .status()
      .then(setWhatsApp)
      .catch(() =>
        setWhatsApp({
          configurada: true,
          disponivel: false,
          instanciaCriada: false,
          conectada: false,
          instancia: null,
          nomeExibicao: null,
          estado: null,
          mensagem: "Nao foi possivel consultar a Evolution.",
        }),
      );
  }, []);

  const resumo = useMemo(() => {
    const ativosHoje = data.agendamentos.filter(
      (item) => item.data === dataHoje && item.status !== "CANCELADO",
    );
    const concluidosMes = data.agendamentos.filter(
      (item) => item.status === "CONCLUIDO" && item.data.startsWith(dataHoje.slice(0, 7)),
    );
    const faturamento = concluidosMes.reduce(
      (total, item) => total + Number(item.servico?.preco ?? 0),
      0,
    );
    const proximos = data.agendamentos
      .filter((item) => item.data >= dataHoje && item.status !== "CANCELADO")
      .sort((a, b) => `${a.data}${a.hora}`.localeCompare(`${b.data}${b.hora}`))
      .slice(0, 6);
    return {
      hoje: ativosHoje.length,
      confirmados: ativosHoje.filter((item) => item.status === "CONFIRMADO").length,
      pendentes: ativosHoje.filter((item) => item.status === "PENDENTE").length,
      faturamento,
      proximos,
    };
  }, [data, dataHoje]);

  const cards = [
    {
      label: "Agenda de hoje",
      value: resumo.hoje,
      help: `${resumo.confirmados} confirmados`,
      icon: CalendarDays,
      color: "dashboard-metrica-agenda",
    },
    {
      label: "Pendentes hoje",
      value: resumo.pendentes,
      help: "Aguardando confirmação",
      icon: Clock3,
      color: "dashboard-metrica-pendentes",
    },
    {
      label: "Clientes ativos",
      value: data.clientes.length,
      help: "Clientes cadastrados",
      icon: UsersRound,
      color: "dashboard-metrica-clientes",
    },
    {
      label: "Faturamento do mês",
      value: moeda(resumo.faturamento),
      help: "Somente concluídos",
      icon: CircleDollarSign,
      color: "dashboard-metrica-faturamento",
    },
  ];
  const conexaoWhatsApp = estadoWhatsApp(whatsApp);

  return (
    <section className="pagina-dashboard">
      <header className="cabecalho-dashboard">
        <div>
          <p className="identificacao-dashboard">Visão geral</p>
          <h1 className="titulo-dashboard">Bom trabalho. Veja como está o dia.</h1>
          <p className="descricao-dashboard">
            Acompanhe agenda, clientes e resultados da barbearia.
          </p>
        </div>
        <div className="acoes-dashboard">
          <Link
            href="/painel/agendamentos"
            className="botao-agenda-dashboard"
          >
            <ListTodo className="icone-link-dashboard" />
            Organizar agenda
          </Link>
          <Link
            href="/painel/agendamentos"
            className="botao-novo-dashboard"
          >
            <CalendarPlus className="icone-link-dashboard" />
            Novo agendamento
          </Link>
        </div>
      </header>

      <div className="grade-metricas-dashboard">
        {cards.map((card) => (
          <article
            key={card.label}
            className="cartao-dashboard"
          >
            <div className="cabecalho-cartao-dashboard">
              <div>
                <p className="titulo-metrica-dashboard">{card.label}</p>
                <p className="valor-metrica-dashboard">{loading ? "—" : card.value}</p>
                <p className="detalhe-metrica-dashboard">{card.help}</p>
              </div>
              <span className={`emblema-dashboard ${card.color}`}>
                <card.icon className="icone-cartao-dashboard" />
              </span>
            </div>
          </article>
        ))}
      </div>

      <div className="grade-resumos-dashboard">
        <article className="atendimentos-dashboard">
          <div className="cabecalho-atendimentos-dashboard">
            <div>
              <h2 className="titulo-secao-dashboard">Próximos atendimentos</h2>
              <p className="periodo-atendimentos-dashboard">A partir de hoje</p>
            </div>
            <Link
              href="/painel/agendamentos"
              className="link-agenda-dashboard"
            >
              Ver agenda <ChevronRight className="icone-link-dashboard" />
            </Link>
          </div>
          <div className="lista-atendimentos-dashboard">
            {loading ? (
              <p className="carregando-agenda-dashboard">Carregando agenda...</p>
            ) : resumo.proximos.length === 0 ? (
              <div className="agenda-vazia-dashboard">
                <CalendarDays className="icone-agenda-vazia-dashboard" />
                <p className="mensagem-agenda-vazia-dashboard">Nenhum atendimento agendado.</p>
                <p className="orientacao-agenda-dashboard">
                  Use o botão acima para criar um agendamento.
                </p>
              </div>
            ) : (
              resumo.proximos.map((item) => (
                <div
                  key={item.id}
                  className="atendimento-dashboard"
                >
                  <div className="data-atendimento-dashboard">
                    <p className="hora-atendimento-dashboard">{item.hora}</p>
                    <p className="dia-atendimento-dashboard">
                      {item.data === dataHoje
                        ? "Hoje"
                        : item.data.slice(8, 10) + "/" + item.data.slice(5, 7)}
                    </p>
                  </div>
                  <div className="dados-atendimento-dashboard">
                    <p className="cliente-atendimento-dashboard">
                      {item.usuario?.nome ?? "Cliente não informado"}
                    </p>
                    <p className="servico-atendimento-dashboard">
                      {item.servico?.nome ?? "Serviço"} ·{" "}
                      {item.profissional?.nome ?? "Profissional"}
                    </p>
                  </div>
                  <span
                    className={`status-dashboard ${statusClass[item.status] ?? "dashboard-estado-neutro"}`}
                  >
                    {statusLabel[item.status] ?? item.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </article>

        <aside className="resumos-laterais-dashboard">
          <article className="cartao-dashboard">
            <div className="cabecalho-cartao-dashboard">
              <div>
                <h2 className="titulo-secao-dashboard">WhatsApp</h2>
                <p className="descricao-dashboard">Canal de notificacoes</p>
              </div>
              <span className={`emblema-dashboard ${conexaoWhatsApp.classe}`}>
                {conexaoWhatsApp.conectado ? (
                  <Wifi
                    className="icone-cartao-dashboard"
                    aria-hidden="true"
                  />
                ) : (
                  <WifiOff
                    className="icone-cartao-dashboard"
                    aria-hidden="true"
                  />
                )}
              </span>
            </div>
            <p
              className="situacao-whatsapp-dashboard"
              aria-live="polite"
            >
              {conexaoWhatsApp.titulo}
            </p>
            <p className="descricao-dashboard">{conexaoWhatsApp.detalhe}</p>
            <Link
              href="/painel/whatsapp"
              className="link-whatsapp-dashboard"
            >
              <MessageCircle className="icone-link-dashboard" />
              Gerenciar WhatsApp
            </Link>
          </article>
          <article className="cartao-dashboard">
            <h2 className="titulo-secao-dashboard">Equipe</h2>
            <p className="descricao-dashboard">
              {loading
                ? "Carregando..."
                : `${data.profissionais.filter((item) => item.ativo).length} profissionais ativos`}
            </p>
            <div className="equipe-dashboard">
              <span className="emblema-equipe-dashboard">
                <Scissors className="icone-cartao-dashboard" />
              </span>
              <div>
                <p className="titulo-equipe-dashboard">Gerencie disponibilidade</p>
                <Link
                  href="/painel/profissionais"
                  className="link-profissionais-dashboard"
                >
                  Ver profissionais
                </Link>
              </div>
            </div>
          </article>
          <article className="resumo-hoje-dashboard">
            <CheckCircle2 className="icone-resumo-hoje-dashboard" />
            <h2 className="titulo-resumo-hoje-dashboard">Resumo de hoje</h2>
            <p className="descricao-resumo-hoje-dashboard">
              {loading
                ? "Atualizando informações..."
                : resumo.confirmados
                  ? `${resumo.confirmados} atendimento(s) confirmado(s) para hoje.`
                  : "Ainda não há atendimentos confirmados para hoje."}
            </p>
            <Link
              href="/painel/agendamentos"
              className="link-resumo-hoje-dashboard"
            >
              Organizar agenda <ChevronRight className="icone-link-dashboard" />
            </Link>
          </article>
        </aside>
      </div>
    </section>
  );
}
