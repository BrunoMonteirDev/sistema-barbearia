import "./EvolutionPage.css";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LoaderCircle, RefreshCw, Smartphone, Trash2, Unplug, Wifi, WifiOff } from "lucide-react";
import {
  api,
  type EvolutionStatus,
  type ModelosMensagemWhatsApp,
  type RegrasEnvioAutomatico,
} from "@/lib/api";

const QR_EXPIRACAO_SEGUNDOS = 30;
const modelosPadrao: ModelosMensagemWhatsApp = {
  criacao:
    "Ola, {{cliente}}! Seu agendamento de {{servico}} com {{profissional}} foi confirmado para {{data}} as {{hora}}.",
  remarcacao:
    "Ola, {{cliente}}! Seu agendamento de {{servico}} foi remarcado para {{data}} as {{hora}} com {{profissional}}.",
  cancelamento:
    "Ola, {{cliente}}! Seu agendamento de {{servico}} em {{data}} as {{hora}} foi cancelado.",
  atualizacao:
    "Ola, {{cliente}}! Seu agendamento de {{servico}} com {{profissional}} foi atualizado: {{data}} as {{hora}}.",
  lembrete:
    "Ola, {{cliente}}! Lembrete: seu atendimento de {{servico}} com {{profissional}} sera em {{data}} as {{hora}}.",
  pendente:
    "Ola, {{cliente}}! Seu agendamento de {{servico}} esta pendente de confirmacao para {{data}} as {{hora}}.",
  confirmado:
    "Ola, {{cliente}}! Seu agendamento de {{servico}} foi confirmado para {{data}} as {{hora}}.",
  concluido: "Ola, {{cliente}}! Seu atendimento de {{servico}} foi concluido.",
  atrasado: "Ola, {{cliente}}! Seu horario de {{servico}} esta marcado como atrasado.",
};
const regrasPadrao: RegrasEnvioAutomatico = {
  criacao: false,
  remarcacao: false,
  cancelamento: false,
  pendente: false,
  confirmado: false,
  concluido: false,
  atrasado: false,
  lembrete: false,
  antecedenciaLembreteMinutos: 60,
};

export default function EvolutionPage() {
  const [status, setStatus] = useState<EvolutionStatus | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [segundosQr, setSegundosQr] = useState(0);
  const [nomeExibicao, setNomeExibicao] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [modelos, setModelos] = useState<ModelosMensagemWhatsApp>(modelosPadrao);
  const [envioAutomatico, setEnvioAutomatico] = useState(false);
  const [regrasAutomaticas, setRegrasAutomaticas] = useState<RegrasEnvioAutomatico>(regrasPadrao);
  const atualizar = async () => {
    try {
      const atual = await api.evolution.status();
      setStatus(atual);
      setNomeExibicao(atual.nomeExibicao ?? "");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível verificar a Evolution.",
      );
    }
  };
  useEffect(() => {
    void atualizar();
    void api.evolution
      .mensagens()
      .then(setModelos)
      .catch(() => {});
    void api.evolution
      .regrasEnvioAutomatico()
      .then((resposta) => {
        setEnvioAutomatico(resposta.ativo);
        setRegrasAutomaticas(resposta.regras);
      })
      .catch(() => {});
  }, []);
  useEffect(() => {
    if (!qrCode || segundosQr <= 0) return;
    const timer = window.setTimeout(() => setSegundosQr((atual) => atual - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [qrCode, segundosQr]);
  useEffect(() => {
    if (qrCode && segundosQr === 0) {
      setQrCode(null);
      toast("QR Code expirado. Gere um novo para conectar.");
    }
  }, [qrCode, segundosQr]);
  const executar = async (acao: "criarInstancia" | "conectar" | "reconectar", sucesso: string) => {
    setCarregando(true);
    try {
      const resposta = await api.evolution[acao]();
      if (resposta.base64) {
        setQrCode(resposta.base64);
        setSegundosQr(QR_EXPIRACAO_SEGUNDOS);
      }
      toast.success(sucesso);
      await atualizar();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível concluir a ação.");
    } finally {
      setCarregando(false);
    }
  };
  const desconectar = async () => {
    setCarregando(true);
    try {
      await api.evolution.desconectar();
      setQrCode(null);
      toast.success("WhatsApp desconectado.");
      await atualizar();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível desconectar.");
    } finally {
      setCarregando(false);
    }
  };
  const excluirInstancia = async () => {
    if (!window.confirm("Excluir esta instância? A sessão do WhatsApp será removida.")) return;
    setCarregando(true);
    try {
      await api.evolution.excluirInstancia();
      setQrCode(null);
      toast.success("Instância excluída.");
      await atualizar();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível excluir a instância.");
    } finally {
      setCarregando(false);
    }
  };
  const salvarNome = async () => {
    try {
      await api.evolution.atualizarNomeExibicao(nomeExibicao);
      toast.success("Nome exibido no sistema atualizado.");
      await atualizar();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível atualizar o nome.");
    }
  };
  const criarInstancia = async () => {
    if (nomeExibicao.trim().length < 2)
      return toast.error("Informe o nome da instância antes de criá-la.");
    setCarregando(true);
    try {
      await api.evolution.atualizarNomeExibicao(nomeExibicao);
      await api.evolution.criarInstancia();
      toast.success("Instância criada.");
      await atualizar();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível criar a instância.");
    } finally {
      setCarregando(false);
    }
  };
  const salvarModelos = async () => {
    try {
      setModelos(await api.evolution.salvarMensagens(modelos));
      toast.success("Mensagens salvas.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nao foi possivel salvar as mensagens.");
    }
  };
  const alterarEnvioAutomatico = async (ativo: boolean) => {
    try {
      setEnvioAutomatico((await api.evolution.salvarEnvioAutomatico(ativo)).ativo);
      toast.success(ativo ? "Envio automatico ativado." : "Envio automatico desativado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nao foi possivel atualizar a opcao.");
    }
  };
  const salvarRegrasAutomaticas = async () => {
    try {
      setRegrasAutomaticas(
        (await api.evolution.salvarRegrasEnvioAutomatico(regrasAutomaticas)).regras,
      );
      toast.success("Regras de envio automatico salvas.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nao foi possivel salvar as regras.");
    }
  };
  const conectado = Boolean(status?.conectada);
  const criada = Boolean(status?.instanciaCriada);
  return (
    <section className="pagina-evolution">
      <p className="identificacao-evolution">Integrações</p>
      <h1 className="titulo-evolution">WhatsApp de notificações</h1>
      <p className="introducao-evolution">
        Conecte o número usado apenas para avisos de agendamento. Se a integração estiver
        indisponível, os agendamentos continuam funcionando normalmente.
      </p>
      <div className="cartao-evolution">
        <label className="rotulo-nome-evolution">
          Nome da instância no sistema
          <div className="formulario-nome-evolution">
            <input
              className="campo-evolution"
              value={nomeExibicao}
              onChange={(event) => setNomeExibicao(event.target.value)}
              placeholder="WhatsApp da barbearia"
            />
            <button
              type="button"
              onClick={() => void salvarNome()}
              className="botao-secundario-evolution botao-nome-evolution"
            >
              Salvar nome
            </button>
          </div>
          <span className="ajuda-nome-evolution">
            Informe este nome antes de criar a instância. Ele aparece somente no sistema e não
            altera o identificador técnico da Evolution.
          </span>
        </label>
        <div className="cabecalho-status-evolution">
          <div className="dados-status-evolution">
            <span
              className={`status-evolution ${conectado ? "status-evolution-conectado" : "status-evolution-desconectado"}`}
            >
              {conectado ? <Wifi aria-hidden="true" /> : <WifiOff aria-hidden="true" />}
            </span>
            <div>
              <h2 className="titulo-status-evolution">{nomeExibicao || "WhatsApp da barbearia"}</h2>
              <p className="descricao-status-evolution">
                {!status
                  ? "Verificando…"
                  : conectado
                    ? "Conectada"
                    : criada
                      ? "Instância desconectada"
                      : status.disponivel
                        ? "Nenhuma instância criada"
                        : (status.mensagem ?? "Indisponível")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void atualizar()}
            className="botao-secundario-evolution botao-com-icone-evolution"
          >
            <RefreshCw
              className="icone-evolution"
              aria-hidden="true"
            />
            Atualizar status
          </button>
        </div>
        {!status?.configurada && (
          <p className="aviso-configuracao-evolution">
            A integração não está configurada no servidor. Defina EVOLUTION_API_URL e
            EVOLUTION_API_KEY no ambiente do backend.
          </p>
        )}
        {status?.configurada && (
          <div className="acoes-conexao-evolution">
            {!criada && (
              <button
                type="button"
                disabled={carregando || !status.disponivel || nomeExibicao.trim().length < 2}
                onClick={() => void criarInstancia()}
                className="botao-principal-evolution"
              >
                Criar instância
              </button>
            )}
            {criada && !conectado && status?.estado !== "close" && (
              <button
                type="button"
                disabled={carregando || !status.disponivel}
                onClick={() => void executar("conectar", "QR Code gerado.")}
                className="botao-principal-evolution botao-com-icone-evolution"
              >
                {carregando ? (
                  <LoaderCircle className="icone-evolution carregando-evolution" />
                ) : (
                  <Smartphone className="icone-evolution" />
                )}
                Conectar WhatsApp
              </button>
            )}
            {criada && !conectado && status?.estado === "close" && (
              <button
                type="button"
                disabled={carregando || !status.disponivel}
                onClick={() => void executar("reconectar", "Reconexão iniciada.")}
                className="botao-principal-evolution"
              >
                Reconectar WhatsApp
              </button>
            )}
            {conectado && (
              <button
                type="button"
                disabled={carregando}
                onClick={() => void desconectar()}
                className="botao-desconectar-evolution"
              >
                <Unplug className="icone-evolution" />
                Desconectar
              </button>
            )}
            {criada && !conectado && (
              <button
                type="button"
                disabled={carregando}
                onClick={() => void excluirInstancia()}
                className="botao-excluir-evolution"
              >
                <Trash2 className="icone-evolution" />
                Excluir instância
              </button>
            )}
          </div>
        )}
        {qrCode && (
          <div className="painel-qrcode-evolution">
            <h3 className="titulo-status-evolution">Escaneie o QR Code</h3>
            <p className="descricao-secao-evolution">
              No WhatsApp: Aparelhos conectados → Conectar aparelho.
            </p>
            <img
              className="qrcode-evolution"
              src={qrCode}
              alt="QR Code para conectar o WhatsApp"
            />
            <p className="prazo-qrcode-evolution">Expira em {segundosQr}s</p>
          </div>
        )}
      </div>
      <div className="cartao-evolution">
        <h2 className="titulo-secao-evolution">Envio automatico</h2>
        <label className="ativacao-envio-evolution">
          <input
            type="checkbox"
            checked={envioAutomatico}
            onChange={(event) => void alterarEnvioAutomatico(event.target.checked)}
          />
          Ativar envio automatico
        </label>
        <p className="descricao-secao-evolution">
          Desativado por padrao. Escolha abaixo quais eventos podem enviar mensagens
          automaticamente.
        </p>
        <div className="grade-regras-evolution">
          {(
            [
              ["criacao", "Criacao"],
              ["remarcacao", "Remarcacao"],
              ["cancelamento", "Cancelamento"],
              ["pendente", "Status pendente"],
              ["confirmado", "Status confirmado"],
              ["concluido", "Status concluido"],
              ["atrasado", "Status atrasado"],
              ["lembrete", "Lembrete antes do horario"],
            ] as const
          ).map(([chave, titulo]) => (
            <label
              key={chave}
              className="opcao-envio-evolution"
            >
              <input
                type="checkbox"
                disabled={!envioAutomatico}
                checked={regrasAutomaticas[chave]}
                onChange={(event) =>
                  setRegrasAutomaticas((atual) => ({ ...atual, [chave]: event.target.checked }))
                }
              />
              {titulo}
            </label>
          ))}
        </div>
        {regrasAutomaticas.lembrete && (
          <label className="rotulo-evolution rotulo-lembrete-evolution">
            Enviar lembrete com quantos minutos de antecedencia?
            <input
              className="campo-evolution campo-lembrete-evolution"
              type="number"
              min="5"
              max="10080"
              disabled={!envioAutomatico}
              value={regrasAutomaticas.antecedenciaLembreteMinutos}
              onChange={(event) =>
                setRegrasAutomaticas((atual) => ({
                  ...atual,
                  antecedenciaLembreteMinutos: Number(event.target.value),
                }))
              }
            />
          </label>
        )}
        <button
          type="button"
          disabled={!envioAutomatico}
          onClick={() => void salvarRegrasAutomaticas()}
          className="botao-principal-evolution botao-salvar-evolution"
        >
          Salvar regras automaticas
        </button>
      </div>
      <div className="cartao-evolution">
        <h2 className="titulo-secao-evolution">Modelos das mensagens</h2>
        <p className="descricao-secao-evolution">
          Variaveis disponiveis: cliente, servico, profissional, data e hora, entre chaves duplas.
        </p>
        <div className="modelos-mensagens-evolution">
          {(
            [
              ["criacao", "Criacao"],
              ["remarcacao", "Remarcacao"],
              ["cancelamento", "Cancelamento"],
              ["lembrete", "Lembrete"],
              ["pendente", "Status: pendente"],
              ["confirmado", "Status: confirmado"],
              ["concluido", "Status: concluido"],
              ["atrasado", "Status: atrasado"],
              ["atualizacao", "Atualizacao generica"],
            ] as const
          ).map(([chave, titulo]) => (
            <label
              key={chave}
              className="rotulo-evolution"
            >
              {titulo}
              <textarea
                className="campo-evolution campo-mensagem-evolution"
                maxLength={1000}
                value={modelos[chave]}
                onChange={(event) =>
                  setModelos((atual) => ({ ...atual, [chave]: event.target.value }))
                }
              />
            </label>
          ))}
        </div>
        <button
          type="button"
          onClick={() => void salvarModelos()}
          className="botao-principal-evolution botao-salvar-evolution"
        >
          Salvar mensagens
        </button>
      </div>
    </section>
  );
}
