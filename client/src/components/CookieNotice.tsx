import { useState } from 'react'
import { Link } from 'wouter'

const chave = 'barbearia.cookies-aviso-visto'

export function CookieNotice() {
  const [visivel, setVisivel] = useState(() => localStorage.getItem(chave) !== 'true')
  if (!visivel) return null
  const aceitar = () => { localStorage.setItem(chave, 'true'); setVisivel(false) }
  return <aside aria-label="Aviso sobre cookies" className="fixed bottom-4 left-4 z-40 max-w-sm rounded-xl border border-slate-200 bg-white p-4 shadow-xl"><p className="text-sm font-semibold text-slate-900">Privacidade e cookies</p><p className="mt-1 text-sm leading-5 text-slate-600">Usamos armazenamento essencial para sessão e preferências de acessibilidade. Serviços como Google e VLibras têm suas próprias políticas.</p><div className="mt-3 flex items-center justify-between gap-3"><Link href="/cookies" className="text-sm font-semibold text-primary-700 hover:underline">Saiba mais</Link><button type="button" className="btn-primary px-4 py-2 text-sm" onClick={aceitar}>Entendi</button></div></aside>
}
