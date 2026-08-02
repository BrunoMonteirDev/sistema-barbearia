import { useEffect, useMemo, useState } from "react";
import {
  CalendarPlus,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  api,
  type Agendamento,
  type Profissional,
  type Servico,
  type Usuario,
} from "@/lib/api";
import { ConfirmDialog, Modal } from "@/components/ui/modal";
import { formatarTelefoneBrasileiro } from "@/utils/telefone";
import { NovoAgendamentoWizard } from "./NovoAgendamentoWizard";

type FormData = {
  usuarioId: string;
  profissionalId: string;
  servicoId: string;
  data: string;
  hora: string;
  status: string;
};
const emptyForm: FormData = {
  usuarioId: "",
  profissionalId: "",
  servicoId: "",
  data: "",
  hora: "",
  status: "PENDENTE",
};
const statusLabels: Record<string, string> = {
  PENDENTE: "Pendente",
  CONFIRMADO: "Confirmado",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
  ATRASADO: "Atrasado",
};
const statusStyle: Record<string, string> = {
  PENDENTE: "bg-amber-100 text-amber-800",
  CONFIRMADO: "bg-blue-100 text-blue-800",
  CONCLUIDO: "bg-green-100 text-green-800",
  CANCELADO: "bg-red-100 text-red-800",
  ATRASADO: "bg-red-100 text-red-800",
};

export default function AgendamentosPage() {
  const [items, setItems] = useState<Agendamento[]>([]);
  const [clientes, setClientes] = useState<Usuario[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [filtros, setFiltros] = useState({
    cliente: "",
    profissional: "",
    data: "",
    status: "",
  });
  const [modal, setModal] = useState<"novo" | "editar" | "visualizar" | null>(
    null,
  );
  const [selected, setSelected] = useState<Agendamento | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [pendingAction, setPendingAction] = useState<{
    type: "cancelar" | "excluir";
    item: Agendamento;
  } | null>(null);
  const [notificationPrompt, setNotificationPrompt] = useState<{ item: Agendamento; tipo: 'CRIACAO' | 'REMARCACAO' | 'CANCELAMENTO' | 'ATUALIZACAO' } | null>(null);
  // Mantidos para o formulÃ¡rio de ediÃ§Ã£o legado, que nÃ£o Ã© exibido no fluxo novo.
  const [criandoCliente, setCriandoCliente] = useState(false);
  const [novoCliente, setNovoCliente] = useState({ nome: "", telefone: "" });
  const [buscaCliente, setBuscaCliente] = useState("");
  const [visualizacao, setVisualizacao] = useState<"lista" | "agenda" | "semana">("lista");

  const jaTerminou = (item: Agendamento) => {
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
  };

  const load = () => {
    void api.agendamentos
      .list()
      .then(async (agendamentos) => {
        const atrasados = agendamentos.filter(jaTerminou);
        if (atrasados.length) {
          await Promise.all(
            atrasados.map((item) =>
              api.agendamentos.status(item.id, "ATRASADO"),
            ),
          );
          setItems(
            agendamentos.map((item) =>
              atrasados.some((atrasado) => atrasado.id === item.id)
                ? { ...item, status: "ATRASADO" }
                : item,
            ),
          );
          return;
        }
        setItems(agendamentos);
      })
      .catch((error) => toast.error(error.message));
  };
  useEffect(() => {
    load();
    void Promise.all([
      api.usuarios.list(),
      api.profissionais.list(),
      api.servicos.list(),
    ])
      .then(([usuarios, profs, servs]) => {
        setClientes(usuarios.filter((usuario) => usuario.nivel === "Cliente"));
        setProfissionais(profs);
        setServicos(servs);
      })
      .catch((error) => toast.error(error.message));
  }, []);

  const filteredByFields = useMemo(
    () =>
      items.filter(
        (item) =>
          (!filtros.cliente || item.usuario?.id === filtros.cliente) &&
          (!filtros.profissional ||
            item.profissional?.id === filtros.profissional) &&
          (!filtros.status || item.status === filtros.status),
      ),
    [filtros.cliente, filtros.profissional, filtros.status, items],
  );
  const filteredItems = useMemo(() => filteredByFields.filter((item) => !filtros.data || item.data === filtros.data), [filteredByFields, filtros.data]);

  const dataAgenda = filtros.data || new Date().toLocaleDateString("en-CA");
  const mudarDiaAgenda = (dias: number) => {
    const data = new Date(`${dataAgenda}T12:00:00`);
    data.setDate(data.getDate() + dias);
    setFiltros((current) => ({ ...current, data: data.toLocaleDateString("en-CA") }));
  };

  const openNew = () => {
    setForm(emptyForm);
    setSelected(null);
    setModal("novo");
  };
  const openEdit = (item: Agendamento) => {
    setSelected(item);
    setForm({
      usuarioId: item.usuario?.id ?? "",
      profissionalId: item.profissional?.id ?? "",
      servicoId: item.servico?.id ?? "",
      data: item.data,
      hora: item.hora,
      status: item.status,
    });
    setModal("editar");
  };
  const closeModal = () => {
    setModal(null);
    setSelected(null);
  };
  const setField = (field: keyof FormData, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const save = async () => {
    if (
      !form.profissionalId ||
      !form.servicoId ||
      !form.data ||
      !form.hora
    )
      return toast.error("Preencha todos os campos obrigatórios.");
    try {
      if (modal === "editar" && selected) {
        const dadosAtualizados = {
          profissionalId: form.profissionalId,
          servicoId: form.servicoId,
          data: form.data,
          hora: form.hora,
          status: form.status,
        };
        await api.agendamentos.update(selected.id, dadosAtualizados);
      }
      toast.success(
        "Agendamento atualizado.",
      );
      closeModal();
      load();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível salvar.",
      );
    }
  };

  const confirmAction = async () => {
    if (!pendingAction) return;
    try {
      if (pendingAction.type === "cancelar")
        await api.agendamentos.cancel(pendingAction.item.id);
      else await api.agendamentos.remove(pendingAction.item.id);
      toast.success(
        pendingAction.type === "cancelar"
          ? "Agendamento cancelado."
          : "Agendamento excluído.",
      );
      if (pendingAction.type === 'cancelar') setNotificationPrompt({ item: { ...pendingAction.item, status: 'CANCELADO' }, tipo: 'CANCELAMENTO' });
      setPendingAction(null);
      load();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível concluir a ação.",
      );
    }
  };

  const confirmarAgendamento = async (item: Agendamento) => {
    try {
      await api.agendamentos.status(item.id, "CONFIRMADO");
      toast.success("Agendamento confirmado.");
      setNotificationPrompt({ item: { ...item, status: 'CONFIRMADO' }, tipo: 'ATUALIZACAO' });
      load();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível confirmar o agendamento.",
      );
    }
  };

  const concluirAgendamento = async (item: Agendamento) => {
    try {
      await api.agendamentos.status(item.id, "CONCLUIDO");
      toast.success("Agendamento concluído.");
      setNotificationPrompt({ item: { ...item, status: 'CONCLUIDO' }, tipo: 'ATUALIZACAO' });
      load();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível concluir o agendamento.",
      );
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary-500">
            Agendamentos
          </h1>
          <p className="text-sm text-gray-500">
            Gerencie os horários da barbearia.
          </p>
        </div>
        <button
          onClick={openNew}
          className="btn-primary inline-flex items-center justify-center gap-2"
        >
          <CalendarPlus className="h-5 w-5" />
          Novo agendamento
        </button>
      </div>
      <div className="grid gap-4 rounded-xl bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <Filter
          label="Cliente"
          value={filtros.cliente}
          onChange={(value) =>
            setFiltros((current) => ({ ...current, cliente: value }))
          }
        >
          <option value="">Todos os clientes</option>
          {clientes.map((cliente) => (
            <option key={cliente.id} value={cliente.id}>
              {cliente.nome}
            </option>
          ))}
        </Filter>
        <Filter
          label="Funcionário"
          value={filtros.profissional}
          onChange={(value) =>
            setFiltros((current) => ({ ...current, profissional: value }))
          }
        >
          <option value="">Todos os funcionários</option>
          {profissionais.map((profissional) => (
            <option key={profissional.id} value={profissional.id}>
              {profissional.nome}
            </option>
          ))}
        </Filter>
        <label className="text-sm font-medium text-gray-700">
          Data
          <input
            type="date"
            value={filtros.data}
            onChange={(event) =>
              setFiltros((current) => ({
                ...current,
                data: event.target.value,
              }))
            }
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          />
        </label>
        <Filter
          label="Status"
          value={filtros.status}
          onChange={(value) =>
            setFiltros((current) => ({ ...current, status: value }))
          }
        >
          <option value="">Todos os status</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Filter>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          <button type="button" onClick={() => setVisualizacao("lista")} className={`rounded-md px-3 py-2 text-sm font-semibold ${visualizacao === "lista" ? "bg-secondary-800 text-white" : "text-slate-600 hover:bg-slate-100"}`}>Lista</button>
          <button type="button" onClick={() => setVisualizacao("agenda")} className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ${visualizacao === "agenda" ? "bg-secondary-800 text-white" : "text-slate-600 hover:bg-slate-100"}`}><CalendarDays className="h-4 w-4" />Dia</button>
          <button type="button" onClick={() => setVisualizacao("semana")} className={`rounded-md px-3 py-2 text-sm font-semibold ${visualizacao === "semana" ? "bg-secondary-800 text-white" : "text-slate-600 hover:bg-slate-100"}`}>Semana</button>
        </div>
        {visualizacao !== "lista" && <div className="flex items-center gap-1"><button type="button" aria-label={visualizacao === "semana" ? "Semana anterior" : "Dia anterior"} onClick={() => mudarDiaAgenda(visualizacao === "semana" ? -7 : -1)} className="rounded-md p-2 text-slate-700 hover:bg-slate-100"><ChevronLeft className="h-5 w-5" /></button><strong className="min-w-48 text-center text-sm capitalize text-slate-800">{visualizacao === "semana" ? rotuloSemana(dataAgenda) : new Date(`${dataAgenda}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}</strong><button type="button" aria-label={visualizacao === "semana" ? "Próxima semana" : "Próximo dia"} onClick={() => mudarDiaAgenda(visualizacao === "semana" ? 7 : 1)} className="rounded-md p-2 text-slate-700 hover:bg-slate-100"><ChevronRight className="h-5 w-5" /></button></div>}
      </div>
      {visualizacao === "agenda" ? <AgendaDiaria items={filteredByFields.filter((item) => item.data === dataAgenda)} profissionais={profissionais.filter((profissional) => !filtros.profissional || profissional.id === filtros.profissional)} onEdit={openEdit} onConfirm={confirmarAgendamento} onConclude={concluirAgendamento} /> : visualizacao === "semana" ? <AgendaSemanal items={filteredByFields} dataReferencia={dataAgenda} onEdit={openEdit} onConfirm={confirmarAgendamento} onConclude={concluirAgendamento} /> : <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              {[
                "Cliente",
                "Funcionário",
                "Serviço",
                "Data",
                "Hora",
                "Valor",
                "Status",
                "Ações",
              ].map((header) => (
                <th
                  className="whitespace-nowrap px-4 py-3 font-semibold"
                  key={header}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">
                  {item.usuario?.nome ?? "—"}
                </td>
                <td className="px-4 py-3">{item.profissional?.nome ?? "—"}</td>
                <td className="px-4 py-3">{item.servico?.nome ?? "—"}</td>
                <td className="px-4 py-3">{item.data}</td>
                <td className="px-4 py-3">{item.hora}</td>
                <td className="px-4 py-3">
                  {item.servico
                    ? Number(item.servico.preco).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle[item.status] ?? "bg-gray-100 text-gray-700"}`}
                  >
                    {statusLabels[item.status] ?? item.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {item.status === "PENDENTE" && (
                      <button
                        type="button"
                        aria-label="Confirmar agendamento"
                        title="Confirmar agendamento"
                        className="inline-flex items-center gap-1 rounded-md bg-emerald-700 px-2.5 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
                        onClick={() => {
                          void confirmarAgendamento(item);
                        }}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Confirmar
                      </button>
                    )}
                    {["CONFIRMADO", "ATRASADO"].includes(item.status) && (
                      <button
                        type="button"
                        aria-label="Concluir agendamento"
                        title="Concluir agendamento"
                        className="inline-flex items-center gap-1 rounded-md bg-secondary-700 px-2.5 py-2 text-xs font-semibold text-white hover:bg-secondary-800"
                        onClick={() => {
                          void concluirAgendamento(item);
                        }}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Concluir
                      </button>
                    )}
                    <Action
                      label="Visualizar"
                      onClick={() => {
                        setSelected(item);
                        setModal("visualizar");
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Action>
                    <Action label="Editar" onClick={() => openEdit(item)}>
                      <Pencil className="h-4 w-4" />
                    </Action>
                    <Action
                      label="Cancelar"
                      onClick={() =>
                        setPendingAction({ type: "cancelar", item })
                      }
                      disabled={item.status === "CANCELADO"}
                    >
                      <XCircle className="h-4 w-4" />
                    </Action>
                    <Action
                      label="Excluir"
                      onClick={() =>
                        setPendingAction({ type: "excluir", item })
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Action>
                  </div>
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  Nenhum agendamento encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>}
      {modal === "novo" && (
        <NovoAgendamentoWizard
          clientes={clientes}
          profissionais={profissionais}
          servicos={servicos}
          onClose={closeModal}
          onCreated={() => {
            closeModal();
            load();
          }}
        />
      )}
      {modal && modal !== "novo" && (
        <Modal
          title={modal === "editar" ? "Editar agendamento" : "Detalhes do agendamento"}
          onClose={closeModal}
          footer={<><button type="button" onClick={closeModal} className="rounded px-4 py-2 text-gray-700 hover:bg-gray-100">Fechar</button>{modal !== "visualizar" && <button type="button" onClick={save} className="btn-primary">Salvar</button>}</>}
        >
            {modal === "visualizar" && selected ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <Detail label="Cliente" value={selected.usuario?.nome} />
                <Detail
                  label="Funcionário"
                  value={selected.profissional?.nome}
                />
                <Detail label="Serviço" value={selected.servico?.nome} />
                <Detail
                  label="Valor"
                  value={
                    selected.servico
                      ? Number(selected.servico.preco).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })
                      : undefined
                  }
                />
                <Detail label="Data" value={selected.data} />
                <Detail label="Hora" value={selected.hora} />
                <Detail
                  label="Status"
                  value={statusLabels[selected.status] ?? selected.status}
                />
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {String(modal) === "novo" && (
                  <div className="space-y-3 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900">
                        1. Cliente
                      </p>
                      <button
                        type="button"
                        className="hidden"
                        onClick={() => setCriandoCliente((current) => !current)}
                      >
                        {criandoCliente
                          ? "Selecionar cliente existente"
                          : "+ Cadastrar cliente rápido"}
                      </button>
                    </div>
                    {criandoCliente ? (
                      <div className="grid gap-3 rounded-lg border border-slate-300 bg-slate-50 p-4 sm:grid-cols-2">
                        <label className="text-sm font-medium text-slate-800">
                          Nome
                          <input
                            autoFocus
                            required
                            className="input-field mt-1"
                            value={novoCliente.nome}
                            onChange={(event) =>
                              setNovoCliente((current) => ({
                                ...current,
                                nome: event.target.value,
                              }))
                            }
                          />
                        </label>
                        <label className="text-sm font-medium text-slate-800">
                          Telefone{" "}
                          <span className="font-normal text-slate-500">
                            (opcional)
                          </span>
                          <input
                            inputMode="tel"
                            maxLength={15}
                            className="input-field mt-1"
                            placeholder="(00) 00000-0000"
                            value={novoCliente.telefone}
                            onChange={(event) =>
                              setNovoCliente((current) => ({
                                ...current,
                                telefone: formatarTelefoneBrasileiro(
                                  event.target.value,
                                ),
                              }))
                            }
                          />
                        </label>
                        <p className="sm:col-span-2 text-xs text-slate-600">
                          Este cadastro é apenas para a agenda. E-mail e senha
                          não são necessários.
                        </p>
                      </div>
                    ) : (
                      <>
                      <label className="block text-sm font-medium text-slate-800">Pesquisar cliente<input className="input-field mt-1" placeholder="Nome ou telefone" value={buscaCliente} onChange={(event) => setBuscaCliente(event.target.value)} /></label>
                      <Filter
                        label="Cliente"
                        value={form.usuarioId}
                        onChange={(value) => { if (value === "__novo_cliente__") { setCriandoCliente(true); setField("usuarioId", ""); } else setField("usuarioId", value) }}
                      >
                        <option value="__novo_cliente__">+ Cadastrar novo cliente</option>
                        <option value="">Selecione um cliente</option>
                        {clientes.filter((cliente) => `${cliente.nome} ${cliente.telefone ?? ""}`.toLowerCase().includes(buscaCliente.toLowerCase())).map((cliente) => (
                          <option key={cliente.id} value={cliente.id}>
                            {cliente.nome}
                            {cliente.telefone ? ` · ${cliente.telefone}` : ""}
                          </option>
                        ))}
                      </Filter>
                      </>
                    )}
                  </div>
                )}
                <Filter
                  label="Funcionário"
                  value={form.profissionalId}
                  onChange={(value) => setField("profissionalId", value)}
                >
                  <option value="">Selecione</option>
                  {profissionais.map((profissional) => (
                    <option key={profissional.id} value={profissional.id}>
                      {profissional.nome}
                    </option>
                  ))}
                </Filter>
                <Filter
                  label="Serviço"
                  value={form.servicoId}
                  onChange={(value) => setField("servicoId", value)}
                >
                  <option value="">Selecione</option>
                  {servicos.map((servico) => (
                    <option key={servico.id} value={servico.id}>
                      {servico.nome}
                    </option>
                  ))}
                </Filter>
                <label className="text-sm font-medium text-gray-700">
                  Data
                  <input
                    type="date"
                    value={form.data}
                    onChange={(event) => setField("data", event.target.value)}
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                  />
                </label>
                <label className="text-sm font-medium text-gray-700">
                  Hora
                  <input
                    type="time"
                    value={form.hora}
                    onChange={(event) => setField("hora", event.target.value)}
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                  />
                </label>
                <Filter
                  label="Status"
                  value={form.status}
                  onChange={(value) => setField("status", value)}
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Filter>
              </div>
            )}
        </Modal>
      )}
      {pendingAction && (
        <ConfirmDialog
          title={
            pendingAction.type === "cancelar"
              ? "Cancelar agendamento"
              : "Excluir agendamento"
          }
          message={`${pendingAction.type === "cancelar" ? "Deseja cancelar" : "Deseja excluir definitivamente"} o agendamento de ${pendingAction.item.usuario?.nome ?? "cliente"}?`}
          confirmLabel={
            pendingAction.type === "cancelar"
              ? "Cancelar agendamento"
              : "Excluir"
          }
          danger
          onConfirm={() => {
            void confirmAction();
          }}
          onClose={() => setPendingAction(null)}
        />
      )}
      {notificationPrompt && (
        <ConfirmDialog
          title="Enviar notificação por WhatsApp?"
          message={notificationPrompt.item.usuario?.telefone ? `Deseja avisar ${notificationPrompt.item.usuario?.nome ?? 'o cliente'} sobre esta atualização?` : 'O cliente não possui telefone cadastrado. Não é possível enviar uma notificação por WhatsApp.'}
          confirmLabel="Enviar mensagem"
          onConfirm={() => {
            if (!notificationPrompt.item.usuario?.telefone) { toast.error('O cliente não possui telefone cadastrado para receber WhatsApp.'); setNotificationPrompt(null); return; }
            void api.agendamentos.notificar(notificationPrompt.item.id, notificationPrompt.tipo).then(() => { toast.success('Notificação enviada.'); setNotificationPrompt(null); }).catch((error) => toast.error(error instanceof Error ? error.message : 'Não foi possível enviar a notificação.'));
          }}
          onClose={() => setNotificationPrompt(null)}
        />
      )}
    </section>
  );
}

function Filter({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="text-sm font-medium text-gray-700">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2"
      >
        {children}
      </select>
    </label>
  );
}
function Action({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="rounded p-2 text-secondary-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium">{value ?? "—"}</p>
    </div>
  );
}

export function AgendaDiaria({
  items,
  profissionais,
  onEdit,
  onConfirm,
  onConclude,
}: {
  items: Agendamento[];
  profissionais: Profissional[];
  onEdit: (item: Agendamento) => void;
  onConfirm: (item: Agendamento) => Promise<void>;
  onConclude: (item: Agendamento) => Promise<void>;
}) {
  const horarios = Array.from({ length: 24 }, (_, index) => {
    const minutos = 8 * 60 + index * 30;
    return `${String(Math.floor(minutos / 60)).padStart(2, "0")}:${String(minutos % 60).padStart(2, "0")}`;
  });

  if (!profissionais.length) return <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-600">Não há profissionais para exibir nesta agenda.</div>;

  return <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm"><div className="min-w-220"><div className="grid border-b border-slate-200 bg-slate-50" style={{ gridTemplateColumns: `72px repeat(${profissionais.length}, minmax(180px, 1fr))` }}><div className="p-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Hora</div>{profissionais.map((profissional) => <div key={profissional.id} className="border-l border-slate-200 p-3 text-sm font-bold text-slate-900">{profissional.nome}</div>)}</div>{horarios.map((hora) => <div key={hora} className="grid min-h-18 border-b border-slate-100" style={{ gridTemplateColumns: `72px repeat(${profissionais.length}, minmax(180px, 1fr))` }}><div className="p-3 text-xs font-semibold text-slate-500">{hora}</div>{profissionais.map((profissional) => { const agendamentos = items.filter((item) => item.profissional?.id === profissional.id && item.hora === hora); return <div key={profissional.id} className="border-l border-slate-100 p-1.5">{agendamentos.map((item) => <article key={item.id} onClick={() => onEdit(item)} className={`cursor-pointer rounded-md p-2 text-xs shadow-sm transition hover:ring-2 hover:ring-secondary-300 ${statusStyle[item.status] ?? "bg-slate-100 text-slate-700"}`}><p className="font-bold">{item.usuario?.nome ?? "Cliente"}</p><p className="mt-0.5 truncate">{item.servico?.nome ?? "Serviço"} · {item.servico?.duracao ?? 0} min</p><p className="mt-1 font-semibold">{statusLabels[item.status] ?? item.status}</p>{item.status === "PENDENTE" && <button type="button" onClick={(event) => { event.stopPropagation(); void onConfirm(item); }} className="mt-2 rounded bg-white/80 px-2 py-1 font-bold text-emerald-800 hover:bg-white">Confirmar</button>}{["CONFIRMADO", "ATRASADO"].includes(item.status) && <button type="button" onClick={(event) => { event.stopPropagation(); void onConclude(item); }} className="mt-2 rounded bg-white/80 px-2 py-1 font-bold text-secondary-800 hover:bg-white">Concluir</button>}</article>)}</div>})}</div>)}</div></div>;
}

function inicioSemana(data: string) {
  const valor = new Date(`${data}T12:00:00`);
  valor.setDate(valor.getDate() - ((valor.getDay() + 6) % 7));
  return valor;
}

function datasDaSemana(data: string) {
  const inicio = inicioSemana(data);
  return Array.from({ length: 7 }, (_, index) => {
    const dia = new Date(inicio);
    dia.setDate(inicio.getDate() + index);
    return dia.toLocaleDateString("en-CA");
  });
}

function rotuloSemana(data: string) {
  const dias = datasDaSemana(data);
  return `${new Date(`${dias[0]}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} – ${new Date(`${dias[6]}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}`;
}

export function AgendaSemanal({ items, dataReferencia, onEdit, onConfirm, onConclude }: { items: Agendamento[]; dataReferencia: string; onEdit: (item: Agendamento) => void; onConfirm: (item: Agendamento) => Promise<void>; onConclude: (item: Agendamento) => Promise<void> }) {
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-7">{datasDaSemana(dataReferencia).map((data) => { const doDia = items.filter((item) => item.data === data).sort((a, b) => a.hora.localeCompare(b.hora)); return <section key={data} className="min-h-44 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"><h3 className="border-b border-slate-100 pb-2 text-sm font-bold capitalize text-slate-900">{new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit" })}</h3><div className="mt-3 space-y-2">{doDia.length ? doDia.map((item) => <article key={item.id} onClick={() => onEdit(item)} className={`cursor-pointer rounded-md p-2 text-xs shadow-sm transition hover:ring-2 hover:ring-secondary-300 ${statusStyle[item.status] ?? "bg-slate-100 text-slate-700"}`}><p className="font-bold">{item.hora} · {item.usuario?.nome ?? "Cliente"}</p><p className="mt-0.5 truncate">{item.profissional?.nome ?? "Profissional"} · {item.servico?.nome ?? "Serviço"}</p><p className="mt-1 font-semibold">{statusLabels[item.status] ?? item.status}</p>{item.status === "PENDENTE" && <button type="button" onClick={(event) => { event.stopPropagation(); void onConfirm(item); }} className="mt-2 rounded bg-white/80 px-2 py-1 font-bold text-emerald-800 hover:bg-white">Confirmar</button>}{["CONFIRMADO", "ATRASADO"].includes(item.status) && <button type="button" onClick={(event) => { event.stopPropagation(); void onConclude(item); }} className="mt-2 rounded bg-white/80 px-2 py-1 font-bold text-secondary-800 hover:bg-white">Concluir</button>}</article>) : <p className="pt-3 text-xs text-slate-400">Sem agendamentos.</p>}</div></section>})}</div>;
}
