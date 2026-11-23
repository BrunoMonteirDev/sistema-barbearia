/** Solicita o e-mail de recuperação sem revelar se a conta existe. */
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { auth } from "@/services/auth.api";
import "./LoginPage.css";
import "./RecuperacaoSenha.css";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState("");
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
      setMensagem(resultado.message);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível solicitar o link.");
    } finally {
      envioEmCurso.current = false;
      setEnviando(false);
    }
  };

  return (
    <main className="pagina-login pagina-recuperacao">
      <section className="formulario-login" aria-labelledby="titulo-recuperacao">
        <Link href="/login" className="botao-voltar-login">← Voltar para entrar</Link>
        <h1 id="titulo-recuperacao" className="titulo-login" tabIndex={-1} ref={tituloRef}>Esqueci minha senha</h1>
        <p>Informe o e-mail do seu cadastro para receber um link e criar uma nova senha.</p>
        {/* WCAG 4.1.3: mensagens persistentes são anunciadas sem depender de cor ou toast. */}
        <p role="status" className="mensagem-recuperacao">{mensagem}</p>
        <p role="alert" className="erro-recuperacao">{erro}</p>
        {!mensagem && (
          <form className="campos-recuperacao" onSubmit={enviar} aria-busy={enviando}>
            <label className="rotulo-login" htmlFor="email-recuperacao">
              E-mail cadastrado
              <input id="email-recuperacao" className="input-login" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
            <button className="botao-principal-login" type="submit" aria-disabled={enviando}>
              {enviando ? "Solicitando link…" : "Enviar link de recuperação"}
            </button>
          </form>
        )}
        {mensagem && <p>O link vale por 30 minutos. Se você receber mais de um, use o mais recente.</p>}
        <p className="orientacao-recuperacao">Se você criou a conta apenas com Google, use “Continuar com o Google” na tela de entrada.</p>
      </section>
    </main>
  );
}
