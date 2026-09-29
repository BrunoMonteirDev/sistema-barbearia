import { request, body } from "../lib/http";
export const profissionais = {
  list: () => request("/profissionais"),
  listAdmin: () => request("/profissionais/admin"),
  create: (value) => request("/profissionais", body("POST", value)),
  update: (id, value) => request(`/profissionais/${id}`, body("PUT", value)),
  remove: (id) => request(`/profissionais/${id}`, body("DELETE")),
  disponibilidade: (id) => request(`/profissionais/${id}/disponibilidade`),
  salvarDisponibilidade: (id, disponibilidade) =>
    request(
      `/profissionais/${id}/disponibilidade`,
      body("PUT", { disponibilidade }),
    ),
};
