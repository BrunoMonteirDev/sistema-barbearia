import { postgres, isDatabaseConfigured } from "@/lib/postgres";
import { Agendamento, Funcionario } from "./agendamentos.types";

/* =========================
   FuncionÃ¡rios
========================= */
export async function fetchFuncionarios(): Promise<Funcionario[]> {
  if (!isDatabaseConfigured) return [];

  const { data } = await postgres
    .from("funcionarios")
    .select("id, usuario:usuarios(nome)");

  return (
    data?.map((f: any) => ({
      id: f.id,
      usuario: {
        nome: Array.isArray(f.usuario) ? f.usuario[0]?.nome : f.usuario?.nome,
      },
    })) || []
  );
}

/* =========================
   Clientes
========================= */
export async function fetchClientes(): Promise<{ id: string; nome: string }[]> {
  if (!isDatabaseConfigured) return [];

  const { data } = await postgres
    .from("usuarios")
    .select("id, nome")
    .eq("nivel", "Cliente")
    .eq("ativo", true);

  return data || [];
}

/* =========================
   Helpers de data (SEM UTC BUG)
========================= */
function hojeStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
}

function somarDias(dias: number) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
}

function calcularIntervalo(
  periodo: string,
  dataInicio?: string,
  dataFim?: string
) {
  const hoje = hojeStr();

  let inicio: string | null = null;
  let fim: string | null = null;

  switch (periodo) {
    case "todos":
      inicio = hoje;
      break;

    case "hoje":
      inicio = hoje;
      fim = hoje;
      break;

    case "7dias":
      inicio = hoje;
      fim = somarDias(7);
      break;

    case "30dias":
      inicio = hoje;
      fim = somarDias(30);
      break;

    case "custom":
      inicio = dataInicio || null;
      fim = dataFim || null;
      break;
  }

  return { inicio, fim };
}

/* =========================
   Agendamentos
========================= */
interface FetchAgendamentosParams {
  periodo: string;
  statusFiltro: string;
  funcFiltro: string;
  ordenarPor: string;
  pagina: number;
  porPagina?: number;

  // âœ… ADICIONADOS
  dataInicio?: string;
  dataFim?: string;
}

export async function fetchAgendamentos({
  periodo,
  statusFiltro,
  funcFiltro,
  ordenarPor,
  pagina,
  porPagina = 10,
  dataInicio,
  dataFim,
}: FetchAgendamentosParams): Promise<{
  dados: Agendamento[];
  total: number;
}> {
  if (!isDatabaseConfigured) return { dados: [], total: 0 };

  // âœ… AGORA O CUSTOM FUNCIONA
  const { inicio, fim } = calcularIntervalo(periodo, dataInicio, dataFim);

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
    `,
      { count: "exact" }
    )
    .order("data", { ascending: true })
    .order("hora", { ascending: true });

  if (inicio) query = query.gte("data", inicio);
  if (fim) query = query.lte("data", fim);
  if (statusFiltro !== "Todos") query = query.eq("status", statusFiltro);
  if (funcFiltro !== "Todos") query = query.eq("funcionario_id", funcFiltro);

  const from = (pagina - 1) * porPagina;
  const to = from + porPagina - 1;
  query = query.range(from, to);

  const { data: raw, count } = await query;

  if (!raw || raw.length === 0) {
    return { dados: [], total: count || 0 };
  }

  // Buscar clientes
  const clienteIds = raw.map((a: any) => a.cliente_id);

  const { data: clientes } = await postgres
    .from("usuarios")
    .select("id, nome, telefone")
    .in("id", clienteIds);

  const clienteMap = new Map();
  clientes?.forEach((c) => clienteMap.set(c.id, c));

  const dados: Agendamento[] = raw.map((a: any) => {
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
      cliente: {
        nome: cli.nome,
        telefone: cli.telefone,
      },
      servico: serv,
      funcionario: func
        ? { usuario: { nome: func.usuario?.nome ?? "" } }
        : null,
    };
  });

  if (ordenarPor === "profissional") {
    dados.sort((a, b) =>
      (a.funcionario?.usuario.nome ?? "").localeCompare(
        b.funcionario?.usuario.nome ?? ""
      )
    );
  }

  return {
    dados,
    total: count || 0,
  };
}

/* =========================
   Status
========================= */
export async function updateStatusAgendamento(id: string, status: string) {
  await postgres.from("agendamentos").update({ status }).eq("id", id);
}

