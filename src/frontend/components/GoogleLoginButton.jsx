import "./GoogleLoginButton.css";
import { useEffect, useRef } from "react";
const scriptId = "google-identity-services";
export function GoogleLoginButton({ onCredential }) {
  const containerRef = useRef(null);
  const onCredentialRef = useRef(onCredential);
  onCredentialRef.current = onCredential;
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  useEffect(() => {
    if (!clientId || !containerRef.current) return;
    const iniciar = () => {
      if (!window.google || !containerRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: ({ credential }) => {
          if (credential) onCredentialRef.current(credential);
        },
      });
      containerRef.current.replaceChildren();
      window.google.accounts.id.renderButton(containerRef.current, {
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        width: 320,
        locale: "pt-BR",
      });
    };
    const existente = document.getElementById(scriptId);
    if (existente) {
      existente.addEventListener("load", iniciar);
      iniciar();
      return () => existente.removeEventListener("load", iniciar);
    }
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = iniciar;
    document.head.appendChild(script);
    return () => {
      script.onload = null;
    };
  }, [clientId]);
  if (!clientId) return null;
  return (
    <div className="acesso-google">
      <div ref={containerRef} aria-label="Entrar com Google" />
      <p className="alternativa-login-google">ou use seu e-mail e senha</p>
    </div>
  );
}
