import { useState } from "react";
import { ArrowDown, ArrowDownUp, ArrowUp } from "lucide-react";
import "./OrdenacaoPainel.css";

const comparador = new Intl.Collator("pt-BR", { sensitivity: "base", numeric: true });

export function useOrdenacao(campoInicial) {
  const [ordenacao, definirOrdenacao] = useState({ campo: campoInicial, direcao: "asc" });

  function alternar(campo) {
    definirOrdenacao((atual) => ({
      campo,
      direcao: atual.campo === campo && atual.direcao === "asc" ? "desc" : "asc",
    }));
  }

  function ordenar(itens, campos) {
    const obterValor = campos[ordenacao.campo];
    if (!obterValor) return itens;
    const direcao = ordenacao.direcao === "asc" ? 1 : -1;

    return [...itens].sort((a, b) => {
      const primeiro = obterValor(a);
      const segundo = obterValor(b);
      const primeiroAusente = primeiro == null || primeiro === "" || Number.isNaN(primeiro);
      const segundoAusente = segundo == null || segundo === "" || Number.isNaN(segundo);
      if (primeiroAusente || segundoAusente) return Number(primeiroAusente) - Number(segundoAusente);

      const comparacao = typeof primeiro === "number" && typeof segundo === "number"
        ? primeiro - segundo
        : comparador.compare(primeiro, segundo);
      return direcao * comparacao;
    });
  }

  return { ordenacao, definirOrdenacao, alternar, ordenar };
}

export function CabecalhoOrdenavel({ campo, ordenacao, alternar, className, children }) {
  const ativo = ordenacao.campo === campo;
  const crescente = ordenacao.direcao === "asc";
  const Icone = ativo ? (crescente ? ArrowUp : ArrowDown) : ArrowDownUp;

  return (
    <th scope="col" className={className} aria-sort={ativo ? (crescente ? "ascending" : "descending") : undefined}>
      <button type="button" className="botao-ordenar-painel" onClick={() => alternar(campo)}>
        {children}
        <Icone aria-hidden="true" size={14} />
      </button>
    </th>
  );
}

export function SelecaoOrdenacao({ ordenacao, definirOrdenacao, opcoes }) {
  return (
    <label className="selecao-ordenacao-painel">
      Ordenar por
      <select
        value={ordenacao.campo ? `${ordenacao.campo}:${ordenacao.direcao}` : ""}
        onChange={(event) => {
          const [campo, direcao = "asc"] = event.target.value.split(":");
          definirOrdenacao({ campo, direcao });
        }}
      >
        <option value="">Ordem padrão</option>
        {Object.entries(opcoes).map(([campo, rotulo]) => (
          <optgroup key={campo} label={rotulo}>
            <option value={`${campo}:asc`}>{rotulo} (crescente)</option>
            <option value={`${campo}:desc`}>{rotulo} (decrescente)</option>
          </optgroup>
        ))}
      </select>
    </label>
  );
}
