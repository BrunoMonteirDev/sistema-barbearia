# Plano de refatoração baseado no projeto atual

## Tecnologias encontradas

- Frontend: React 18, TypeScript, Vite, Tailwind CSS, Wouter, React Hot Toast, Zustand, Lucide React e React Icons.
- Backend: Node.js, TypeScript, Express 5, JWT, bcryptjs, Google Auth Library e CORS.
- Banco e ORM: PostgreSQL e Prisma 7, com migrations em `server/prisma/migrations`.
- Integração: Evolution API/WhatsApp, por configuração e serviço próprio.
- Ferramentas atuais: npm, ESLint, tsconfig, Vitest, React Testing Library e Supertest.

## Estrutura atual

`client/src` contém `App.tsx`, páginas públicas, agendamento, painel, área do usuário, componentes, contexto de autenticação, cliente HTTP (`lib/api.ts`), hooks, utilitários e estilos. `client/src/pages/agendar/AgendarPage.tsx` e partes do painel concentram telas extensas.

`server/src` contém bootstrap (`index.ts`, `app.ts`), middleware de autenticação, Prisma, rotas Express e serviços. As rotas de agendamento estão em `server/src/routes/agendamentos.ts`; serviços de horários, regras, lock, repetição, notificações, Evolution, senha e usuário ficam em `server/src/services`.

`server/prisma` contém o schema PostgreSQL e migrations. Há testes unitários/HTTP em `client/src` e `server/src`, além de integração em `server/tests/integration`.

## Principais funcionalidades encontradas

- autenticação local e login Google;
- cadastro, conclusão e manutenção de perfil de cliente;
- controle de usuários;
- cadastro e administração de serviços;
- cadastro de profissionais e disponibilidade semanal;
- agendamento público e administrativo;
- escolha de profissional ou primeiro profissional disponível;
- consulta de disponibilidade, prevenção de conflitos e lock da agenda;
- confirmação de possível repetição;
- cancelamento, remarcação, atualização de status e histórico;
- regras de antecedência e atualização de atrasados;
- painel, dashboard e áreas do cliente;
- configurações da barbearia e regras do agendamento;
- notificações e integração Evolution/WhatsApp;
- acessibilidade, VLibras, navegação por teclado, cookies e páginas legais.

## Problemas encontrados

- `server/src/routes/agendamentos.ts` é o maior arquivo do backend e mistura entrada HTTP, validações, regras, consultas Prisma, histórico e notificações.
- Algumas rotas de `server/src/routes` acessam Prisma e implementam validações diretamente, enquanto outras usam serviços; a separação é inconsistente.
- `client/src/lib/api.ts` reúne muitos tipos, autenticação de token, transporte HTTP e todas as operações de domínio em um único arquivo.
- `AgendarPage.tsx`, `AgendamentosPage.tsx`, `AcessibilidadeControls.tsx` e outras telas são extensas e combinam apresentação, estado e chamadas de API.
- O projeto mistura nomes em português com APIs e símbolos em inglês, além de estilos de formatação diferentes entre arquivos.
- Existem duas bibliotecas de roteamento no frontend (`wouter` em uso e `react-router-dom` nas dependências), o que exige confirmação de uso antes de qualquer limpeza.
- O repositório possui testes automatizados, mocks, fixtures e dependências de teste, embora eles estejam fora do escopo final definido para esta refatoração.
- Há lógica de domínio duplicada ou próxima entre rotas e serviços que deve ser revisada antes de ser extraída; isso é especialmente relevante para agendamento, disponibilidade e autorização.

## Estrutura proposta

Manter a separação `client`/`server` e evoluir gradualmente:

```text
client/src/
  pages/              # Views compostas por fluxo
  components/         # componentes visuais reutilizáveis
  contexts/ hooks/    # estado e comportamento de interface
  lib/api/            # cliente HTTP e tipos agrupados por domínio
  utils/              # utilitários sem regra de persistência

server/src/
  routes/             # entrada HTTP e resposta
  controllers/        # somente se a extração deixar o fluxo mais claro
  services/            # regras de negócio significativas
  models/              # somente se houver benefício além do Prisma
  middlewares/        # autenticação e autorização
  lib/                # infraestrutura, incluindo Prisma
```

Não criar todas as pastas antecipadamente. A estrutura será criada por domínio, conforme a extração de responsabilidades demonstrar benefício.

## MVC proposto neste projeto

No cliente, `AgendarPage`, `NovoAgendamentoWizard`, páginas do painel e páginas do usuário são Views. `lib/api.ts` é a fronteira de comunicação com a API, não a regra de negócio.

No servidor, as rotas Express são a entrada/controller atual. A refatoração poderá extrair controladores nomeados quando uma rota grande deixar de ser compreensível, mas a extração não será automática. Serviços já existentes representam regras reutilizáveis: `horarios.service.ts`, `regras-agendamento.service.ts`, `agenda-lock.service.ts`, `repeticao-agendamento.service.ts`, `notificacao.service.ts`, `evolution.service.ts`, `senha.service.ts` e `usuario.service.ts`.

O Model é o domínio persistido no Prisma: usuários, profissionais, serviços, agendamentos, disponibilidade, configuração, histórico e notificações. O fluxo prioritário é tornar `AgendarPage → API/rota de agendamentos → serviços de regra → Prisma → PostgreSQL` fácil de seguir.

## Ordem da refatoração

1. **Preparação e linha de base:** confirmar scripts, build, lint, typecheck, execução e rotas; mapear imports e dependências; não alterar comportamento.
2. **Autenticação e usuários:** organizar fluxo de login, cadastro, Google, perfil, senha, middleware e proteção de rotas.
3. **Domínio de serviços:** revisar listagem, administração e validações de serviços.
4. **Profissionais e disponibilidade:** separar cadastro, disponibilidade semanal e consulta de horários.
5. **Agendamento:** reduzir a concentração de `agendamentos.ts`, mantendo criação, disponibilidade, conflito, sem preferência, repetição, remarcação, cancelamento, histórico e status.
6. **Frontend do agendamento:** decompor `AgendarPage` e `NovoAgendamentoWizard`, mantendo o fluxo visual e as chamadas reais.
7. **Painel e área do cliente:** organizar páginas de agenda, dashboard, clientes, conta e navegação administrativa.
8. **Configurações, notificações e Evolution:** organizar configuração, regras de antecedência, mensagens e integração WhatsApp.
9. **Padronização final e retirada dos testes:** aplicar nomes/formatação, remover testes e artefatos exclusivos após confirmar uso, limpar código morto e imports.
10. **Validação final e guia do TCC:** executar validações manuais, atualizar status e criar `GUIA_APRESENTACAO.md` com fluxos reais.

## Arquivos que provavelmente serão renomeados

| Atual | Proposto | Motivo |
| ----- | -------- | ------ |
| `client/src/pages/agendar/AgendarPage.tsx` | `client/src/pages/agendamento/PaginaAgendamento.tsx` | alinhar diretório e componente ao domínio em português; confirmar impacto nas rotas/imports |
| `client/src/pages/PainelPage.tsx` | `client/src/pages/PainelPage.tsx` | manter inicialmente: nome já é claro e a mudança não traz benefício imediato |
| `client/src/pages/painel/funcionarios/funcionarios.types.ts` | `client/src/pages/painel/funcionarios/tiposFuncionarios.ts` | padronizar elemento criado pelo sistema, se a mudança melhorar a consistência |
| `client/src/pages/painel/funcionarios/funcionarios.utils.ts` | `client/src/pages/painel/funcionarios/utilitariosFuncionarios.ts` | traduzir nome próprio do domínio, após revisar imports |
| `server/src/services/agenda-lock.service.ts` | `server/src/services/bloqueio-agenda.service.ts` | padronizar nome do serviço em português |
| `server/src/services/evolution.service.ts` | `server/src/services/evolution.service.ts` | manter `Evolution` por ser nome da integração externa |

Essas são hipóteses de renomeação, não ações autorizadas nesta etapa. Nenhum arquivo foi renomeado.

## Riscos

- alterar regras de conflito, duração em blocos de 30 minutos ou escolha sem preferência;
- perder proteção de autenticação/autorização ao mover rotas;
- mudar comportamento de cancelamento/remarcação e antecedência;
- quebrar confirmação de agendamento repetido ou o token temporário;
- duplicar ou omitir histórico e notificações;
- quebrar integração Evolution e configurações de mensagens;
- alterar contratos do cliente HTTP e endpoints;
- mudar imports, aliases ou rotas do Wouter;
- remover dependência que ainda seja usada pela aplicação;
- alterar schema/migrations sem necessidade;
- remover validações junto com os testes.

## Critério de conclusão

A refatoração estará concluída quando as funcionalidades atuais continuarem disponíveis, regras críticas permanecerem protegidas no backend, cliente e servidor compilarem, lint/typecheck/build passarem quando disponíveis, rotas e comunicação funcionarem, verificações manuais principais forem concluídas, testes e artefatos exclusivos forem removidos conforme o escopo, e `GUIA_APRESENTACAO.md` descrever os fluxos reais com caminhos e funções finais.
