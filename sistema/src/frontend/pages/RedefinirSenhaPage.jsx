/** Recebe o token do link e permite cadastrar uma nova senha, sem login automático. */
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { auth } from "@/services/auth.api";
import { useAuth } from "@/contexts/AuthContext";
import { validarSenha } from "@/utils/senha";
import "./LoginPage.css";
import "./RecuperacaoSenha.css";

export default function RedefinirSenhaPage() {
  // O fragmento fica no navegador: o token só segue para a API no POST de redefinição.
  const [token, setToken] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get("token") ?? "");
  const tokenBemFormado = /^[a-f0-9]{64}$/.test(token);
  const [senha, setSenha] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const [erro, setErro] = useState("");
  const { signOut } = useAuth();
  const tituloRef = useRef(null);
  const envioEmCurso = useRef(false);

  useEffect(() => {
    // Abrir outro link na mesma aba pode alterar só o fragmento, sem remontar a página.
    const atualizarToken = () => {
      setToken(new URLSearchParams(window.location.hash.slice(1)).get("token") ?? "");
      setErro("");
      setConcluido(false);
      setSenha("");
      setConfirmacaoSenha("");
    };
    window.addEventListener("hashchange", atualizarToken);
    return () => window.removeEventListener("hashchange", atualizarToken);
  }, []);

  useEffect(() => {
    const tituloAnterior = document.title;
    document.title = "Redefinir senha — Barbearia";
    // WCAG 2.4.3: orienta usuários de teclado e leitor de tela ao entrar nesta rota.
    tituloRef.current?.focus();
    return () => { document.title = tituloAnterior; };
  }, []);

  const salvar = async (event) => {
    event.preventDefault();
    if (envioEmCurso.current) return;
    const erroSenha = validarSenha(senha);
    if (erroSenha) return setErro(erroSenha);
    if (new TextEncoder().encode(senha).length > 72) return setErro("A senha é muito longa. Escolha uma senha mais curta.");
    if (senha !== confirmacaoSenha) return setErro("As senhas não coincidem.");
    envioEmCurso.current = true;
    setSalvando(true);
    setErro("");
    try {
      await auth.redefinirSenha({ token, senha, confirmacaoSenha });
      signOut();
      setSenha("");
      setConfirmacaoSenha("");
      setConcluido(true);
      window.history.replaceState(window.history.state, "", window.location.pathname);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível redefinir sua senha.");
    } finally {
      envioEmCurso.current = false;
      setSalvando(false);
    }
  };

  return (
    <main className="pagina-login pagina-recuperacao">
      <section className="formulario-login" aria-labelledby="titulo-nova-senha">
        <Link href="/login" className="botao-voltar-login">← Voltar para entrar</Link>
        <h1 id="titulo-nova-senha" className="titulo-login" tabIndex={-1} ref={tituloRef}>Redefinir senha</h1>
        {/* WCAG 4.1.3: sucesso e erro permanecem visíveis e são anunciados. */}
        <p role="status" className="mensagem-recuperacao">{concluido ? "Senha redefinida com sucesso. Entre com sua nova senha." : ""}</p>
        <p role="alert" className="erro-recuperacao">{erro || (!tokenBemFormado ? "Link inválido ou incompleto. Solicite um novo link de recuperação." : "")}</p>
        {concluido ? (
          <Link href="/login" className="botao-principal-login">Entrar com a nova senha</Link>
        ) : tokenBemFormado ? (
          <form className="campos-recuperacao" onSubmit={salvar} aria-busy={salvando}>
            <p id="regras-nova-senha" className="orientacao-recuperacao">Use pelo menos 10 caracteres, com maiúscula, minúscula, número e um símbolo: ! @ # $ % * ? _ -. Não use espaços, três caracteres iguais seguidos ou sequências como 123.</p>
            <label className="rotulo-login" htmlFor="nova-senha">
              Nova senha
              <input id="nova-senha" className="input-login" type={mostrarSenha ? "text" : "password"} autoComplete="new-password" required minLength={10} maxLength={72} aria-describedby="regras-nova-senha" value={senha} onChange={(event) => setSenha(event.target.value)} />
            </label>
            <label className="rotulo-login" htmlFor="confirmacao-senha">
              Confirmar nova senha
              <input id="confirmacao-senha" className="input-login" type={mostrarSenha ? "text" : "password"} autoComplete="new-password" required minLength={10} maxLength={72} value={confirmacaoSenha} onChange={(event) => setConfirmacaoSenha(event.target.value)} />
            </label>
            <label className="mostrar-senha-recuperacao">
              <input type="checkbox" checked={mostrarSenha} onChange={(event) => setMostrarSenha(event.target.checked)} />
              Mostrar senhas
            </label>
            <button className="botao-principal-login" type="submit" aria-disabled={salvando}>{salvando ? "Salvando…" : "Salvar nova senha"}</button>
          </form>
        ) : null}
        {!concluido && <Link href="/esqueci-senha" className="link-recuperacao-login">Solicitar outro link</Link>}
      </section>
    </main>
  );
}
