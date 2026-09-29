import type { AgendamentoRelacionado } from '../types/api'

export class ApiError extends Error {
  codigo?: string
  agendamentosRelacionados?: AgendamentoRelacionado[]
  tokenConfirmacaoRepeticao?: string

  constructor(data: Record<string, unknown>) {
    super(typeof data.error === 'string' ? data.error : 'Não foi possível concluir a solicitação.')
    this.codigo = typeof data.codigo === 'string' ? data.codigo : undefined
    this.agendamentosRelacionados = Array.isArray(data.agendamentosRelacionados)
      ? data.agendamentosRelacionados as AgendamentoRelacionado[]
      : undefined
    this.tokenConfirmacaoRepeticao = typeof data.tokenConfirmacaoRepeticao === 'string'
      ? data.tokenConfirmacaoRepeticao
      : undefined
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'
const tokenKey = 'barbearia.token'

export const authStorage = {
  get: () => localStorage.getItem(tokenKey),
  set: (token: string) => localStorage.setItem(tokenKey, token),
  clear: () => localStorage.removeItem(tokenKey),
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(authStorage.get() ? { Authorization: `Bearer ${authStorage.get()}` } : {}),
      ...options.headers,
    },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new ApiError(data)
  return data as T
}

export const body = (method: string, value?: unknown) => ({
  method,
  body: value === undefined ? undefined : JSON.stringify(value),
})
