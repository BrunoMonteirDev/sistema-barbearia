/** Papel do módulo: Controla o estado e as consultas de disponibilidade no assistente de agendamento administrativo. */
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { ApiError, api } from "@/lib/api";

function normalizarBusca(texto) {
  return texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").trim().toLowerCase();
}

export function useAgendamentoAdministrativo({
  clientes,
  profissionais,
  servicos,
  onCreated,
}) {
  const [etapa, setEtapa] = useState(1);
  const [busca, setBusca] = useState("");
  const [criarCliente, setCriarCliente] = useState(false);
  const [novoCliente, setNovoCliente] = useState({ nome: "", telefone: "" });
  const [clienteId, setClienteId] = useState("");
  const [profissionalId, setProfissionalId] = useState("");
  const [servicoId, setServicoId] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [disponibilidade, setDisponibilidade] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const salvandoRef = useRef(false);
  const clienteCriado = useRef(null);
  const [confirmacaoRepeticao, setConfirmacaoRepeticao] = useState(null);
  const clientesFiltrados = useMemo(() => {
    const texto = normalizarBusca(busca);
    const numero = /^[\d ()+.\-]+$/.test(texto) ? texto.replace(/\D/g, "") : "";
    return clientes.filter((cliente) =>
      normalizarBusca(`${cliente.nome} ${cliente.telefone ?? ""}`).includes(texto) ||
      (numero && cliente.telefone?.replace(/\D/g, "").includes(numero)),
    );
  }, [busca, clientes]);
  const clienteSelecionado = clientes.find(
    (cliente) => cliente.id === clienteId,
  );
  const profissionalSelecionado = profissionais.find(
    (item) => item.id === profissionalId,
  );
  const servicoSelecionado = servicos.find((item) => item.id === servicoId);
  const proximosDias = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const dia = new Date();
        dia.setDate(dia.getDate() + index);
        return {
          valor: dia.toLocaleDateString("en-CA"),
          semana: dia
            .toLocaleDateString("pt-BR", { weekday: "short" })
            .replace(".", ""),
          numero: dia.getDate(),
        };
      }),
    [],
  );
  const temConsulta = Boolean(profissionalId && servicoId && data);
  const horarios = disponibilidade?.horarios ?? [];
  const erroHorarios = disponibilidade?.erro ?? "";
  const carregandoHorarios = temConsulta && disponibilidade === null;
  useEffect(() => {
    if (!temConsulta) return;
    let ignorar = false;
    api.agendamentos
      .disponibilidade(profissionalId, servicoId, data)
      .then(({ horarios }) => {
        if (!ignorar) setDisponibilidade({ horarios });
      })
      .catch((error) => {
        if (ignorar) return;
        setDisponibilidade({
          erro: error instanceof Error
            ? error.message
            : "Não foi possível carregar os horários.",
        });
      });
    return () => { ignorar = true; };
  }, [profissionalId, servicoId, data, temConsulta]);

  function alterarConsulta(definir, atual, valor) {
    if (valor === atual) return;
    definir(valor);
    setHora("");
    setDisponibilidade(null);
    setConfirmacaoRepeticao(null);
  }

  const nomeNovoCliente = novoCliente.nome.trim();
  const telefoneNovoCliente = novoCliente.telefone.trim();
  const telefonePreenchido = telefoneNovoCliente.replace(/\D/g, "");
  const erroNovoCliente = !nomeNovoCliente
    ? "Informe o nome do cliente."
    : telefoneNovoCliente && !/^\d{10,11}$/.test(telefonePreenchido)
      ? "Informe um telefone brasileiro válido com DDD."
      : "";
  const errosPorEtapa = {
    1: criarCliente ? erroNovoCliente : !clienteSelecionado && "Selecione ou cadastre um cliente para continuar.",
    2: !profissionalSelecionado && "Escolha um profissional para continuar.",
    3: !servicoSelecionado && "Escolha um serviço para continuar.",
    4: !horarios.includes(hora) && "Selecione um horário disponível para continuar.",
  };
  const erroEtapa = errosPorEtapa[etapa];
  const avancarEtapa = () => {
    if (erroEtapa) return toast.error(erroEtapa);
    if (etapa < 5) setEtapa(etapa + 1);
  };
  const confirmarAgendamento = async (tokenConfirmacaoRepeticao) => {
    if (salvandoRef.current) return;
    const erroConfirmacao = Object.values(errosPorEtapa).find(Boolean);
    if (erroConfirmacao) return toast.error(erroConfirmacao);
    if (tokenConfirmacaoRepeticao && tokenConfirmacaoRepeticao !== confirmacaoRepeticao?.token) return;

    salvandoRef.current = true;
    setSalvando(true);
    let reserva = confirmacaoRepeticao && tokenConfirmacaoRepeticao
      ? confirmacaoRepeticao.snapshot
      : { usuarioId: clienteId, profissionalId, servicoId, data, hora };
    try {
      if (criarCliente && !tokenConfirmacaoRepeticao) {
        const chave = JSON.stringify([nomeNovoCliente, telefonePreenchido]);
        if (clienteCriado.current?.chave !== chave) {
          const cliente = await api.usuarios.create({
            nome: nomeNovoCliente,
            telefone: telefoneNovoCliente || undefined,
            nivel: "Cliente",
            ativo: true,
          });
          clienteCriado.current = { chave, id: cliente.id };
        }
        reserva = { ...reserva, usuarioId: clienteCriado.current.id };
      }
      await api.agendamentos.create({
        ...reserva,
        ...(tokenConfirmacaoRepeticao ? { tokenConfirmacaoRepeticao } : {}),
      });
      toast.success("Agendamento criado.");
      setConfirmacaoRepeticao(null);
      onCreated();
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.codigo === "CONFIRMACAO_REPETICAO_NECESSARIA" &&
        error.tokenConfirmacaoRepeticao
      ) {
        setConfirmacaoRepeticao({
          token: error.tokenConfirmacaoRepeticao,
          relacionados: error.agendamentosRelacionados ?? [],
          snapshot: reserva,
        });
        return;
      }
      if (
        error instanceof ApiError &&
        [
          "CONFIRMACAO_REPETICAO_EXPIRADA",
          "CONFIRMACAO_REPETICAO_INVALIDA",
        ].includes(error.codigo ?? "")
      )
        setConfirmacaoRepeticao(null);
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível criar o agendamento.",
      );
    } finally {
      salvandoRef.current = false;
      setSalvando(false);
    }
  };
  return {
    etapa,
    setEtapa,
    busca,
    setBusca,
    criarCliente,
    novoCliente,
    clienteId,
    profissionalId,
    servicoId,
    data,
    hora,
    horarios,
    carregandoHorarios,
    erroHorarios,
    erroNovoCliente,
    podeAvancar: !erroEtapa,
    salvando,
    confirmacaoRepeticao,
    clientesFiltrados,
    clienteSelecionado,
    profissionalSelecionado,
    servicoSelecionado,
    proximosDias,
    setCriarCliente,
    setNovoCliente,
    setClienteId,
    setProfissionalId: (valor) => alterarConsulta(setProfissionalId, profissionalId, valor),
    setServicoId: (valor) => alterarConsulta(setServicoId, servicoId, valor),
    setData: (valor) => alterarConsulta(setData, data, valor),
    setHora,
    setConfirmacaoRepeticao,
    avancarEtapa,
    confirmarAgendamento,
  };
}
