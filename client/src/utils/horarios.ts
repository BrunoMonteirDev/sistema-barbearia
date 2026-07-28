export const DIAS_SEMANA = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda' },
  { value: 2, label: 'Terça' },
  { value: 3, label: 'Quarta' },
  { value: 4, label: 'Quinta' },
  { value: 5, label: 'Sexta' },
  { value: 6, label: 'Sábado' },
]

export function obterBlocos(inicio = '08:00', fim = '18:00') {
  const blocos: string[] = []
  let atual = toMinutes(inicio)
  const limite = toMinutes(fim)
  while (atual < limite) {
    blocos.push(toTime(atual))
    atual += 30
  }
  return blocos
}

export function arredondarDuracaoParaBloco(duracao: number) {
  if (!Number.isFinite(duracao) || duracao <= 0) return 30
  return Math.ceil(duracao / 30) * 30
}

function toMinutes(value: string) {
  const [hour, minute] = value.split(':').map(Number)
  return hour * 60 + minute
}

function toTime(value: number) {
  return `${Math.floor(value / 60).toString().padStart(2, '0')}:${(value % 60).toString().padStart(2, '0')}`
}
