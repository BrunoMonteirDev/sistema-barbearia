/** Papel do módulo: Define as chamadas HTTP para login, cadastro e autenticação com Google. */
import { request, body } from "../lib/http";
export const auth = {
  login: (value) => request("/auth/login", body("POST", value)),
  register: (value) => request("/auth/register", body("POST", value)),
  google: (idToken) => request("/auth/google", body("POST", { idToken })),
};
