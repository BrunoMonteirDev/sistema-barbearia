type EstadoEvolution = {
  configurada: boolean
  disponivel: boolean
  instanciaCriada: boolean
  conectada: boolean
  instancia: string | null
  estado: string | null
  mensagem?: string
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
    if (!url || !apiKey) return { configurada: false, disponivel: false, instanciaCriada: false, conectada: false, instancia: null, estado: null, mensagem: 'Integração local não configurada.' }
    try {
      const instancias = await requisitar('/instance/fetchInstances')
      const criada = Array.isArray(instancias) && instancias.some((item: any) => item?.instance?.instanceName === instancia || item?.name === instancia)
      if (!criada) return { configurada: true, disponivel: true, instanciaCriada: false, conectada: false, instancia, estado: null }
      const dados = await requisitar(`/instance/connectionState/${encodeURIComponent(instancia)}`)
      const { estado, conectada } = estadoConectado(dados)
      return { configurada: true, disponivel: true, instanciaCriada: true, conectada, instancia, estado }
    } catch (error) {
      return { configurada: true, disponivel: false, instanciaCriada: false, conectada: false, instancia, estado: null, mensagem: error instanceof Error ? error.message : 'Evolution indisponível.' }
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

  async enviarTexto(numero: string, texto: string) {
    const { instancia } = configuracao()
    return requisitar(`/message/sendText/${encodeURIComponent(instancia)}`, { method: 'POST', body: JSON.stringify({ number: numero, textMessage: { text: texto } }) })
  },
}
