import { Modal } from "@/components/ui/modal";
import { statusLabels } from "./agendaVisualizacao";
function Detalhe({ titulo, valor }) {
  return (
    <div>
      <p className="descricao-agendamentos">{titulo}</p>
      <p className="valor-detalhe-agenda">{valor ?? "—"}</p>
    </div>
  );
}
export function ModalAgendamento({
  modo,
  agendamento,
  form,
  profissionais,
  servicos,
  alterarCampo,
  fechar,
  salvar,
}) {
  const valorServico = agendamento?.servico
    ? Number(agendamento.servico.preco).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })
    : undefined;
  return (
    <Modal
      title={
        modo === "editar" ? "Editar agendamento" : "Detalhes do agendamento"
      }
      onClose={fechar}
      footer={
        <>
          <button
            type="button"
            onClick={fechar}
            className="botao-fechar-agenda"
          >
            Fechar
          </button>
          {modo !== "visualizar" && (
            <button
              type="button"
              onClick={salvar}
              className="botao-principal-agenda"
            >
              Salvar
            </button>
          )}
        </>
      }
    >
      {modo === "visualizar" && agendamento ? (
        <div className="detalhes-agendamento-admin">
          <Detalhe titulo="Cliente" valor={agendamento.usuario?.nome} />
          <Detalhe
            titulo="Funcionário"
            valor={agendamento.profissional?.nome}
          />
          <Detalhe titulo="Serviço" valor={agendamento.servico?.nome} />
          <Detalhe titulo="Valor" valor={valorServico} />
          <Detalhe titulo="Data" valor={agendamento.data} />
          <Detalhe titulo="Hora" valor={agendamento.hora} />
          <Detalhe
            titulo="Status"
            valor={statusLabels[agendamento.status] ?? agendamento.status}
          />
        </div>
      ) : (
        <div className="formulario-agendamento-admin">
          <label className="rotulo-filtro-agenda">
            Funcionário
            <select
              value={form.profissionalId}
              onChange={(event) =>
                alterarCampo("profissionalId", event.target.value)
              }
              className="campo-filtro-agenda selecao-filtro-agenda"
            >
              <option value="">Selecione</option>
              {profissionais.map((profissional) => (
                <option key={profissional.id} value={profissional.id}>
                  {profissional.nome}
                </option>
              ))}
            </select>
          </label>
          <label className="rotulo-filtro-agenda">
            Serviço
            <select
              value={form.servicoId}
              onChange={(event) =>
                alterarCampo("servicoId", event.target.value)
              }
              className="campo-filtro-agenda selecao-filtro-agenda"
            >
              <option value="">Selecione</option>
              {servicos.map((servico) => (
                <option key={servico.id} value={servico.id}>
                  {servico.nome}
                </option>
              ))}
            </select>
          </label>
          <label className="rotulo-filtro-agenda">
            Data
            <input
              type="date"
              value={form.data}
              onChange={(event) => alterarCampo("data", event.target.value)}
              className="campo-filtro-agenda"
            />
          </label>
          <label className="rotulo-filtro-agenda">
            Hora
            <input
              type="time"
              value={form.hora}
              onChange={(event) => alterarCampo("hora", event.target.value)}
              className="campo-filtro-agenda"
            />
          </label>
          <label className="rotulo-filtro-agenda">
            Status
            <select
              value={form.status}
              onChange={(event) => alterarCampo("status", event.target.value)}
              className="campo-filtro-agenda selecao-filtro-agenda"
            >
              {Object.entries(statusLabels).map(([valor, titulo]) => (
                <option key={valor} value={valor}>
                  {titulo}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </Modal>
  );
}
