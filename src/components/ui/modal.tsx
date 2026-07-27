'use client'
import type { ReactNode } from 'react'
export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) { return <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label={title}><div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"><div className="mb-4 flex justify-between"><h2 className="text-lg font-semibold">{title}</h2><button aria-label="Fechar" onClick={onClose}>×</button></div>{children}</div></div> }
