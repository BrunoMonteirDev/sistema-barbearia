import { useEffect } from "react";

const seletorFocaveis = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [role="switch"]:not([disabled]), [tabindex]:not([tabindex="-1"])';

function campoComSetasNativas(elemento: HTMLElement) {
  return elemento.matches('input, textarea, select, [contenteditable="true"]');
}

/** Permite percorrer controles acionáveis com as setas sem interferir na edição de campos. */
export function KeyboardArrowNavigation() {
  useEffect(() => {
    const navegar = (event: KeyboardEvent) => {
      if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(event.key) || event.altKey || event.ctrlKey || event.metaKey) return;
      const atual = document.activeElement;
      if (!(atual instanceof HTMLElement) || campoComSetasNativas(atual)) return;

      const limite = atual.closest('[role="dialog"]') ?? document;
      const focaveis = Array.from(limite.querySelectorAll<HTMLElement>(seletorFocaveis)).filter((elemento) => !elemento.hasAttribute("aria-hidden"));
      const indice = focaveis.indexOf(atual);
      if (indice < 0 || focaveis.length < 2) return;

      event.preventDefault();
      const avancar = event.key === "ArrowRight" || event.key === "ArrowDown";
      const destino = (indice + (avancar ? 1 : -1) + focaveis.length) % focaveis.length;
      focaveis[destino].focus();
    };

    document.addEventListener("keydown", navegar);
    return () => document.removeEventListener("keydown", navegar);
  }, []);

  return null;
}
