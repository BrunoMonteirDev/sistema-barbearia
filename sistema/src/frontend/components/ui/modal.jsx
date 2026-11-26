/** Papel do módulo: Implementa a estrutura reutilizável de modal e diálogo de confirmação com foco e semântica acessíveis. */
import "./modal.css";
import { useEffect, useId, useRef } from "react";

const modalSelector = '[role="dialog"][aria-modal="true"]';

export function Modal({ title, children, onClose, footer, size = "default", closeDisabled = false }) {
  const titleId = useId();
  const closeButtonRef = useRef(null);
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = closeDisabled ? null : onClose;
  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const closeOnEscape = (event) => {
      const dialogs = document.querySelectorAll(modalSelector);
      if (dialogs[dialogs.length - 1] !== dialog) return;
      if (event.key === "Escape") onCloseRef.current?.();
      if (event.key !== "Tab") return;
      const focusables = dialog?.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables?.length) {
        event.preventDefault();
        dialog?.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!dialog.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    (closeButtonRef.current?.disabled ? dialog : closeButtonRef.current)?.focus();
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      const currentDialog = Array.from(document.querySelectorAll(modalSelector))
        .findLast((item) => item !== dialog);
      if (
        previousFocus?.isConnected &&
        !previousFocus.matches(":disabled") &&
        (!currentDialog || currentDialog.contains(previousFocus))
      ) {
        previousFocus.focus();
      } else {
        const closeButton = currentDialog?.querySelector(".modal-botao-fechar");
        (closeButton?.disabled ? currentDialog : closeButton)?.focus();
      }
    };
  }, []);
  return (
    <div className="modal-overlay" onMouseDown={closeDisabled ? undefined : onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
        aria-modal="true"
        aria-labelledby={titleId}
        className={`modal-conteudo ${size === "wide" ? "modal-amplo" : "modal-padrao"}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-cabecalho">
          <h2 id={titleId} className="modal-titulo">
            {title}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            disabled={closeDisabled}
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
