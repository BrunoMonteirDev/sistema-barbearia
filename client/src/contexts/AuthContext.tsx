import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, authStorage, type Usuario } from '@/lib/api'
type Auth = { user: Usuario | null; loading: boolean; signIn: (email: string, password: string) => Promise<void>; signInGoogle: (idToken: string) => Promise<void>; signUp: (nome: string, email: string, password: string) => Promise<void>; atualizarUsuario: (usuario: Usuario) => void; signOut: () => void }
const Context = createContext<Auth | undefined>(undefined)
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null); const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!authStorage.get()) { setLoading(false); return }
    api.usuarios.me().then(setUser).catch(authStorage.clear).finally(() => setLoading(false))
  }, [])
  const signIn = async (email: string, password: string) => { const result = await api.auth.login({ email, password }); authStorage.set(result.token); setUser(result.user) }
  const signInGoogle = async (idToken: string) => { const result = await api.auth.google(idToken); authStorage.set(result.token); setUser(result.user) }
  const signUp = async (nome: string, email: string, password: string) => { const result = await api.auth.register({ nome, email, password }); authStorage.set(result.token); setUser(result.user) }
  const atualizarUsuario = (usuario: Usuario) => setUser(usuario)
  const signOut = () => { authStorage.clear(); setUser(null) }
  return <Context.Provider value={{ user, loading, signIn, signInGoogle, signUp, atualizarUsuario, signOut }}>{children}</Context.Provider>
}
export function useAuth() { const value = useContext(Context); if (!value) throw new Error('useAuth deve ser usado dentro de AuthProvider'); return value }
