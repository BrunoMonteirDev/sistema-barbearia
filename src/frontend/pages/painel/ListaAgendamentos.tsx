import { CheckCircle2, Eye, Pencil, Trash2, XCircle } from "lucide-react";
import type { Agendamento } from "@/lib/api";
import { statusLabels, statusStyle } from "./agendaVisualizacao";

type Props = {
  agendamentos: Agendamento[];
  confirmar: (agendamento: Agendamento) => Promise<void>;
  concluir: (agendamento: Agendamento) => Promise<void>;
  visualizar: (agendamento: Agendamento) => void;
  editar: (agendamento: Agendamento) => void;
  cancelar: (agendamento: Agendamento) => void;
  excluir: (agendamento: Agendamento) => void;
};

function Acao({
  titulo,
  executar,
  disabled,
  children,
}: {
  titulo: string;
  executar: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
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
  confirmar,
  concluir,
  visualizar,
  editar,
  cancelar,
  excluir,
}: Props) {
  const colunas = ["Cliente", "Funcionário", "Serviço", "Data", "Hora", "Valor", "Status", "Ações"];

  return (
    <div className="lista-agendamentos">
      <table className="tabela-agendamentos">
        <thead className="cabecalho-tabela-agenda">
          <tr>
            {colunas.map((coluna) => (
              <th
                key={coluna}
                className="titulo-coluna-agenda"
              >
                {coluna}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="corpo-tabela-agenda">
          {agendamentos.map((agendamento) => (
            <tr
              key={agendamento.id}
              className="linha-tabela-agenda"
            >
              <td className="celula-agenda cliente-agendamento">
                {agendamento.usuario?.nome ?? "—"}
              </td>
              <td className="celula-agenda">{agendamento.profissional?.nome ?? "—"}</td>
              <td className="celula-agenda">{agendamento.servico?.nome ?? "—"}</td>
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
                    titulo="Editar"
                    executar={() => editar(agendamento)}
                  >
                    <Pencil className="icone-agenda" />
                  </Acao>
                  <Acao
                    titulo="Cancelar"
                    executar={() => cancelar(agendamento)}
                    disabled={agendamento.status === "CANCELADO"}
                  >
                    <XCircle className="icone-agenda" />
                  </Acao>
                  <Acao
                    titulo="Excluir"
                    executar={() => excluir(agendamento)}
                  >
                    <Trash2 className="icone-agenda" />
                  </Acao>
                </div>
              </td>
            </tr>
          ))}
          {agendamentos.length === 0 && (
            <tr>
              <td
                colSpan={8}
                className="mensagem-lista-vazia-agenda"
              >
                Nenhum agendamento encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
