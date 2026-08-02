import { Route, Switch, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar, { type SidebarItem } from "@/components/layout/Sidebar";
import ClientesPage from "./painel/ClientesPage";
import ServicosAdminPage from "./painel/ServicosAdminPage";
import FuncionariosPage from "./painel/FuncionariosPage";
import AgendamentosPage from "./painel/AgendamentosPage";
import DashboardPage from "./painel/DashboardPage";
import WhatsAppConfigPage from "./painel/WhatsAppConfigPage";
import RegrasNegocioPage from "./painel/RegrasNegocioPage";
import EvolutionPage from "./painel/EvolutionPage";

const sidebarItems: SidebarItem[] = [
  { href: "/painel", label: "Dashboard", exact: true },
  { href: "/painel/agendamentos", label: "Agendamentos" },
  { href: "/painel/clientes", label: "Clientes" },
  { href: "/painel/servicos", label: "Serviços" },
  { href: "/painel/profissionais", label: "Profissionais" },
  { href: "/painel/configuracoes", label: "Configurações" },
  { href: "/painel/regras-negocio", label: "Regras de negócio" },
  { href: "/painel/whatsapp", label: "WhatsApp" },
];

export default function PainelPage() {
  const { signOut } = useAuth();
  const [, go] = useLocation();
  const exit = () => {
    signOut();
    go("/");
  };
  return (
    <div className="min-h-screen bg-gray-100 md:flex">
      <Sidebar items={sidebarItems} onSignOut={exit} />
      <main className="min-w-0 flex-1 p-6">
        <Switch>
          <Route path="/painel" component={DashboardPage} />
          <Route path="/painel/clientes" component={ClientesPage} />
          <Route path="/painel/servicos" component={ServicosAdminPage} />
          <Route path="/painel/profissionais" component={FuncionariosPage} />
          <Route path="/painel/agendamentos" component={AgendamentosPage} />
          <Route path="/painel/configuracoes" component={WhatsAppConfigPage} />
          <Route path="/painel/regras-negocio" component={RegrasNegocioPage} />
          <Route path="/painel/whatsapp" component={EvolutionPage} />
        </Switch>
      </main>
    </div>
  );
}
