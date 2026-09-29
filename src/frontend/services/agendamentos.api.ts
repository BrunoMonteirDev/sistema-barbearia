import { request, body } from '../lib/http'
import type { Agendamento, DisponibilidadeAgendamento } from '../types/api'

export const agendamentos = {
  list: () =>
    request<Agendamento[]>('/agendamentos'),

  create: (value: { usuarioId?: string; profissionalId: string; servicoId: string; data: string; hora: string; observacao?: string; tokenConfirmacaoRepeticao?: string }) =>
    request<Agendamento>('/agendamentos', body('POST', value)),

  update: (id: string, value: Partial<{ profissionalId: string; servicoId: string; data: string; hora: string; status: string; observacao: string }>) =>
    request<Agendamento>(`/agendamentos/${id}`, body('PUT', value)),

  remove: (id: string) =>
    request<void>(`/agendamentos/${id}`, body('DELETE')),

  cancel: (id: string) =>
    request<Agendamento>(`/agendamentos/${id}/cancelar`, body('PATCH')),

  remarcar: (id: string, value: { data: string; hora: string; profissionalId?: string; servicoId?: string }) =>
    request<Agendamento>(`/agendamentos/${id}/remarcar`, body('PATCH', value)),

  historico: (id: string) =>
    request<Array<{ id: string; tipo: string; createdAt: string }>>(`/agendamentos/${id}/historico`),

  status: (id: string, status: string) =>
    request<Agendamento>(`/agendamentos/${id}/status`, body('PATCH', { status })),

  notificar: (id: string, tipo: 'CRIACAO' | 'REMARCACAO' | 'CANCELAMENTO' | 'ATUALIZACAO' | 'PENDENTE' | 'CONFIRMADO' | 'CONCLUIDO' | 'ATRASADO') =>
    request<{ ok: true }>(`/agendamentos/${id}/notificar`, body('POST', { tipo })),

  disponibilidade: (profissionalId: string, servicoId: string, data: string, ignorarAgendamentoId?: string) => {
    const query = new URLSearchParams({ profissionalId, servicoId, data })
    if (ignorarAgendamentoId) query.set('ignorarAgendamentoId', ignorarAgendamentoId)
    return request<DisponibilidadeAgendamento>(`/agendamentos/disponibilidade?${query}`)
  },
}
