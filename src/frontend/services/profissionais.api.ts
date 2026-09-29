import { request, body } from '../lib/http'
import type { Profissional, DisponibilidadeFuncionario } from '../types/api'

export const profissionais = {
  list: () =>
    request<Profissional[]>('/profissionais'),

  listAdmin: () =>
    request<Profissional[]>('/profissionais/admin'),

  create: (value: Pick<Profissional, 'nome' | 'telefone' | 'email' | 'ativo'>) =>
    request<Profissional>('/profissionais', body('POST', value)),

  update: (id: string, value: Pick<Profissional, 'nome' | 'telefone' | 'email' | 'ativo'>) =>
    request<Profissional>(`/profissionais/${id}`, body('PUT', value)),

  remove: (id: string) =>
    request<Profissional>(`/profissionais/${id}`, body('DELETE')),

  disponibilidade: (id: string) =>
    request<DisponibilidadeFuncionario>(`/profissionais/${id}/disponibilidade`),

  salvarDisponibilidade: (id: string, disponibilidade: DisponibilidadeFuncionario) =>
    request<{ ok: boolean }>(`/profissionais/${id}/disponibilidade`, body('PUT', { disponibilidade })),
}
