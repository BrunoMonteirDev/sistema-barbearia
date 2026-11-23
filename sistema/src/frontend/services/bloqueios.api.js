/** Papel do módulo: Define as chamadas HTTP para consultar e administrar datas bloqueadas. */
import { request, body } from "../lib/http";

export const bloqueios = {
  list: () => request("/bloqueios-data"),
  create: (value) => request("/bloqueios-data", body("POST", value)),
  remove: (id) => request(`/bloqueios-data/${id}`, body("DELETE")),
};
