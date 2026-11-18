import { Copy, Eraser, ListChecks } from "lucide-react";
import { DIAS_SEMANA, obterBlocos } from "@/utils/horarios";
const blocos = obterBlocos("00:00", "24:00");
export function EditorHorariosFuncionario({
  funcionarios,
  funcionarioEditado,
  disponibilidade,
  diaSelecionado,
  diaOrigem,
  copiarDeFuncionarioId,
  selecionarDia,
  selecionarOrigem,
  selecionarFuncionarioOrigem,
  marcarDia,
  alternarHorario,
  copiarDia,
  copiarSemana,
}) {
  const nomeDiaSelecionado = DIAS_SEMANA.find(
    (dia) => dia.value === diaSelecionado,
  )?.label;
  const nomeDiaOrigem = DIAS_SEMANA.find(
    (dia) => dia.value === diaOrigem,
  )?.label;
  const horariosDoDia = disponibilidade[diaSelecionado] ?? [];
  const outrosFuncionarios = funcionarios.filter(
    (funcionario) => funcionario.id !== funcionarioEditado?.id,
  );
  return (
    <div className="disponibilidade-profissional">
      <div className="aviso-disponibilidade-profissional">
        <strong>{blocos.length} horários disponíveis</strong> em blocos de 30
        minutos, de 00:00 a 23:30.
      </div>
      <div className="selecao-dias-profissional">
        <label className="rotulo-dia-profissional">
          <span className="titulo-dia-profissional">
            1. Dia de destino
            <br />
            (que você está editando)
          </span>
          <select
            aria-label="Dia de destino"
            className="campo-profissional"
            value={diaSelecionado}
            onChange={(event) => selecionarDia(Number(event.target.value))}
          >
            {DIAS_SEMANA.map((dia) => (
              <option key={dia.value} value={dia.value}>
                {dia.label}
              </option>
            ))}
          </select>
        </label>
        <label className="rotulo-dia-profissional">
          <span className="titulo-dia-profissional">
            2. Copiar horários de:
          </span>
          <select
            aria-label="Copiar horários de"
            className="campo-profissional"
            value={diaOrigem}
            onChange={(event) => selecionarOrigem(Number(event.target.value))}
          >
            {DIAS_SEMANA.map((dia) => (
              <option key={dia.value} value={dia.value}>
                {dia.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="orientacao-disponibilidade-profissional">
        Você está editando os horários de <strong>{nomeDiaSelecionado}</strong>.
        Para repetir uma jornada, use <strong>{nomeDiaOrigem}</strong> como
        modelo: os horários dele serão copiados para{" "}
        <strong>{nomeDiaSelecionado}</strong>.
      </p>
      <div className="acoes-disponibilidade-profissional">
        <button
          type="button"
          onClick={() => marcarDia(blocos)}
          className="botao-marcar-profissional"
        >
          <ListChecks className="icone-profissional" />
          Marcar tudo
        </button>
        <button
          type="button"
          onClick={() => marcarDia([])}
          disabled={horariosDoDia.length === 0}
          className="botao-desmarcar-profissional"
        >
          <Eraser className="icone-profissional" />
          Desmarcar tudo
        </button>
        <button
          type="button"
          onClick={copiarDia}
          disabled={diaOrigem === diaSelecionado}
          className="botao-copiar-dia-profissional"
        >
          <Copy className="icone-profissional" />
          Copiar dia
        </button>
      </div>
      <div className="copiar-semana-profissional">
        <p className="titulo-copiar-semana-profissional">
          Copiar a semana inteira de outro funcionário
        </p>
        <div className="acoes-copiar-semana-profissional">
          <select
            className="campo-profissional campo-origem-profissional"
            value={copiarDeFuncionarioId}
            onChange={(event) =>
              selecionarFuncionarioOrigem(event.target.value)
            }
          >
            <option value="">Selecione um funcionário</option>
            {outrosFuncionarios.map((funcionario) => (
              <option key={funcionario.id} value={funcionario.id}>
                {funcionario.nome}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={copiarSemana}
            disabled={!copiarDeFuncionarioId}
            className="botao-copiar-semana-profissional"
          >
            <Copy className="icone-profissional" />
            Copiar semana
          </button>
        </div>
      </div>
      <div className="grade-horarios-profissional">
        <p className="resumo-horarios-profissional">
          {horariosDoDia.length} horários marcados em {nomeDiaSelecionado}.
        </p>
        {blocos.map((hora) => (
          <label key={hora} className="horario-profissional">
            <input
              type="checkbox"
              checked={horariosDoDia.includes(hora)}
              onChange={() => alternarHorario(hora)}
            />
            {hora}
          </label>
        ))}
      </div>
    </div>
  );
}
