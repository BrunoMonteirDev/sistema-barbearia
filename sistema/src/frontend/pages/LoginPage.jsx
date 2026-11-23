/** Papel do módulo: Apresenta login, cadastro de cliente e entrada com Google, preservando o destino de retorno. */
import "./LoginPage.css";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useLocation } from "wouter";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";
import { formatarTelefoneBrasileiro } from "@/utils/telefone";
export function destinoAposLoginGoogle(cadastroConcluido) {
  return cadastroConcluido === false ? "/concluir-cadastro" : "/minha-conta";
}
function destinoSeguro(retorno) {
  return retorno?.startsWith("/") && !retorno.startsWith("//") ? retorno : null;
}
export default function LoginPage() {
  const { signIn, signInGoogle, signUp, user } = useAuth();
  const [, go] = useLocation();
  const retorno = destinoSeguro(
    new URLSearchParams(window.location.search).get("retorno"),
  );
  const [register, setRegister] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [autenticandoGoogle, setAutenticandoGoogle] = useState(false);
  const [destinoGoogle, setDestinoGoogle] = useState(null);
  useEffect(() => {
    if (!destinoGoogle || !user) return;
    go(destinoGoogle);
    setDestinoGoogle(null);
  }, [destinoGoogle, go, user]);
  const enviarFormulario = async (event) => {
    event.preventDefault();
    try {
      if (register) await signUp(nome, email, senha, telefone);
      else await signIn(email, senha);
      toast.success("Acesso realizado.");
      go(retorno ?? (register ? "/minha-conta" : "/"));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao autenticar.",
      );
    }
  };
  const entrarComGoogle = async (idToken) => {
    setAutenticandoGoogle(true);
    try {
      const usuario = await signInGoogle(idToken);
      toast.success("Acesso realizado com Google.");
      const destino =
        usuario.cadastroConcluido === false
          ? `/concluir-cadastro${retorno ? `?retorno=${encodeURIComponent(retorno)}` : ""}`
          : (retorno ?? destinoAposLoginGoogle(usuario.cadastroConcluido));
      setDestinoGoogle(destino);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível entrar com Google.",
      );
    } finally {
      setAutenticandoGoogle(false);
    }
  };
  return (
    <main className="pagina-login">
      <form className="formulario-login" onSubmit={enviarFormulario}>
        <button
          type="button"
          className="botao-voltar-login"
          onClick={() => go("/")}
        >
          ← Voltar ao início
        </button>
        <h1 className="titulo-login">{register ? "Criar conta" : "Entrar"}</h1>
        {!register && !autenticandoGoogle && (
          <GoogleLoginButton
            onCredential={(token) => void entrarComGoogle(token)}
          />
        )}
        {autenticandoGoogle && (
          <p className="mensagem-autenticando-google">
            Validando acesso Google...
          </p>
        )}
        {register && (
          <label className="rotulo-login" htmlFor="nome">
            <span>Nome completo</span>
            <input
              id="nome"
              required
              className="input-login"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
            />
          </label>
        )}
        {register && (
          <label className="rotulo-login" htmlFor="telefone">
            <span>Telefone com DDD</span>
            <input
              id="telefone"
              required
              type="tel"
              inputMode="tel"
              minLength={14}
              maxLength={15}
              autoComplete="tel"
              placeholder="(00) 00000-0000"
              className="input-login"
              value={telefone}
              onChange={(event) =>
                setTelefone(formatarTelefoneBrasileiro(event.target.value))
              }
            />
          </label>
        )}
        <label className="rotulo-login" htmlFor="email">
          <span>E-mail</span>
          <input
            id="email"
            required
            type="email"
            className="input-login"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <div className="rotulo-login">
          <label htmlFor="senha">Senha</label>
          <div className="campo-senha-login">
            <input
            id="senha"
            required
            minLength={6}
            type={senhaVisivel ? "text" : "password"}
            className="input-login"
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            />
            <button type="button" className="botao-visibilidade-senha" onClick={() => setSenhaVisivel((visivel) => !visivel)} aria-label={senhaVisivel ? "Ocultar senha" : "Mostrar senha"} aria-pressed={senhaVisivel}>
              {senhaVisivel ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
            </button>
          </div>
        </div>
        <button className="botao-principal-login">
          {register ? "Cadastrar" : "Entrar"}
        </button>
        <button
          type="button"
          className="botao-alternar-cadastro"
          onClick={() => setRegister(!register)}
        >
          {register ? "Já tenho uma conta" : "Criar conta de cliente"}
        </button>
      </form>
    </main>
  );
}
