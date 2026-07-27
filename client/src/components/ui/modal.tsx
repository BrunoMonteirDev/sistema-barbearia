import { useEffect, useRef, type ReactNode } from 'react'

interface ModalProps {
  title: string
  children: ReactNode
  onClose: () => void
  footer?: ReactNode
}

export function Modal({ title, children, onClose, footer }: ModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', closeOnEscape)
    closeButtonRef.current?.focus()
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="modal-title" className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl" onMouseDown={event => event.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 id="modal-title" className="text-xl font-bold text-secondary-500">{title}</h2>
          <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="Fechar janela" className="rounded p-2 text-gray-500 hover:bg-gray-100">×</button>
        </div>
        {children}
        {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  )
}

interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel: string
  onConfirm: () => void
  onClose: () => void
  danger?: boolean
}

export function ConfirmDialog({ title, message, confirmLabel, onConfirm, onClose, danger = false }: ConfirmDialogProps) {
  return <Modal title={title} onClose={onClose} footer={<><button type="button" onClick={onClose} className="rounded px-4 py-2 text-gray-700 hover:bg-gray-100">Voltar</button><button type="button" onClick={onConfirm} className={danger ? 'rounded bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700' : 'btn-primary'}>{confirmLabel}</button></>}><p className="text-gray-600">{message}</p></Modal>
}
