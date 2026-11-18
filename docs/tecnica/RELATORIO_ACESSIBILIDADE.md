# Relatório de verificação de acessibilidade

**Data:** 18 de novembro de 2026  
**Responsável pela execução:** Codex  
**Referência:** WCAG 2.2, níveis A, AA e critérios AAA verificáveis pelas ferramentas utilizadas

## Escopo

A verificação cobriu os estados renderizados das seguintes rotas:

- públicas: `/`, `/login`, `/agendamento` e `/privacidade`;
- administrativas: `/painel`, `/painel/agendamentos`, `/painel/clientes`, `/painel/servicos`, `/painel/profissionais`, `/painel/configuracoes` e `/painel/bloqueios`;
- cliente: `/minha-conta`, `/minha-conta/agendamentos` e `/concluir-cadastro`;
- estados interativos: painel de acessibilidade aberto e modal de novo agendamento aberto.

Foram usados Pa11y 10.0.0, Axe e HTML_CodeSniffer no Google Chrome, além de verificações de teclado automatizadas com Puppeteer. As páginas testadas terminaram sem erros automáticos dos dois analisadores, inclusive com o HTML_CodeSniffer configurado para WCAG 2 AAA.

Esse resultado não constitui certificação de conformidade integral. Ferramentas automáticas detectam somente parte dos critérios, e vários requisitos dependem de avaliação humana e de tecnologias assistivas reais.

## Critérios verificados

| Critério WCAG 2.2 | Verificação realizada | Estado |
| --- | --- | --- |
| 1.3.1 — Informações e relações | Estrutura, rótulos, formulários, diálogo e associações ARIA nas rotas do escopo | Aprovado no escopo |
| 1.4.3 — Contraste mínimo | Axe e HTML_CodeSniffer; cores apontadas foram ajustadas | Aprovado no escopo |
| 1.4.6 — Contraste aprimorado | HTML_CodeSniffer em nível AAA nos estados renderizados | Aprovado no escopo |
| 1.4.10 — Refluxo | Rotas públicas verificadas em largura de 320 px, sem rolagem horizontal da página | Parcial: faltam todos os estados autenticados e conteúdos extensos |
| 2.1.1 — Teclado | Link de salto, painel de acessibilidade, modal e preservação das setas nativas | Parcial: falta percorrer manualmente todos os fluxos |
| 2.1.2 — Sem bloqueio de teclado | Entrada, contenção e saída de foco no modal; fechamento por Escape | Aprovado nos componentes testados |
| 2.3.3 — Animação por interações | Regra automática para `prefers-reduced-motion` e preferência interna | Aprovado no escopo |
| 2.4.1 — Ignorar blocos | Primeiro Tab alcança “Pular para o conteúdo principal” | Aprovado |
| 2.4.3 — Ordem do foco | Abertura e retorno de foco do painel e do modal | Parcial: faltam todos os fluxos |
| 2.4.7 — Foco visível | Estilo global com `:focus-visible`, sem animação de escala | Aprovado no escopo |
| 3.3.2 — Rótulos ou instruções | Campos do assistente administrativo receberam rótulos visíveis e opções expõem seleção | Aprovado no escopo |
| 4.1.2 — Nome, função e valor | IDs únicos dos diálogos, nomes acessíveis e estados `aria-pressed` | Aprovado no escopo |
| 4.1.3 — Mensagens de status | Notificações comuns usam `status`; erros usam `alert` e permanecem por mais tempo | Parcial: falta leitor de tela real |

## Verificações manuais ainda necessárias

- NVDA ou JAWS no Windows e TalkBack no Android;
- zoom real do navegador em 200% e 400% em todas as páginas e estados;
- navegação completa apenas por teclado, incluindo calendários, tabelas, filtros e modais encadeados;
- contraste em estados de foco, hover, desabilitado e alto contraste do sistema operacional;
- conteúdo ampliado em 1x, 2x e 3x em todas as páginas;
- funcionamento do Google Identity Services e do VLibras com tecnologias assistivas;
- avaliação com usuários, especialmente pessoas com deficiência.

Até essas verificações serem concluídas, o projeto não deve declarar conformidade total com WCAG 2.2 nem compatibilidade universal com leitores de tela.
