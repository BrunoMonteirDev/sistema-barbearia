import "./modal.css";
import { useEffect, useRef } from "react";
export function Modal({ title, children, onClose, footer, size = "default" }) {
  const closeButtonRef = useRef(null);
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onCloseRef.current();
      if (event.key !== "Tab") return;
      const focusables = dialogRef.current?.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    closeButtonRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      previousFocus?.focus();
    };
  }, []);
  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`modal-conteudo ${size === "wide" ? "modal-amplo" : "modal-padrao"}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-cabecalho">
          <h2 id="modal-title" className="modal-titulo">
            {title}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar janela"
            className="modal-botao-fechar"
          >
            ×
          </button>
        </div>
        <div className="modal-corpo">{children}</div>
        {footer && <div className="modal-acoes">{footer}</div>}
      </div>
    </div>
  );
}
export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel = "Voltar",
  onConfirm,
  onClose,
  danger = false,
}) {
  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="dialog-botao-cancelar"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={
              danger ? "dialog-botao-perigo" : "dialog-botao-confirmar"
            }
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="dialog-confirmacao-mensagem">{message}</p>
    </Modal>
  );
}
