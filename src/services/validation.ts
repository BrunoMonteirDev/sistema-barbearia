export function requiredText(value: unknown, label: string) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} é obrigatório.`)
  return value.trim()
}

export function optionalText(value: unknown) { return typeof value === 'string' && value.trim() ? value.trim() : null }

export function booleanValue(value: unknown, defaultValue = true) { return typeof value === 'boolean' ? value : defaultValue }

export function positiveNumber(value: unknown, label: string) {
  const number = Number(value)
  if (!Number.isFinite(number) || number <= 0) throw new Error(`${label} deve ser maior que zero.`)
  return number
}
