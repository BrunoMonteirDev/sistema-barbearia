import "./ErrorBoundary.css";
import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { erro: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { erro: false };

  static getDerivedStateFromError() {
    return { erro: true };
  }

  componentDidCatch() {
    // A interface permanece utilizável; o diagnóstico detalhado fica no console.
  }

  render() {
    if (!this.state.erro) return this.props.children;
    return (
      <main className="pagina-falha">
        <section
          role="alert"
          className="cartao-falha"
        >
          <h1 className="titulo-falha">Não foi possível abrir esta tela</h1>
          <p className="mensagem-falha">
            Tente recarregar ou volte ao início para continuar usando o sistema.
          </p>
          <div className="acoes-falha">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => this.setState({ erro: false })}
            >
              Tentar novamente
            </button>
            <a
              className="btn-primary"
              href="/"
            >
              Voltar ao início
            </a>
          </div>
        </section>
      </main>
    );
  }
}
