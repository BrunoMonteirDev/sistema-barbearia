import { evolutionService, type ModelosMensagemWhatsApp } from "../evolution/evolution.service";
import type { TipoNotificacao } from "./notificacao.service";

type DadosMensagem = { data: string; hora: string; usuario: { nome: string }; profissional: { nome: string }; servico: { nome: string } };
const chaves: Record<TipoNotificacao, keyof ModelosMensagemWhatsApp> = { CRIACAO: "criacao", REMARCACAO: "remarcacao", CANCELAMENTO: "cancelamento", ATUALIZACAO: "atualizacao", PENDENTE: "pendente", CONFIRMADO: "confirmado", CONCLUIDO: "concluido", ATRASADO: "atrasado", LEMBRETE: "lembrete" };

export async function montarMensagemNotificacao(tipo: TipoNotificacao, agendamento: DadosMensagem) {
  const modelos = await evolutionService.obterModelosMensagens();
  return modelos[chaves[tipo]].replace(/{{cliente}}/g, agendamento.usuario.nome).replace(/{{servico}}/g, agendamento.servico.nome).replace(/{{profissional}}/g, agendamento.profissional.nome).replace(/{{data}}/g, agendamento.data).replace(/{{hora}}/g, agendamento.hora);
}
