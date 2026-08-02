const simbolos = '!@#$%*?_-'

export function gerarSenhaForte(tamanho = 14) {
  const grupos = ['ABCDEFGHJKLMNPQRSTUVWXYZ', 'abcdefghijkmnopqrstuvwxyz', '23456789', simbolos]
  const caracteres = grupos.join('')
  const valores = new Uint32Array(tamanho)
  crypto.getRandomValues(valores)
  const senha = grupos.map((grupo, indice) => grupo[valores[indice] % grupo.length])
  for (let indice = senha.length; indice < tamanho; indice++) senha.push(caracteres[valores[indice] % caracteres.length])
  return senha.sort(() => crypto.getRandomValues(new Uint32Array(1))[0] - 2 ** 31).join('')
}

export function validarSenha(senha: string) {
  if (senha.length < 10) return 'Use pelo menos 10 caracteres.'
  if (!/[a-z]/.test(senha) || !/[A-Z]/.test(senha)) return 'Use letras maiúsculas e minúsculas.'
  if (!/\d/.test(senha)) return 'Inclua pelo menos um número.'
  if (!/[!@#$%*?_\-]/.test(senha)) return 'Inclua pelo menos um caractere especial.'
  if (/\s/.test(senha)) return 'A senha não pode conter espaços.'
  if (/(.)\1\1/.test(senha)) return 'Evite repetir o mesmo caractere três vezes.'
  const numeros = '0123456789'
  const inverso = numeros.split('').reverse().join('')
  for (let indice = 0; indice <= senha.length - 3; indice++) {
    const trecho = senha.slice(indice, indice + 3)
    if (/^\d{3}$/.test(trecho) && (numeros.includes(trecho) || inverso.includes(trecho))) return 'Evite sequências numéricas, como 123.'
  }
  return null
}
