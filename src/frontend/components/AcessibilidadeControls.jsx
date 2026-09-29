import "./AcessibilidadeControls.css";
import { useEffect, useRef, useState } from "react";
import { Accessibility, Eye, Square, Type, Volume2 } from "lucide-react";
import { useLocation } from "wouter";
import { useSpeechSynthesis } from "./useSpeechSynthesis";
const chave = "barbearia.acessibilidade";
const padrao = {
  altoContraste: false,
  fonteGrande: false,
  reduzirAnimacoes: false,
};
function carregar() {
  try {
    return { ...padrao, ...JSON.parse(localStorage.getItem(chave) ?? "{}") };
  } catch {
    return padrao;
  }
}
export function AcessibilidadeControls() {
  const [localizacao] = useLocation();
  const [aberto, setAberto] = useState(false);
  const [selecionandoLeitura, setSelecionandoLeitura] = useState(false);
  const [textoSelecionado, setTextoSelecionado] = useState("");
  const [posicaoDestaque, setPosicaoDestaque] = useState(null);
  const [itemInterativo, setItemInterativo] = useState(false);
  const ultimoElementoLido = useRef(null);
  const ultimoCliqueLeitura = useRef(0);
  const elementoDestacado = useRef(null);
  const [preferencias, setPreferencias] = useState(carregar);
  const { disponivel, lendo, ler, parar } = useSpeechSynthesis();
  useEffect(() => {
    localStorage.setItem(chave, JSON.stringify(preferencias));
    const raiz = document.documentElement;
    raiz.classList.toggle(
      "acessibilidade-alto-contraste",
      preferencias.altoContraste,
    );
    raiz.classList.toggle(
      "acessibilidade-fonte-grande",
      preferencias.fonteGrande,
    );
    raiz.classList.toggle(
      "acessibilidade-reduzir-animacoes",
      preferencias.reduzirAnimacoes,
    );
  }, [preferencias]);
  useEffect(() => {
    parar();
  }, [localizacao, parar]);
  useEffect(() => {
    document.documentElement.classList.toggle(
      "acessibilidade-leitura-ativa",
      selecionandoLeitura,
    );
    if (!selecionandoLeitura) return;
    const lerElemento = (event) => {
      const alvo = event.target instanceof Element ? event.target : null;
      if (
        !alvo ||
        alvo.closest(
          "[data-speech-ignore], [aria-label='Preferências de acessibilidade']",
        )
      )
        return;
      const elemento = alvo.closest(
        "[data-speech-text], h1, h2, h3, p, li, label, button, a",
      );
      const texto =
        elemento instanceof HTMLElement
          ? (elemento.dataset.speechText ?? elemento.textContent ?? "")
              .replace(/\s+/g, " ")
              .trim()
          : "";
      if (!elemento || !texto) return;
      const interativo = elemento.matches(
        "button, a, input, select, textarea, [role='button'], [role='link']",
      );
      const agora = Date.now();
      const confirmarAcao =
        interativo &&
        elemento === ultimoElementoLido.current &&
        agora - ultimoCliqueLeitura.current <= 1800;
      if (confirmarAcao) {
        elementoDestacado.current?.classList.remove(
          "acessibilidade-texto-em-leitura",
        );
        elementoDestacado.current = null;
        ultimoElementoLido.current = null;
        ultimoCliqueLeitura.current = 0;
        setTextoSelecionado("");
        setPosicaoDestaque(null);
        setItemInterativo(false);
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      elementoDestacado.current?.classList.remove(
        "acessibilidade-texto-em-leitura",
      );
      if (elemento instanceof HTMLElement) {
        elemento.classList.add("acessibilidade-texto-em-leitura");
        elementoDestacado.current = elemento;
        const retangulo = elemento.getBoundingClientRect();
        const abaixo = retangulo.top < 58;
        setPosicaoDestaque({
          x: Math.min(
            window.innerWidth - 170,
            Math.max(170, retangulo.left + retangulo.width / 2),
          ),
          y: abaixo ? retangulo.bottom + 12 : retangulo.top - 12,
          abaixo,
        });
      }
      ultimoElementoLido.current = interativo ? elemento : null;
      ultimoCliqueLeitura.current = interativo ? agora : 0;
      setItemInterativo(interativo);
      setTextoSelecionado(texto);
      ler(texto);
    };
    const desativarComEscape = (event) => {
      if (event.key === "Escape") setSelecionandoLeitura(false);
    };
    document.addEventListener("click", lerElemento, true);
    document.addEventListener("keydown", desativarComEscape);
    return () => {
      elementoDestacado.current?.classList.remove(
        "acessibilidade-texto-em-leitura",
      );
      elementoDestacado.current = null;
      document.documentElement.classList.remove("acessibilidade-leitura-ativa");
      document.removeEventListener("click", lerElemento, true);
      document.removeEventListener("keydown", desativarComEscape);
    };
  }, [selecionandoLeitura, ler]);
  const alternar = (campo) =>
    setPreferencias((atual) => ({ ...atual, [campo]: !atual[campo] }));
  const iniciarLeitura = () =>
    setSelecionandoLeitura((atual) => {
      if (atual) {
        setTextoSelecionado("");
        setPosicaoDestaque(null);
        setItemInterativo(false);
      }
      return !atual;
    });
  return (
    <>
      <aside
        className="controles-acessibilidade"
        aria-label="Preferências de acessibilidade"
        data-speech-ignore
      >
        {aberto && (
          <div
            id="opcoes-acessibilidade"
            className="painel-acessibilidade"
            role="dialog"
            aria-label="Opções de acessibilidade"
          >
            <div className="cabecalho-acessibilidade">
              <h2 className="titulo-acessibilidade">Acessibilidade</h2>
              <button
                type="button"
                onClick={() => setAberto(false)}
                aria-label="Fechar opções de acessibilidade"
                className="botao-fechar-acessibilidade"
              >
                ×
              </button>
            </div>
            <p className="descricao-acessibilidade">
              As preferências ficam salvas neste dispositivo.
            </p>
            <Opcao
              ativa={preferencias.altoContraste}
              aoAlternar={() => alternar("altoContraste")}
              icone={<Eye className="icone-acessibilidade" />}
              titulo="Alto contraste"
              descricao="Aumenta a diferença entre textos e fundos."
            />
            <Opcao
              ativa={preferencias.fonteGrande}
              aoAlternar={() => alternar("fonteGrande")}
              icone={<Type className="icone-acessibilidade" />}
              titulo="Texto maior"
              descricao="Aumenta o tamanho da fonte da página."
            />
            <Opcao
              ativa={preferencias.reduzirAnimacoes}
              aoAlternar={() => alternar("reduzirAnimacoes")}
              icone={<Accessibility className="icone-acessibilidade" />}
              titulo="Reduzir animações"
              descricao="Remove transições e movimentos não essenciais."
            />
            <div className="secao-leitura-acessibilidade">
              {disponivel ? (
                <button
                  type="button"
                  onClick={lendo ? parar : iniciarLeitura}
                  aria-label={lendo ? "Parar leitura" : "Leitura em voz alta"}
                  aria-pressed={selecionandoLeitura}
                  className="botao-leitura-acessibilidade"
                >
                  <span
                    className={`indicador-leitura-acessibilidade ${selecionandoLeitura ? "indicador-acessibilidade-ativo" : "indicador-acessibilidade-inativo"}`}
                  >
                    {lendo ? (
                      <Square className="icone-acessibilidade" />
                    ) : (
                      <Volume2 className="icone-acessibilidade" />
                    )}
                  </span>
                  <span>
                    <span className="titulo-opcao-acessibilidade">
                      {lendo
                        ? "Parar leitura"
                        : selecionandoLeitura
                          ? "Seta de leitura ativa"
                          : "Leitura em voz alta"}
                    </span>
                    <span className="descricao-opcao-acessibilidade">
                      {selecionandoLeitura
                        ? "1º clique lê; 2º clique no mesmo item confirma a ação."
                        : "Ative e clique em um texto da página."}
                    </span>
                  </span>
                </button>
              ) : (
                <p className="leitura-indisponivel-acessibilidade">
                  Leitura em voz alta não disponível neste navegador.
                </p>
              )}
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => setAberto((atual) => !atual)}
          aria-expanded={aberto}
          aria-controls="opcoes-acessibilidade"
          className="botao-abrir-acessibilidade"
        >
          <Accessibility className="icone-abrir-acessibilidade" />
          Acessibilidade
        </button>
      </aside>
      {selecionandoLeitura && (
        <div
          className="aviso-leitura-acessibilidade"
          role="status"
          data-speech-ignore
        >
          <p className="titulo-leitura-acessibilidade">
            ↗ Seta de leitura ativa
          </p>
          <p className="texto-leitura-acessibilidade">
            {textoSelecionado
              ? `Lendo: “${textoSelecionado.slice(0, 180)}${textoSelecionado.length > 180 ? "…" : ""}”`
              : "Clique em um texto para ouvi-lo. Botões e links exigem um segundo clique para abrir."}
          </p>
        </div>
      )}
      {posicaoDestaque && (
        <div
          className={`destaque-leitura-acessibilidade ${posicaoDestaque.abaixo ? "destaque-leitura-abaixo" : "destaque-leitura-acima"}`}
          style={{ left: posicaoDestaque.x, top: posicaoDestaque.y }}
          data-speech-ignore
        >
          <span aria-hidden>🔊</span>{" "}
          {itemInterativo
            ? "Lendo · clique novamente para abrir"
            : "Lendo texto"}
        </div>
      )}
    </>
  );
}
function Opcao({ ativa, aoAlternar, icone, titulo, descricao }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={ativa}
      onClick={aoAlternar}
      className="opcao-acessibilidade"
    >
      <span
        className={`indicador-opcao-acessibilidade ${ativa ? "indicador-acessibilidade-ativo" : "indicador-acessibilidade-inativo"}`}
      >
        {icone}
      </span>
      <span>
        <span className="titulo-opcao-acessibilidade">{titulo}</span>
        <span className="descricao-opcao-acessibilidade">{descricao}</span>
      </span>
      <span
        className={`trilho-opcao-acessibilidade ${ativa ? "trilho-opcao-ativo" : "trilho-opcao-inativo"}`}
      >
        <span
          className={`marcador-opcao-acessibilidade ${ativa ? "marcador-opcao-ativo" : "marcador-opcao-inativo"}`}
        />
      </span>
    </button>
  );
}
