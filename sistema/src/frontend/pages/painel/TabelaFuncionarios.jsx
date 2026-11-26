/** Papel do módulo: Exibe os profissionais e disponibiliza ações administrativas sobre cada linha. */
import { CabecalhoOrdenavel, useOrdenacao } from "./OrdenacaoPainel";

const colunas = [
  { campo: "nome", titulo: "Nome" },
  { campo: "telefone", titulo: "Telefone" },
  { campo: "email", titulo: "E-mail" },
  { campo: "status", titulo: "Status" },
];
const camposOrdenaveis = {
  nome: (funcionario) => funcionario.nome,
  telefone: (funcionario) => funcionario.telefone?.replace(/\D/g, ""),
  email: (funcionario) => funcionario.email,
  status: (funcionario) => funcionario.ativo ? "Ativo" : "Inativo",
};

export function TabelaFuncionarios({
  funcionarios,
  carregando,
  editar,
  desativar,
}) {
  const { ordenacao, alternar, ordenar } = useOrdenacao("nome");
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
    conteudo = ordenar(funcionarios, camposOrdenaveis).map((funcionario) => (
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
            {colunas.map(({ campo, titulo }) => (
              <CabecalhoOrdenavel
                key={campo}
                className="celula-profissional"
                campo={campo}
                ordenacao={ordenacao}
                alternar={alternar}
              >
                {titulo}
              </CabecalhoOrdenavel>
            ))}
            <th className="celula-profissional" scope="col">Ações</th>
          </tr>
        </thead>
        <tbody className="corpo-tabela-profissionais">{conteudo}</tbody>
      </table>
    </div>
  );
}
