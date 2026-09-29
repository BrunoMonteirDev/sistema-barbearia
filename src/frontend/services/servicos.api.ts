import { request, body } from '../lib/http'
import type { Servico } from '../types/api'

export const servicos = {
  list: () =>
    request<Servico[]>('/servicos'),

  create: (value: Partial<Servico>) =>
    request<Servico>('/servicos', body('POST', value)),

  update: (id: string, value: Partial<Servico>) =>
    request<Servico>(`/servicos/${id}`, body('PUT', value)),

  remove: (id: string) =>
    request(`/servicos/${id}`, body('DELETE')),
}
