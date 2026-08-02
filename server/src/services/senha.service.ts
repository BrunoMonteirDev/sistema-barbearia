export function validarSenha(senha: string) {
  if (senha.length < 10) return 'Use pelo menos 10 caracteres.'
  if (!/[a-z]/.test(senha) || !/[A-Z]/.test(senha)) return 'Use letras maiúsculas e minúsculas.'
  if (!/\d/.test(senha)) return 'Inclua pelo menos um número.'
  if (!/[!@#$%*?_\-]/.test(senha)) return 'Inclua pelo menos um caractere especial.'
  if (/\s/.test(senha)) return 'A senha não pode conter espaços.'
  if (/(.)\1\1/.test(senha)) return 'Evite repetir o mesmo caractere três vezes.'
  const sequencia = '0123456789'
  const inversa = sequencia.split('').reverse().join('')
  for (let index = 0; index <= senha.length - 3; index++) {
    const trecho = senha.slice(index, index + 3)
    if (/^\d{3}$/.test(trecho) && (sequencia.includes(trecho) || inversa.includes(trecho))) return 'Evite sequências numéricas, como 123.'
  }
  return null
}
