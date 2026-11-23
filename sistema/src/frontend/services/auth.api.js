/** Papel do módulo: Define as chamadas HTTP para login, cadastro e autenticação com Google. */
import { request, body } from "../lib/http";
export const auth = {
  esqueciSenha: (email) => request("/auth/esqueci-senha", body("POST", { email })),
  redefinirSenha: (dados) => request("/auth/redefinir-senha", body("POST", dados)),
  login: (value) => request("/auth/login", body("POST", value)),
  register: (value) => request("/auth/register", body("POST", value)),
  google: (idToken) => request("/auth/google", body("POST", { idToken })),
};
