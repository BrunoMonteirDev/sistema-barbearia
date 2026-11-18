import "./CookieNotice.css";
import { useState } from "react";
import { Link } from "wouter";
const chave = "barbearia.cookies-aviso-visto";
export function CookieNotice() {
  const [visivel, setVisivel] = useState(
    () => localStorage.getItem(chave) !== "true",
  );
  if (!visivel) return null;
  const aceitar = () => {
    localStorage.setItem(chave, "true");
    setVisivel(false);
  };
  return (
    <aside aria-label="Aviso sobre cookies" className="aviso-cookies">
      <p className="titulo-aviso-cookies">Privacidade e cookies</p>
      <p className="texto-aviso-cookies">
        Usamos armazenamento essencial para sessão e preferências de
        acessibilidade. Serviços como Google e VLibras têm suas próprias
        políticas.
      </p>
      <div className="acoes-aviso-cookies">
        <Link href="/cookies" className="link-politica-cookies">
          Saiba mais
        </Link>
        <button
          type="button"
          className="botao-aceitar-cookies"
          onClick={aceitar}
        >
          Entendi
        </button>
      </div>
    </aside>
  );
}
