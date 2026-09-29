import "./ConfirmacaoAgendamentoRepetidoModal.css";
import { useEffect, useState } from "react";
import { Modal } from "./ui/modal";
import type { AgendamentoRelacionado } from "@/lib/api";

export function ConfirmacaoAgendamentoRepetidoModal({
  relacionados = [],
  onClose,
  onConfirm,
}: {
  relacionados?: AgendamentoRelacionado[];
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [restante, setRestante] = useState(60);
  const [enviando, setEnviando] = useState(false);
  useEffect(() => {
    const timer = window.setInterval(() => setRestante((atual) => Math.max(0, atual - 1)), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const confirmar = async () => {
    if (!restante || enviando) return;
    setEnviando(true);
    try {
      await onConfirm();
    } finally {
      setEnviando(false);
    }
  };
  return (
    <Modal
      title="Confirmar novo agendamento"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="repeticao-botao-voltar"
          >
            Voltar
          </button>
          <button
            type="button"
            disabled={!restante || enviando}
            onClick={() => void confirmar()}
            className="repeticao-botao-confirmar"
          >
            {enviando ? "Confirmando..." : "Confirmar"}
          </button>
        </>
      }
    >
      <p className="repeticao-mensagem">
        Você já possui outro agendamento neste dia. Deseja realizar mais um agendamento mesmo assim?
      </p>
      {relacionados.length > 0 && (
        <ul className="repeticao-agendamentos">
          {relacionados.map((item) => (
            <li
              key={item.id}
              className="repeticao-agendamento"
            >
              <strong>{item.servico}</strong>
              <br />
              {new Date(`${item.data}T12:00:00`).toLocaleDateString("pt-BR")} às {item.hora} ·{" "}
              {item.profissional}
              <br />
              <span className="repeticao-status">{item.status}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="repeticao-prazo">
        {restante
          ? `Confirme em até 00:${String(restante).padStart(2, "0")}`
          : "A confirmação expirou. Faça uma nova tentativa."}
      </p>
    </Modal>
  );
}
