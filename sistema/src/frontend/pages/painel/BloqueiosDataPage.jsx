/** Papel do módulo: Permite ao administrador bloquear e liberar datas sem atendimento. */
import "./BloqueiosDataPage.css";
import { useEffect, useState } from "react";
import { CalendarOff, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { SelecaoOrdenacao, useOrdenacao } from "./OrdenacaoPainel";

const opcoesOrdenacao = { data: "Data", motivo: "Motivo" };
const camposOrdenacao = {
  data: (bloqueio) => bloqueio.data,
  motivo: (bloqueio) => bloqueio.motivo,
};

export default function BloqueiosDataPage() {
  const [bloqueios, setBloqueios] = useState([]);
  const [data, setData] = useState("");
  const [motivo, setMotivo] = useState("");
  const [salvando, setSalvando] = useState(false);
  const { ordenacao, definirOrdenacao, ordenar } = useOrdenacao("data");
  const carregar = () => void api.bloqueios.list().then(setBloqueios).catch((error) => toast.error(error.message));
  useEffect(() => { carregar(); }, []);

  const criar = async (event) => {
    event.preventDefault();
    setSalvando(true);
    try {
      await api.bloqueios.create({ data, motivo });
      toast.success("Data bloqueada.");
      setData("");
      setMotivo("");
      carregar();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível bloquear a data.");
    } finally {
      setSalvando(false);
    }
  };

  const remover = async (bloqueio) => {
    try {
      await api.bloqueios.remove(bloqueio.id);
      toast.success("Bloqueio removido. A disponibilidade voltou a seguir os horários configurados.");
      carregar();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível remover o bloqueio.");
    }
  };

  return <section className="pagina-agendamentos">
    <header className="cabecalho-agendamentos"><div><h1 className="titulo-agendamentos">Dias bloqueados</h1><p className="descricao-agendamentos">Impeça novos agendamentos em feriados, folgas ou outros dias sem atendimento.</p></div></header>
    <form onSubmit={criar} className="formulario-bloqueio-data">
      <label>Data<input required type="date" value={data} onChange={(event) => setData(event.target.value)} /></label>
      <label>Motivo<input required maxLength={180} value={motivo} onChange={(event) => setMotivo(event.target.value)} placeholder="Ex.: Feriado, férias ou compromisso" /></label>
      <button disabled={salvando} className="botao-principal-agenda">{salvando ? "Salvando..." : "Bloquear data"}</button>
    </form>
    {bloqueios.length > 0 && (
      <div className="ordenacao-bloqueios-data">
        <SelecaoOrdenacao ordenacao={ordenacao} definirOrdenacao={definirOrdenacao} opcoes={opcoesOrdenacao} />
      </div>
    )}
    <div className="lista-bloqueios-data" aria-live="polite">
      {bloqueios.length ? ordenar(bloqueios, camposOrdenacao).map((item) => <article key={item.id} className="cartao-bloqueio-data">
        <span className="icone-bloqueio-data"><CalendarOff aria-hidden="true" /></span>
        <div><strong>{new Date(`${item.data}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}</strong><p>{item.motivo}</p></div>
        <button type="button" aria-label={`Remover bloqueio de ${item.data}`} title="Remover bloqueio" onClick={() => void remover(item)}><Trash2 aria-hidden="true" /></button>
      </article>) : <p className="descricao-agendamentos">Nenhuma data bloqueada.</p>}
    </div>
  </section>;
}
