import { request, body } from "../lib/http";
export const usuarios = {
  me: () => request("/usuarios/me"),
  updateMe: (value) => request("/usuarios/me", body("PUT", value)),
  concluirCadastro: (value) =>
    request("/usuarios/me/concluir-cadastro", body("PUT", value)),
  excluirMinhaConta: (confirmacao) =>
    request("/usuarios/me", body("DELETE", { confirmacao })),
  list: () => request("/usuarios"),
  create: (value) => request("/usuarios", body("POST", value)),
  update: (id, value) => request(`/usuarios/${id}`, body("PUT", value)),
  remove: (id) => request(`/usuarios/${id}`, body("DELETE")),
};
