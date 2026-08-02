import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

declare global {
  interface Window { VLibras?: { Widget: new (url: string) => unknown } }
}

const scriptId = "vlibras-plugin";

export function VLibras() {
  const [localizacao] = useLocation();
  const raizRef = useRef<HTMLDivElement>(null);
  const botaoRef = useRef<HTMLDivElement>(null);
  const conteudoRef = useRef<HTMLDivElement>(null);
  const topoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (localizacao.startsWith("/painel")) return;
    raizRef.current?.setAttribute("vw", "");
    botaoRef.current?.setAttribute("vw-access-button", "");
    conteudoRef.current?.setAttribute("vw-plugin-wrapper", "");
    topoRef.current?.setAttribute("vw-plugin-top-wrapper", "");
    const iniciar = () => {
      if (window.VLibras && !document.documentElement.dataset.vlibrasInicializado) {
        new window.VLibras.Widget("https://vlibras.gov.br/app");
        document.documentElement.dataset.vlibrasInicializado = "true";
      }
    };
    const existente = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (existente) { existente.addEventListener("load", iniciar); iniciar(); return () => existente.removeEventListener("load", iniciar); }
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
    script.async = true;
    script.onload = iniciar;
    document.body.appendChild(script);
    return () => { script.onload = null; };
  }, [localizacao]);

  if (localizacao.startsWith("/painel")) return null;
  return <div ref={raizRef} className="enabled"><div ref={botaoRef} /><div ref={conteudoRef}><div ref={topoRef} /></div></div>;
}
