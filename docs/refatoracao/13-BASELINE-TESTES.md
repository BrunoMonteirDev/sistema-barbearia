# Baseline de testes

## Situação atual

Auditoria realizada em 23 de setembro de 2026 na branch `baseline/estado-atual-2026-09-23`, no commit:

```text
a14b7a1dda7505da9ef50e2d58e21eedbeb23423
```

O worktree possui 46 caminhos de testes e infraestrutura que estão rastreados no `HEAD`, mas ausentes no estado atual:

| Origem | Arquivos de teste | Infraestrutura/documentação | Total de caminhos | Casos `it`/`test` no HEAD |
|---|---:|---:|---:|---:|
| Frontend | 24 | 2 | 26 | 63 |
| Backend | 14 | 5 | 19 | 119 |
| Raiz | 0 | 1 | 1 | 0 |
| **Total** | **38** | **8** | **46** | **182** |

Os oito caminhos de suporte são `client/src/test/setup.ts`, as três configurações Vitest, os dois scripts de proteção/preparo do banco de integração, o README da integração e `docker-compose.test.yml`.

Vitest, Testing Library, jsdom e Supertest não estão disponíveis nos `node_modules` atuais. Por isso, nenhum teste removido pôde ser executado sem reinstalar dependências. Os arquivos foram analisados diretamente com `git show HEAD:<caminho>`, sem restauração no worktree.

Esta etapa não alterou manifestos, lockfiles, `.env`, testes nem código de produção.

## Infraestrutura anterior

### Frontend

O `HEAD` possuía:

```text
client/vitest.config.ts
client/src/test/setup.ts
```

Configuração anterior:

- ambiente `jsdom`;
- alias `@` apontando para `client/src`;
- inclusão de `src/**/*.test.{ts,tsx}`;
- setup com `@testing-library/jest-dom/vitest` e limpeza do DOM após cada teste;
- cobertura V8 com limite de 80% para linhas, funções, branches e statements.

Dependências removidas de `client/package.json`:

```text
@testing-library/jest-dom       ^7.0.0
@testing-library/react          ^16.3.2
@testing-library/user-event     ^14.6.1
@vitest/coverage-v8             ^4.1.10
jsdom                           ^30.0.1
vitest                          ^4.1.10
```

`@testing-library/user-event` não é importado pelos testes existentes no `HEAD`, portanto não faz parte da baseline mínima. `@vitest/coverage-v8` também não é necessário para voltar a executar testes; cobertura deve ser recuperada depois que a suíte mínima estiver estável.

Scripts removidos:

```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

### Backend

O `HEAD` possuía:

```text
server/vitest.config.ts
server/vitest.integration.config.ts
server/tests/integration/setup.ts
server/tests/integration/migrate.ts
server/tests/integration/README.txt
docker-compose.test.yml
```

Configuração anterior:

- testes unitários/HTTP em `server/src/**/*.test.ts`;
- ambiente Node;
- cobertura V8 com limites de 80%;
- integração serial (`fileParallelism: false`);
- banco PostgreSQL exclusivo na porta local `5435`;
- validações para impedir uso de `DATABASE_URL` de desenvolvimento;
- exigência de `DATABASE_URL_TEST` cujo nome de banco contenha `test`;
- migrations aplicadas antes da integração.

Dependências removidas de `server/package.json`:

```text
@types/supertest               ^7.2.1
@vitest/coverage-v8            ^4.1.10
supertest                      ^7.2.2
vitest                         ^4.1.10
```

Scripts removidos:

```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage",
"pretest:integration": "tsx tests/integration/migrate.ts",
"test:integration": "vitest run --config vitest.integration.config.ts"
```

### Raiz

Scripts removidos de `package.json`:

```json
"test": "npm --prefix client run test && npm --prefix server run test",
"test:watch": "npm --prefix client run test:watch",
"test:coverage": "npm --prefix client run test:coverage && npm --prefix server run test:coverage",
"test:integration": "npm --prefix server run test:integration"
```

### Infraestrutura mínima necessária

Para a primeira recuperação, bastam:

Frontend:

```text
vitest
jsdom
@testing-library/react
@testing-library/jest-dom
```

Backend:

```text
vitest
supertest
@types/supertest
```

Já existem no projeto as demais dependências necessárias: React, plugin React do Vite, TypeScript, Express, Prisma, PostgreSQL, `tsx`, `dotenv`, `bcryptjs` e JWT.

Não são necessários inicialmente:

```text
@testing-library/user-event
@vitest/coverage-v8
scripts de watch
scripts de coverage
```

Scripts mínimos propostos para uma etapa futura autorizada:

```json
// client/package.json
"test": "vitest run --config vitest.config.ts"

// server/package.json
"test": "vitest run --config vitest.config.ts",
"pretest:integration": "tsx tests/integration/migrate.ts",
"test:integration": "vitest run --config vitest.integration.config.ts"

// package.json da raiz
"test": "npm --prefix client run test && npm --prefix server run test",
"test:integration": "npm --prefix server run test:integration"
```

Nada disso foi adicionado nesta etapa.

## Testes removidos

Classificação usada:

- **A** — ainda corresponde ao comportamento/código atual ou é infraestrutura ainda aplicável;
- **B** — continua relevante, mas precisa de adaptação por renomeação, extração ou contrato alterado;
- **C** — testa código que não existe mais e não possui equivalente atual;
- **D** — duplicado ou de baixo valor para a baseline;
- **E** — depende de decisão humana sobre o comportamento desejado.

### Frontend — 26 caminhos

| Arquivo | Classe | Avaliação |
|---|:---:|---|
| `client/src/components/AcessibilidadeControls.test.tsx` | A | Preferências persistidas continuam existindo; futuramente deve ganhar cobertura pequena para leitura por voz. |
| `client/src/components/ErrorBoundary.test.tsx` | A | Protege recuperação de erro de renderização. |
| `client/src/components/KeyboardArrowNavigation.test.tsx` | A | Componente e comportamento de teclado continuam ativos. |
| `client/src/components/ProtectedRoute.test.tsx` | A | Protege visitante, cliente, administrador e cadastro Google pendente. |
| `client/src/components/ResumoAgendamentosCliente.test.tsx` | A | Componente continua ativo na página pública de agendamento. |
| `client/src/components/SkipToContent.test.tsx` | A | Atalho de acessibilidade continua existente. |
| `client/src/components/VLibras.test.tsx` | A | Integração e alternância por rota continuam existentes. |
| `client/src/components/layout/Sidebar.test.tsx` | A | `aria-current` continua sendo aplicado conforme a rota. |
| `client/src/components/ui/modal.test.tsx` | A | Foco, Tab, Escape e devolução de foco continuam críticos. |
| `client/src/contexts/AuthContext.test.tsx` | A | Sessão, login, cadastro, Google e logout continuam no contexto atual. |
| `client/src/lib/api.test.ts` | A | Token, erros e `ignorarAgendamentoId` continuam no cliente HTTP atual. |
| `client/src/pages/HomePage.test.tsx` | A | Contatos públicos configuráveis continuam exibidos pela Home. |
| `client/src/pages/LoginPage.test.ts` | A | Destino pós-Google e cadastro pendente continuam atuais. |
| `client/src/pages/agendar/AgendarPage.test.tsx` | B | A funcionalidade permanece, mas a página agora é `PaginaAgendamento.tsx`, usa `useAgendamentoPublico.ts` e a resposta de disponibilidade ganhou avisos de antecedência. |
| `client/src/pages/painel/AgendamentosPage.agenda.test.tsx` | A | Agenda diária/semanal e confirmação rápida continuam exportadas. |
| `client/src/pages/painel/AgendamentosPage.test.tsx` | D | Repete quase integralmente a cobertura de `AgendamentosPage.agenda.test.tsx`; manter apenas os cenários adicionais relevantes. |
| `client/src/pages/painel/DashboardPage.test.ts` | A | Funções de status e estado do WhatsApp continuam exportadas. |
| `client/src/pages/painel/DashboardPage.ui.test.tsx` | A | Indicadores e degradação da integração continuam comportamentos atuais. |
| `client/src/pages/painel/NovoAgendamentoWizard.test.tsx` | A | O teste de percurso ainda aponta para o componente atual; o próprio wizard, porém, precisa de revisão humana visual/funcional. |
| `client/src/pages/painel/RegrasNegocioPage.test.tsx` | E | Espera “antecedência mínima”; a tela atual chama a regra de “aviso de proximidade”. É preciso confirmar a regra desejada antes de adaptar a asserção. |
| `client/src/pages/user/MinhaContaPage.test.tsx` | A | Exclusão com confirmação textual e logout continuam atuais após extração para hook. |
| `client/src/pages/user/UserAppointmentsPage.test.tsx` | A | Remarcação, cancelamento e histórico continuam atuais após extração para hook. |
| `client/src/test/setup.ts` | A | Setup mínimo de DOM e matchers continua adequado. |
| `client/src/utils/senha.test.ts` | A | Utilitário frontend permanece e as regras continuam iguais. |
| `client/src/utils/telefone.test.ts` | A | Formatação continua usada em formulários. |
| `client/vitest.config.ts` | A | Alias, jsdom e setup continuam adequados; cobertura pode ficar desativada no primeiro momento. |

### Backend — 19 caminhos

| Arquivo | Classe | Avaliação |
|---|:---:|---|
| `server/src/middlewares/auth.test.ts` | A | Protege autenticação JWT e autorização administrativa. |
| `server/src/routes/agendamentos.test.ts` | B | Ainda é central, mas mocka `agenda-lock.service.ts`, lógica agora extraída para novos services e a antecedência deixou de bloquear horários próximos. |
| `server/src/routes/auth.test.ts` | A | Contratos de login local, cadastro e Google continuam atuais apesar da extração de funções internas. |
| `server/src/routes/configuracoes.test.ts` | A | Configurações e validação numérica continuam existentes. |
| `server/src/routes/evolution.test.ts` | A | Rotas e tratamento degradado continuam atuais. |
| `server/src/routes/profissionais.test.ts` | A | Cadastro e disponibilidade continuam atuais. |
| `server/src/routes/servicos.test.ts` | A | CRUD lógico continua atual; as novas validações tornam o teste ainda mais importante. |
| `server/src/routes/usuarios.test.ts` | A | Perfil, criação, senha, autorização e desativação continuam atuais. |
| `server/src/services/evolution.service.test.ts` | A | Regras de envio automático continuam atuais. |
| `server/src/services/horarios.service.test.ts` | A | Blocos, duração, conflito, disponibilidade e “sem preferência” continuam centrais. Os aliases preservam os nomes usados pelo teste. |
| `server/src/services/notificacao.service.test.ts` | A | Envio, falha, telefone, eventos automáticos e lembretes continuam atuais após extração da mensagem. |
| `server/src/services/regras-agendamento.service.test.ts` | A | Funções de data, antecedência e horário passado continuam existindo; deve receber um caso novo para igualdade exata após `<=`. |
| `server/tests/integration/README.txt` | A | Procedimento de banco isolado e proteções continuam adequados. |
| `server/tests/integration/agendamentos.test.ts` | B | É valioso e cobre lock real, mas espera o contrato antigo de disponibilidade e bloqueio por antecedência mínima. Deve ser reduzido/adaptado à baseline. |
| `server/tests/integration/health.test.ts` | A | Smoke test do app e banco exclusivo continua válido. |
| `server/tests/integration/migrate.ts` | A | Proteções contra migrations no banco de desenvolvimento continuam essenciais. |
| `server/tests/integration/setup.ts` | A | Isolamento de `DATABASE_URL_TEST` continua essencial. |
| `server/vitest.config.ts` | A | Descoberta de testes unitários continua adequada; cobertura pode ser postergada. |
| `server/vitest.integration.config.ts` | A | Execução serial e setup do banco continuam adequados. |

### Raiz — 1 caminho

| Arquivo | Classe | Avaliação |
|---|:---:|---|
| `docker-compose.test.yml` | A | PostgreSQL exclusivo na porta 5435 continua sendo a forma segura de testar concorrência/Prisma sem usar o banco de desenvolvimento. |

### Totais da classificação

| Classe | Caminhos | Leitura |
|---|---:|---|
| A | 41 | Ainda válidos ou infraestrutura compatível. |
| B | 3 | Adaptação objetiva necessária. |
| C | 0 | Nenhum caminho é comprovadamente obsoleto apenas porque o código desapareceu. |
| D | 1 | Duplicado/baixo valor para a baseline. |
| E | 1 | Depende da decisão sobre antecedência mínima versus aviso. |

Os números são por caminho, não por caso individual. A classe A não significa que todos os 182 casos devam voltar para a baseline mínima.

## Testes ainda válidos

Os 41 caminhos A podem ser recuperados tecnicamente, mas devem ser priorizados. Os mais importantes para a refatoração são:

```text
server/src/middlewares/auth.test.ts
server/src/routes/auth.test.ts
server/src/routes/usuarios.test.ts
server/src/routes/servicos.test.ts
server/src/routes/profissionais.test.ts
server/src/services/horarios.service.test.ts
server/src/services/notificacao.service.test.ts
server/src/services/regras-agendamento.service.test.ts
client/src/contexts/AuthContext.test.tsx
client/src/components/ProtectedRoute.test.tsx
client/src/lib/api.test.ts
client/src/pages/user/UserAppointmentsPage.test.tsx
client/src/pages/painel/NovoAgendamentoWizard.test.tsx
```

Eles protegem contratos e regras, não aparência ou classes Tailwind.

## Testes que precisam de adaptação

### `client/src/pages/agendar/AgendarPage.test.tsx`

Adaptações objetivas:

- mudar arquivo/import para `PaginaAgendamento`;
- manter a proteção “revisar antes de confirmar”;
- manter preservação dos dados ao redirecionar para login;
- incluir `horariosComAvisoAntecedencia` no mock de disponibilidade;
- testar o aviso/aceite de proximidade somente depois que essa regra for confirmada.

### `server/src/routes/agendamentos.test.ts`

Adaptações objetivas:

- substituir o mock de `agenda-lock.service.ts` pelo caminho atual;
- mockar ou testar de forma focada `criacao-agendamento.service.ts` e `manutencao-agendamento.service.ts`;
- retirar das rotas asserções que pertencem aos services extraídos;
- atualizar disponibilidade para `{ horarios, horariosComAvisoAntecedencia }`;
- revisar cenários que esperam HTTP 409 por antecedência mínima.

### `server/tests/integration/agendamentos.test.ts`

Adaptações objetivas:

- atualizar respostas exatas de disponibilidade;
- decidir a expectativa para horário futuro dentro da janela de aviso;
- manter os testes reais de concorrência, pois são os únicos que exercitam advisory lock + transação + PostgreSQL;
- reduzir o conjunto inicial aos fluxos críticos, expandindo depois.

### Dependente de decisão

`client/src/pages/painel/RegrasNegocioPage.test.tsx` só pode ser adaptado após confirmar se `antecedenciaAgendamentoMinutos` bloqueia a reserva ou apenas mostra aviso. O código atual implementa aviso, enquanto o teste do `HEAD` descreve bloqueio mínimo.

## Testes obsoletos

Nenhum teste foi classificado como C: todos os módulos removidos possuem equivalente atual ou continuam existentes.

`client/src/pages/painel/AgendamentosPage.test.tsx` foi classificado como D por duplicar `AgendamentosPage.agenda.test.tsx`. Seus cenários exclusivos de clique para edição podem ser incorporados ao arquivo mantido; não é necessário preservar dois arquivos quase iguais.

Também não se recomenda recuperar de imediato testes predominantemente visuais ou periféricos apenas para alcançar cobertura. Isso inclui Home, Dashboard completo, VLibras e todos os detalhes de acessibilidade. Eles continuam válidos, mas não bloqueiam o início da baseline mínima dos domínios.

## Baseline mínima recomendada

A baseline deve proteger fronteiras HTTP, regras de domínio e concorrência. Não deve validar Tailwind, cores, espaçamentos ou snapshots extensos.

### Backend

| Arquivo proposto | Comportamento protegido | Por que é importante | Situação |
|---|---|---|---|
| `server/src/services/senha.service.test.ts` | Senha curta, complexidade, espaços, repetição, sequência e senha válida. | Regra compartilhada por autenticação e usuários. | **Novo**; não existe no HEAD como teste unitário direto. |
| `server/src/routes/auth.test.ts` | Login válido/inválido, conta inativa, cadastro local e e-mail duplicado. | Protege entrada e criação de sessão. | Existe no HEAD; recuperar. |
| `server/src/routes/usuarios.test.ts` | Criação administrativa, perfil próprio, autorização, senha e desativação lógica. | Protege usuários e privacidade. | Existe no HEAD; recuperar. |
| `server/src/middlewares/auth.test.ts` | Ausência/token inválido, cliente bloqueado no admin e administrador autorizado. | Evita regressão transversal de autorização. | Existe no HEAD; recuperar. |
| `server/src/routes/servicos.test.ts` | Listagem pública ativa, criação, edição, validação e desativação. | É o domínio-piloto provável da MVC. | Existe no HEAD; recuperar e acrescentar entradas inválidas exigidas pela rota atual. |
| `server/src/routes/profissionais.test.ts` | Profissional ativo, validação cadastral e substituição segura da disponibilidade. | Liga profissional à disponibilidade. | Existe no HEAD; recuperar. |
| `server/src/services/horarios.service.test.ts` | Blocos, duração, sobreposição parcial, cancelados, remarcação e sem preferência. | Protege a regra central de conflito sem banco real. | Existe no HEAD; recuperar. |
| `server/src/services/criacao-agendamento.service.test.ts` | Recursos ativos, cadastro pendente, repetição, disponibilidade e criação sob lock. | A lógica saiu da rota e precisa de proteção direta. | **Novo**. |
| `server/src/services/manutencao-agendamento.service.test.ts` | Cancelamento, remarcação, atualização de status e histórico. | Protege alterações e auditoria após a extração. | **Novo**. |
| `server/src/routes/agendamentos.test.ts` | Validação HTTP, autorização, códigos de erro, disponibilidade e delegação aos services. | Protege o contrato sem duplicar toda a regra de negócio. | Existe no HEAD; recuperar e adaptar. |
| `server/src/services/notificacao.service.test.ts` | Não interromper operação, telefone ausente, sucesso/falha e não duplicar lembrete. | WhatsApp é efeito externo e precisa falhar de forma controlada. | Existe no HEAD; recuperar inicialmente apenas os casos essenciais. |
| `server/tests/integration/agendamentos-baseline.test.ts` | Criação real, conflito sobreposto, concorrência, cancelamento liberando horário, remarcação e autorização. | Única proteção completa para Prisma, PostgreSQL e advisory lock. | **Novo e menor**, derivado dos cenários recuperáveis de `server/tests/integration/agendamentos.test.ts`. |

Para o primeiro ciclo, cobertura automática de Google e Evolution externa pode permanecer em testes mockados. Não chamar serviços externos reais.

### Frontend

| Arquivo proposto | Comportamento protegido | Por que é importante | Situação |
|---|---|---|---|
| `client/src/pages/agendar/PaginaAgendamento.test.tsx` | Escolha dos dados, revisão obrigatória, autenticação tardia e preservação da tentativa. | É o principal fluxo do cliente. | Adaptar de `AgendarPage.test.tsx`. |
| `client/src/contexts/AuthContext.test.tsx` | Restauração/limpeza de sessão, login local, Google, cadastro e logout. | Protege o estado global de autenticação. | Existe no HEAD; recuperar. |
| `client/src/components/ProtectedRoute.test.tsx` | Redirecionamento por sessão, perfil e cadastro incompleto. | Evita exposição de áreas protegidas. | Existe no HEAD; recuperar. |
| `client/src/pages/user/UserAppointmentsPage.test.tsx` | Remarcação, cancelamento, histórico e bloqueio de ações concluídas. | Protege ações do cliente depois da reserva. | Existe no HEAD; recuperar. |
| `client/src/lib/api.test.ts` | Token, erro da API e `ignorarAgendamentoId`. | Protege o contrato comum usado pelas páginas. | Existe no HEAD; recuperar. |

`NovoAgendamentoWizard.test.tsx` deve ser o próximo teste frontend depois da decisão humana sobre o wizard atual. Testes de CSS/Tailwind não fazem parte da baseline.

## Frontend

### Comandos atuais

| Objetivo | Comando declarado/seguro | Resultado desta auditoria |
|---|---|---|
| Desenvolvimento | `npm --prefix client run dev` | Não executado: processo persistente e pode criar cache `.vite`. |
| Build declarado | `npm --prefix client run build` | Não executado diretamente: `tsc -b` pode atualizar `.tsbuildinfo` e Vite escreve `dist`. |
| Typecheck sem emissão | `node ./node_modules/typescript/bin/tsc --project tsconfig.json --noEmit --incremental false` em `client/` | **Aprovado**, exit code 0, sem saída de erro. |
| Lint sem cache | `npm run lint -- --no-cache` em `client/` | **Aprovado**, exit code 0. |
| Bundle sem escrever no repositório | `node ./node_modules/vite/bin/vite.js build --config vite.config.ts --outDir <diretório temporário>` em `client/` | **Aprovado**: 1.619 módulos; CSS 43,38 kB; JS 322,09 kB. Saída em `/tmp/sistema-barbearia-client-build.T7R0cO`. |
| Testes | Não há script/binário disponível atualmente. | Não executado; Vitest/Testing Library/jsdom ausentes. |

O bundle emitiu apenas avisos de dados desatualizados de Browserslist e `baseline-browser-mapping`; não houve falha.

## Backend

### Comandos atuais

| Objetivo | Comando atual | Resultado desta auditoria |
|---|---|---|
| Desenvolvimento | `npm --prefix server run dev` | Não executado: processo persistente. |
| Execução | `npm --prefix server start` | Não executado: inicia API, conecta infraestrutura e agenda processamento de lembretes. |
| Build/typecheck | `npm --prefix server run build` | **Aprovado**, exit code 0; executa `tsc --noEmit`. |
| Lint | Nenhum script/configuração específica encontrada no servidor. | Não disponível. |
| Testes | Não há script/binário disponível atualmente. | Não executado; Vitest/Supertest ausentes. |

Ambiente observado: Node `v24.16.0` e npm `11.13.0`.

## Comandos de validação

Validações seguras que já podem formar o baseline, sem instalar dependências:

```text
cd client
node ./node_modules/typescript/bin/tsc --project tsconfig.json --noEmit --incremental false
npm run lint -- --no-cache
node ./node_modules/vite/bin/vite.js build --config vite.config.ts --outDir <diretório temporário>

cd server
npm run build
```

Não usar o build frontend declarado enquanto o repositório estiver sendo auditado, porque ele grava artefatos. Não executar `start` do servidor como simples validação: `server/src/index.ts` inicia o scheduler de lembretes.

Depois da recuperação mínima, os comandos esperados serão:

```text
npm --prefix client run test
npm --prefix server run test
npm --prefix server run test:integration
```

## Ordem recomendada de recuperação

1. Confirmar humanamente a regra de antecedência: bloqueio ou aviso.
2. Em mudança autorizada, recuperar apenas configs/setup e dependências mínimas, sem coverage e sem `user-event`.
3. Recuperar primeiro testes backend puros e HTTP: senha, auth middleware, auth route, usuários, serviços, profissionais e horários.
4. Criar testes diretos dos novos services de criação e manutenção de agendamento.
5. Adaptar `server/src/routes/agendamentos.test.ts` para testar a fronteira HTTP, sem repetir os services.
6. Recuperar frontend mínimo: AuthContext, ProtectedRoute, API, página pública de agendamento e área de agendamentos do cliente.
7. Recuperar o banco exclusivo de integração e executar primeiro `health.test.ts`.
8. Criar a integração reduzida de agenda/lock usando os cenários valiosos do arquivo antigo.
9. Só depois recuperar notificações ampliadas, acessibilidade, Dashboard, Home, Google e Evolution.
10. Reintroduzir coverage e definir limites realistas após a baseline ficar verde.

Os primeiros testes recomendados são:

```text
server/src/services/horarios.service.test.ts
server/src/routes/servicos.test.ts
server/src/middlewares/auth.test.ts
server/src/routes/auth.test.ts
server/src/routes/usuarios.test.ts
```

Eles têm boa relação entre risco protegido e custo de adaptação, não dependem do banco real e cobrem os primeiros domínios da futura refatoração.

## Critério para considerar a baseline segura

A baseline estará segura para iniciar a refatoração MVC quando:

- typecheck e bundle frontend passarem sem escrever artefatos no repositório;
- lint frontend passar;
- typecheck backend passar;
- testes mínimos de serviços, autenticação, usuários, profissionais, horários e autorização estiverem verdes;
- criação, conflito, cancelamento e remarcação estiverem cobertos nos services/rotas;
- pelo menos uma suíte com PostgreSQL real provar conflito concorrente e advisory lock;
- o banco de integração estiver comprovadamente isolado do desenvolvimento;
- frontend proteger revisão/autenticação do agendamento e ações da área do cliente;
- a decisão sobre antecedência mínima estiver registrada;
- nenhum teste depender de Google ou Evolution reais;
- `git status` antes e depois das validações não ganhar alterações inesperadas.

Não é necessário alcançar 80% de cobertura antes de começar a MVC. É necessário cobrir as fronteiras e regras com maior risco de regressão.

## Próximo passo

Ainda não iniciar a refatoração MVC. O próximo passo recomendado é decidir a semântica de `antecedenciaAgendamentoMinutos` e autorizar uma etapa pequena para recuperar apenas a infraestrutura mínima e os cinco primeiros testes backend listados acima. Manifestos e lockfiles devem ser alterados em conjunto e revisados antes de qualquer instalação.

Arquivos que ainda exigem decisão humana:

```text
client/src/pages/painel/RegrasNegocioPage.test.tsx
client/src/pages/painel/NovoAgendamentoWizard.test.tsx
client/src/pages/painel/AgendamentosPage.test.tsx
server/src/routes/agendamentos.test.ts
server/tests/integration/agendamentos.test.ts
client/package.json
client/package-lock.json
server/package.json
server/package-lock.json
package.json
package-lock.json
docker-compose.test.yml
server/.env.test.example
```

A dúvida central é funcional: `antecedenciaAgendamentoMinutos` deve impedir reservas próximas ou apenas exigir um aviso/aceite? Sem essa decisão, um grupo importante de testes teria expectativas contraditórias.
