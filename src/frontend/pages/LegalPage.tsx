import "./LegalPage.css";
import { Link } from "wouter";

type LegalKind = "privacidade" | "termos" | "cookies";

const paginas: Record<
  LegalKind,
  { titulo: string; subtitulo: string; secoes: Array<{ titulo: string; texto: string }> }
> = {
  privacidade: {
    titulo: "Política de privacidade",
    subtitulo: "Como tratamos os dados necessários para o agendamento e atendimento.",
    secoes: [
      {
        titulo: "Dados coletados",
        texto:
          "Coletamos nome, e-mail, telefone, dados de acesso e informações de agendamentos para identificar a pessoa cliente, prestar o serviço e administrar a barbearia.",
      },
      {
        titulo: "Uso e proteção",
        texto:
          "Os dados são usados para autenticação, agendamentos, comunicação solicitada e cumprimento de obrigações legais. O acesso é limitado às pessoas autorizadas e as senhas são armazenadas de forma protegida.",
      },
      {
        titulo: "Compartilhamento",
        texto:
          "Não comercializamos dados pessoais. Serviços externos, como Google para login e VLibras para acessibilidade, podem tratar dados conforme suas próprias políticas quando utilizados.",
      },
      {
        titulo: "Seus direitos",
        texto:
          "Você pode atualizar seus dados em Minha conta. Também pode excluir a conta: o acesso é desativado e a sessão encerrada; registros de agendamentos podem ser mantidos quando necessários para histórico, segurança e obrigações legais.",
      },
    ],
  },
  termos: {
    titulo: "Termos de uso",
    subtitulo: "Regras para usar o sistema de agendamento da barbearia.",
    secoes: [
      {
        titulo: "Uso da conta",
        texto:
          "Você é responsável pelas informações fornecidas e por manter suas credenciais em sigilo. O acesso deve ser utilizado somente para finalidades legítimas de agendamento e atendimento.",
      },
      {
        titulo: "Agendamentos",
        texto:
          "A disponibilidade, duração do serviço, confirmação, remarcação e cancelamento obedecem às regras informadas no sistema. A barbearia pode atualizar a agenda quando necessário, preservando o histórico das alterações.",
      },
      {
        titulo: "Condutas proibidas",
        texto:
          "Não é permitido tentar acessar contas de terceiros, interferir no funcionamento do sistema ou utilizar informações da plataforma de maneira ilícita.",
      },
      {
        titulo: "Alterações",
        texto:
          "Estes termos podem ser atualizados para refletir mudanças no serviço ou na legislação. A versão vigente ficará disponível nesta página.",
      },
    ],
  },
  cookies: {
    titulo: "Política de cookies e armazenamento local",
    subtitulo: "Explicação objetiva sobre o que o sistema armazena no seu navegador.",
    secoes: [
      {
        titulo: "Essenciais",
        texto:
          "Usamos armazenamento local para manter sua sessão autenticada e salvar preferências de acessibilidade, como alto contraste, tamanho de texto e redução de animações. Esses itens são necessários para o funcionamento escolhido por você.",
      },
      {
        titulo: "Serviços de terceiros",
        texto:
          "O login Google pode utilizar cookies e tecnologias do Google para autenticação. O VLibras é carregado como serviço de acessibilidade. Esses serviços seguem suas próprias políticas de privacidade.",
      },
      {
        titulo: "Sua escolha",
        texto:
          "Ao continuar navegando após o aviso, você reconhece o uso dos recursos essenciais. Você pode limpar os dados do site nas configurações do navegador; isso encerrará sua sessão e removerá preferências locais.",
      },
    ],
  },
};

export default function LegalPage({ kind }: { kind: LegalKind }) {
  const pagina = paginas[kind];
  return (
    <main className="pagina-legal">
      <div className="conteudo-legal">
        <Link
          href="/"
          className="link-voltar-legal"
        >
          ← Voltar ao início
        </Link>
        <article className="artigo-legal">
          <h1 className="titulo-legal">{pagina.titulo}</h1>
          <p className="subtitulo-legal">{pagina.subtitulo}</p>
          <p className="atualizacao-legal">Última atualização: 1 de agosto de 2026.</p>
          <div className="secoes-legal">
            {pagina.secoes.map((secao) => (
              <section key={secao.titulo}>
                <h2 className="titulo-secao-legal">{secao.titulo}</h2>
                <p className="texto-secao-legal">{secao.texto}</p>
              </section>
            ))}
          </div>
        </article>
        <footer className="rodape-legal">
          <Link
            href="/privacidade"
            className="link-rodape-legal"
          >
            Privacidade
          </Link>
          <Link
            href="/termos"
            className="link-rodape-legal"
          >
            Termos de uso
          </Link>
          <Link
            href="/cookies"
            className="link-rodape-legal"
          >
            Cookies
          </Link>
        </footer>
      </div>
    </main>
  );
}
