/** Guia o administrador pelas etapas de uma nova reserva. */
import "./NovoAgendamentoWizard.css";
import { useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, Check, Plus } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { ConfirmacaoAgendamentoRepetidoModal } from "@/components/ConfirmacaoAgendamentoRepetidoModal";
import { formatarTelefoneBrasileiro } from "@/utils/telefone";
import { useAgendamentoAdministrativo } from "./useAgendamentoAdministrativo";

const etapas = ["Cliente", "Profissional", "Serviço", "Horário", "Revisão"];
const titulos = ["Escolha o cliente", "Escolha o profissional", "Escolha o serviço", "Escolha o horário", "Revise o agendamento"];
const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dataCompleta = new Intl.DateTimeFormat("pt-BR", { dateStyle: "full" });

export function NovoAgendamentoWizard(props) {
  const fluxo = useAgendamentoAdministrativo(props);
  const { etapa, setEtapa, confirmacaoRepeticao, salvando } = fluxo;
  const etapaAnterior = useRef(etapa);
  const tituloRef = useRef(null);

  useEffect(() => {
    if (etapaAnterior.current === etapa) return;
    etapaAnterior.current = etapa;
    tituloRef.current?.focus();
  }, [etapa]);

  return (
    <>
      <Modal
        title="Novo agendamento"
        onClose={props.onClose}
        closeDisabled={salvando}
        size="wide"
        footer={
          <div className="acoes-novo-agendamento">
            <button
              type="button"
              className="botao-secundario-novo-agendamento"
              disabled={salvando}
              onClick={etapa === 1 ? props.onClose : () => setEtapa(etapa - 1)}
            >
              {etapa > 1 && <ArrowLeft aria-hidden="true" />}
              {etapa === 1 ? "Cancelar" : "Voltar"}
            </button>
            {etapa < etapas.length ? (
              <button type="button" className="botao-principal-novo-agendamento" disabled={!fluxo.podeAvancar} onClick={fluxo.avancarEtapa}>
                {etapa === 4 ? "Revisar agendamento" : "Avançar"}
                <ArrowRight aria-hidden="true" />
              </button>
            ) : (
              <button type="button" className="botao-principal-novo-agendamento" disabled={salvando} onClick={() => void fluxo.confirmarAgendamento()}>
                {salvando ? "Salvando…" : "Confirmar agendamento"}
                {!salvando && <Check aria-hidden="true" />}
              </button>
            )}
          </div>
        }
      >
        <div className="progresso-novo-agendamento">
          <strong>Etapa {etapa} de {etapas.length}</strong>
          <div className="trilho-novo-agendamento" role="progressbar" aria-label="Progresso do agendamento" aria-valuenow={etapa} aria-valuemax={etapas.length}>
            <span style={{ width: `${(etapa / etapas.length) * 100}%` }} />
          </div>
          <ol className="etapas-novo-agendamento">
            {etapas.map((nome, indice) => (
              <li key={nome} aria-current={indice + 1 === etapa ? "step" : undefined}>{nome}</li>
            ))}
          </ol>
        </div>
        <section className="etapa-novo-agendamento" aria-labelledby="titulo-etapa-novo-agendamento">
          <h3 id="titulo-etapa-novo-agendamento" tabIndex={-1} ref={tituloRef}>
            {etapa === 1 && fluxo.criarCliente ? "Cadastre o cliente" : titulos[etapa - 1]}
          </h3>
          {etapa === 1 && <Cliente fluxo={fluxo} />}
          {etapa === 2 && (
            <Opcoes
              itens={props.profissionais.filter((item) => item.ativo).map((item) => ({
                id: item.id, titulo: item.nome, descricao: item.especialidade,
              }))}
              vazio="Nenhum profissional ativo disponível."
              selecionado={fluxo.profissionalId}
              selecionar={fluxo.setProfissionalId}
            />
          )}
          {etapa === 3 && (
            <Opcoes
              itens={props.servicos.filter((item) => item.ativo).map((item) => ({
                id: item.id, titulo: item.nome, descricao: moeda.format(Number(item.preco)) + " · " + item.duracao + " min",
              }))}
              vazio="Nenhum serviço ativo disponível."
              selecionado={fluxo.servicoId}
              selecionar={fluxo.setServicoId}
            />
          )}
          {etapa === 4 && <Horario fluxo={fluxo} />}
          {etapa === 5 && <Resumo fluxo={fluxo} />}
        </section>
      </Modal>
      {confirmacaoRepeticao && (
        <ConfirmacaoAgendamentoRepetidoModal
          relacionados={confirmacaoRepeticao.relacionados}
          confirmando={salvando}
          onClose={() => fluxo.setConfirmacaoRepeticao(null)}
          onConfirm={() => fluxo.confirmarAgendamento(confirmacaoRepeticao.token)}
        />
      )}
    </>
  );
}

function Cliente({ fluxo }) {
  const buscaRef = useRef(null);
  const criandoAntes = useRef(false);
  useEffect(() => {
    if (criandoAntes.current && !fluxo.criarCliente) buscaRef.current?.focus();
    criandoAntes.current = fluxo.criarCliente;
  }, [fluxo.criarCliente]);

  if (fluxo.criarCliente) {
    return (
      <>
        <div className="campos-cliente-novo-agendamento">
          <label className="campo-novo-agendamento">
            Nome
            <input autoFocus autoComplete="name" value={fluxo.novoCliente.nome}
              onChange={(evento) => fluxo.setNovoCliente((atual) => ({ ...atual, nome: evento.target.value }))} />
          </label>
          <label className="campo-novo-agendamento">
            Telefone (opcional)
            <input type="tel" autoComplete="tel-national" placeholder="(00) 00000-0000" value={fluxo.novoCliente.telefone}
              onChange={(evento) => fluxo.setNovoCliente((atual) => ({ ...atual, telefone: formatarTelefoneBrasileiro(evento.target.value) }))} />
          </label>
        </div>
        {fluxo.erroNovoCliente && <p className="erro-novo-agendamento" role="status">{fluxo.erroNovoCliente}</p>}
        <button type="button" className="botao-secundario-novo-agendamento" onClick={() => fluxo.setCriarCliente(false)}>
          <ArrowLeft aria-hidden="true" /> Voltar à lista de clientes
        </button>
      </>
    );
  }

  return (
    <>
      <div className="busca-cliente-novo-agendamento">
        <label className="campo-novo-agendamento">
          Buscar por nome ou telefone
          <input ref={buscaRef} type="search" autoComplete="off" value={fluxo.busca}
            onChange={(evento) => fluxo.setBusca(evento.target.value)} />
        </label>
        <button type="button" className="botao-secundario-novo-agendamento" onClick={() => fluxo.setCriarCliente(true)}>
          <Plus aria-hidden="true" /> Cadastrar novo cliente
        </button>
      </div>
      <Opcoes
        itens={fluxo.clientesFiltrados.map((cliente) => ({
          id: cliente.id,
          titulo: cliente.nome,
          descricao: cliente.telefone ? formatarTelefoneBrasileiro(cliente.telefone) :
            cliente.email?.endsWith("@sem-email.local") ? undefined : cliente.email,
        }))}
        vazio={fluxo.busca.trim() ? "Nenhum cliente encontrado para essa busca." : "Nenhum cliente cadastrado."}
        selecionado={fluxo.clienteId}
        selecionar={fluxo.setClienteId}
        listaClientes
      />
    </>
  );
}

function Opcoes({ itens, vazio, selecionado, selecionar, listaClientes }) {
  if (!itens.length) return <p className="estado-novo-agendamento" role="status">{vazio}</p>;

  return (
    <ul className={listaClientes ? "opcoes-novo-agendamento opcoes-clientes-novo-agendamento" : "opcoes-novo-agendamento"}>
      {itens.map((item) => (
        <li key={item.id}>
          <button type="button" aria-pressed={selecionado === item.id} onClick={() => selecionar(item.id)} className="opcao-novo-agendamento">
            <span className="texto-opcao-novo-agendamento">
              <strong>{item.titulo}</strong>
              {item.descricao && <small title={listaClientes ? item.descricao : undefined}>{item.descricao}</small>}
            </span>
            {selecionado === item.id && <Check aria-hidden="true" />}
          </button>
        </li>
      ))}
    </ul>
  );
}

function Horario({ fluxo }) {
  return (
    <>
      <div className="dias-novo-agendamento" role="group" aria-label="Próximos dias">
        {fluxo.proximosDias.map((dia) => (
          <button key={dia.valor} type="button" aria-pressed={fluxo.data === dia.valor}
            aria-label={dataCompleta.format(new Date(dia.valor + "T12:00"))}
            onClick={() => fluxo.setData(dia.valor)}>
            <span>{dia.semana}</span>
            <strong>{dia.numero}</strong>
          </button>
        ))}
      </div>
      <label className="campo-novo-agendamento campo-data-novo-agendamento">
        Data do agendamento
        <input type="date" min={fluxo.proximosDias[0]?.valor} value={fluxo.data}
          onChange={(evento) => fluxo.setData(evento.target.value)} />
      </label>
      <div aria-busy={fluxo.carregandoHorarios}>
        {fluxo.carregandoHorarios ? (
          <p className="estado-novo-agendamento" role="status">Carregando horários…</p>
        ) : fluxo.erroHorarios ? (
          <p className="erro-novo-agendamento" role="alert">{fluxo.erroHorarios}</p>
        ) : !fluxo.data || !fluxo.horarios.length ? (
          <p className="estado-novo-agendamento" role="status">
            {fluxo.data ? "Nenhum horário disponível nesta data. Escolha outro dia." : "Selecione uma data para consultar os horários."}
          </p>
        ) : (
          <div className="horarios-novo-agendamento" role="group" aria-label="Horários disponíveis">
            {fluxo.horarios.map((hora) => (
              <button type="button" key={hora} aria-pressed={fluxo.hora === hora} onClick={() => fluxo.setHora(hora)}>{hora}</button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function Resumo({ fluxo }) {
  const registros = [
    ["Cliente", fluxo.criarCliente ? fluxo.novoCliente.nome.trim() : fluxo.clienteSelecionado?.nome],
    ["Profissional", fluxo.profissionalSelecionado?.nome],
    ["Serviço", fluxo.servicoSelecionado?.nome],
    ["Data", fluxo.data && dataCompleta.format(new Date(fluxo.data + "T12:00"))],
    ["Horário", fluxo.hora],
    ["Valor", fluxo.servicoSelecionado && moeda.format(Number(fluxo.servicoSelecionado.preco))],
  ];

  return (
    <dl className="resumo-novo-agendamento">
      {registros.map(([rotulo, valor]) => (
        <div key={rotulo}><dt>{rotulo}</dt><dd>{valor}</dd></div>
      ))}
    </dl>
  );
}
