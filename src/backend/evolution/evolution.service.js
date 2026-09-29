import { EvolutionRepository } from "./evolution.repository.js";
const evolutionRepository = new EvolutionRepository();
const regrasPadrao = {
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
const modelosPadrao = {
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
    "Ola, {{cliente}}! Seu agendamento de {{servico}} com {{profissional}} foi confirmado para {{data}} as {{hora}}.",
  concluido:
    "Ola, {{cliente}}! Obrigado pela visita. Seu atendimento de {{servico}} foi concluido.",
  atrasado:
    "Ola, {{cliente}}! Seu horario de {{servico}} em {{data}} as {{hora}} esta marcado como atrasado. Fale conosco se precisar de ajuda.",
};
const configuracao = () => {
  const url = process.env.EVOLUTION_API_URL?.replace(/\/$/, "");
  const apiKey = process.env.EVOLUTION_API_KEY;
  const instancia = process.env.EVOLUTION_INSTANCE_NAME || "barbearia-teste";
  return { url, apiKey, instancia };
};
async function requisitar(caminho, opcoes = {}) {
  const { url, apiKey } = configuracao();
  if (!url || !apiKey) throw new Error("Evolution API não configurada.");
  const resposta = await fetch(`${url}${caminho}`, {
    ...opcoes,
    headers: {
      apikey: apiKey,
      "content-type": "application/json",
      ...opcoes.headers,
    },
  });
  const dados = await resposta.json().catch(() => ({}));
  const respostaEvolution = dados && typeof dados === "object" ? dados : {};
  if (!resposta.ok)
    throw new Error(
      respostaEvolution.response?.message ||
        respostaEvolution.message ||
        `Evolution respondeu ${resposta.status}.`,
    );
  return dados;
}
function estadoConectado(dados) {
  const resposta = dados && typeof dados === "object" ? dados : {};
  const estado = String(
    resposta.instance?.state ?? resposta.state ?? resposta.status ?? "",
  ).toLowerCase();
  return {
    estado: estado || null,
    conectada: ["open", "connected"].includes(estado),
  };
}
export const evolutionService = {
  configurada: () => Boolean(configuracao().url && configuracao().apiKey),
  async status() {
    const { url, apiKey, instancia } = configuracao();
    const config = await evolutionRepository.buscarNomeExibicao();
    const nomeExibicao = config?.evolutionNomeExibicao ?? instancia;
    if (!url || !apiKey)
      return {
        configurada: false,
        disponivel: false,
        instanciaCriada: false,
        conectada: false,
        instancia: null,
        nomeExibicao: null,
        estado: null,
        mensagem: "Integração local não configurada.",
      };
    try {
      const instancias = await requisitar("/instance/fetchInstances");
      const criada =
        Array.isArray(instancias) &&
        instancias.some((item) => {
          const itemEvolution = item && typeof item === "object" ? item : {};
          return (
            itemEvolution.instance?.instanceName === instancia ||
            itemEvolution.name === instancia
          );
        });
      if (!criada)
        return {
          configurada: true,
          disponivel: true,
          instanciaCriada: false,
          conectada: false,
          instancia,
          nomeExibicao,
          estado: null,
        };
      const dados = await requisitar(
        `/instance/connectionState/${encodeURIComponent(instancia)}`,
      );
      const { estado, conectada } = estadoConectado(dados);
      return {
        configurada: true,
        disponivel: true,
        instanciaCriada: true,
        conectada,
        instancia,
        nomeExibicao,
        estado,
      };
    } catch (error) {
      return {
        configurada: true,
        disponivel: false,
        instanciaCriada: false,
        conectada: false,
        instancia,
        nomeExibicao,
        estado: null,
        mensagem:
          error instanceof Error ? error.message : "Evolution indisponível.",
      };
    }
  },
  async criarInstancia() {
    const { instancia } = configuracao();
    return requisitar("/instance/create", {
      method: "POST",
      body: JSON.stringify({
        instanceName: instancia,
        integration: "WHATSAPP-BAILEYS",
        qrcode: true,
      }),
    });
  },
  async conectar() {
    const { instancia } = configuracao();
    return requisitar(`/instance/connect/${encodeURIComponent(instancia)}`);
  },
  async reconectar() {
    const { instancia } = configuracao();
    await requisitar(`/instance/restart/${encodeURIComponent(instancia)}`, {
      method: "POST",
    });
    return this.conectar();
  },
  async desconectar() {
    const { instancia } = configuracao();
    return requisitar(`/instance/logout/${encodeURIComponent(instancia)}`, {
      method: "DELETE",
    });
  },
  async excluirInstancia() {
    const { instancia } = configuracao();
    return requisitar(`/instance/delete/${encodeURIComponent(instancia)}`, {
      method: "DELETE",
    });
  },
  async atualizarNomeExibicao(nome) {
    if (
      typeof nome !== "string" ||
      nome.trim().length < 2 ||
      nome.trim().length > 60
    )
      throw new Error("O nome de exibição deve ter entre 2 e 60 caracteres.");
    const config = await evolutionRepository.buscarConfiguracao();
    const dados = { evolutionNomeExibicao: nome.trim() };
    return config
      ? evolutionRepository.atualizarConfiguracao(config.id, dados)
      : evolutionRepository.criarConfiguracao(dados);
  },
  async obterModelosMensagens() {
    const config = await evolutionRepository.buscarModelosMensagens();
    const status = config?.mensagensWhatsappStatus ?? {};
    return {
      criacao: config?.mensagemWhatsappCriacao || modelosPadrao.criacao,
      remarcacao:
        config?.mensagemWhatsappRemarcacao || modelosPadrao.remarcacao,
      cancelamento:
        config?.mensagemWhatsappCancelamento || modelosPadrao.cancelamento,
      atualizacao:
        config?.mensagemWhatsappAtualizacao || modelosPadrao.atualizacao,
      lembrete: config?.mensagemWhatsappLembrete || modelosPadrao.lembrete,
      pendente: status.pendente || modelosPadrao.pendente,
      confirmado: status.confirmado || modelosPadrao.confirmado,
      concluido: status.concluido || modelosPadrao.concluido,
      atrasado: status.atrasado || modelosPadrao.atrasado,
    };
  },
  async atualizarModelosMensagens(modelos) {
    if (!modelos || typeof modelos !== "object")
      throw new Error("Modelos de mensagem invalidos.");
    const dados = modelos;
    const chaves = [
      "criacao",
      "remarcacao",
      "cancelamento",
      "atualizacao",
      "lembrete",
      "pendente",
      "confirmado",
      "concluido",
      "atrasado",
    ];
    if (
      chaves.some(
        (chave) =>
          typeof dados[chave] !== "string" ||
          !dados[chave]?.trim() ||
          dados[chave].trim().length > 1000,
      )
    )
      throw new Error("Cada mensagem deve ter entre 1 e 1000 caracteres.");
    const valores = {
      mensagemWhatsappCriacao: dados.criacao.trim(),
      mensagemWhatsappRemarcacao: dados.remarcacao.trim(),
      mensagemWhatsappCancelamento: dados.cancelamento.trim(),
      mensagemWhatsappAtualizacao: dados.atualizacao.trim(),
      mensagemWhatsappLembrete: dados.lembrete.trim(),
      mensagensWhatsappStatus: {
        pendente: dados.pendente.trim(),
        confirmado: dados.confirmado.trim(),
        concluido: dados.concluido.trim(),
        atrasado: dados.atrasado.trim(),
      },
    };
    const config = await evolutionRepository.buscarConfiguracao();
    await (config
      ? evolutionRepository.atualizarConfiguracao(config.id, valores)
      : evolutionRepository.criarConfiguracao(valores));
    return this.obterModelosMensagens();
  },
  async regrasEnvioAutomatico() {
    const config = await evolutionRepository.buscarRegrasEnvioAutomatico();
    return {
      ativo: Boolean(config?.envioAutomaticoWhatsapp),
      regras: { ...regrasPadrao, ...(config?.regrasEnvioAutomatico ?? {}) },
    };
  },
  async envioAutomaticoAtivo(tipo) {
    const config = await this.regrasEnvioAutomatico();
    return config.ativo && (!tipo || config.regras[tipo] === true);
  },
  async atualizarEnvioAutomatico(ativo) {
    if (typeof ativo !== "boolean")
      throw new Error("Valor de envio automatico invalido.");
    const config = await evolutionRepository.buscarConfiguracao();
    return config
      ? evolutionRepository.atualizarConfiguracao(config.id, {
          envioAutomaticoWhatsapp: ativo,
        })
      : evolutionRepository.criarConfiguracao({
          envioAutomaticoWhatsapp: ativo,
        });
  },
  async atualizarRegrasEnvioAutomatico(regras) {
    if (!regras || typeof regras !== "object")
      throw new Error("Regras de envio invalidas.");
    const dados = { ...regrasPadrao, ...regras };
    const chaves = [
      "criacao",
      "remarcacao",
      "cancelamento",
      "pendente",
      "confirmado",
      "concluido",
      "atrasado",
      "lembrete",
    ];
    if (
      chaves.some((chave) => typeof dados[chave] !== "boolean") ||
      !Number.isInteger(dados.antecedenciaLembreteMinutos) ||
      dados.antecedenciaLembreteMinutos < 5 ||
      dados.antecedenciaLembreteMinutos > 10080
    )
      throw new Error("Informe uma antecedencia entre 5 minutos e 7 dias.");
    const config = await evolutionRepository.buscarConfiguracao();
    await (config
      ? evolutionRepository.atualizarConfiguracao(config.id, {
          regrasEnvioAutomatico: dados,
        })
      : evolutionRepository.criarConfiguracao({
          regrasEnvioAutomatico: dados,
        }));
    return this.regrasEnvioAutomatico();
  },
  async enviarTexto(numero, texto) {
    const { instancia } = configuracao();
    return requisitar(`/message/sendText/${encodeURIComponent(instancia)}`, {
      method: "POST",
      body: JSON.stringify({ number: numero, text: texto }),
    });
  },
};
