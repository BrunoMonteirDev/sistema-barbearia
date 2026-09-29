import { request, body } from "../lib/http";
export const configuracoes = {
  publico: () => request("/configuracoes-publicas"),
  get: () => request("/configuracoes"),
  update: (value) => request("/configuracoes", body("PUT", value)),
  regras: () => request("/configuracoes/regras"),
  salvarRegras: (value) => request("/configuracoes/regras", body("PUT", value)),
};
