# Plano de migração de Tailwind para CSS tradicional

## Estado atual

Tailwind 3 está ativo por:

- `client/package.json`: `tailwindcss`, `postcss` e `autoprefixer` em `devDependencies`;
- `client/tailwind.config.js`: conteúdo, cores `primary`/`secondary` e fonte Poppins;
- `client/postcss.config.js`: plugins Tailwind e Autoprefixer;
- `client/src/styles/index.css`: `@tailwind base`, `components` e `utilities`.

O CSS global já mistura três abordagens:

1. diretivas Tailwind;
2. componentes Tailwind via `@apply`: `.btn-primary`, `.btn-secondary`, `.card`, `.input-field`, `.label`;
3. CSS tradicional para reset, base, acessibilidade, gradiente, scrollbar e `.btn-google`.

Inventário estático observado:

- 808 ocorrências de `className` em TSX;
- 45 variantes `sm:`, 12 `md:`, 5 `lg:` e 2 `xl:`;
- 111 variantes `hover:`, 26 `focus:` e 29 `disabled:`;
- 31 template strings iniciadas em `className={` e 34 expressões de classe;
- 10 formulários, 3 tabelas, 8 usos de `Modal` e 5 de `ConfirmDialog`;
- 155 usos de tokens `rounded*`, 145 de `flex`, 40 de `grid`, 45 de `shadow*` e 6 de `overflow-x-auto`.

As contagens são um retrato do código atual, não uma métrica de qualidade isolada.

## Concentração por página

| Arquivo | Linhas | Ocorrências de `className` | Elementos relevantes |
|---|---:|---:|---|
| `client/src/pages/painel/AgendamentosPage.tsx` | 746 | 98 | filtros, calendário, agenda diária/semanal, modais, formulários e estados por status |
| `client/src/pages/agendar/PaginaAgendamento.tsx` | 315 | 80 | wizard, cartões de escolha, calendário, horários e resumo |
| `client/src/pages/HomePage.tsx` | 199 | 67 | navegação, hero, cards, CTA e footer |
| `client/src/pages/painel/DashboardPage.tsx` | 89 | 65 | cards, métricas, lista e status condicionais |
| `client/src/pages/painel/FuncionariosPage.tsx` | 183 | 63 | tabela, modal, abas e grade de 48 horários |
| `client/src/pages/painel/EvolutionPage.tsx` | 73 | 49 | estado da conexão, ações, QR e configurações |
| `client/src/pages/user/UserAppointmentsPage.tsx` | 60 | 36 | cartões, botões por status e dialogs |
| `client/src/pages/painel/ClientesPage.tsx` | 276 | 27 | tabela/lista, formulário e confirmação |
| `client/src/pages/painel/ServicosAdminPage.tsx` | 25 | 25 | tabela, formulário e confirmação em JSX muito condensado |

## Concentração por componente

| Arquivo | Ocorrências de `className` | Observação |
|---|---:|---|
| `client/src/pages/painel/funcionarios/FuncionariosTable.tsx` | 30 | possível implementação antiga, sem importador conhecido |
| `client/src/components/AcessibilidadeControls.tsx` | 29 | muitos estados e posicionamento fixo |
| `client/src/components/ResumoAgendamentosCliente.tsx` | 24 | cartões e estados de agendamento |
| `client/src/components/Footer.tsx` | 24 | possível arquivo sem uso |
| `client/src/pages/painel/funcionarios/HorariosModal.tsx` | 23 | classes condicionais; possível arquivo sem uso |
| `client/src/components/Header.tsx` | 16 | possível arquivo sem uso |
| `client/src/components/ui/modal.tsx` | 10 | base compartilhada de modais |
| `client/src/components/layout/Sidebar.tsx` | 10 | navegação responsiva e item ativo |

Arquivos sem importador não devem ser migrados antes de decidir se estão realmente em uso; isso evita gastar esforço em código possivelmente morto.

## Padrões repetidos encontrados

### Botões

- `.btn-primary` e `.btn-secondary` via `@apply`;
- botões de texto com `hover:underline`;
- botões destrutivos em vermelho;
- botões compactos dentro de cards de agenda;
- combinações recorrentes de `disabled:cursor-not-allowed` e opacidade/cor.

Destino possível:

```css
.botao-principal { ... }
.botao-secundario { ... }
.botao-perigo { ... }
.botao-texto { ... }
.botao-icone { ... }
```

Só criar uma classe compartilhada quando a aparência e o comportamento visual forem realmente comuns.

### Formulários

- `.input-field` via `@apply` aparece 34 vezes;
- labels combinam `block`, `text-sm`, `font-semibold/medium`;
- formulários usam `space-y-*` e grupos responsivos;
- estados de foco e desabilitado dependem de variantes Tailwind.

Destino:

```css
.campo-formulario { ... }
.rotulo-campo { ... }
.grupo-formulario { ... }
.mensagem-ajuda { ... }
.mensagem-erro { ... }
```

### Cards

Repetem fundo branco, borda cinza, radius e sombra. Existem variações para agendamento, métrica, aviso, perigo e integração.

Não transformar todos em uma classe `.card` genérica se isso esconder diferenças. Preferir nomes de papel:

- `.cartao-agendamento`;
- `.cartao-metrica`;
- `.cartao-aviso`;
- `.cartao-integracao`.

### Modais

`client/src/components/ui/modal.tsx` já centraliza backdrop, painel, cabeçalho, corpo e rodapé. É um bom candidato inicial para `modal.css`. `HorariosModal.tsx` possui implementação visual própria, mas está sem importador conhecido e exige validação antes de qualquer trabalho.

### Tabelas

Existem tabelas em:

- `AgendamentosPage.tsx`;
- `FuncionariosPage.tsx`;
- `ServicosAdminPage.tsx`/outros trechos administrativos, conforme renderização atual.

Padrões: wrapper com overflow horizontal, cabeçalho claro, linhas divisórias, padding e ações alinhadas. As classes podem ser locais ao módulo antes de decidir se um pequeno estilo compartilhado de tabela vale a pena.

### Navegação

- `HomePage.tsx` possui navegação própria;
- `Sidebar.tsx` atende painel e área do cliente;
- item ativo da Sidebar usa template string condicional;
- responsividade muda a Sidebar de faixa horizontal para coluna em `md`.

### Status condicionais

- `DashboardPage.tsx` possui `statusClass` com classes Tailwind;
- `AgendamentosPage.tsx` possui `statusStyle` e template strings;
- `AcessibilidadeControls.tsx`, `Sidebar.tsx`, `PaginaAgendamento.tsx` e `HorariosModal.tsx` também alternam classes por estado.

Destino recomendado:

```tsx
className={`status-agendamento status-agendamento--${status.toLowerCase()}`}
```

ou um mapa de nomes semânticos quando o valor não puder formar classe com segurança:

```tsx
const classeStatus = {
  PENDENTE: 'status-agendamento status-agendamento--pendente',
  // ...
}
```

O CSS define cores; o TSX conserva somente o estado semântico.

### Responsividade

Há breakpoints sobretudo `sm` e `md`, com poucos `lg`/`xl`. Ao converter, manter mobile first:

```css
.grade-resumo {
  display: grid;
  gap: 12px;
}

@media (min-width: 640px) {
  .grade-resumo {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
```

Usar os mesmos limiares atuais inicialmente: `sm` 640px, `md` 768px, `lg` 1024px e `xl` 1280px.

### Hover, focus e disabled

Ao remover cada variante, preservar explicitamente:

- `:hover` apenas onde faz sentido;
- `:focus-visible` e as regras globais especiais de navegação por teclado;
- `[disabled]` ou `:disabled` com cursor e contraste adequados;
- `aria-current`, `aria-pressed` e estados que não dependam apenas de cor;
- modo de alto contraste em `client/src/styles/index.css`.

## Convenção de arquivos

Preferência:

```text
PaginaAgendamento.tsx
PaginaAgendamento.css

LoginPage.tsx
LoginPage.css

components/ui/
├── modal.tsx
└── modal.css
```

O CSS deve ficar ao lado do TSX quando pertence exclusivamente ao componente/página. `client/src/styles/` deve conter apenas base global, acessibilidade e estilos compartilhados realmente estáveis.

## Convenção de classes

### Regras

- usar português quando o conceito exibido pelo sistema está em português;
- usar nomes de domínio ou papel visual;
- usar hífen entre palavras;
- usar modificador com `--` para estados/variações;
- evitar selecionar por estrutura (`div > div:nth-child(...)`);
- evitar IDs para estilização;
- evitar nomes ligados à posição quando a função é mais clara.

### Bons exemplos

```text
.pagina-agendamento
.cabecalho-agendamento
.etapas-agendamento
.opcao-profissional
.opcao-profissional--selecionada
.grade-horarios
.horario--indisponivel
.formulario-login
.campo-formulario
.botao-principal
.lista-clientes
.cartao-agendamento
.status-agendamento--confirmado
.barra-lateral
.item-navegacao--ativo
```

### Evitar

```text
.box
.item
.container2
.div1
.red-text
.left-panel
.wrapper-final
```

Nomes como `.container` só são aceitáveis para um layout global realmente único e documentado; no restante, devem indicar propósito.

## Estratégia gradual

### Fase 0 — baseline visual

Antes de converter:

- registrar screenshots nas larguras usadas pelo projeto;
- listar estados: vazio, carregando, erro, ativo, disabled, modal aberto;
- testar navegação por teclado e preferências de acessibilidade;
- não alterar Tailwind/configuração.

### Fase 1 — fundação pequena

Converter primeiro um componente controlado, por exemplo `client/src/components/ui/modal.tsx` para `modal.css`, e uma página pequena, como `client/src/pages/LoginPage.tsx`.

Objetivo: validar importação de CSS local, nomenclatura, foco, responsividade e revisão visual.

Não converter `.btn-primary` global nessa fase se páginas não migradas ainda dependem dele.

### Fase 2 — área pública simples

Ordem sugerida:

1. `LegalPage.tsx`;
2. `NotFoundPage.tsx`, apenas se for conectado/confirmado como usado em tarefa própria;
3. `CompleteRegistrationPage.tsx`;
4. `CookieNotice.tsx`;
5. `ResumoAgendamentosCliente.tsx`.

### Fase 3 — autenticação e conta

- `LoginPage.tsx` se não convertido na fase-piloto;
- `MinhaContaPage.tsx`;
- `UserAppointmentsPage.tsx`;
- `ProtectedRoute.tsx` somente se houver estilo renderizado relevante.

### Fase 4 — componentes compartilhados

- `Sidebar.tsx`;
- `AcessibilidadeControls.tsx`;
- `ErrorBoundary.tsx`;
- `ConfirmacaoAgendamentoRepetidoModal.tsx`;
- toast customizado de `App.tsx`.

Acessibilidade deve ser migrada com cuidado porque `index.css` hoje usa seletores baseados em `[class*="bg-"]`, `[class*="text-"]` e `[class*="border-"]`. Esses fallbacks deixam de alcançar classes semânticas. O modo de alto contraste precisará de seletores semânticos equivalentes antes de remover as classes Tailwind.

### Fase 5 — home e agendamento público

- `HomePage.tsx` → `HomePage.css`;
- `PaginaAgendamento.tsx` → `PaginaAgendamento.css`;
- componentes extraídos do wizard recebem CSS próprio quando fizer sentido.

Converter por seção: layout, passos, opções, calendário, horários, revisão e rodapé. Não trocar 80 classes de uma vez sem comparação intermediária.

### Fase 6 — painel CRUD

Ordem de menor para maior risco visual:

1. `WhatsAppConfigPage.tsx`;
2. `RegrasNegocioPage.tsx`;
3. `ServicosAdminPage.tsx`;
4. `ClientesPage.tsx`;
5. `FuncionariosPage.tsx`;
6. `EvolutionPage.tsx`;
7. `DashboardPage.tsx`.

### Fase 7 — agenda administrativa

Migrar `AgendamentosPage.tsx` por partes, idealmente depois da divisão em componentes:

- cabeçalho e filtros;
- métricas/ações;
- lista/tabela;
- agenda diária;
- agenda semanal;
- formulário de edição/criação;
- detalhes e notificações;
- estados por status.

Esse arquivo deve ser o último grande módulo, pois concentra 98 `className`, 746 linhas e estilos condicionais complexos.

### Fase 8 — limpar utilitários Tailwind restantes

- buscar `className` contendo utilitários;
- converter classes Tailwind usadas em SVGs/ícones;
- substituir `@apply` de `.btn-*`, `.card`, `.input-field` e `.label` por propriedades CSS normais;
- manter as classes semânticas se ainda forem úteis;
- reescrever alto contraste sem depender de prefixos Tailwind.

### Fase 9 — remover Tailwind somente no final

Pré-condições:

- `rg "@tailwind|@apply" client/src` sem resultados;
- nenhum utilitário Tailwind restante em TSX;
- modo de alto contraste funcionando com classes semânticas;
- builds e validação visual completos;
- documentação atualizada.

Só então, em tarefa autorizada:

- remover `tailwindcss` de `client/package.json`;
- ajustar `client/postcss.config.js`;
- remover `client/tailwind.config.js` se não tiver outra utilidade;
- atualizar lockfile;
- nunca remover PostCSS/Autoprefixer automaticamente sem confirmar se continuam no pipeline desejado.

## Checklist por arquivo migrado

- [ ] criar CSS ao lado do TSX;
- [ ] importar o CSS no componente/página;
- [ ] trocar utilitários por classes semânticas em partes pequenas;
- [ ] preservar classes/atributos necessários a bibliotecas externas, como VLibras;
- [ ] preservar hover, focus-visible, disabled, loading e seleção;
- [ ] preservar breakpoints e overflow;
- [ ] testar modo de alto contraste, fonte grande e redução de animação;
- [ ] comparar mobile e desktop;
- [ ] buscar utilitários Tailwind restantes no arquivo;
- [ ] não remover dependências globais enquanto houver consumidores.

## O que não fazer

- criar um único `app.css` gigante;
- converter todas as páginas no mesmo commit;
- inventar design system ou CSS-in-JS;
- usar nomes genéricos para substituir cadeias de utilitários;
- mover regras de estado do React para CSS de maneira obscura;
- alterar aparência e estrutura do componente ao mesmo tempo;
- remover Tailwind antes de migrar acessibilidade e classes compartilhadas.
