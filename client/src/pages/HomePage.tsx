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
  const [contatos, setContatos] = useState<{ telefoneWhatsApp: string | null; email: string | null; instagram: string | null }>({ telefoneWhatsApp: null, email: null, instagram: null });
  const destinoUsuario =
    user?.nivel === "Administrador" ? "/painel" : "/minha-conta";

  useEffect(() => {
    void api.configuracoes.publico()
      .then(setContatos)
      .catch(() => setContatos({ telefoneWhatsApp: null, email: null, instagram: null }));
  }, []);

  const numeroWhatsApp = contatos.telefoneWhatsApp?.replace(/\D/g, "");
  const linkWhatsApp = numeroWhatsApp
    ? `https://wa.me/${numeroWhatsApp.startsWith("55") ? numeroWhatsApp : `55${numeroWhatsApp}`}`
    : null;
  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <header className="bg-secondary-600 text-white">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
            <Scissors className="h-5 w-5" />
            Barbearia
          </Link>
          <nav className="flex items-center gap-5 text-sm font-semibold sm:gap-7">
            <a
              href="#inicio"
              className="text-primary-300 hover:text-primary-200"
            >
              Início
            </a>
            <Link href="/agendamento" className="hover:text-slate-200">
              Agendar
            </Link>
            {user ? (
              <>
                <Link
                  href={destinoUsuario}
                  className="rounded-full bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
                >
                  Minha área
                </Link>
                <button
                  type="button"
                  onClick={signOut}
                  className="hidden text-slate-200 hover:text-white sm:block"
                >
                  Sair
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-full bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
              >
                Entrar
              </Link>
            )}
          </nav>
        </div>
      </header>
      <section
        id="inicio"
        className="relative isolate min-h-[360px] overflow-hidden bg-slate-800 sm:min-h-[460px]"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/bg.png')" }}
        />
        <div className="absolute inset-0 bg-slate-950/55" />
        <div className="relative mx-auto flex min-h-[360px] max-w-6xl items-center px-5 py-12 sm:min-h-[460px]">
          <div className="max-w-xl text-white">
            <h1 className="text-4xl font-extrabold leading-[.95] tracking-tight sm:text-5xl">
              Estilo e <span className="text-primary-400">Precisão</span> em
              <br />
              Cada Corte
            </h1>
            <p className="mt-4 max-w-lg text-sm text-slate-100 sm:text-base">
              Experiência de alto nível em cuidados masculinos — ambiente
              moderno, atendimento premium.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/agendamento"
                className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-700"
              >
                <CalendarDays className="h-4 w-4" />
                Agendar agora
              </Link>
              {linkWhatsApp ? <a
                href={linkWhatsApp}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-blue-700 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-800"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a> : <span className="inline-flex items-center gap-2 rounded-full bg-slate-500 px-5 py-3 text-sm font-bold text-white" title="WhatsApp ainda não configurado">
                <MessageCircle className="h-4 w-4" />
                WhatsApp indisponível
              </span>}
            </div>
          </div>
        </div>
      </section>
      <section
        id="diferenciais"
        className="mx-auto max-w-6xl px-5 py-10 sm:py-12"
      >
        <div className="text-center">
          <h2 className="text-xl font-bold text-secondary-700">
            Por que nos escolher?
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            Uma experiência completa em cuidados masculinos.
          </p>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {diferenciais.slice(0, 3).map((item) => (
            <article
              key={item.titulo}
              className="rounded-lg border border-slate-200 bg-white p-5 text-center shadow-sm"
            >
              <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-primary-50 text-primary-600">
                <item.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-sm font-bold text-secondary-700">
                {item.titulo}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                {item.texto}
              </p>
            </article>
          ))}
        </div>
        {user && (
          <div className="mt-8 flex justify-center">
            <Link
              href={destinoUsuario}
              className="inline-flex items-center gap-2 text-sm font-semibold text-secondary-700 hover:text-secondary-900"
            >
              <UserRoundCheck className="h-4 w-4" />
              Acessar minha área
            </Link>
          </div>
        )}
      </section>
      <footer className="bg-secondary-600 px-5 py-10 text-slate-200">
        <div className="mx-auto grid max-w-6xl gap-9 sm:grid-cols-2 lg:grid-cols-4">
          <section><Link href="/" className="flex items-center gap-2 text-lg font-bold text-white"><Scissors className="h-5 w-5" />Barbearia</Link><p className="mt-3 max-w-xs text-sm leading-5 text-slate-300">A melhor experiência em cuidados masculinos. Cortes modernos, barba impecável e ambiente acolhedor.</p></section>
          <section><h2 className="font-bold text-white">Links rápidos</h2><nav aria-label="Links rápidos" className="mt-3 flex flex-col items-start gap-2 text-sm"><a href="#inicio" className="hover:text-white hover:underline">Início</a><Link href="/agendamento" className="hover:text-white hover:underline">Agendar</Link><Link href="/privacidade" className="hover:text-white hover:underline">Privacidade</Link><Link href="/termos" className="hover:text-white hover:underline">Termos de uso</Link><Link href="/cookies" className="hover:text-white hover:underline">Cookies</Link></nav></section>
          <section><h2 className="font-bold text-white">Contato</h2><div className="mt-3 space-y-3 text-sm">{linkWhatsApp ? <a href={linkWhatsApp} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white"><Phone className="h-4 w-4 text-primary-400" />{contatos.telefoneWhatsApp}</a> : <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary-400" />WhatsApp não configurado</p>}<a href={`mailto:${contatos.email ?? 'contato@barbearia.com'}`} className="flex items-center gap-2 hover:text-white"><Mail className="h-4 w-4 text-primary-400" />{contatos.email ?? 'contato@barbearia.com'}</a></div></section>
          <section><h2 className="font-bold text-white">Redes sociais</h2><div className="mt-3 flex gap-3">{contatos.instagram && <a href={contatos.instagram} target="_blank" rel="noreferrer" aria-label="Instagram da Barbearia" className="inline-grid h-9 w-9 place-items-center rounded-full bg-primary-600 text-white transition hover:bg-primary-500"><Instagram className="h-5 w-5" /></a>}{linkWhatsApp && <a href={linkWhatsApp} target="_blank" rel="noreferrer" aria-label="Abrir WhatsApp da barbearia" className="inline-grid h-9 w-9 place-items-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-500"><MessageCircle className="h-5 w-5" /></a>}</div>{!contatos.instagram && !linkWhatsApp && <p className="mt-3 text-sm text-slate-400">Nenhuma rede social configurada.</p>}</section>
        </div>
        <div className="mx-auto mt-8 max-w-6xl border-t border-secondary-400 pt-5 text-center text-sm text-slate-300">© 2026 Barbearia. Todos os direitos reservados.</div>
      </footer>
    </main>
  );
}
