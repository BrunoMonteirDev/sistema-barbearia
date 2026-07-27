import { useEffect, useState } from "react";
import { postgres, isDatabaseConfigured } from "@/lib/postgres";

export interface Agendamento {
  id: string;
  data: string;
  hora: string;
  status: string;
  cliente: { nome: string; telefone: string };
  servico: { nome: string; preco: number };
  funcionario: { usuario: { nome: string } } | null;
}

export interface Funcionario {
  id: string;
  usuario: { nome: string };
}

export function useAgenda() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);

  const [statusFiltro, setStatusFiltro] = useState("Todos");
  const [funcFiltro, setFuncFiltro] = useState("Todos");
  const [ordenarPor, setOrdenarPor] = useState("data");

  const [periodo, setPeriodo] = useState("todos");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const [pagina, setPagina] = useState(1);
  const porPagina = 10;

  const [totalAgendamentos, setTotalAgendamentos] = useState(0);

  /* =============================
      Carregar funcionÃ¡rios
  ============================== */
  useEffect(() => {
    fetchFuncionarios();
  }, []);

  async function fetchFuncionarios() {
    if (!isDatabaseConfigured) return;

    const { data } = await postgres
      .from("funcionarios")
      .select("id, usuario:usuarios(nome)");

    if (data) {
      const mapped = data.map((f: any) => ({
        id: f.id,
        usuario: {
          nome: Array.isArray(f.usuario) ? f.usuario[0]?.nome : f.usuario?.nome,
        },
      }));
      setFuncionarios(mapped);
    }
  }

  /* =============================
      Timezone
  ============================== */
  function hojeStr() {
    const today = new Date();
    const brasil = new Date(
      today.getTime() - today.getTimezoneOffset() * 60000
    );
    return brasil.toISOString().split("T")[0];
  }

  /* =============================
      Intervalo
  ============================== */
  function calcularIntervalo() {
    const hoje = hojeStr();
    let inicio: string | null = hoje;
    let fim: string | null = null;

    switch (periodo) {
      case "todos":
        inicio = hoje;
        break;

      case "hoje":
        inicio = fim = hoje;
        break;

      case "7dias":
        inicio = hoje;
        fim = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];
        break;

      case "30dias":
        inicio = hoje;
        fim = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];
        break;

      case "semanal": {
        const d = new Date();
        const diasRestantes = 6 - d.getDay();
        inicio = hoje;
        fim = new Date(Date.now() + diasRestantes * 86400000)
          .toISOString()
          .split("T")[0];
        break;
      }

      case "mensal": {
        const d = new Date();
        const ano = d.getFullYear();
        const mes = d.getMonth();
        const ultimo = new Date(ano, mes + 1, 0).getDate();
        inicio = hoje;
        fim = `${ano}-${String(mes + 1).padStart(2, "0")}-${ultimo}`;
        break;
      }

      case "anual": {
        const ano = new Date().getFullYear();
        inicio = hoje;
        fim = `${ano}-12-31`;
        break;
      }

      case "custom":
        inicio = dataInicio || null;
        fim = dataFim || null;
        break;
    }

    return { inicio, fim };
  }

  /* =============================
      Buscar Agendamentos
  ============================== */
  useEffect(() => {
    fetchAgendamentos();
  }, [
    statusFiltro,
    funcFiltro,
    periodo,
    dataInicio,
    dataFim,
    ordenarPor,
    pagina,
  ]);

  async function fetchAgendamentos() {
    if (!isDatabaseConfigured) return;

    const { inicio, fim } = calcularIntervalo();

    let query = postgres
      .from("agendamentos")
      .select(
        `
        id,
        data,
        hora,
        status,
        cliente_id,
        servico:servicos(nome, preco),
        funcionario:funcionarios(usuario:usuarios(nome))
      `
      )
      .order("data", { ascending: true })
      .order("hora", { ascending: true });

    if (inicio) query.gte("data", inicio);
    if (fim) query.lte("data", fim);
    if (statusFiltro !== "Todos") query.eq("status", statusFiltro);
    if (funcFiltro !== "Todos") query.eq("funcionario_id", funcFiltro);

    const { data: raw } = await query;

    if (!raw || raw.length === 0) {
      setAgendamentos([]);
      setTotalAgendamentos(0);
      return;
    }

    const ids = raw.map((a: any) => a.cliente_id);

    const { data: clientes } = await postgres
      .from("usuarios")
      .select("id, nome, telefone")
      .in("id", ids);

    const clienteMap = new Map();
    clientes?.forEach((c) => clienteMap.set(c.id, c));

    const joined: Agendamento[] = raw.map((a: any) => {
      const serv = Array.isArray(a.servico) ? a.servico[0] : a.servico;
      const func = Array.isArray(a.funcionario)
        ? a.funcionario[0]
        : a.funcionario;
      const cli = clienteMap.get(a.cliente_id) || {
        nome: "",
        telefone: "",
      };

      return {
        id: a.id,
        data: a.data,
        hora: a.hora,
        status: a.status,
        cliente: { nome: cli.nome, telefone: cli.telefone },
        servico: serv,
        funcionario: func
          ? { usuario: { nome: func.usuario?.nome ?? "" } }
          : null,
      };
    });

    if (ordenarPor === "profissional") {
      joined.sort((a, b) =>
        (a.funcionario?.usuario.nome ?? "").localeCompare(
          b.funcionario?.usuario.nome ?? ""
        )
      );
    }

    setTotalAgendamentos(joined.length);

    const start = (pagina - 1) * porPagina;
    setAgendamentos(joined.slice(start, start + porPagina));
  }

  /* =============================
      Update Status
  ============================== */
  async function updateStatus(id: string, status: string) {
    await postgres.from("agendamentos").update({ status }).eq("id", id);
    fetchAgendamentos();
  }

  /* =============================
      Badge inteligente
  ============================== */
  function getBadge(ag: Agendamento) {
    const agora = new Date();
    const horaAg = new Date(`${ag.data}T${ag.hora}`);
    const diffMin = (horaAg.getTime() - agora.getTime()) / 60000;

    if (diffMin < -5)
      return { label: "Atrasado", classe: "bg-red-100 text-red-600" };
    if (Math.abs(diffMin) <= 5)
      return { label: "Agora", classe: "bg-blue-100 text-blue-600" };
    if (diffMin <= 60)
      return { label: "Em breve", classe: "bg-yellow-100 text-yellow-600" };

    return null;
  }

  return {
    /* dados */
    agendamentos,
    funcionarios,
    totalAgendamentos,

    /* filtros */
    statusFiltro,
    funcFiltro,
    ordenarPor,
    periodo,
    dataInicio,
    dataFim,
    pagina,

    /* setters */
    setStatusFiltro,
    setFuncFiltro,
    setOrdenarPor,
    setPeriodo,
    setDataInicio,
    setDataFim,
    setPagina,

    /* aÃ§Ãµes */
    updateStatus,
    getBadge,
  };
}

