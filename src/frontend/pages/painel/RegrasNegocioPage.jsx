import "./RegrasNegocioPage.css";
import { useRegrasNegocio } from "./useRegrasNegocio";
export default function RegrasNegocioPage() {
  const { regras, salvando, alterarRegra, salvarRegras } = useRegrasNegocio();
  const campo = (nome, label, ajuda) => (
    <label htmlFor={nome} className="rotulo-regras-negocio">
      {label}
      <input
        id={nome}
        className="campo-regras-negocio"
        min="0"
        max={nome === "antecedenciaAgendamentoMinutos" ? undefined : 720}
        step="1"
        type="number"
        value={regras[nome]}
        onChange={(event) => alterarRegra(nome, Number(event.target.value))}
      />
      <span className="ajuda-regras-negocio">{ajuda}</span>
    </label>
  );
  return (
    <section className="pagina-regras-negocio">
      <p className="identificacao-regras-negocio">Configurações</p>
      <h1 className="titulo-regras-negocio">Regras de negócio</h1>
      <p className="descricao-regras-negocio">
        Os valores são aplicados imediatamente a novos cancelamentos,
        remarcações e atrasos.
      </p>
      <form onSubmit={salvarRegras} className="formulario-regras-negocio">
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
          "antecedenciaAgendamentoMinutos",
          "Aviso de proximidade para novos agendamentos (minutos)",
          "Exibe um aviso quando a reserva estiver próxima do horário escolhido, sem impedir a confirmação.",
        )}
        {campo(
          "toleranciaAtrasoMinutos",
          "Tolerância de atraso (minutos)",
          "Após esse período, atendimentos pendentes ou confirmados recebem o status Atrasado.",
        )}
        <button disabled={salvando} className="botao-salvar-regras-negocio">
          {salvando ? "Salvando..." : "Salvar regras"}
        </button>
      </form>
    </section>
  );
}
