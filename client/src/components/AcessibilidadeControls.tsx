import { useEffect, useState, type ReactNode } from "react";
import { Accessibility, Eye, Type } from "lucide-react";

type Preferencias = { altoContraste: boolean; fonteGrande: boolean; reduzirAnimacoes: boolean };
const chave = "barbearia.acessibilidade";
const padrao: Preferencias = { altoContraste: false, fonteGrande: false, reduzirAnimacoes: false };

function carregar(): Preferencias {
  try { return { ...padrao, ...JSON.parse(localStorage.getItem(chave) ?? "{}") }; }
  catch { return padrao; }
}

export function AcessibilidadeControls() {
  const [aberto, setAberto] = useState(false);
  const [preferencias, setPreferencias] = useState<Preferencias>(carregar);

  useEffect(() => {
    localStorage.setItem(chave, JSON.stringify(preferencias));
    const raiz = document.documentElement;
    raiz.classList.toggle("acessibilidade-alto-contraste", preferencias.altoContraste);
    raiz.classList.toggle("acessibilidade-fonte-grande", preferencias.fonteGrande);
    raiz.classList.toggle("acessibilidade-reduzir-animacoes", preferencias.reduzirAnimacoes);
  }, [preferencias]);

  const alternar = (campo: keyof Preferencias) => setPreferencias((atual) => ({ ...atual, [campo]: !atual[campo] }));

  return <aside className="fixed bottom-4 left-4 z-50" aria-label="Preferências de acessibilidade">
    {aberto && <div id="opcoes-acessibilidade" className="mb-3 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-xl" role="dialog" aria-label="Opções de acessibilidade"><div className="mb-3 flex items-center justify-between"><h2 className="font-bold text-slate-950">Acessibilidade</h2><button type="button" onClick={() => setAberto(false)} aria-label="Fechar opções de acessibilidade" className="rounded p-1 text-slate-600 hover:bg-slate-100">×</button></div><p className="mb-3 text-sm text-slate-600">As preferências ficam salvas neste dispositivo.</p><Opcao ativa={preferencias.altoContraste} aoAlternar={() => alternar("altoContraste")} icone={<Eye className="h-4 w-4" />} titulo="Alto contraste" descricao="Aumenta a diferença entre textos e fundos." /><Opcao ativa={preferencias.fonteGrande} aoAlternar={() => alternar("fonteGrande")} icone={<Type className="h-4 w-4" />} titulo="Texto maior" descricao="Aumenta o tamanho da fonte da página." /><Opcao ativa={preferencias.reduzirAnimacoes} aoAlternar={() => alternar("reduzirAnimacoes")} icone={<Accessibility className="h-4 w-4" />} titulo="Reduzir animações" descricao="Remove transições e movimentos não essenciais." /></div>}
    <button type="button" onClick={() => setAberto((atual) => !atual)} aria-expanded={aberto} aria-controls="opcoes-acessibilidade" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"><Accessibility className="h-5 w-5" />Acessibilidade</button>
  </aside>;
}

function Opcao({ ativa, aoAlternar, icone, titulo, descricao }: { ativa: boolean; aoAlternar: () => void; icone: ReactNode; titulo: string; descricao: string }) {
  return <button type="button" role="switch" aria-checked={ativa} onClick={aoAlternar} className="mb-2 flex w-full items-start gap-3 rounded-lg p-2 text-left hover:bg-slate-50"><span className={`mt-0.5 grid h-7 w-7 place-items-center rounded-full ${ativa ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-600"}`}>{icone}</span><span><span className="block text-sm font-semibold text-slate-900">{titulo}</span><span className="block text-xs text-slate-600">{descricao}</span></span><span className={`ml-auto mt-1 h-4 w-7 rounded-full p-0.5 ${ativa ? "bg-primary-600" : "bg-slate-300"}`}><span className={`block h-3 w-3 rounded-full bg-white transition-transform ${ativa ? "translate-x-3" : "translate-x-0"}`} /></span></button>;
}
