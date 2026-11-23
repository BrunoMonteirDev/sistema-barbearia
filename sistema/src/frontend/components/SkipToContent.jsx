/** Papel do módulo: Fornece um link de teclado para pular a navegação e chegar diretamente ao conteúdo principal. */
import "./SkipToContent.css";
export function SkipToContent() {
  return (
    <a href="#conteudo-principal" className="link-pular-conteudo">
      Pular para o conteúdo principal
    </a>
  );
}
