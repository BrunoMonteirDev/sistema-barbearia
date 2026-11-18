# Plano de checkpoint do Git

## Objetivo

Preservar e tornar auditável o worktree encontrado em 23 de setembro de 2026 antes de qualquer limpeza do índice ou refatoração MVC. Este plano não declara que todas as mudanças atuais estão corretas: ele separa o que precisa ser preservado do que ainda depende de validação humana e funcional.

Nenhum arquivo foi adicionado ao stage, commitado, descartado ou removido durante esta auditoria.

## Branch de checkpoint

Branch criada:

```text
baseline/estado-atual-2026-09-23
```

Ela aponta para o mesmo commit que `main` apontava no início:

```text
a14b7a1dda7505da9ef50e2d58e21eedbeb23423
```

A assinatura de `git status --short --untracked-files=all` foi calculada antes e depois da troca de branch e permaneceu igual. Portanto, a criação da branch não alterou o conteúdo do worktree.

## Estado inicial

Antes da criação deste documento, o status possuía 599 entradas no total. Fora de `client/node_modules/` havia 122 entradas:

| Situação fora de `node_modules` | Quantidade |
|---|---:|
| Modificados (`M`) | 36 |
| Ausentes no worktree (`D`) | 50 |
| Não rastreados (`??`) | 36 |
| Total | 122 |

As 122 entradas se distribuem assim:

| Grupo | Quantidade | Situação |
|---|---:|---|
| Código-fonte de produção | 41 | 23 modificados, 4 ausentes e 14 novos |
| Testes e infraestrutura de testes | 46 | todos ausentes no worktree |
| Dependências e lockfiles | 6 | 5 modificados e 1 novo |
| Documentação | 23 | 2 modificados e 21 novos |
| Ambientes | 2 | modificados |
| Gerados | 3 | modificados |
| Configuração Vite não gerada | 1 | modificada |

Depois da criação de `12-PLANO-CHECKPOINT-GIT.md`, o total externo a `node_modules` passa a 123 porque este arquivo é uma nova entrada não rastreada. `10-STATUS-DO-PROJETO.md` já era não rastreado e sua atualização não aumenta a contagem.

Além disso, há 477 alterações em arquivos rastreados de `client/node_modules/`: 128 modificações, 347 ausências e 2 mudanças de tipo. O índice contém 7.620 arquivos sob essa pasta.

## Código-fonte que deve ser preservado

“Preservar” significa não descartar. Não significa aprovar automaticamente o comportamento.

### Frontend rastreado modificado

```text
client/src/App.tsx
client/src/components/AcessibilidadeControls.tsx
client/src/components/ProtectedRoute.tsx
client/src/components/layout/Sidebar.tsx
client/src/contexts/AuthContext.tsx
client/src/lib/api.ts
client/src/pages/LoginPage.tsx
client/src/pages/PainelPage.tsx
client/src/pages/painel/AgendamentosPage.tsx
client/src/pages/painel/NovoAgendamentoWizard.tsx
client/src/pages/painel/RegrasNegocioPage.tsx
client/src/pages/painel/ServicosAdminPage.tsx
client/src/pages/painel/funcionarios/FuncionariosTable.tsx
client/src/pages/painel/funcionarios/HorariosModal.tsx
client/src/pages/user/MinhaContaPage.tsx
client/src/pages/user/UserAppointmentsPage.tsx
client/src/styles/index.css
```

### Backend rastreado modificado

```text
server/src/routes/agendamentos.ts
server/src/routes/auth.ts
server/src/routes/servicos.ts
server/src/services/horarios.service.ts
server/src/services/notificacao.service.ts
server/src/services/regras-agendamento.service.ts
```

### Leitura funcional do conjunto

- A versão atualmente ligada por imports usa `PaginaAgendamento`, os novos hooks de páginas e os novos services de agenda. Esses arquivos formam a versão mais recente presente no worktree e não podem ser perdidos.
- Há extrações reais de responsabilidades: lógica saiu de páginas React para hooks e de `routes/agendamentos.ts` para services de criação/manutenção.
- `AcessibilidadeControls.tsx`, `useSpeechSynthesis.ts` e `styles/index.css` formam uma funcionalidade ativa de leitura em voz alta.
- `notificacao.service.ts` utiliza o novo `mensagem-notificacao.service.ts`.
- `bloqueio-agenda.service.ts` é usado pela rota e pelos novos services de agenda.
- `auth.ts`, `ProtectedRoute.tsx`, `AuthContext.tsx`, `LoginPage.tsx`, `PainelPage.tsx`, `Sidebar.tsx` e `ServicosAdminPage.tsx` contêm sobretudo renomeações e reorganização para leitura, mas devem ser revisados junto dos fluxos correspondentes.
- O conjunto também contém mudanças de comportamento: o limite mínimo de antecedência passou a ser tratado como aviso, a comparação de horário passado mudou de `<` para `<=`, a validação de serviços ficou mais estrita e o wizard administrativo foi bastante simplificado. Esses pontos exigem validação antes de um checkpoint ser chamado de funcional.

## Arquivos novos relevantes

### Ativos no grafo de imports

```text
client/src/hooks/useSpeechSynthesis.ts
client/src/pages/agendar/PaginaAgendamento.tsx
client/src/pages/agendar/useAgendamentoPublico.ts
client/src/pages/painel/useAgendaAdministrativa.ts
client/src/pages/painel/useAgendamentoAdministrativo.ts
client/src/pages/painel/useRegrasNegocio.ts
client/src/pages/user/useAgendamentosCliente.ts
client/src/pages/user/useMinhaConta.ts
server/src/services/bloqueio-agenda.service.ts
server/src/services/criacao-agendamento.service.ts
server/src/services/manutencao-agendamento.service.ts
server/src/services/mensagem-notificacao.service.ts
```

### Novos, mas com uso duvidoso

```text
client/src/pages/painel/funcionarios/tiposFuncionarios.ts
client/src/pages/painel/funcionarios/utilitariosFuncionarios.ts
```

`tiposFuncionarios.ts` é importado somente por `FuncionariosTable.tsx`, `HorariosModal.tsx` e `utilitariosFuncionarios.ts`. Os dois componentes não têm importador encontrado no frontend atual. `utilitariosFuncionarios.ts` não tem consumidor encontrado. Esses arquivos parecem uma tradução dos nomes antigos, porém o subgrafo inteiro pode ser residual. Necessita validação manual.

## Exclusões que parecem intencionais

Os pares abaixo têm sinais fortes de migração porque o código atual já importa o caminho novo:

```text
client/src/pages/agendar/AgendarPage.tsx
  → client/src/pages/agendar/PaginaAgendamento.tsx
  + client/src/pages/agendar/useAgendamentoPublico.ts

server/src/services/agenda-lock.service.ts
  → server/src/services/bloqueio-agenda.service.ts
```

O primeiro não é uma renomeação pura: uma página rastreada de 466 linhas foi dividida entre página e hook. O segundo tem conteúdo equivalente no arquivo novo, com o nome traduzido, e seus importadores ativos foram atualizados.

Mesmo essas exclusões só devem entrar em commit junto com seus destinos e depois de build/validação dos fluxos.

## Exclusões que necessitam validação

### Pares de funcionários

```text
client/src/pages/painel/funcionarios/funcionarios.types.ts
client/src/pages/painel/funcionarios/funcionarios.utils.ts
```

Possíveis destinos:

```text
client/src/pages/painel/funcionarios/tiposFuncionarios.ts
client/src/pages/painel/funcionarios/utilitariosFuncionarios.ts
```

Os conteúdos apontam para tradução de nomes, mas os consumidores também parecem fora do grafo ativo. Não confirmar a exclusão nem o novo par antes de decidir se `FuncionariosTable.tsx` e `HorariosModal.tsx` continuam fazendo parte da aplicação.

### Testes

As 46 exclusões de teste e infraestrutura são coerentes com a retirada de Vitest, Testing Library e Supertest dos manifestos. Coerência, entretanto, não prova intenção. A perda cobre autenticação, agenda, serviços, configurações, Evolution, middlewares, UI e integração; deve permanecer bloqueada até decisão humana.

## Renomeações prováveis

| Origem rastreada ausente | Destino novo | Confiança | Observação |
|---|---|---:|---|
| `client/src/pages/agendar/AgendarPage.tsx` | `client/src/pages/agendar/PaginaAgendamento.tsx` + `client/src/pages/agendar/useAgendamentoPublico.ts` | alta | Divisão de página e lógica; `App.tsx` usa o nome novo. |
| `server/src/services/agenda-lock.service.ts` | `server/src/services/bloqueio-agenda.service.ts` | alta | Conteúdo equivalente e imports ativos atualizados. |
| `client/src/pages/painel/funcionarios/funcionarios.types.ts` | `client/src/pages/painel/funcionarios/tiposFuncionarios.ts` | média | Tradução de nome; consumidores parecem residuais. |
| `client/src/pages/painel/funcionarios/funcionarios.utils.ts` | `client/src/pages/painel/funcionarios/utilitariosFuncionarios.ts` | média/baixa | Tradução de nome, mas o destino não tem consumidor encontrado. |

O Git ainda mostra esses casos como `D` + `??`, não como renomeações, porque os arquivos novos não estão no índice.

## Testes e infraestrutura de testes

Todos os 46 caminhos abaixo estão ausentes no worktree:

### Cliente — 26 caminhos

```text
client/src/components/AcessibilidadeControls.test.tsx
client/src/components/ErrorBoundary.test.tsx
client/src/components/KeyboardArrowNavigation.test.tsx
client/src/components/ProtectedRoute.test.tsx
client/src/components/ResumoAgendamentosCliente.test.tsx
client/src/components/SkipToContent.test.tsx
client/src/components/VLibras.test.tsx
client/src/components/layout/Sidebar.test.tsx
client/src/components/ui/modal.test.tsx
client/src/contexts/AuthContext.test.tsx
client/src/lib/api.test.ts
client/src/pages/HomePage.test.tsx
client/src/pages/LoginPage.test.ts
client/src/pages/agendar/AgendarPage.test.tsx
client/src/pages/painel/AgendamentosPage.agenda.test.tsx
client/src/pages/painel/AgendamentosPage.test.tsx
client/src/pages/painel/DashboardPage.test.ts
client/src/pages/painel/DashboardPage.ui.test.tsx
client/src/pages/painel/NovoAgendamentoWizard.test.tsx
client/src/pages/painel/RegrasNegocioPage.test.tsx
client/src/pages/user/MinhaContaPage.test.tsx
client/src/pages/user/UserAppointmentsPage.test.tsx
client/src/test/setup.ts
client/src/utils/senha.test.ts
client/src/utils/telefone.test.ts
client/vitest.config.ts
```

### Servidor — 19 caminhos

```text
server/src/middlewares/auth.test.ts
server/src/routes/agendamentos.test.ts
server/src/routes/auth.test.ts
server/src/routes/configuracoes.test.ts
server/src/routes/evolution.test.ts
server/src/routes/profissionais.test.ts
server/src/routes/servicos.test.ts
server/src/routes/usuarios.test.ts
server/src/services/evolution.service.test.ts
server/src/services/horarios.service.test.ts
server/src/services/notificacao.service.test.ts
server/src/services/regras-agendamento.service.test.ts
server/tests/integration/README.txt
server/tests/integration/agendamentos.test.ts
server/tests/integration/health.test.ts
server/tests/integration/migrate.ts
server/tests/integration/setup.ts
server/vitest.config.ts
server/vitest.integration.config.ts
```

### Raiz — 1 caminho

```text
docker-compose.test.yml
```

Não há uma suíte automatizada disponível no worktree para provar equivalência de comportamento. Antes de confirmar exclusões, a recomendação é recuperar apenas para inspeção a partir do `HEAD`, atualizar os testes que precisarem acompanhar as renomeações e executar as suítes. Isso requer uma etapa futura autorizada; nada foi restaurado nesta auditoria.

## Dependências

Arquivos afetados:

```text
package.json
package-lock.json
client/package.json
client/package-lock.json
server/package.json
server/package-lock.json
```

Situação observada:

- `package.json` remove scripts de teste da raiz.
- `client/package.json` remove scripts e dependências de Vitest/Testing Library, além de `react-icons`, `react-router-dom` e `zustand`.
- `server/package.json` remove scripts e dependências de Vitest/Supertest.
- `client/package-lock.json` e `server/package-lock.json` acompanham grandes alterações dos manifestos.
- `package-lock.json` da raiz é novo e ainda não rastreado.

Esses arquivos não devem ser commitados antes de decidir o destino dos testes e confirmar que as três dependências de runtime removidas do cliente realmente não são necessárias.

`client/vite.config.ts` também foi modificado: o proxy `/api` mudou de `localhost:3001` para `localhost:3002`. A porta deve ser validada contra o ambiente pretendido; não misturar essa mudança com remoção de testes.

## Arquivos gerados

Gerados rastreados e modificados:

```text
client/tsconfig.node.tsbuildinfo
client/tsconfig.tsbuildinfo
client/vite.config.js
```

Gerado rastreado sem modificação atual:

```text
client/vite.config.d.ts
```

Não devem entrar em checkpoints funcionais. Em uma limpeza posterior, os quatro devem sair do índice de forma controlada; as regras atuais do `.gitignore` já os cobrem.

## node_modules rastreado

O índice contém exatamente 7.620 caminhos em `client/node_modules/`; 477 aparecem alterados no status atual. Nenhum `node_modules` de raiz ou do servidor está rastreado.

Não há commit de limpeza pronto nesta etapa. Antes dele, deve ser gerado e revisado um manifesto exato dos 7.620 caminhos rastreados. Só então a retirada do índice deve ocorrer em commit exclusivo, preservando o diretório físico do worktree e sem usar `git add .`, `git clean`, `git reset` ou exclusão manual.

Também há seis arquivos rastreados sob `.local/state/replit/agent/` que o `.gitignore` atual cobre, embora nenhum esteja modificado agora:

```text
.local/state/replit/agent/.agent_state_211d39bdedbcd501e85124b585db9406caf0a6a1.bin
.local/state/replit/agent/.agent_state_6b7c7edcd198741a37d5065f94856e66b0359449.bin
.local/state/replit/agent/.agent_state_d3a698dc5ea914bcba226e296c78bf6d9d74a1bb.bin
.local/state/replit/agent/.agent_state_main.bin
.local/state/replit/agent/.latest.json
.local/state/replit/agent/repl_state.bin
```

## .env e arquivos sensíveis

Modificados e rastreados:

```text
client/.env
server/.env
```

Sem expor valores, as chaves alteradas detectadas são:

```text
client/.env: VITE_API_URL, VITE_GOOGLE_CLIENT_ID
server/.env: GOOGLE_CLIENT_ID, PORT
```

Esses arquivos não devem entrar em nenhum checkpoint compartilhável antes de revisão de segredos. Permanecem preservados apenas no worktree atual.

Os exemplos abaixo também já são rastreados, embora a regra ampla `.env.*` hoje os considere ignorados:

```text
client/.env.example
server/.env.example
server/.env.test.example
```

Uma futura correção do `.gitignore` deve criar exceções explícitas para os exemplos que devam continuar versionados. `server/.env.evolution.example` já possui exceção explícita.

## Plano de commits

Os commits abaixo são uma proposta controlada. Nenhum foi executado. Cada grupo deve ser validado e adicionado por lista explícita; não usar `git add .`, `git add docs/`, `git add client/` ou equivalentes amplos.

### Commit 1 — preservar a extração do fluxo backend de agendamentos

Arquivos:

```text
server/src/routes/agendamentos.ts
server/src/services/agenda-lock.service.ts
server/src/services/bloqueio-agenda.service.ts
server/src/services/criacao-agendamento.service.ts
server/src/services/manutencao-agendamento.service.ts
server/src/services/horarios.service.ts
server/src/services/regras-agendamento.service.ts
```

Condição: revisar mudança de antecedência mínima para aviso, sem confundi-la com refatoração sem alteração de comportamento; validar criação, concorrência, disponibilidade, remarcação, cancelamento, status e histórico.

### Commit 2 — preservar contrato e frontend dos agendamentos

Arquivos:

```text
client/src/App.tsx
client/src/lib/api.ts
client/src/pages/agendar/AgendarPage.tsx
client/src/pages/agendar/PaginaAgendamento.tsx
client/src/pages/agendar/useAgendamentoPublico.ts
client/src/pages/painel/AgendamentosPage.tsx
client/src/pages/painel/NovoAgendamentoWizard.tsx
client/src/pages/painel/useAgendaAdministrativa.ts
client/src/pages/painel/useAgendamentoAdministrativo.ts
client/src/pages/user/UserAppointmentsPage.tsx
client/src/pages/user/useAgendamentosCliente.ts
```

Condição: validar o fluxo público, “sem preferência”, possível repetição, aviso de proximidade, wizard administrativo e área do cliente. O wizard atual perdeu partes relevantes da apresentação anterior; necessita revisão visual e funcional antes do commit.

### Commit 3 — preservar perfil e autenticação

Arquivos:

```text
client/src/components/ProtectedRoute.tsx
client/src/components/layout/Sidebar.tsx
client/src/contexts/AuthContext.tsx
client/src/pages/LoginPage.tsx
client/src/pages/PainelPage.tsx
client/src/pages/user/MinhaContaPage.tsx
client/src/pages/user/useMinhaConta.ts
server/src/routes/auth.ts
```

Condição: validar login local, cadastro, Google, sessão persistida, redirecionamentos por perfil, conclusão cadastral, edição e desativação da conta.

### Commit 4 — preservar acessibilidade por voz

Arquivos:

```text
client/src/components/AcessibilidadeControls.tsx
client/src/hooks/useSpeechSynthesis.ts
client/src/styles/index.css
```

Condição: validar suporte/ausência de Web Speech API, parada ao navegar, primeiro e segundo cliques, teclado e regressões de alto contraste.

### Commit 5 — preservar regras, serviços e notificações extraídas

Arquivos:

```text
client/src/pages/painel/RegrasNegocioPage.tsx
client/src/pages/painel/ServicosAdminPage.tsx
client/src/pages/painel/useRegrasNegocio.ts
server/src/routes/servicos.ts
server/src/services/mensagem-notificacao.service.ts
server/src/services/notificacao.service.ts
```

Condição: validar CRUD de serviços, conversões de preço/duração, regras configuráveis, montagem de todos os tipos de mensagem e envio Evolution.

### Commit 6 — decidir componentes residuais de funcionários

Este commit fica bloqueado até decisão humana. Se os componentes ainda forem válidos, o grupo é:

```text
client/src/pages/painel/funcionarios/FuncionariosTable.tsx
client/src/pages/painel/funcionarios/HorariosModal.tsx
client/src/pages/painel/funcionarios/funcionarios.types.ts
client/src/pages/painel/funcionarios/funcionarios.utils.ts
client/src/pages/painel/funcionarios/tiposFuncionarios.ts
client/src/pages/painel/funcionarios/utilitariosFuncionarios.ts
```

Se forem código morto, não confirmar exclusões automaticamente: primeiro documentar por que deixaram o grafo ativo e decidir uma remoção separada.

### Commit 7 — registrar documentação funcional preexistente

Arquivos:

```text
artigo/roteiro-orientacao-tcc.md
docs/05-regras-de-negocio.md
docs/SYSTEM_SPECIFICATION.md
```

Condição: conferir especialmente a nova regra de aviso de proximidade e as referências a `server/src/routes/agendamentos.ts` antes de declarar o documento como estado funcional vigente.

### Commit 8 — registrar documentação de refatoração e baseline

Arquivos desta iniciativa:

```text
docs/refatoracao/01-ARQUITETURA-ATUAL.md
docs/refatoracao/02-ARQUITETURA-ALVO.md
docs/refatoracao/03-PLANO-REFATORACAO-MVC.md
docs/refatoracao/04-PLANO-TAILWIND-PARA-CSS.md
docs/refatoracao/05-PADROES-DE-CODIGO.md
docs/refatoracao/06-MAPA-DE-FLUXOS.md
docs/refatoracao/07-GUIA-ESTUDO-TCC.md
docs/refatoracao/08-CHECKLIST-REFATORACAO.md
docs/refatoracao/09-DECISOES-ARQUITETURAIS.md
docs/refatoracao/10-STATUS-DO-PROJETO.md
docs/refatoracao/11-BASELINE-GIT.md
docs/refatoracao/12-PLANO-CHECKPOINT-GIT.md
```

Há nove documentos anteriores na mesma pasta e eles não devem entrar por acidente:

```text
docs/refatoracao/00-objetivo.md
docs/refatoracao/01-padroes-codigo.md
docs/refatoracao/02-arquitetura-mvc.md
docs/refatoracao/03-regras-refatoracao.md
docs/refatoracao/04-validacao.md
docs/refatoracao/05-guia-tcc.md
docs/refatoracao/06-plano-refatoracao.md
docs/refatoracao/07-status-refatoracao.md
docs/refatoracao/08-linha-base.md
```

Esses nove precisam de revisão de conteúdo e decisão própria antes de eventual commit.

### Commit 9 — infraestrutura do cliente, somente se a remoção dos testes for confirmada

Arquivos:

```text
client/package.json
client/package-lock.json
client/src/components/AcessibilidadeControls.test.tsx
client/src/components/ErrorBoundary.test.tsx
client/src/components/KeyboardArrowNavigation.test.tsx
client/src/components/ProtectedRoute.test.tsx
client/src/components/ResumoAgendamentosCliente.test.tsx
client/src/components/SkipToContent.test.tsx
client/src/components/VLibras.test.tsx
client/src/components/layout/Sidebar.test.tsx
client/src/components/ui/modal.test.tsx
client/src/contexts/AuthContext.test.tsx
client/src/lib/api.test.ts
client/src/pages/HomePage.test.tsx
client/src/pages/LoginPage.test.ts
client/src/pages/agendar/AgendarPage.test.tsx
client/src/pages/painel/AgendamentosPage.agenda.test.tsx
client/src/pages/painel/AgendamentosPage.test.tsx
client/src/pages/painel/DashboardPage.test.ts
client/src/pages/painel/DashboardPage.ui.test.tsx
client/src/pages/painel/NovoAgendamentoWizard.test.tsx
client/src/pages/painel/RegrasNegocioPage.test.tsx
client/src/pages/user/MinhaContaPage.test.tsx
client/src/pages/user/UserAppointmentsPage.test.tsx
client/src/test/setup.ts
client/src/utils/senha.test.ts
client/src/utils/telefone.test.ts
client/vitest.config.ts
```

Recomendação: não executar esse commit como remoção. A opção preferida é adaptar/restaurar a suíte em uma etapa autorizada. Além disso, confirmar separadamente `react-icons`, `react-router-dom` e `zustand`, pois são dependências de runtime e não pertencem à infraestrutura de testes.

### Commit 10 — infraestrutura do servidor, somente se a remoção dos testes for confirmada

Arquivos:

```text
server/package.json
server/package-lock.json
server/src/middlewares/auth.test.ts
server/src/routes/agendamentos.test.ts
server/src/routes/auth.test.ts
server/src/routes/configuracoes.test.ts
server/src/routes/evolution.test.ts
server/src/routes/profissionais.test.ts
server/src/routes/servicos.test.ts
server/src/routes/usuarios.test.ts
server/src/services/evolution.service.test.ts
server/src/services/horarios.service.test.ts
server/src/services/notificacao.service.test.ts
server/src/services/regras-agendamento.service.test.ts
server/tests/integration/README.txt
server/tests/integration/agendamentos.test.ts
server/tests/integration/health.test.ts
server/tests/integration/migrate.ts
server/tests/integration/setup.ts
server/vitest.config.ts
server/vitest.integration.config.ts
```

Recomendação: preservar ou atualizar a cobertura antes da refatoração MVC, em vez de confirmar a perda de Vitest/Supertest sem substituição.

### Commit 11 — scripts e integração de testes da raiz, condicionado às decisões anteriores

Arquivos:

```text
package.json
package-lock.json
docker-compose.test.yml
```

O novo lockfile da raiz precisa ser explicado por uma instalação intencional. Se não representar uma decisão de dependências da raiz, permanece fora do checkpoint até revisão.

### Commit 12 — configuração local de proxy, após validar a porta

Arquivo:

```text
client/vite.config.ts
```

Condição: confirmar se a API deve operar em `3002`, se `server/.env` é apenas configuração local e se documentação/scripts continuam coerentes.

### Commits futuros de higiene — ainda não prontos

Não executar até os checkpoints anteriores estarem validados e registrados:

1. retirar do índice os 7.620 caminhos de `client/node_modules/`, usando manifesto exato e preservando o worktree;
2. retirar do índice os quatro gerados `client/tsconfig.node.tsbuildinfo`, `client/tsconfig.tsbuildinfo`, `client/vite.config.js` e `client/vite.config.d.ts`;
3. decidir a retirada controlada dos seis caminhos `.local/state/replit/agent/` listados acima;
4. corrigir exceções de exemplos no `.gitignore` e tratar `client/.env` e `server/.env` somente após auditoria de segredos;
5. executar build, testes restaurados/adaptados e roteiro manual; então registrar o baseline validado.

## Estratégia segura recomendada

1. Manter a branch `baseline/estado-atual-2026-09-23` no HEAD atual e não iniciar MVC ainda.
2. Revisar primeiro os quatro pontos de maior risco: antecedência como aviso, wizard administrativo, porta 3002 e exclusão dos testes.
3. Validar e registrar os commits 1 a 5 por domínio, sempre com listas explícitas.
4. Resolver separadamente os componentes de funcionários e a documentação anterior.
5. Restaurar/adaptar a infraestrutura de testes ou confirmar formalmente sua substituição antes de qualquer refatoração estrutural.
6. Manter `.env`, gerados e `node_modules` fora dos commits funcionais.
7. Só depois criar commits exclusivos de higiene do índice, sem apagar os arquivos físicos do worktree.
8. Executar build e validações funcionais; atualizar `10-STATUS-DO-PROJETO.md`; somente então iniciar a migração MVC.

## Arquivos que necessitam decisão humana

```text
client/.env
server/.env
client/vite.config.ts
package.json
package-lock.json
client/package.json
client/package-lock.json
server/package.json
server/package-lock.json
docker-compose.test.yml
client/src/pages/painel/NovoAgendamentoWizard.tsx
client/src/pages/painel/funcionarios/FuncionariosTable.tsx
client/src/pages/painel/funcionarios/HorariosModal.tsx
client/src/pages/painel/funcionarios/funcionarios.types.ts
client/src/pages/painel/funcionarios/funcionarios.utils.ts
client/src/pages/painel/funcionarios/tiposFuncionarios.ts
client/src/pages/painel/funcionarios/utilitariosFuncionarios.ts
docs/05-regras-de-negocio.md
docs/SYSTEM_SPECIFICATION.md
artigo/roteiro-orientacao-tcc.md
docs/refatoracao/00-objetivo.md
docs/refatoracao/01-padroes-codigo.md
docs/refatoracao/02-arquitetura-mvc.md
docs/refatoracao/03-regras-refatoracao.md
docs/refatoracao/04-validacao.md
docs/refatoracao/05-guia-tcc.md
docs/refatoracao/06-plano-refatoracao.md
docs/refatoracao/07-status-refatoracao.md
docs/refatoracao/08-linha-base.md
```

Também necessitam decisão conjunta, como grupos, os 46 caminhos de teste listados neste documento, os 7.620 caminhos rastreados em `client/node_modules/`, os quatro arquivos gerados e os seis arquivos `.local`.

## Próximo passo recomendado

Fazer uma revisão humana dirigida dos commits 1 e 2, porque agenda é o maior conjunto funcional e concentra mudanças reais de regra. Antes de commitar, restaurar a capacidade de teste em uma etapa separada e autorizada ou, no mínimo, executar build e um roteiro manual explícito dos contratos HTTP e telas. Não iniciar a refatoração MVC até esse checkpoint funcional estar validado.
