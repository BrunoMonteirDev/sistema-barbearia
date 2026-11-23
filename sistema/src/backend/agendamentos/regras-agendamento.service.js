/** Papel do módulo: Reúne regras temporais do agendamento, como horário passado, antecedência e identificação de atrasos. */
import { prisma } from "../lib/prisma.js";
export async function regrasAgendamento() {
  return {
    antecedenciaCancelamentoHoras: 24,
    antecedenciaAgendamentoMinutos: 30,
    toleranciaAtrasoMinutos: 0,
  };
}
export function inicioAtendimento(data, hora) {
  return new Date(`${data}T${hora}:00`);
}
export function horarioAgendamentoJaPassou(data, hora, agora = new Date()) {
  return inicioAtendimento(data, hora).getTime() <= agora.getTime();
}
export function respeitaAntecedenciaMinimaAgendamento(
  data,
  hora,
  antecedenciaMinutos,
  agora = new Date(),
) {
  return (
    inicioAtendimento(data, hora).getTime() - agora.getTime() >=
    antecedenciaMinutos * 60000
  );
}
export function respeitaAntecedencia(data, hora, horas) {
  return (
    inicioAtendimento(data, hora).getTime() - Date.now() >= horas * 3600000
  );
}
export async function atualizarAtrasados() {
  const { toleranciaAtrasoMinutos } = await regrasAgendamento();
  const limite = new Date(Date.now() - toleranciaAtrasoMinutos * 60000);
  const ativos = await prisma.agendamento.findMany({
    where: { status: { in: ["PENDENTE", "CONFIRMADO"] } },
  });
  const ids = ativos
    .filter((item) => inicioAtendimento(item.data, item.hora) < limite)
    .map((item) => item.id);
  if (ids.length)
    await prisma.agendamento.updateMany({
      where: { id: { in: ids } },
      data: { status: "ATRASADO" },
    });
}
