/** Papel do módulo: Apresenta edição do perfil do cliente e a confirmação de exclusão da conta. */
import "./MinhaContaPage.css";
import { useLocation } from "wouter";
import { UserLayout } from "./UserLayout";
import { useMinhaConta } from "./useMinhaConta";
export default function MinhaContaPage() {
  const [, go] = useLocation();
  const {
    formulario: form,
    salvando: saving,
    confirmacaoExclusao,
    excluindo,
    setConfirmacaoExclusao,
    alterarNome,
    alterarTelefone,
    salvarPerfil,
    excluirConta,
  } = useMinhaConta();
  return (
    <UserLayout>
      <div className="pagina-minha-conta">
        <header className="cabecalho-minha-conta">
          <p className="identificacao-perfil">Perfil</p>
          <h1 className="titulo-minha-conta">Minha conta</h1>
          <p className="descricao-minha-conta">
            Mantenha seus dados de contato atualizados.
          </p>
        </header>
        {!form ? (
          <p className="mensagem-carregando-perfil">Carregando dados...</p>
        ) : (
          <>
            <form onSubmit={salvarPerfil} className="formulario-perfil">
              <label className="rotulo-perfil">
                Nome
                <input
                  required
                  className="campo-perfil"
                  value={form.nome}
                  onChange={(event) => alterarNome(event.target.value)}
                />
              </label>
              <label className="rotulo-perfil">
                E-mail
                <input disabled className="campo-perfil" value={form.email} />
                <span className="aviso-email-perfil">
                  O e-mail de acesso não pode ser alterado por aqui.
                </span>
              </label>
              <label className="rotulo-perfil">
                Telefone
                <input
                  inputMode="tel"
                  className="campo-perfil"
                  value={form.telefone ?? ""}
                  onChange={(event) => alterarTelefone(event.target.value)}
                />
              </label>
              <div className="acoes-perfil">
                <button disabled={saving} className="botao-salvar-perfil">
                  {saving ? "Salvando..." : "Salvar alterações"}
                </button>
              </div>
            </form>
            <section className="secao-excluir-conta">
              <h2 className="titulo-excluir-conta">Excluir conta</h2>
              <p className="aviso-excluir-conta">
                Esta ação remove seus dados pessoais e libera seu e-mail para
                um novo cadastro. O histórico de agendamentos será mantido com
                a identificação genérica “Conta excluída”. Digite{" "}
                <strong>EXCLUIR MINHA CONTA</strong> para confirmar.
              </p>
              <form
                className="formulario-excluir-conta"
                onSubmit={(event) => void excluirConta(event, () => go("/"))}
              >
                <label
                  className="rotulo-confirmacao-exclusao"
                  htmlFor="confirmacao-exclusao"
                >
                  Confirmação de exclusão
                </label>
                <input
                  id="confirmacao-exclusao"
                  className="campo-confirmacao-exclusao"
                  value={confirmacaoExclusao}
                  onChange={(event) =>
                    setConfirmacaoExclusao(event.target.value)
                  }
                  placeholder="EXCLUIR MINHA CONTA"
                />
                <button
                  disabled={
                    excluindo ||
                    confirmacaoExclusao.trim().toUpperCase() !==
                      "EXCLUIR MINHA CONTA"
                  }
                  className="botao-excluir-conta"
                >
                  {excluindo ? "Excluindo..." : "Excluir minha conta"}
                </button>
              </form>
            </section>
          </>
        )}
      </div>
    </UserLayout>
  );
}
