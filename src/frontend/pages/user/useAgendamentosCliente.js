import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

export function useAgendamentosCliente() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [historico, setHistorico] = useState(null);
  const carregarAgendamentos = () => void api.agendamentos.list().then(setAgendamentos).catch((error) => toast.error(error.message));
  useEffect(() => { carregarAgendamentos(); }, []);

  const cancelarAgendamento = async (item) => {
    try {
      await api.agendamentos.cancel(item.id);
      toast.success("Agendamento cancelado. Para escolher outra data ou horário, faça um novo agendamento.");
      carregarAgendamentos();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível cancelar o agendamento.");
    }
  };

  const abrirHistorico = async (item) => {
    try {
      const eventos = await api.agendamentos.historico(item.id);
      setHistorico({ item, eventos });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível carregar o histórico.");
    }
  };

  return { agendamentos, historico, setHistorico, cancelarAgendamento, abrirHistorico };
}
