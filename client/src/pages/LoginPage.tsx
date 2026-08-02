import { useState, type FormEvent } from 'react'
import { useLocation } from 'wouter'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const { signIn, signUp } = useAuth()
  const [, go] = useLocation()
  const [register, setRegister] = useState(false)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    try {
      if (register) await signUp(nome, email, senha)
      else await signIn(email, senha)
      toast.success('Acesso realizado.')
      go(register ? '/minha-conta' : '/')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao autenticar.')
    }
  }

  return <main className="min-h-screen grid place-items-center bg-gray-100 p-4">
    <form className="w-full max-w-sm space-y-4 rounded-xl bg-white p-6 shadow" onSubmit={submit}>
      <button type="button" className="-ml-2 inline-flex items-center gap-2 rounded px-2 py-1 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950" onClick={() => go('/')}>
        ← Voltar ao início
      </button>
      <h1 className="text-2xl font-bold">{register ? 'Criar conta' : 'Entrar'}</h1>
      {register && <input required className="input-field" placeholder="Nome completo" value={nome} onChange={event => setNome(event.target.value)} />}
      <input required type="email" className="input-field" placeholder="E-mail" value={email} onChange={event => setEmail(event.target.value)} />
      <input required minLength={6} type="password" className="input-field" placeholder="Senha" value={senha} onChange={event => setSenha(event.target.value)} />
      <button className="btn-primary w-full">{register ? 'Cadastrar' : 'Entrar'}</button>
      <button type="button" className="w-full text-primary-600" onClick={() => setRegister(!register)}>{register ? 'Já tenho uma conta' : 'Criar conta de cliente'}</button>
    </form>
  </main>
}
