import "./Sidebar.css";
import type { LucideIcon } from "lucide-react";
import { LogOut, Scissors } from "lucide-react";
import { Link, useLocation } from "wouter";

export interface SidebarItem {
  href: string;
  label: string;
  icon?: LucideIcon;
  exact?: boolean;
}

interface SidebarProps {
  items: SidebarItem[];
  onSignOut: () => void;
  title?: string;
}

export default function Sidebar({ items, onSignOut, title = "Barbearia" }: SidebarProps) {
  const [localizacao] = useLocation();

  return (
    <aside className="sidebar">
      <Link
        href="/"
        className="sidebar-cabecalho"
      >
        <Scissors
          className="sidebar-icone-marca"
          aria-hidden="true"
        />
        <span className="sidebar-titulo">{title}</span>
      </Link>
      <nav
        aria-label="Navegação do painel"
        className="sidebar-navegacao"
      >
        {items.map((item) => {
          const itemAtivo = item.exact
            ? localizacao === item.href
            : localizacao === item.href || localizacao.startsWith(`${item.href}/`);
          const Icon = item.icon;
          const classeItem = itemAtivo ? "sidebar-link-ativo" : "sidebar-link-inativo";
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={itemAtivo ? "page" : undefined}
              className={`sidebar-link ${classeItem}`}
            >
              {Icon && (
                <Icon
                  className="sidebar-icone"
                  aria-hidden="true"
                />
              )}
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="sidebar-acoes">
        <button
          type="button"
          onClick={onSignOut}
          className="sidebar-botao-logout"
        >
          <LogOut
            className="sidebar-icone"
            aria-hidden="true"
          />
          Sair
        </button>
      </div>
    </aside>
  );
}
