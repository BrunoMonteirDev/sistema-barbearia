/** Solicita o e-mail de recuperação sem revelar se a conta existe. */
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { auth } from "@/services/auth.api";
import RedefinirSenhaPage from "./RedefinirSenhaPage";
import "./LoginPage.css";
import "./RecuperacaoSenha.css";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [solicitacao, setSolicitacao] = useState(null);
  const [erro, setErro] = useState("");
  const tituloRef = useRef(null);
  const envioEmCurso = useRef(false);

  useEffect(() => {
    const tituloAnterior = document.title;
    document.title = "Esqueci minha senha — Barbearia";
    // WCAG 2.4.3: após a navegação na SPA, o foco começa no título da nova tela.
    tituloRef.current?.focus();
    return () => { document.title = tituloAnterior; };
  }, []);

  const enviar = async (event) => {
    event.preventDefault();
    if (envioEmCurso.current) return;
    envioEmCurso.current = true;
    setEnviando(true);
    setErro("");
    try {
      const resultado = await auth.esqueciSenha(email.trim());
      setSolicitacao({ email: email.trim(), mensagem: resultado.message, reenvioEm: Date.now() + resultado.reenvioEmSegundos * 1000 });
    } catch (error) {
      if (error.reenvioEmSegundos) {
        setSolicitacao({ email: email.trim(), mensagem: "Use o código mais recente enviado para seu e-mail ou aguarde para solicitar outro.", reenvioEm: Date.now() + error.reenvioEmSegundos * 1000 });
      } else {
        setErro(error instanceof Error ? error.message : "Não foi possível solicitar o código.");
      }
    } finally {
      envioEmCurso.current = false;
      setEnviando(false);
    }
  };

  if (solicitacao) return <RedefinirSenhaPage solicitacao={solicitacao} />;

  return (
    <main className="pagina-login pagina-recuperacao">
      <section className="formulario-login" aria-labelledby="titulo-recuperacao">
        <Link href="/login" className="botao-voltar-login">← Voltar para entrar</Link>
        <h1 id="titulo-recuperacao" className="titulo-login" tabIndex={-1} ref={tituloRef}>Esqueci minha senha</h1>
        <p>Informe o e-mail do seu cadastro para receber um código de 6 dígitos, válido por 10 minutos, e criar uma nova senha.</p>
        {/* WCAG 4.1.3: mensagens persistentes são anunciadas sem depender de cor ou toast. */}
        <p role="alert" className="erro-recuperacao">{erro}</p>
        <form className="campos-recuperacao" onSubmit={enviar} aria-busy={enviando}>
          <label className="rotulo-login" htmlFor="email-recuperacao">
            E-mail cadastrado
            <input id="email-recuperacao" className="input-login" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <button className="botao-principal-login" type="submit" aria-disabled={enviando}>
            {enviando ? "Solicitando código…" : "Enviar código de recuperação"}
          </button>
        </form>
        <p className="orientacao-recuperacao">Se você criou a conta apenas com Google, use “Continuar com o Google” na tela de entrada.</p>
      </section>
    </main>
  );
}
