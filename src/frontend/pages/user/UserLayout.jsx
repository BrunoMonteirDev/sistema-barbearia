import "./UserLayout.css";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/layout/Sidebar";
const sidebarItems = [
  { href: "/minha-conta", label: "Minha conta", exact: true },
  { href: "/minha-conta/agendamentos", label: "Meus agendamentos" },
];
export function UserLayout({ children }) {
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
