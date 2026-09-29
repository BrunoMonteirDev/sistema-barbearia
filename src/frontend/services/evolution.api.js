import { request, body } from "../lib/http";
export const evolution = {
  status: () => request("/integracoes/evolution/status"),
  criarInstancia: () =>
    request("/integracoes/evolution/instancia", body("POST")),
  conectar: () => request("/integracoes/evolution/conectar", body("POST")),
  reconectar: () => request("/integracoes/evolution/reconectar", body("POST")),
  desconectar: () =>
    request("/integracoes/evolution/desconectar", body("POST")),
  excluirInstancia: () =>
    request("/integracoes/evolution/instancia", { method: "DELETE" }),
  atualizarNomeExibicao: (nome) =>
    request("/integracoes/evolution/nome-exibicao", body("PUT", { nome })),
  mensagens: () => request("/integracoes/evolution/mensagens"),
  salvarMensagens: (value) =>
    request("/integracoes/evolution/mensagens", body("PUT", value)),
  envioAutomatico: () => request("/integracoes/evolution/envio-automatico"),
  salvarEnvioAutomatico: (ativo) =>
    request("/integracoes/evolution/envio-automatico", body("PUT", { ativo })),
  regrasEnvioAutomatico: () =>
    request("/integracoes/evolution/regras-envio-automatico"),
  salvarRegrasEnvioAutomatico: (value) =>
    request(
      "/integracoes/evolution/regras-envio-automatico",
      body("PUT", value),
    ),
};
