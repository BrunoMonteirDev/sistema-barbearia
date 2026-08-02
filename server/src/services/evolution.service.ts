import { prisma } from '../lib/prisma'

type EstadoEvolution = {
  configurada: boolean
  disponivel: boolean
  instanciaCriada: boolean
  conectada: boolean
  instancia: string | null
  nomeExibicao: string | null
  estado: string | null
  mensagem?: string
}
export type ModelosMensagemWhatsApp = { criacao: string; remarcacao: string; cancelamento: string; atualizacao: string; lembrete: string; pendente: string; confirmado: string; concluido: string; atrasado: string }
export type RegrasEnvioAutomatico = { criacao: boolean; remarcacao: boolean; cancelamento: boolean; pendente: boolean; confirmado: boolean; concluido: boolean; atrasado: boolean; lembrete: boolean; antecedenciaLembreteMinutos: number }
const regrasPadrao: RegrasEnvioAutomatico = { criacao: false, remarcacao: false, cancelamento: false, pendente: false, confirmado: false, concluido: false, atrasado: false, lembrete: false, antecedenciaLembreteMinutos: 60 }
const modelosPadrao: ModelosMensagemWhatsApp = {
  criacao: 'Ola, {{cliente}}! Seu agendamento de {{servico}} com {{profissional}} foi confirmado para {{data}} as {{hora}}.',
  remarcacao: 'Ola, {{cliente}}! Seu agendamento de {{servico}} foi remarcado para {{data}} as {{hora}} com {{profissional}}.',
  cancelamento: 'Ola, {{cliente}}! Seu agendamento de {{servico}} em {{data}} as {{hora}} foi cancelado.',
  atualizacao: 'Ola, {{cliente}}! Seu agendamento de {{servico}} com {{profissional}} foi atualizado: {{data}} as {{hora}}.',
  lembrete: 'Ola, {{cliente}}! Lembrete: seu atendimento de {{servico}} com {{profissional}} sera em {{data}} as {{hora}}.',
  pendente: 'Ola, {{cliente}}! Seu agendamento de {{servico}} esta pendente de confirmacao para {{data}} as {{hora}}.',
  confirmado: 'Ola, {{cliente}}! Seu agendamento de {{servico}} com {{profissional}} foi confirmado para {{data}} as {{hora}}.',
  concluido: 'Ola, {{cliente}}! Obrigado pela visita. Seu atendimento de {{servico}} foi concluido.',
  atrasado: 'Ola, {{cliente}}! Seu horario de {{servico}} em {{data}} as {{hora}} esta marcado como atrasado. Fale conosco se precisar de ajuda.',
}

const configuracao = () => {
  const url = process.env.EVOLUTION_API_URL?.replace(/\/$/, '')
  const apiKey = process.env.EVOLUTION_API_KEY
  const instancia = process.env.EVOLUTION_INSTANCE_NAME || 'barbearia-teste'
  return { url, apiKey, instancia }
}

async function requisitar(caminho: string, opcoes: RequestInit = {}) {
  const { url, apiKey } = configuracao()
  if (!url || !apiKey) throw new Error('Evolution API não configurada.')
  const resposta = await fetch(`${url}${caminho}`, {
    ...opcoes,
    headers: { apikey: apiKey, 'content-type': 'application/json', ...opcoes.headers },
  })
  const dados = await resposta.json().catch(() => ({}))
  if (!resposta.ok) throw new Error(dados?.response?.message || dados?.message || `Evolution respondeu ${resposta.status}.`)
  return dados
}

function estadoConectado(dados: any) {
  const estado = String(dados?.instance?.state ?? dados?.state ?? dados?.status ?? '').toLowerCase()
  return { estado: estado || null, conectada: ['open', 'connected'].includes(estado) }
}

export const evolutionService = {
  configurada: () => Boolean(configuracao().url && configuracao().apiKey),

  async status(): Promise<EstadoEvolution> {
    const { url, apiKey, instancia } = configuracao()
    const config = await prisma.configuracao.findFirst({ select: { evolutionNomeExibicao: true } })
    const nomeExibicao = config?.evolutionNomeExibicao ?? instancia
    if (!url || !apiKey) return { configurada: false, disponivel: false, instanciaCriada: false, conectada: false, instancia: null, nomeExibicao: null, estado: null, mensagem: 'Integração local não configurada.' }
    try {
      const instancias = await requisitar('/instance/fetchInstances')
      const criada = Array.isArray(instancias) && instancias.some((item: any) => item?.instance?.instanceName === instancia || item?.name === instancia)
      if (!criada) return { configurada: true, disponivel: true, instanciaCriada: false, conectada: false, instancia, nomeExibicao, estado: null }
      const dados = await requisitar(`/instance/connectionState/${encodeURIComponent(instancia)}`)
      const { estado, conectada } = estadoConectado(dados)
      return { configurada: true, disponivel: true, instanciaCriada: true, conectada, instancia, nomeExibicao, estado }
    } catch (error) {
      return { configurada: true, disponivel: false, instanciaCriada: false, conectada: false, instancia, nomeExibicao, estado: null, mensagem: error instanceof Error ? error.message : 'Evolution indisponível.' }
    }
  },

  async criarInstancia() {
    const { instancia } = configuracao()
    return requisitar('/instance/create', { method: 'POST', body: JSON.stringify({ instanceName: instancia, integration: 'WHATSAPP-BAILEYS', qrcode: true }) })
  },

  async conectar() {
    const { instancia } = configuracao()
    return requisitar(`/instance/connect/${encodeURIComponent(instancia)}`)
  },

  async reconectar() {
    const { instancia } = configuracao()
    await requisitar(`/instance/restart/${encodeURIComponent(instancia)}`, { method: 'POST' })
    return this.conectar()
  },

  async desconectar() {
    const { instancia } = configuracao()
    return requisitar(`/instance/logout/${encodeURIComponent(instancia)}`, { method: 'DELETE' })
  },

  async excluirInstancia() {
    const { instancia } = configuracao()
    return requisitar(`/instance/delete/${encodeURIComponent(instancia)}`, { method: 'DELETE' })
  },

  async atualizarNomeExibicao(nome: unknown) {
    if (typeof nome !== 'string' || nome.trim().length < 2 || nome.trim().length > 60) throw new Error('O nome de exibição deve ter entre 2 e 60 caracteres.')
    const config = await prisma.configuracao.findFirst()
    const dados = { evolutionNomeExibicao: nome.trim() }
    return config ? prisma.configuracao.update({ where: { id: config.id }, data: dados }) : prisma.configuracao.create({ data: dados })
  },

  async obterModelosMensagens(): Promise<ModelosMensagemWhatsApp> {
    const config = await prisma.configuracao.findFirst({ select: { mensagemWhatsappCriacao: true, mensagemWhatsappRemarcacao: true, mensagemWhatsappCancelamento: true, mensagemWhatsappAtualizacao: true, mensagemWhatsappLembrete: true, mensagensWhatsappStatus: true } })
    const status = (config?.mensagensWhatsappStatus ?? {}) as Partial<ModelosMensagemWhatsApp>
    return { criacao: config?.mensagemWhatsappCriacao || modelosPadrao.criacao, remarcacao: config?.mensagemWhatsappRemarcacao || modelosPadrao.remarcacao, cancelamento: config?.mensagemWhatsappCancelamento || modelosPadrao.cancelamento, atualizacao: config?.mensagemWhatsappAtualizacao || modelosPadrao.atualizacao, lembrete: config?.mensagemWhatsappLembrete || modelosPadrao.lembrete, pendente: status.pendente || modelosPadrao.pendente, confirmado: status.confirmado || modelosPadrao.confirmado, concluido: status.concluido || modelosPadrao.concluido, atrasado: status.atrasado || modelosPadrao.atrasado }
  },

  async atualizarModelosMensagens(modelos: unknown) {
    if (!modelos || typeof modelos !== 'object') throw new Error('Modelos de mensagem invalidos.')
    const dados = modelos as Partial<ModelosMensagemWhatsApp>
    const chaves = ['criacao', 'remarcacao', 'cancelamento', 'atualizacao', 'lembrete', 'pendente', 'confirmado', 'concluido', 'atrasado'] as const
    if (chaves.some((chave) => typeof dados[chave] !== 'string' || !dados[chave]?.trim() || dados[chave]!.trim().length > 1000)) throw new Error('Cada mensagem deve ter entre 1 e 1000 caracteres.')
    const valores = { mensagemWhatsappCriacao: dados.criacao!.trim(), mensagemWhatsappRemarcacao: dados.remarcacao!.trim(), mensagemWhatsappCancelamento: dados.cancelamento!.trim(), mensagemWhatsappAtualizacao: dados.atualizacao!.trim(), mensagemWhatsappLembrete: dados.lembrete!.trim(), mensagensWhatsappStatus: { pendente: dados.pendente!.trim(), confirmado: dados.confirmado!.trim(), concluido: dados.concluido!.trim(), atrasado: dados.atrasado!.trim() } }
    const config = await prisma.configuracao.findFirst()
    await (config ? prisma.configuracao.update({ where: { id: config.id }, data: valores }) : prisma.configuracao.create({ data: valores }))
    return this.obterModelosMensagens()
  },

  async regrasEnvioAutomatico(): Promise<{ ativo: boolean; regras: RegrasEnvioAutomatico }> { const config = await prisma.configuracao.findFirst({ select: { envioAutomaticoWhatsapp: true, regrasEnvioAutomatico: true } }); return { ativo: Boolean(config?.envioAutomaticoWhatsapp), regras: { ...regrasPadrao, ...((config?.regrasEnvioAutomatico ?? {}) as Partial<RegrasEnvioAutomatico>) } } },
  async envioAutomaticoAtivo(tipo?: keyof RegrasEnvioAutomatico) { const config = await this.regrasEnvioAutomatico(); return config.ativo && (!tipo || config.regras[tipo] === true) },
  async atualizarEnvioAutomatico(ativo: unknown) {
    if (typeof ativo !== 'boolean') throw new Error('Valor de envio automatico invalido.')
    const config = await prisma.configuracao.findFirst()
    return config ? prisma.configuracao.update({ where: { id: config.id }, data: { envioAutomaticoWhatsapp: ativo } }) : prisma.configuracao.create({ data: { envioAutomaticoWhatsapp: ativo } })
  },
  async atualizarRegrasEnvioAutomatico(regras: unknown) {
    if (!regras || typeof regras !== 'object') throw new Error('Regras de envio invalidas.')
    const dados = { ...regrasPadrao, ...(regras as Partial<RegrasEnvioAutomatico>) }
    const chaves = ['criacao', 'remarcacao', 'cancelamento', 'pendente', 'confirmado', 'concluido', 'atrasado', 'lembrete'] as const
    if (chaves.some(chave => typeof dados[chave] !== 'boolean') || !Number.isInteger(dados.antecedenciaLembreteMinutos) || dados.antecedenciaLembreteMinutos < 5 || dados.antecedenciaLembreteMinutos > 10080) throw new Error('Informe uma antecedencia entre 5 minutos e 7 dias.')
    const config = await prisma.configuracao.findFirst()
    await (config ? prisma.configuracao.update({ where: { id: config.id }, data: { regrasEnvioAutomatico: dados } }) : prisma.configuracao.create({ data: { regrasEnvioAutomatico: dados } }))
    return this.regrasEnvioAutomatico()
  },

  async enviarTexto(numero: string, texto: string) {
    const { instancia } = configuracao()
    return requisitar(`/message/sendText/${encodeURIComponent(instancia)}`, { method: 'POST', body: JSON.stringify({ number: numero, text: texto }) })
  },
}
