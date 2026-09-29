export function TabelaFuncionarios({
  funcionarios,
  carregando,
  editar,
  desativar,
}) {
  let conteudo;
  if (carregando) {
    conteudo = (
      <tr>
        <td colSpan={5} className="mensagem-lista-profissionais">
          Carregando funcionários...
        </td>
      </tr>
    );
  } else if (funcionarios.length === 0) {
    conteudo = (
      <tr>
        <td colSpan={5} className="mensagem-lista-profissionais">
          Nenhum funcionário cadastrado.
        </td>
      </tr>
    );
  } else {
    conteudo = funcionarios.map((funcionario) => (
      <tr key={funcionario.id}>
        <td className="celula-profissional nome-profissional">
          {funcionario.nome}
        </td>
        <td className="celula-profissional">{funcionario.telefone ?? "—"}</td>
        <td className="celula-profissional">{funcionario.email ?? "—"}</td>
        <td className="celula-profissional">
          {funcionario.ativo ? "Ativo" : "Inativo"}
        </td>
        <td className="celula-profissional">
          <div className="acoes-profissional">
            <button
              type="button"
              onClick={() => editar(funcionario)}
              className="botao-editar-profissional"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={() => desativar(funcionario)}
              className="botao-desativar-profissional"
            >
              Desativar
            </button>
          </div>
        </td>
      </tr>
    ));
  }
  return (
    <div className="lista-profissionais">
      <table className="tabela-profissionais">
        <thead className="cabecalho-tabela-profissionais">
          <tr>
            <th className="celula-profissional">Nome</th>
            <th className="celula-profissional">Telefone</th>
            <th className="celula-profissional">E-mail</th>
            <th className="celula-profissional">Status</th>
            <th className="celula-profissional">Ações</th>
          </tr>
        </thead>
        <tbody className="corpo-tabela-profissionais">{conteudo}</tbody>
      </table>
    </div>
  );
}
