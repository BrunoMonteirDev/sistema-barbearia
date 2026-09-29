import { request, body } from '../lib/http'
import type { Usuario } from '../types/api'

export const auth = {
  login: (value: { email: string; password: string }) =>
    request<{ token: string; user: Usuario }>('/auth/login', body('POST', value)),

  register: (value: { nome: string; email: string; password: string; telefone?: string }) =>
    request<{ token: string; user: Usuario }>('/auth/register', body('POST', value)),

  google: (idToken: string) =>
    request<{ token: string; user: Usuario }>('/auth/google', body('POST', { idToken })),
}
