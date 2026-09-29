import { request, body } from "../lib/http";
export const agendamentos = {
  list: () => request("/agendamentos"),
  create: (value) => request("/agendamentos", body("POST", value)),
  update: (id, value) => request(`/agendamentos/${id}`, body("PUT", value)),
  remove: (id) => request(`/agendamentos/${id}`, body("DELETE")),
  cancel: (id) => request(`/agendamentos/${id}/cancelar`, body("PATCH")),
  remarcar: (id, value) =>
    request(`/agendamentos/${id}/remarcar`, body("PATCH", value)),
  historico: (id) => request(`/agendamentos/${id}/historico`),
  status: (id, status) =>
    request(`/agendamentos/${id}/status`, body("PATCH", { status })),
  notificar: (id, tipo) =>
    request(`/agendamentos/${id}/notificar`, body("POST", { tipo })),
  disponibilidade: (profissionalId, servicoId, data, ignorarAgendamentoId) => {
    const query = new URLSearchParams({ profissionalId, servicoId, data });
    if (ignorarAgendamentoId)
      query.set("ignorarAgendamentoId", ignorarAgendamentoId);
    return request(`/agendamentos/disponibilidade?${query}`);
  },
};
