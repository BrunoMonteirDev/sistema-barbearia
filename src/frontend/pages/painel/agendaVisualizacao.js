export const statusLabels = {
  PENDENTE: "Pendente",
  CONFIRMADO: "Confirmado",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
  ATRASADO: "Atrasado",
};
export const statusStyle = {
  PENDENTE: "status-agenda-pendente",
  CONFIRMADO: "status-agenda-confirmado",
  CONCLUIDO: "status-agenda-concluido",
  CANCELADO: "status-agenda-cancelado",
  ATRASADO: "status-agenda-atrasado",
};
function inicioSemana(data) {
  const valor = new Date(`${data}T12:00:00`);
  valor.setDate(valor.getDate() - ((valor.getDay() + 6) % 7));
  return valor;
}
export function datasDaSemana(data) {
  const inicio = inicioSemana(data);
  return Array.from({ length: 7 }, (_, index) => {
    const dia = new Date(inicio);
    dia.setDate(inicio.getDate() + index);
    return dia.toLocaleDateString("en-CA");
  });
}
export function rotuloSemana(data) {
  const dias = datasDaSemana(data);
  const primeiroDia = new Date(`${dias[0]}T12:00:00`);
  const ultimoDia = new Date(`${dias[6]}T12:00:00`);
  const opcoes = { day: "2-digit", month: "short" };
  return `${primeiroDia.toLocaleDateString("pt-BR", opcoes)} – ${ultimoDia.toLocaleDateString("pt-BR", opcoes)}`;
}
