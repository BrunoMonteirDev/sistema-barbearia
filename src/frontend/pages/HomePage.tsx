import "./HomePage.css";
import {
  CalendarDays,
  Clock3,
  Instagram,
  Mail,
  MessageCircle,
  Phone,
  Scissors,
  Star,
  Trophy,
  UserRoundCheck,
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";

const diferenciais = [
  {
    icon: Scissors,
    titulo: "Cortes modernos",
    texto: "Estilos atuais e clássicos para todos os gostos.",
  },
  {
    icon: Star,
    titulo: "Profissionais qualificados",
    texto: "Equipe especializada em cuidados masculinos.",
  },
  {
    icon: Clock3,
    titulo: "Agendamento online",
    texto: "Marque seu horário de forma prática e rápida.",
  },
  {
    icon: Trophy,
    titulo: "Cartão fidelidade",
    texto: "Acumule pontos e ganhe serviços gratuitos.",
  },
];

export default function HomePage() {
  const { user, signOut } = useAuth();
  const [contatos, setContatos] = useState<{
    telefoneWhatsApp: string | null;
    email: string | null;
    instagram: string | null;
  }>({ telefoneWhatsApp: null, email: null, instagram: null });
  const destinoUsuario = user?.nivel === "Administrador" ? "/painel" : "/minha-conta";

  useEffect(() => {
    void api.configuracoes
      .publico()
      .then(setContatos)
      .catch(() => setContatos({ telefoneWhatsApp: null, email: null, instagram: null }));
  }, []);

  const numeroWhatsApp = contatos.telefoneWhatsApp?.replace(/\D/g, "");
  const linkWhatsApp = numeroWhatsApp
    ? `https://wa.me/${numeroWhatsApp.startsWith("55") ? numeroWhatsApp : `55${numeroWhatsApp}`}`
    : null;
  return (
    <main className="pagina-inicial">
      <header className="cabecalho-inicial">
        <div className="cabecalho-inicial-conteudo">
          <Link
            href="/"
            className="marca-inicial"
          >
            <Scissors className="icone-inicial" />
            Barbearia
          </Link>
          <nav className="navegacao-inicial">
            <a
              href="#inicio"
              className="link-inicio-inicial"
            >
              Início
            </a>
            <Link
              href="/agendamento"
              className="link-agendar-inicial"
            >
              Agendar
            </Link>
            {user ? (
              <>
                <Link
                  href={destinoUsuario}
                  className="botao-area-inicial"
                >
                  Minha área
                </Link>
                <button
                  type="button"
                  onClick={signOut}
                  className="botao-sair-inicial"
                >
                  Sair
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="botao-area-inicial"
              >
                Entrar
              </Link>
            )}
          </nav>
        </div>
      </header>
      <section
        id="inicio"
        className="hero-inicial"
      >
        <div
          className="hero-inicial-imagem"
          style={{ backgroundImage: "url('/bg.png')" }}
        />
        <div className="hero-inicial-overlay" />
        <div className="hero-inicial-conteudo">
          <div className="hero-inicial-texto">
            <h1 className="hero-inicial-titulo">
              Estilo e <span className="hero-inicial-destaque">Precisão</span> em
              <br />
              Cada Corte
            </h1>
            <p className="hero-inicial-descricao">
              Experiência de alto nível em cuidados masculinos — ambiente moderno, atendimento
              premium.
            </p>
            <div className="hero-inicial-acoes">
              <Link
                href="/agendamento"
                className="botao-agendar-inicial"
              >
                <CalendarDays className="icone-acao-inicial" />
                Agendar agora
              </Link>
              {linkWhatsApp ? (
                <a
                  href={linkWhatsApp}
                  target="_blank"
                  rel="noreferrer"
                  className="botao-whatsapp-inicial"
                >
                  <MessageCircle className="icone-acao-inicial" />
                  WhatsApp
                </a>
              ) : (
                <span
                  className="whatsapp-indisponivel-inicial"
                  title="WhatsApp ainda não configurado"
                >
                  <MessageCircle className="icone-acao-inicial" />
                  WhatsApp indisponível
                </span>
              )}
            </div>
          </div>
        </div>
      </section>
      <section
        id="diferenciais"
        className="diferenciais-inicial"
      >
        <div className="diferenciais-inicial-cabecalho">
          <h2 className="diferenciais-inicial-titulo">Por que nos escolher?</h2>
          <p className="diferenciais-inicial-descricao">
            Uma experiência completa em cuidados masculinos.
          </p>
        </div>
        <div className="diferenciais-inicial-grade">
          {diferenciais.slice(0, 3).map((item) => (
            <article
              key={item.titulo}
              className="diferencial-inicial"
            >
              <span className="diferencial-inicial-icone">
                <item.icon className="icone-inicial" />
              </span>
              <h3 className="diferencial-inicial-titulo">{item.titulo}</h3>
              <p className="diferencial-inicial-texto">{item.texto}</p>
            </article>
          ))}
        </div>
        {user && (
          <div className="area-cliente-inicial">
            <Link
              href={destinoUsuario}
              className="link-area-cliente-inicial"
            >
              <UserRoundCheck className="icone-acao-inicial" />
              Acessar minha área
            </Link>
          </div>
        )}
      </section>
      <footer className="rodape-inicial">
        <div className="rodape-inicial-grade">
          <section>
            <Link
              href="/"
              className="rodape-inicial-marca"
            >
              <Scissors className="icone-inicial" />
              Barbearia
            </Link>
            <p className="rodape-inicial-descricao">
              A melhor experiência em cuidados masculinos. Cortes modernos, barba impecável e
              ambiente acolhedor.
            </p>
          </section>
          <section>
            <h2 className="rodape-inicial-titulo">Links rápidos</h2>
            <nav
              aria-label="Links rápidos"
              className="rodape-inicial-navegacao"
            >
              <a
                href="#inicio"
                className="rodape-inicial-link"
              >
                Início
              </a>
              <Link
                href="/agendamento"
                className="rodape-inicial-link"
              >
                Agendar
              </Link>
              <Link
                href="/privacidade"
                className="rodape-inicial-link"
              >
                Privacidade
              </Link>
              <Link
                href="/termos"
                className="rodape-inicial-link"
              >
                Termos de uso
              </Link>
              <Link
                href="/cookies"
                className="rodape-inicial-link"
              >
                Cookies
              </Link>
            </nav>
          </section>
          <section>
            <h2 className="rodape-inicial-titulo">Contato</h2>
            <div className="rodape-inicial-contatos">
              {linkWhatsApp ? (
                <a
                  href={linkWhatsApp}
                  target="_blank"
                  rel="noreferrer"
                  className="rodape-inicial-contato-link"
                >
                  <Phone className="rodape-inicial-icone-contato" />
                  {contatos.telefoneWhatsApp}
                </a>
              ) : (
                <p className="rodape-inicial-contato">
                  <Phone className="rodape-inicial-icone-contato" />
                  WhatsApp não configurado
                </p>
              )}
              <a
                href={`mailto:${contatos.email ?? "contato@barbearia.com"}`}
                className="rodape-inicial-contato-link"
              >
                <Mail className="rodape-inicial-icone-contato" />
                {contatos.email ?? "contato@barbearia.com"}
              </a>
            </div>
          </section>
          <section>
            <h2 className="rodape-inicial-titulo">Redes sociais</h2>
            <div className="rodape-inicial-redes">
              {contatos.instagram && (
                <a
                  href={contatos.instagram}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram da Barbearia"
                  className="rodape-inicial-instagram"
                >
                  <Instagram className="icone-inicial" />
                </a>
              )}
              {linkWhatsApp && (
                <a
                  href={linkWhatsApp}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Abrir WhatsApp da barbearia"
                  className="rodape-inicial-whatsapp"
                >
                  <MessageCircle className="icone-inicial" />
                </a>
              )}
            </div>
            {!contatos.instagram && !linkWhatsApp && (
              <p className="rodape-inicial-sem-redes">Nenhuma rede social configurada.</p>
            )}
          </section>
        </div>
        <div className="rodape-inicial-direitos">
          © 2026 Barbearia. Todos os direitos reservados.
        </div>
      </footer>
    </main>
  );
}
