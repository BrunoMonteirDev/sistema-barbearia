import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { api, type RegrasAgendamento } from "@/lib/api";

const padrao: RegrasAgendamento = {
  antecedenciaCancelamentoHoras: 24,
  antecedenciaRemarcacaoHoras: 24,
  toleranciaAtrasoMinutos: 0,
};

export default function RegrasNegocioPage() {
  const [regras, setRegras] = useState<RegrasAgendamento>(padrao);
  const [salvando, setSalvando] = useState(false);
  useEffect(() => {
    void api.configuracoes
      .regras()
      .then(setRegras)
      .catch((error) => toast.error(error.message));
  }, []);
  const salvar = async (event: FormEvent) => {
    event.preventDefault();
    setSalvando(true);
    try {
      await api.configuracoes.salvarRegras(regras);
      toast.success("Regras de negócio atualizadas.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível salvar.",
      );
    } finally {
      setSalvando(false);
    }
  };
  const campo = (
    nome: keyof RegrasAgendamento,
    label: string,
    ajuda: string,
  ) => (
    <label className="block text-sm font-semibold text-slate-800">
      {label}
      <input
        className="input-field mt-1"
        min="0"
        max="720"
        step="1"
        type="number"
        value={regras[nome]}
        onChange={(event) =>
          setRegras((atual) => ({
            ...atual,
            [nome]: Number(event.target.value),
          }))
        }
      />
      <span className="mt-1 block text-xs font-normal text-slate-600">
        {ajuda}
      </span>
    </label>
  );
  return (
    <section className="mx-auto max-w-xl">
      <p className="text-sm font-semibold text-primary-700">Configurações</p>
      <h1 className="text-2xl font-bold text-slate-950">Regras de negócio</h1>
      <p className="mt-1 text-slate-600">
        Os valores são aplicados imediatamente a novos cancelamentos,
        remarcações e atrasos.
      </p>
      <form
        onSubmit={salvar}
        className="mt-6 space-y-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      >
        {campo(
          "antecedenciaCancelamentoHoras",
          "Antecedência para cancelar (horas)",
          "Clientes só poderão cancelar dentro desta antecedência. Administradores não possuem essa limitação.",
        )}
        {campo(
          "antecedenciaRemarcacaoHoras",
          "Antecedência para remarcar (horas)",
          "Clientes só poderão remarcar dentro desta antecedência. Administradores não possuem essa limitação.",
        )}
        {campo(
          "toleranciaAtrasoMinutos",
          "Tolerância de atraso (minutos)",
          "Após esse período, atendimentos pendentes ou confirmados recebem o status Atrasado.",
        )}
        <button disabled={salvando} className="btn-primary">
          {salvando ? "Salvando..." : "Salvar regras"}
        </button>
      </form>
    </section>
  );
}
