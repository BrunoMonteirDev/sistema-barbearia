import { request, body } from "../lib/http";
export const agendamentos = {
  list: () => request("/agendamentos"),
  create: (value) => request("/agendamentos", body("POST", value)),
  cancel: (id) => request(`/agendamentos/${id}/cancelar`, body("PATCH")),
  historico: (id) => request(`/agendamentos/${id}/historico`),
  status: (id, status) =>
    request(`/agendamentos/${id}/status`, body("PATCH", { status })),
  disponibilidade: (profissionalId, servicoId, data) => {
    const query = new URLSearchParams({ profissionalId, servicoId, data });
    return request(`/agendamentos/disponibilidade?${query}`);
  },
};
