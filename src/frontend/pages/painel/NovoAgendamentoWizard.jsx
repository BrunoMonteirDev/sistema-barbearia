import "./NovoAgendamentoWizard.css";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { ConfirmacaoAgendamentoRepetidoModal } from "@/components/ConfirmacaoAgendamentoRepetidoModal";
import { useAgendamentoAdministrativo } from "./useAgendamentoAdministrativo";
export function NovoAgendamentoWizard(props) {
  const fluxo = useAgendamentoAdministrativo(props);
  const { etapa, setEtapa, confirmacaoRepeticao } = fluxo;
  const nomes = ["Cliente", "Profissional", "Serviço", "Horário", "Revisão"];
  return (
    <>
      <Modal
        title="Novo agendamento"
        onClose={props.onClose}
        size="wide"
        footer={
          <div className="acoes-novo-agendamento">
            {etapa === 1 ? (
              <button type="button" onClick={props.onClose}>
                Cancelar
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setEtapa((atual) => atual - 1)}
              >
                <ArrowLeft className="icone-voltar-novo-agendamento" />
                Voltar
              </button>
            )}
            {etapa < 5 ? (
              <button type="button" onClick={fluxo.avancarEtapa}>
                {etapa === 4 ? "Revisar agendamento" : "Avançar"}
                <ArrowRight className="icone-avancar-novo-agendamento" />
              </button>
            ) : (
              <button
                type="button"
                disabled={fluxo.salvando}
                onClick={() => void fluxo.confirmarAgendamento()}
              >
                Confirmar agendamento
                <Check className="icone-avancar-novo-agendamento" />
              </button>
            )}
          </div>
        }
      >
        <div className="progresso-novo-agendamento">
          <strong>Etapa {etapa} de 5</strong>
          <div className="trilho-novo-agendamento">
            <div
              className="barra-novo-agendamento"
              style={{ width: (etapa / 5) * 100 + "%" }}
            />
          </div>
          <div className="etapas-novo-agendamento">
            {nomes.map((nome, indice) => (
              <span
                key={nome}
                className={
                  indice + 1 <= etapa
                    ? "etapa-novo-agendamento ativa"
                    : "etapa-novo-agendamento"
                }
              >
                {nome}
              </span>
            ))}
          </div>
        </div>
        {etapa === 1 && <Cliente etapa={fluxo} />}
        {etapa === 2 && (
          <Opcoes
            titulo="Escolha o profissional"
            itens={props.profissionais
              .filter((item) => item.ativo)
              .map((item) => ({
                id: item.id,
                titulo: item.nome,
                descricao: item.especialidade || "Profissional da barbearia",
              }))}
            selecionado={fluxo.profissionalId}
            selecionar={(id) => {
              fluxo.setProfissionalId(id);
              fluxo.setHora("");
            }}
          />
        )}
        {etapa === 3 && (
          <Opcoes
            titulo="Escolha o serviço"
            itens={props.servicos
              .filter((item) => item.ativo)
              .map((item) => ({
                id: item.id,
                titulo: item.nome,
                descricao:
                  String(item.preco) + " · " + String(item.duracao) + " min",
              }))}
            selecionado={fluxo.servicoId}
            selecionar={(id) => {
              fluxo.setServicoId(id);
              fluxo.setHora("");
            }}
          />
        )}
        {etapa === 4 && <Horario fluxo={fluxo} />}
        {etapa === 5 && <Resumo fluxo={fluxo} />}
      </Modal>
      {confirmacaoRepeticao && (
        <ConfirmacaoAgendamentoRepetidoModal
          relacionados={confirmacaoRepeticao.relacionados}
          onClose={() => fluxo.setConfirmacaoRepeticao(null)}
          onConfirm={() =>
            fluxo.confirmarAgendamento(confirmacaoRepeticao.token)
          }
        />
      )}
    </>
  );
}
function Cliente({ etapa }) {
  return (
    <section>
      <h3>Escolha o cliente</h3>
      {etapa.criarCliente ? (
        <>
          <input
            autoFocus
            value={etapa.novoCliente.nome}
            placeholder="Nome"
            onChange={(evento) =>
              etapa.setNovoCliente((atual) => ({
                ...atual,
                nome: evento.target.value,
              }))
            }
          />
          <input
            value={etapa.novoCliente.telefone}
            placeholder="Telefone"
            onChange={(evento) =>
              etapa.setNovoCliente((atual) => ({
                ...atual,
                telefone: evento.target.value,
              }))
            }
          />
        </>
      ) : (
        <>
          <input
            value={etapa.busca}
            placeholder="Nome ou telefone"
            onChange={(evento) => etapa.setBusca(evento.target.value)}
          />
          {etapa.clientesFiltrados.map((cliente) => (
            <button
              type="button"
              key={cliente.id}
              onClick={() => etapa.setClienteId(cliente.id)}
            >
              {cliente.nome}
            </button>
          ))}
          <button type="button" onClick={() => etapa.setCriarCliente(true)}>
            Cadastrar novo cliente
          </button>
        </>
      )}
    </section>
  );
}
function Opcoes({ titulo, itens, selecionado, selecionar }) {
  return (
    <section>
      <h3>{titulo}</h3>
      {itens.map((item) => (
        <button
          type="button"
          key={item.id}
          onClick={() => selecionar(item.id)}
          className={
            selecionado === item.id ? "opcao-novo-agendamento selecionada" : ""
          }
        >
          {item.titulo}
          <small>{item.descricao}</small>
        </button>
      ))}
    </section>
  );
}
function Horario({ fluxo }) {
  return (
    <section>
      <h3>Escolha o horário</h3>
      <label>
        Ou escolha outra data
        <input
          aria-label="Ou escolha outra data"
          type="date"
          value={fluxo.data}
          onChange={(evento) => fluxo.setData(evento.target.value)}
        />
      </label>
      {fluxo.carregandoHorarios ? (
        <p>Carregando horários...</p>
      ) : (
        fluxo.horarios.map((item) => (
          <button type="button" key={item} onClick={() => fluxo.setHora(item)}>
            {item}
          </button>
        ))
      )}
    </section>
  );
}
function Resumo({ fluxo }) {
  return (
    <section>
      <h3>Revise o agendamento</h3>
      <p>
        Cliente:{" "}
        <span>
          {fluxo.criarCliente
            ? fluxo.novoCliente.nome
            : fluxo.clienteSelecionado?.nome}
        </span>
      </p>
      <p>
        Profissional: <span>{fluxo.profissionalSelecionado?.nome}</span>
      </p>
      <p>
        Serviço: <span>{fluxo.servicoSelecionado?.nome}</span>
      </p>
      <p>
        Data:{" "}
        <span>
          {fluxo.data} às {fluxo.hora}
        </span>
      </p>
    </section>
  );
}
