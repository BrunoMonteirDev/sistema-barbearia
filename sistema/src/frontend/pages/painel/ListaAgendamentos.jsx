/** Papel do módulo: Renderiza os agendamentos em tabela e oferece ações contextuais para cada reserva. */
import { CheckCircle2, Eye, XCircle } from "lucide-react";
import { statusLabels, statusStyle } from "./agendaVisualizacao";
import { CabecalhoOrdenavel } from "./OrdenacaoPainel";

const colunas = [
  ["cliente", "Cliente", (item) => item.usuario?.nome],
  ["funcionario", "Funcionário", (item) => item.profissional?.nome],
  ["servico", "Serviço", (item) => item.servico?.nome],
  ["data", "Data", (item) => `${item.data}T${item.hora}`],
  ["hora", "Hora", (item) => item.hora],
  ["valor", "Valor", (item) => item.servico?.preco == null ? undefined : Number(item.servico.preco)],
  ["status", "Status", (item) => statusLabels[item.status] ?? item.status],
];
const campos = Object.fromEntries(colunas.map(([campo, , selecionar]) => [campo, selecionar]));

function Acao({ titulo, executar, disabled, children }) {
  return (
    <button
      type="button"
      onClick={executar}
      disabled={disabled}
      aria-label={titulo}
      title={titulo}
      className="botao-acao-agenda"
    >
      {children}
    </button>
  );
}
export function ListaAgendamentos({
  agendamentos,
  ordenacaoLista: { ordenacao, alternar, ordenar },
  confirmar,
  concluir,
  visualizar,
  cancelar,
}) {
  return (
    <div className="lista-agendamentos">
      <table className="tabela-agendamentos">
        <thead className="cabecalho-tabela-agenda">
          <tr>
            {colunas.map(([campo, titulo]) => (
              <CabecalhoOrdenavel
                key={campo}
                campo={campo}
                ordenacao={ordenacao}
                alternar={alternar}
                className="titulo-coluna-agenda"
              >
                {titulo}
              </CabecalhoOrdenavel>
            ))}
            <th scope="col" className="titulo-coluna-agenda">Ações</th>
          </tr>
        </thead>
        <tbody className="corpo-tabela-agenda">
          {ordenar(agendamentos, campos).map((agendamento) => (
            <tr key={agendamento.id} className="linha-tabela-agenda">
              <td className="celula-agenda cliente-agendamento">
                {agendamento.usuario?.nome ?? "—"}
              </td>
              <td className="celula-agenda">
                {agendamento.profissional?.nome ?? "—"}
              </td>
              <td className="celula-agenda">
                {agendamento.servico?.nome ?? "—"}
              </td>
              <td className="celula-agenda">{agendamento.data}</td>
              <td className="celula-agenda">{agendamento.hora}</td>
              <td className="celula-agenda">
                {agendamento.servico
                  ? Number(agendamento.servico.preco).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })
                  : "—"}
              </td>
              <td className="celula-agenda">
                <span
                  className={`status-agendamento-admin ${statusStyle[agendamento.status] ?? "status-agenda-desconhecido"}`}
                >
                  {statusLabels[agendamento.status] ?? agendamento.status}
                </span>
              </td>
              <td className="celula-agenda">
                <div className="acoes-agendamento-admin">
                  {agendamento.status === "PENDENTE" && (
                    <button
                      type="button"
                      aria-label="Confirmar agendamento"
                      title="Confirmar agendamento"
                      className="botao-confirmar-agenda"
                      onClick={() => void confirmar(agendamento)}
                    >
                      <CheckCircle2 className="icone-agenda" />
                      Confirmar
                    </button>
                  )}
                  {["CONFIRMADO", "ATRASADO"].includes(agendamento.status) && (
                    <button
                      type="button"
                      aria-label="Concluir agendamento"
                      title="Concluir agendamento"
                      className="botao-concluir-agenda"
                      onClick={() => void concluir(agendamento)}
                    >
                      <CheckCircle2 className="icone-agenda" />
                      Concluir
                    </button>
                  )}
                  <Acao
                    titulo="Visualizar"
                    executar={() => visualizar(agendamento)}
                  >
                    <Eye className="icone-agenda" />
                  </Acao>
                  <Acao
                    titulo="Cancelar"
                    executar={() => cancelar(agendamento)}
                    disabled={agendamento.status === "CANCELADO"}
                  >
                    <XCircle className="icone-agenda" />
                  </Acao>
                </div>
              </td>
            </tr>
          ))}
          {agendamentos.length === 0 && (
            <tr>
              <td colSpan={colunas.length + 1} className="mensagem-lista-vazia-agenda">
                Nenhum agendamento encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
