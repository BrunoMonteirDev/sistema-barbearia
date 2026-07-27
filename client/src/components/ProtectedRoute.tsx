import { useLocation } from 'wouter'
import { useAuth } from '@/contexts/AuthContext'
import type { ComponentType } from 'react'
export function AdminRoute({ component: Component }: { component: ComponentType }) { const [, go] = useLocation(); const { user, loading } = useAuth(); if (loading) return null; if (!user) { go('/login'); return null }; if (user.nivel !== 'Administrador') { go('/minha-conta'); return null }; return <Component /> }
export function UserRoute({ component: Component }: { component: ComponentType }) { const [, go] = useLocation(); const { user, loading } = useAuth(); if (loading) return null; if (!user) { go('/login'); return null }; if (user.nivel !== 'Cliente') { go('/painel'); return null }; return <Component /> }
