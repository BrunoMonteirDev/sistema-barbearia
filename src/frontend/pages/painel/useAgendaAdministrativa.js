import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
function agendamentoTerminou(item) {
  if (
    !item.servico?.duracao ||
    !["PENDENTE", "CONFIRMADO"].includes(item.status)
  )
    return false;
  const inicio = new Date(`${item.data}T${item.hora}:00`).getTime();
  return (
    Number.isFinite(inicio) &&
    inicio + item.servico.duracao * 60_000 < Date.now()
  );
}
export function useAgendaAdministrativa() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [servicos, setServicos] = useState([]);
  const carregarAgendamentos = () => {
    void api.agendamentos
      .list()
      .then(async (lista) => {
        const atrasados = lista.filter(agendamentoTerminou);
        if (atrasados.length) {
          await Promise.all(
            atrasados.map((item) =>
              api.agendamentos.status(item.id, "ATRASADO"),
            ),
          );
          setAgendamentos(
            lista.map((item) =>
              atrasados.some((atrasado) => atrasado.id === item.id)
                ? { ...item, status: "ATRASADO" }
                : item,
            ),
          );
          return;
        }
        setAgendamentos(lista);
      })
      .catch((error) => toast.error(error.message));
  };
  useEffect(() => {
    carregarAgendamentos();
    void Promise.all([
      api.usuarios.list(),
      api.profissionais.list(),
      api.servicos.list(),
    ])
      .then(([usuarios, listaProfissionais, listaServicos]) => {
        setClientes(usuarios.filter((usuario) => usuario.nivel === "Cliente"));
        setProfissionais(listaProfissionais);
        setServicos(listaServicos);
      })
      .catch((error) => toast.error(error.message));
  }, []);
  return {
    agendamentos,
    clientes,
    profissionais,
    servicos,
    carregarAgendamentos,
  };
}
