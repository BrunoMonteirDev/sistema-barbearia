export type Nivel = 'Administrador' | 'Cliente'

export interface Usuario {
  id: string
  nome: string
  email: string
  telefone?: string | null
  dataNascimento?: string | null
  nivel: Nivel
  ativo?: boolean
  provedorAuth?: string
  cadastroConcluido?: boolean
  fotoUrl?: string | null
}

export interface Servico {
  id: string
  nome: string
  descricao?: string | null
  preco: number
  duracao: number
  ativo: boolean
}

export interface Profissional {
  id: string
  nome: string
  telefone?: string | null
  email?: string | null
  especialidade?: string | null
  ativo: boolean
}

export interface Agendamento {
  id: string
  data: string
  hora: string
  status: string
  observacao?: string | null
  usuario?: Usuario
  profissional?: Profissional
  servico?: Servico
}

export type AgendamentoRelacionado = {
  id: string
  data: string
  hora: string
  servico: string
  profissional: string
  status: string
}

export interface RegrasAgendamento {
  antecedenciaCancelamentoHoras: number
  antecedenciaRemarcacaoHoras: number
  antecedenciaAgendamentoMinutos: number
  toleranciaAtrasoMinutos: number
}

export interface EvolutionStatus {
  configurada: boolean
  disponivel: boolean
  instanciaCriada: boolean
  conectada: boolean
  instancia: string | null
  nomeExibicao: string | null
  estado: string | null
  mensagem?: string
}

export interface ModelosMensagemWhatsApp {
  criacao: string
  remarcacao: string
  cancelamento: string
  atualizacao: string
  lembrete: string
  pendente: string
  confirmado: string
  concluido: string
  atrasado: string
}

export interface RegrasEnvioAutomatico {
  criacao: boolean
  remarcacao: boolean
  cancelamento: boolean
  pendente: boolean
  confirmado: boolean
  concluido: boolean
  atrasado: boolean
  lembrete: boolean
  antecedenciaLembreteMinutos: number
}

export type DisponibilidadeFuncionario = Record<number, string[]>

export interface DisponibilidadeAgendamento {
  horarios: string[]
  horariosComAvisoAntecedencia: string[]
}
