import { request, body } from '../lib/http'
import type { RegrasAgendamento } from '../types/api'

export const configuracoes = {
  publico: () =>
    request<{ telefoneWhatsApp: string | null; email: string | null; instagram: string | null }>('/configuracoes-publicas'),

  get: () =>
    request<{ telefoneWhatsApp?: string | null; email?: string | null; instagram?: string | null }>('/configuracoes'),

  update: (value: { telefoneWhatsApp: string; email: string; instagram: string }) =>
    request('/configuracoes', body('PUT', value)),

  regras: () =>
    request<RegrasAgendamento>('/configuracoes/regras'),

  salvarRegras: (value: RegrasAgendamento) =>
    request<RegrasAgendamento>('/configuracoes/regras', body('PUT', value)),
}
