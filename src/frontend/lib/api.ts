import { auth } from '../services/auth.api'
import { usuarios } from '../services/usuarios.api'
import { servicos } from '../services/servicos.api'
import { profissionais } from '../services/profissionais.api'
import { agendamentos } from '../services/agendamentos.api'
import { configuracoes } from '../services/configuracoes.api'
import { evolution } from '../services/evolution.api'

export { ApiError, authStorage } from './http'
export type * from '../types/api'

export const api = {
  auth,
  usuarios,
  servicos,
  profissionais,
  agendamentos,
  configuracoes,
  evolution,
}
