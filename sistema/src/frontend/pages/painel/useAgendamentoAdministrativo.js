import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ApiError, api } from "@/lib/api";
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
  const [horarios, setHorarios] = useState([]);
  const [carregandoHorarios, setCarregandoHorarios] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [confirmacaoRepeticao, setConfirmacaoRepeticao] = useState(null);
  const clientesFiltrados = useMemo(
    () =>
      clientes.filter((cliente) =>
        `${cliente.nome} ${cliente.telefone ?? ""}`
          .toLowerCase()
          .includes(busca.toLowerCase()),
      ),
    [busca, clientes],
  );
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
  useEffect(() => {
    setHora("");
    setHorarios([]);
    if (!profissionalId || !servicoId || !data) return;
    setCarregandoHorarios(true);
    api.agendamentos
      .disponibilidade(profissionalId, servicoId, data)
      .then((resultado) => setHorarios(resultado.horarios))
      .catch((error) =>
        toast.error(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os horários.",
        ),
      )
      .finally(() => setCarregandoHorarios(false));
  }, [profissionalId, servicoId, data]);
  const avancarEtapa = () => {
    if (etapa === 1 && !clienteId && !(criarCliente && novoCliente.nome.trim()))
      return toast.error("Selecione ou cadastre um cliente para continuar.");
    if (etapa === 2 && !profissionalId)
      return toast.error("Escolha um profissional para continuar.");
    if (etapa === 3 && !servicoId)
      return toast.error("Escolha um serviço para continuar.");
    if (etapa === 4 && !hora)
      return toast.error("Selecione um horário disponível para continuar.");
    setEtapa((atual) => atual + 1);
  };
  const confirmarAgendamento = async (tokenConfirmacaoRepeticao) => {
    if (!horarios.includes(hora) && !tokenConfirmacaoRepeticao) {
      toast.error("Selecione um horário disponível.");
      return;
    }
    setSalvando(true);
    let usuarioId = clienteId;
    try {
      if (criarCliente && !tokenConfirmacaoRepeticao) {
        const cliente = await api.usuarios.create({
          nome: novoCliente.nome.trim(),
          telefone: novoCliente.telefone || undefined,
          nivel: "Cliente",
          ativo: true,
        });
        usuarioId = cliente.id;
      }
      await api.agendamentos.create({
        usuarioId,
        profissionalId,
        servicoId,
        data,
        hora,
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
          snapshot: { usuarioId, profissionalId, servicoId, data, hora },
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
    setProfissionalId,
    setServicoId,
    setData,
    setHora,
    setConfirmacaoRepeticao,
    avancarEtapa,
    confirmarAgendamento,
  };
}
