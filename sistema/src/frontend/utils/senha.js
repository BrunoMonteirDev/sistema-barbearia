/** Papel do módulo: Reúne validações de senha usadas pela interface antes do envio ao backend. */
const simbolos = "!@#$%*?_-";
export function gerarSenhaForte(tamanho = 14) {
  const grupos = [
    "ABCDEFGHJKLMNPQRSTUVWXYZ",
    "abcdefghijkmnopqrstuvwxyz",
    "23456789",
    simbolos,
  ];
  const caracteres = grupos.join("");
  const comprimento = Math.max(10, Math.floor(tamanho));
  for (let tentativa = 0; tentativa < 100; tentativa++) {
    const valores = new Uint32Array(comprimento);
    crypto.getRandomValues(valores);
    const senha = grupos.map(
      (grupo, indice) => grupo[valores[indice] % grupo.length],
    );
    for (let indice = senha.length; indice < comprimento; indice++)
      senha.push(caracteres[valores[indice] % caracteres.length]);
    // Fisher-Yates evita o viés do sort aleatório e mantém a fonte criptográfica.
    for (let indice = senha.length - 1; indice > 0; indice--) {
      const aleatorio = new Uint32Array(1);
      crypto.getRandomValues(aleatorio);
      const destino = aleatorio[0] % (indice + 1);
      [senha[indice], senha[destino]] = [senha[destino], senha[indice]];
    }
    const candidata = senha.join("");
    if (!validarSenha(candidata)) return candidata;
  }
  throw new Error("Não foi possível gerar uma senha segura.");
}
function temSequenciaNumerica(senha) {
  const numeros = "0123456789";
  const inverso = numeros.split("").reverse().join("");
  for (let indice = 0; indice <= senha.length - 3; indice++) {
    const trecho = senha.slice(indice, indice + 3);
    if (
      /^\d{3}$/.test(trecho) &&
      (numeros.includes(trecho) || inverso.includes(trecho))
    )
      return true;
  }
  return false;
}

export function requisitosSenha(senha) {
  return [
    { atendido: senha.length >= 10, mensagem: "Use pelo menos 10 caracteres." },
    { atendido: /[a-z]/.test(senha) && /[A-Z]/.test(senha), mensagem: "Use letras maiúsculas e minúsculas." },
    { atendido: /\d/.test(senha), mensagem: "Inclua pelo menos um número." },
    {
      atendido: [...simbolos].some((simbolo) => senha.includes(simbolo)),
      mensagem: "Inclua pelo menos um caractere especial.",
      detalhe: `(${[...simbolos].join(" ")})`,
    },
    { atendido: !/\s/.test(senha), mensagem: "A senha não pode conter espaços." },
    { atendido: !/(.)\1\1/.test(senha), mensagem: "Evite repetir o mesmo caractere três vezes." },
    { atendido: !temSequenciaNumerica(senha), mensagem: "Evite sequências numéricas, como 123." },
  ];
}

export function validarSenha(senha) {
  return requisitosSenha(senha).find(({ atendido }) => !atendido)?.mensagem ?? null;
}
