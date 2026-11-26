/** Recebe o código enviado por e-mail e permite cadastrar uma nova senha. */
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { auth } from "@/services/auth.api";
import { useAuth } from "@/contexts/AuthContext";
import { validarSenha } from "@/utils/senha";
import "./LoginPage.css";
import "./RecuperacaoSenha.css";

export default function RedefinirSenhaPage({ solicitacao } = {}) {
  const [email, setEmail] = useState(solicitacao?.email ?? "");
  const [codigo, setCodigo] = useState("");
  const [mensagem, setMensagem] = useState(solicitacao?.mensagem ?? "");
  const [reenvioEm, setReenvioEm] = useState(solicitacao?.reenvioEm ?? 0);
  const [agora, setAgora] = useState(Date.now);
  const [reenviando, setReenviando] = useState(false);
  const segundosRestantes = Math.max(0, Math.ceil((reenvioEm - agora) / 1000));
  const codigoRef = useRef(null);
  const [senha, setSenha] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const [erro, setErro] = useState("");
  const { signOut } = useAuth();
  const tituloRef = useRef(null);
  const avisoRef = useRef(null);
  const envioEmCurso = useRef(false);

  useEffect(() => {
    if (!reenvioEm) return;
    const atualizar = () => {
      const instante = Date.now();
      setAgora(instante);
      if (instante >= reenvioEm) clearInterval(timer);
    };
    const timer = setInterval(atualizar, 1000);
    return () => clearInterval(timer);
  }, [reenvioEm]);

  useEffect(() => {
    const tituloAnterior = document.title;
    document.title = "Redefinir senha — Barbearia";
    // WCAG 2.4.3: orienta usuários de teclado e leitor de tela ao entrar nesta rota.
    tituloRef.current?.focus();
    return () => { document.title = tituloAnterior; };
  }, []);

  useEffect(() => {
    const aviso = avisoRef.current;
    if (aviso && !aviso.open) aviso.showModal();
  }, [solicitacao]);

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
      await auth.redefinirSenha({ email: email.trim(), codigo, senha, confirmacaoSenha });
      signOut();
      setSenha("");
      setConfirmacaoSenha("");
      setCodigo("");
      setConcluido(true);
      tituloRef.current?.focus();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível redefinir sua senha.");
    } finally {
      envioEmCurso.current = false;
      setSalvando(false);
    }
  };

  const reenviar = async () => {
    if (envioEmCurso.current || Date.now() < reenvioEm) return;
    envioEmCurso.current = true;
    setReenviando(true);
    setErro("");
    setMensagem("");
    try {
      const resultado = await auth.esqueciSenha(email.trim());
      const instante = Date.now();
      setAgora(instante);
      setReenvioEm(instante + resultado.reenvioEmSegundos * 1000);
      setCodigo("");
      setMensagem(resultado.message);
      codigoRef.current?.focus();
    } catch (error) {
      if (error.reenvioEmSegundos) {
        const instante = Date.now();
        setAgora(instante);
        setReenvioEm(instante + error.reenvioEmSegundos * 1000);
      }
      setErro(error instanceof Error ? error.message : "Não foi possível solicitar outro código.");
    } finally {
      envioEmCurso.current = false;
      setReenviando(false);
    }
  };

  return (
    <main className="pagina-login pagina-recuperacao">
      {solicitacao && (
        <dialog
          ref={avisoRef}
          className="formulario-login aviso-recuperacao"
          aria-labelledby="titulo-aviso-recuperacao"
          aria-describedby="texto-aviso-recuperacao"
          onClose={() => codigoRef.current?.focus()}
        >
          <h2 id="titulo-aviso-recuperacao" className="titulo-login">Recuperação de senha</h2>
          <p id="texto-aviso-recuperacao">Se você usa apenas o Google para entrar, sua conta não tem senha na barbearia e não recebe código de recuperação. Volte à tela de login e escolha “Continuar com o Google”.</p>
          <form method="dialog">
            <button className="botao-principal-login" type="submit">Inserir código</button>
          </form>
          <Link href="/login" className="link-recuperacao-login">Voltar para entrar</Link>
        </dialog>
      )}
      <section className="formulario-login" aria-labelledby="titulo-nova-senha">
        <Link href="/login" className="botao-voltar-login">← Voltar para entrar</Link>
        <h1 id="titulo-nova-senha" className="titulo-login" tabIndex={-1} ref={tituloRef}>Redefinir senha</h1>
        {/* WCAG 4.1.3: sucesso e erro permanecem visíveis e são anunciados. */}
        <p role="status" className="mensagem-recuperacao">{concluido ? "Senha redefinida com sucesso. Entre com sua nova senha." : mensagem}</p>
        <p role="alert" className="erro-recuperacao">{erro}</p>
        {concluido ? (
          <Link href="/login" className="botao-principal-login">Entrar com a nova senha</Link>
        ) : (
          <form className="campos-recuperacao" onSubmit={salvar} aria-busy={salvando || reenviando}>
            <label className="rotulo-login" htmlFor="email-codigo">
              E-mail cadastrado
              <input id="email-codigo" className="input-login" type="email" autoComplete="email" required maxLength={254} readOnly={Boolean(solicitacao)} value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
            <p id="orientacao-codigo" className="orientacao-recuperacao">Digite o código de 6 dígitos recebido por e-mail. Ele vale por 10 minutos. Ao solicitar outro, os códigos anteriores ficam inválidos.</p>
            <label className="rotulo-login" htmlFor="codigo-recuperacao">
              Código de recuperação
              <input ref={codigoRef} id="codigo-recuperacao" className="input-login" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" required minLength={6} maxLength={6} aria-describedby="orientacao-codigo" value={codigo} onChange={(event) => setCodigo(event.target.value)} />
            </label>
            <button className="botao-principal-login" type="button" aria-disabled={segundosRestantes > 0 || reenviando || salvando} onClick={reenviar}>
              {reenviando ? "Solicitando código…" : segundosRestantes > 0 ? `Reenviar código em ${segundosRestantes}s` : "Reenviar código"}
            </button>
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
            <button className="botao-principal-login" type="submit" aria-disabled={salvando || reenviando}>{salvando ? "Salvando…" : "Salvar nova senha"}</button>
          </form>
        )}
        {!concluido && <a href="/esqueci-senha" className="link-recuperacao-login">Usar outro e-mail</a>}
      </section>
    </main>
  );
}
