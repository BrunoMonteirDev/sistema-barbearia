import { request, body } from "../lib/http";
export const configuracoes = {
  publico: () => request("/configuracoes-publicas"),
  get: () => request("/configuracoes"),
  update: (value) => request("/configuracoes", body("PUT", value)),
};
