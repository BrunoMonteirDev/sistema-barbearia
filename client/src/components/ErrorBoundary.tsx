import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { erro: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { erro: false }

  static getDerivedStateFromError() {
    return { erro: true }
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // A interface permanece utilizável; o diagnóstico detalhado fica no console.
  }

  render() {
    if (!this.state.erro) return this.props.children
    return <main className="grid min-h-screen place-items-center bg-slate-100 p-6">
      <section role="alert" className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-7 text-center shadow-sm">
        <h1 className="text-xl font-bold text-slate-950">Não foi possível abrir esta tela</h1>
        <p className="mt-2 text-sm text-slate-600">Tente recarregar ou volte ao início para continuar usando o sistema.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button type="button" className="btn-secondary" onClick={() => this.setState({ erro: false })}>Tentar novamente</button>
          <a className="btn-primary" href="/">Voltar ao início</a>
        </div>
      </section>
    </main>
  }
}
