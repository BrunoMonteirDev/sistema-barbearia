import { request, body } from '../lib/http'
import type { EvolutionStatus, ModelosMensagemWhatsApp, RegrasEnvioAutomatico } from '../types/api'

export const evolution = {
  status: () =>
    request<EvolutionStatus>('/integracoes/evolution/status'),

  criarInstancia: () =>
    request<{ base64?: string; pairingCode?: string | null }>('/integracoes/evolution/instancia', body('POST')),

  conectar: () =>
    request<{ base64?: string; pairingCode?: string | null }>('/integracoes/evolution/conectar', body('POST')),

  reconectar: () =>
    request<{ base64?: string; pairingCode?: string | null }>('/integracoes/evolution/reconectar', body('POST')),

  desconectar: () =>
    request('/integracoes/evolution/desconectar', body('POST')),

  excluirInstancia: () =>
    request('/integracoes/evolution/instancia', { method: 'DELETE' }),

  atualizarNomeExibicao: (nome: string) =>
    request('/integracoes/evolution/nome-exibicao', body('PUT', { nome })),

  mensagens: () =>
    request<ModelosMensagemWhatsApp>('/integracoes/evolution/mensagens'),

  salvarMensagens: (value: ModelosMensagemWhatsApp) =>
    request<ModelosMensagemWhatsApp>('/integracoes/evolution/mensagens', body('PUT', value)),

  envioAutomatico: () =>
    request<{ ativo: boolean }>('/integracoes/evolution/envio-automatico'),

  salvarEnvioAutomatico: (ativo: boolean) =>
    request<{ ativo: boolean }>('/integracoes/evolution/envio-automatico', body('PUT', { ativo })),

  regrasEnvioAutomatico: () =>
    request<{ ativo: boolean; regras: RegrasEnvioAutomatico }>('/integracoes/evolution/regras-envio-automatico'),

  salvarRegrasEnvioAutomatico: (value: RegrasEnvioAutomatico) =>
    request<{ ativo: boolean; regras: RegrasEnvioAutomatico }>('/integracoes/evolution/regras-envio-automatico', body('PUT', value)),
}
