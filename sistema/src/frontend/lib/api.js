/** Papel do módulo: Agrupa os clientes de cada domínio para disponibilizar uma interface única de chamadas à API. */
import { auth } from "../services/auth.api";
import { usuarios } from "../services/usuarios.api";
import { servicos } from "../services/servicos.api";
import { profissionais } from "../services/profissionais.api";
import { agendamentos } from "../services/agendamentos.api";
import { configuracoes } from "../services/configuracoes.api";
import { bloqueios } from "../services/bloqueios.api";
export { ApiError, authStorage } from "./http";
export const api = {
  auth,
  usuarios,
  servicos,
  profissionais,
  agendamentos,
  configuracoes,
  bloqueios,
};
