import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { api, type RegrasAgendamento } from "@/lib/api";

export const regrasPadrao: RegrasAgendamento = { antecedenciaCancelamentoHoras: 24, antecedenciaRemarcacaoHoras: 24, antecedenciaAgendamentoMinutos: 30, toleranciaAtrasoMinutos: 0 };

export function useRegrasNegocio() {
  const [regras, setRegras] = useState<RegrasAgendamento>(regrasPadrao);
  const [salvando, setSalvando] = useState(false);
  useEffect(() => { void api.configuracoes.regras().then(setRegras).catch((error) => toast.error(error.message)); }, []);
  const alterarRegra = (nome: keyof RegrasAgendamento, valor: number) => setRegras((atual) => ({ ...atual, [nome]: valor }));
  const salvarRegras = async (event: FormEvent) => { event.preventDefault(); setSalvando(true); try { await api.configuracoes.salvarRegras(regras); toast.success("Regras de negócio atualizadas."); } catch (error) { toast.error(error instanceof Error ? error.message : "Não foi possível salvar."); } finally { setSalvando(false); } };
  return { regras, salvando, alterarRegra, salvarRegras };
}
