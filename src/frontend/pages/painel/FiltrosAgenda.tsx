import type { Profissional, Usuario } from "@/lib/api";
import { statusLabels } from "./agendaVisualizacao";

export type FiltrosAgendamento = {
  cliente: string;
  profissional: string;
  data: string;
  status: string;
};

type Props = {
  filtros: FiltrosAgendamento;
  clientes: Usuario[];
  profissionais: Profissional[];
  alterarFiltro: (campo: keyof FiltrosAgendamento, valor: string) => void;
};

function FiltroSelecao({
  titulo,
  valor,
  alterar,
  children,
}: {
  titulo: string;
  valor: string;
  alterar: (valor: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="rotulo-filtro-agenda">
      {titulo}
      <select
        value={valor}
        onChange={(event) => alterar(event.target.value)}
        className="campo-filtro-agenda selecao-filtro-agenda"
      >
        {children}
      </select>
    </label>
  );
}

export function FiltrosAgenda({ filtros, clientes, profissionais, alterarFiltro }: Props) {
  return (
    <div className="filtros-agendamentos">
      <FiltroSelecao
        titulo="Cliente"
        valor={filtros.cliente}
        alterar={(valor) => alterarFiltro("cliente", valor)}
      >
        <option value="">Todos os clientes</option>
        {clientes.map((cliente) => (
          <option
            key={cliente.id}
            value={cliente.id}
          >
            {cliente.nome}
          </option>
        ))}
      </FiltroSelecao>
      <FiltroSelecao
        titulo="Funcionário"
        valor={filtros.profissional}
        alterar={(valor) => alterarFiltro("profissional", valor)}
      >
        <option value="">Todos os funcionários</option>
        {profissionais.map((profissional) => (
          <option
            key={profissional.id}
            value={profissional.id}
          >
            {profissional.nome}
          </option>
        ))}
      </FiltroSelecao>
      <label className="rotulo-filtro-agenda">
        Data
        <input
          type="date"
          value={filtros.data}
          onChange={(event) => alterarFiltro("data", event.target.value)}
          className="campo-filtro-agenda"
        />
      </label>
      <FiltroSelecao
        titulo="Status"
        valor={filtros.status}
        alterar={(valor) => alterarFiltro("status", valor)}
      >
        <option value="">Todos os status</option>
        {Object.entries(statusLabels).map(([valor, titulo]) => (
          <option
            key={valor}
            value={valor}
          >
            {titulo}
          </option>
        ))}
      </FiltroSelecao>
    </div>
  );
}
