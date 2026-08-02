import { useEffect, useRef, type ReactNode } from 'react'

interface ModalProps {
  title: string
  children: ReactNode
  onClose: () => void
  footer?: ReactNode
  size?: 'default' | 'wide'
}

export function Modal({ title, children, onClose, footer, size = 'default' }: ModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)

  onCloseRef.current = onClose

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current()
      if (event.key !== 'Tab') return
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')
      if (!focusables?.length) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }

    document.addEventListener('keydown', closeOnEscape)
    closeButtonRef.current?.focus()
    return () => { document.removeEventListener('keydown', closeOnEscape); previousFocus?.focus() }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onMouseDown={onClose}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="modal-title" className={`flex max-h-[90vh] w-full ${size === 'wide' ? 'max-w-3xl' : 'max-w-xl'} flex-col rounded-xl bg-white p-6 shadow-xl`} onMouseDown={event => event.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 id="modal-title" className="text-xl font-bold text-secondary-500">{title}</h2>
          <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="Fechar janela" className="rounded p-2 text-gray-500 hover:bg-gray-100">×</button>
        </div>
        <div className="min-h-0 overflow-y-auto pr-1">{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  )
}

interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  onClose: () => void
  danger?: boolean
}

export function ConfirmDialog({ title, message, confirmLabel, cancelLabel = 'Voltar', onConfirm, onClose, danger = false }: ConfirmDialogProps) {
  return <Modal title={title} onClose={onClose} footer={<><button type="button" onClick={onClose} className="rounded px-4 py-2 text-gray-700 hover:bg-gray-100">{cancelLabel}</button><button type="button" onClick={onConfirm} className={danger ? 'rounded bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700' : 'btn-primary'}>{confirmLabel}</button></>}><p className="text-gray-600">{message}</p></Modal>
}
