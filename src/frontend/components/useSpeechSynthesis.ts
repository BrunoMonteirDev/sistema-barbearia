import { useCallback, useEffect, useRef, useState } from "react";

function recursoDisponivel() {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof window.SpeechSynthesisUtterance === "function"
  );
}

function dividirTextoParaFala(texto: string, limite = 220) {
  const frases = texto.match(/[^.!?]+[.!?]*/g) ?? [texto];
  const trechos: string[] = [];
  let atual = "";
  for (const frase of frases) {
    const limpa = frase.trim();
    if (!limpa) continue;
    if (`${atual} ${limpa}`.trim().length <= limite) atual = `${atual} ${limpa}`.trim();
    else {
      if (atual) trechos.push(atual);
      if (limpa.length <= limite) atual = limpa;
      else {
        const palavras = limpa.split(/\s+/);
        atual = "";
        for (const palavra of palavras) {
          if (`${atual} ${palavra}`.trim().length > limite) {
            if (atual) trechos.push(atual);
            atual = palavra;
          } else atual = `${atual} ${palavra}`.trim();
        }
      }
    }
  }
  if (atual) trechos.push(atual);
  return trechos;
}

export function useSpeechSynthesis() {
  const [disponivel] = useState(recursoDisponivel);
  const [lendo, setLendo] = useState(false);
  const leituraAtual = useRef(0);

  const parar = useCallback(() => {
    leituraAtual.current += 1;
    if (!recursoDisponivel()) return;
    window.speechSynthesis.cancel();
    setLendo(false);
  }, []);

  const ler = useCallback((texto: string) => {
    if (!recursoDisponivel() || !texto) return;
    const identificador = leituraAtual.current + 1;
    leituraAtual.current = identificador;
    window.speechSynthesis.cancel();
    const trechos = dividirTextoParaFala(texto);
    let indice = 0;
    const proximo = () => {
      if (leituraAtual.current !== identificador) return;
      const trecho = trechos[indice++];
      if (!trecho) {
        setLendo(false);
        return;
      }
      const fala = new window.SpeechSynthesisUtterance(trecho);
      fala.lang = "pt-BR";
      fala.rate = 1;
      fala.onend = proximo;
      fala.onerror = () => {
        if (leituraAtual.current === identificador) setLendo(false);
      };
      window.speechSynthesis.speak(fala);
      window.speechSynthesis.resume?.();
    };
    setLendo(true);
    proximo();
  }, []);

  useEffect(
    () => () => {
      if (recursoDisponivel()) window.speechSynthesis.cancel();
    },
    [],
  );

  return { disponivel, lendo, ler, parar };
}
