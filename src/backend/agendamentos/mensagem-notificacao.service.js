import { evolutionService } from "../evolution/evolution.service.js";
const chaves = {
  CRIACAO: "criacao",
  REMARCACAO: "remarcacao",
  CANCELAMENTO: "cancelamento",
  ATUALIZACAO: "atualizacao",
  PENDENTE: "pendente",
  CONFIRMADO: "confirmado",
  CONCLUIDO: "concluido",
  ATRASADO: "atrasado",
  LEMBRETE: "lembrete",
};
export async function montarMensagemNotificacao(tipo, agendamento) {
  const modelos = await evolutionService.obterModelosMensagens();
  return modelos[chaves[tipo]]
    .replace(/{{cliente}}/g, agendamento.usuario.nome)
    .replace(/{{servico}}/g, agendamento.servico.nome)
    .replace(/{{profissional}}/g, agendamento.profissional.nome)
    .replace(/{{data}}/g, agendamento.data)
    .replace(/{{hora}}/g, agendamento.hora);
}
