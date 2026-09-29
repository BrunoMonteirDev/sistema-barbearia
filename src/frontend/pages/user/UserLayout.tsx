import "./UserLayout.css";
import type { ReactNode } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar, { type SidebarItem } from "@/components/layout/Sidebar";

const sidebarItems: SidebarItem[] = [
  { href: "/minha-conta", label: "Minha conta", exact: true },
  { href: "/minha-conta/agendamentos", label: "Meus agendamentos" },
];

export function UserLayout({ children }: { children: ReactNode }) {
  const { signOut } = useAuth();
  const [, navigate] = useLocation();

  const signOutAndReturnHome = () => {
    signOut();
    navigate("/");
  };

  return (
    <div className="layout-usuario">
      <Sidebar
        items={sidebarItems}
        onSignOut={signOutAndReturnHome}
        title="Barbearia"
      />
      <main className="conteudo-layout-usuario">{children}</main>
    </div>
  );
}
