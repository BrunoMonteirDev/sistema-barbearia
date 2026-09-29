import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
export function useAgendamentosCliente() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [remarcando, setRemarcando] = useState(null);
  const [historico, setHistorico] = useState(null);
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [horarios, setHorarios] = useState([]);
  const [carregandoHorarios, setCarregandoHorarios] = useState(false);
  const carregarAgendamentos = () =>
    void api.agendamentos
      .list()
      .then(setAgendamentos)
      .catch((error) => toast.error(error.message));
  useEffect(() => {
    carregarAgendamentos();
  }, []);
  useEffect(() => {
    if (
      !remarcando ||
      !data ||
      !remarcando.profissional?.id ||
      !remarcando.servico?.id
    ) {
      setHorarios([]);
      return;
    }
    setHora("");
    setCarregandoHorarios(true);
    void api.agendamentos
      .disponibilidade(
        remarcando.profissional.id,
        remarcando.servico.id,
        data,
        remarcando.id,
      )
      .then(({ horarios: disponiveis }) => setHorarios(disponiveis))
      .catch((error) =>
        toast.error(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os horários.",
        ),
      )
      .finally(() => setCarregandoHorarios(false));
  }, [data, remarcando]);
  const cancelarAgendamento = async (item) => {
    try {
      await api.agendamentos.cancel(item.id);
      toast.success("Agendamento cancelado.");
      carregarAgendamentos();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível cancelar o agendamento.",
      );
    }
  };
  const iniciarRemarcacao = (item) => {
    setRemarcando(item);
    setData(item.data);
    setHora("");
  };
  const confirmarRemarcacao = async () => {
    if (!remarcando || !data || !hora) {
      toast.error("Escolha uma data e um horário disponíveis.");
      return;
    }
    try {
      await api.agendamentos.remarcar(remarcando.id, { data, hora });
      toast.success("Agendamento remarcado.");
      setRemarcando(null);
      carregarAgendamentos();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível remarcar o agendamento.",
      );
    }
  };
  const abrirHistorico = async (item) => {
    try {
      const eventos = await api.agendamentos.historico(item.id);
      setHistorico({ item, eventos });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar o histórico.",
      );
    }
  };
  return {
    agendamentos,
    remarcando,
    historico,
    data,
    hora,
    horarios,
    carregandoHorarios,
    setRemarcando,
    setHistorico,
    setData,
    setHora,
    cancelarAgendamento,
    iniciarRemarcacao,
    confirmarRemarcacao,
    abrirHistorico,
  };
}
