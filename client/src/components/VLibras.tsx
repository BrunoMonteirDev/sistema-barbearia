import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

declare global {
  interface Window { VLibras?: { Widget: new (config: { rootPath: string; position: string }) => unknown } }
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
        new window.VLibras.Widget({ rootPath: "https://vlibras.gov.br/app", position: "BR" });
        document.documentElement.dataset.vlibrasInicializado = "true";
        // O plugin oficial conclui sua montagem no evento window.onload. Em
        // uma SPA, o script pode ser incluído depois que esse evento já ocorreu.
        // Nesse caso, acionamos a rotina uma vez para criar o botão do widget.
        if (document.readyState === "complete") window.onload?.(new Event("load"));
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
    iniciar();
    return () => { script.onload = null; };
  }, [localizacao]);

  if (localizacao.startsWith("/painel")) return null;
  return <div ref={raizRef} className="enabled"><div ref={botaoRef} className="active" /><div ref={conteudoRef}><div ref={topoRef} className="vw-plugin-top-wrapper" /></div></div>;
}
