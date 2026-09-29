import type { ComponentType } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

type RotaProtegidaProps = { component: ComponentType };

export function AdminRoute({ component: Component }: RotaProtegidaProps) {
  const [, navegar] = useLocation();
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) {
    navegar("/login");
    return null;
  }
  if (user.nivel !== "Administrador") {
    navegar("/minha-conta");
    return null;
  }
  return <Component />;
}

export function UserRoute({ component: Component }: RotaProtegidaProps) {
  const [, navegar] = useLocation();
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) {
    navegar("/login");
    return null;
  }
  if (user.nivel !== "Cliente") {
    navegar("/painel");
    return null;
  }
  if (user.cadastroConcluido === false) {
    navegar("/concluir-cadastro");
    return null;
  }
  return <Component />;
}
