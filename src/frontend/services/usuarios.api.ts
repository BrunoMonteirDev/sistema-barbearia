import { request, body } from '../lib/http'
import type { Usuario } from '../types/api'

export const usuarios = {
  me: () =>
    request<Usuario>('/usuarios/me'),

  updateMe: (value: Partial<Usuario>) =>
    request<Usuario>('/usuarios/me', body('PUT', value)),

  concluirCadastro: (value: { nome: string; telefone: string }) =>
    request<Usuario>('/usuarios/me/concluir-cadastro', body('PUT', value)),

  excluirMinhaConta: (confirmacao: string) =>
    request<{ success: true }>('/usuarios/me', body('DELETE', { confirmacao })),

  list: () =>
    request<Usuario[]>('/usuarios'),

  create: (value: Partial<Usuario> & { senha?: string }) =>
    request<Usuario>('/usuarios', body('POST', value)),

  update: (id: string, value: Partial<Usuario>) =>
    request<Usuario>(`/usuarios/${id}`, body('PUT', value)),

  remove: (id: string) =>
    request(`/usuarios/${id}`, body('DELETE')),
}
