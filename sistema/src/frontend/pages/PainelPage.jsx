/** Papel do módulo: Organiza as rotas internas e o layout principal do painel administrativo. */
import "./PainelPage.css";
import { Route, Switch, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/layout/Sidebar";
import ClientesPage from "./painel/ClientesPage";
import ServicosAdminPage from "./painel/ServicosAdminPage";
import FuncionariosPage from "./painel/FuncionariosPage";
import AgendamentosPage from "./painel/AgendamentosPage";
import DashboardPage from "./painel/DashboardPage";
import ContatoConfigPage from "./painel/ContatoConfigPage";
import BloqueiosDataPage from "./painel/BloqueiosDataPage";
const sidebarItems = [
  { href: "/painel", label: "Dashboard", exact: true },
  { href: "/painel/agendamentos", label: "Agendamentos" },
  { href: "/painel/clientes", label: "Clientes" },
  { href: "/painel/servicos", label: "Serviços" },
  { href: "/painel/profissionais", label: "Profissionais" },
  { href: "/painel/configuracoes", label: "Configurações" },
  { href: "/painel/bloqueios", label: "Dias bloqueados" },
];
export default function PainelPage() {
  const { signOut } = useAuth();
  const [, navegar] = useLocation();
  const sairDoPainel = () => {
    signOut();
    navegar("/");
  };
  return (
    <div className="layout-painel">
      <Sidebar items={sidebarItems} onSignOut={sairDoPainel} />
      <main className="conteudo-layout-painel">
        <Switch>
          <Route path="/painel" component={DashboardPage} />
          <Route path="/painel/clientes" component={ClientesPage} />
          <Route path="/painel/servicos" component={ServicosAdminPage} />
          <Route path="/painel/profissionais" component={FuncionariosPage} />
          <Route path="/painel/agendamentos" component={AgendamentosPage} />
          <Route path="/painel/configuracoes" component={ContatoConfigPage} />
          <Route path="/painel/bloqueios" component={BloqueiosDataPage} />
        </Switch>
      </main>
    </div>
  );
}
