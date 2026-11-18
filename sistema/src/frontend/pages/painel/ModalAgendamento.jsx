import { Modal } from "@/components/ui/modal";
import { statusLabels } from "./agendaVisualizacao";

function Detalhe({ titulo, valor }) {
  return <div><p className="descricao-agendamentos">{titulo}</p><p className="valor-detalhe-agenda">{valor ?? "—"}</p></div>;
}

export function ModalAgendamento({ agendamento, fechar }) {
  if (!agendamento) return null;
  const valor = agendamento.servico ? Number(agendamento.servico.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : undefined;
  return <Modal title="Detalhes do agendamento" onClose={fechar} footer={<button type="button" onClick={fechar} className="botao-fechar-agenda">Fechar</button>}>
    <div className="detalhes-agendamento-admin">
      <Detalhe titulo="Cliente" valor={agendamento.usuario?.nome} />
      <Detalhe titulo="Funcionário" valor={agendamento.profissional?.nome} />
      <Detalhe titulo="Serviço" valor={agendamento.servico?.nome} />
      <Detalhe titulo="Valor" valor={valor} />
      <Detalhe titulo="Data" valor={agendamento.data} />
      <Detalhe titulo="Hora" valor={agendamento.hora} />
      <Detalhe titulo="Status" valor={statusLabels[agendamento.status] ?? agendamento.status} />
    </div>
  </Modal>;
}
