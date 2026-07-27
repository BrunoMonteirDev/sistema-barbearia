export type Status = 'ATIVO' | 'INATIVO'
export type AppointmentStatus = 'PENDENTE' | 'CONFIRMADO' | 'CANCELADO' | 'FINALIZADO' | 'REMARCADO'

export interface PageResult<T> { items: T[]; total: number; page: number; pageSize: number }

export interface Profissional { id: string; nome: string; especialidade: string | null; ativo: boolean }
export interface Servico { id: string; nome: string; duracao: number; preco: string; ativo: boolean }
export interface Cliente { id: string; nome: string; telefone: string | null; email: string; dataNascimento: string | null; ativo: boolean }
export interface Agendamento {
  id: string; data: string; hora: string; status: AppointmentStatus; observacao: string | null
  usuario: Pick<Cliente, 'id' | 'nome'>; profissional: Pick<Profissional, 'id' | 'nome'>; servico: Pick<Servico, 'id' | 'nome'>
}
