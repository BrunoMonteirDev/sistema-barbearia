import { request, body } from "../lib/http";
export const servicos = {
  list: () => request("/servicos"),
  create: (value) => request("/servicos", body("POST", value)),
  update: (id, value) => request(`/servicos/${id}`, body("PUT", value)),
  remove: (id) => request(`/servicos/${id}`, body("DELETE")),
};
