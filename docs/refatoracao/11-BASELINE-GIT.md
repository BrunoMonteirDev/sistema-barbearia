# Estado atual do repositório

## Escopo e momento da captura

Esta auditoria foi realizada em 23 de setembro de 2026, antes de qualquer refatoração MVC e antes da criação deste arquivo. Foram usados apenas comandos de leitura:

```text
git status --short --untracked-files=all
git diff --stat
git diff --name-status
git ls-files
git check-ignore -v --no-index
git log
```

Nenhum reset, checkout, clean, remoção, restauração, stage ou commit foi executado.

Como `11-BASELINE-GIT.md` ainda não existia, a captura inicial possuía 598 entradas no status. Depois da criação deste documento, o status passa a ter uma entrada não rastreada adicional. `10-STATUS-DO-PROJETO.md` já era não rastreado e sua atualização não cria uma segunda entrada.

## Branch atual

```text
main
```

Não foi feita troca ou criação de branch.

# Último commit

```text
Commit:  a14b7a1dda7505da9ef50e2d58e21eedbeb23423
Resumo:  chore: corrigir build do cliente
Autor:   Bruno
Data:    2026-08-24T16:30:13-03:00
```

Commits imediatamente anteriores tratam de documentação, experiência do agendamento e robustez do fluxo. Isso ajuda a contextualizar o conjunto atual, mas não comprova a intenção de nenhuma alteração não commitada.

# Quantidade de arquivos modificados

## Captura antes deste documento

`git status --short --untracked-files=all`:

| Grupo | Quantidade |
|---|---:|
| Caminhos rastreados alterados | 563 |
| Caminhos não rastreados | 35 |
| Total de entradas | 598 |

`git diff --name-status` nos 563 caminhos rastreados:

| Status | Quantidade |
|---|---:|
| `M` — modificados | 164 |
| `D` — ausentes no worktree | 397 |
| `T` — tipo do arquivo alterado | 2 |

`git diff --stat` global:

```text
563 files changed, 3427 insertions(+), 411315 deletions(-)
```

A maior parte desse volume vem de dependências rastreadas:

| Recorte | Arquivos | Inserções | Exclusões |
|---|---:|---:|---:|
| `client/node_modules` | 477 | 2.571 | 402.709 |
| Todo o restante | 86 | 856 | 8.606 |

Os dez documentos criados na etapa anterior são não rastreados e, por isso, não aparecem em `git diff --stat` nem em `git diff --name-status`.

# Arquivos não rastreados

Antes da criação deste baseline havia 35 arquivos não rastreados.

## Código-fonte não rastreado — importante

### Frontend

```text
client/src/hooks/useSpeechSynthesis.ts
client/src/pages/agendar/PaginaAgendamento.tsx
client/src/pages/agendar/useAgendamentoPublico.ts
client/src/pages/painel/funcionarios/tiposFuncionarios.ts
client/src/pages/painel/funcionarios/utilitariosFuncionarios.ts
client/src/pages/painel/useAgendaAdministrativa.ts
client/src/pages/painel/useAgendamentoAdministrativo.ts
client/src/pages/painel/useRegrasNegocio.ts
client/src/pages/user/useAgendamentosCliente.ts
client/src/pages/user/useMinhaConta.ts
```

### Backend

```text
server/src/services/bloqueio-agenda.service.ts
server/src/services/criacao-agendamento.service.ts
server/src/services/manutencao-agendamento.service.ts
server/src/services/mensagem-notificacao.service.ts
```

Esses 14 arquivos são utilizados pelo código atual ou formam pares aparentes com arquivos rastreados ausentes. Não devem ser tratados como lixo.

## Documentação não rastreada

```text
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

Além desses documentos preexistentes, os dez documentos da análise estrutural também estavam não rastreados:

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
```

Os dez estão isolados das mudanças de produção por caminho: todos ficam em arquivos próprios dentro de `docs/refatoracao/`. Entretanto, **não estão isolados por diretório**, pois há nove documentos anteriores não rastreados na mesma pasta. Um futuro `git add docs/refatoracao` incluiria todos eles. O stage deverá usar uma lista explícita de arquivos depois de revisão humana.

## Outro não rastreado

```text
package-lock.json
```

É o lockfile da raiz e merece revisão junto da mudança atual de `package.json`. Lockfile é gerado pelo gerenciador, mas pode ser parte importante e intencional do estado de dependências; não deve ser apagado por suposição.

# node_modules e arquivos gerados rastreados

## node_modules

`node_modules` está efetivamente rastreado pelo Git.

```text
Arquivos rastreados dentro de node_modules: 7.620
Raiz rastreada: client/node_modules
Raiz node_modules: nenhum arquivo rastreado encontrado
server/node_modules: nenhum arquivo rastreado encontrado
```

Estado atual dos caminhos rastreados de `client/node_modules`:

| Status | Quantidade |
|---|---:|
| Modificados | 128 |
| Ausentes | 347 |
| Tipo alterado | 2 |
| Total alterado | 477 |

Os dois `T` são:

```text
client/node_modules/.bin/nanoid
client/node_modules/.bin/parser
```

Mudanças de tipo em `.bin` costumam decorrer da forma como links executáveis foram materializados, mas nenhuma conclusão de descarte deve ser tomada sem estabilizar o restante.

Entre os pacotes rastreados aparecem, por exemplo, `lucide-react`, `tailwindcss`, Babel, TypeScript, `react-icons`, `zustand`, `react-router-dom`, `wouter`, React, Vite e PostCSS. Alguns pacotes removidos do `client/package.json` ainda aparecem como grandes conjuntos `D` dentro de `node_modules`, o que é compatível com uma instalação de dependências após alteração do manifesto.

## Gerados rastreados fora de node_modules

Foram encontrados quatro caminhos gerados/derivados rastreados:

```text
client/tsconfig.node.tsbuildinfo
client/tsconfig.tsbuildinfo
client/vite.config.d.ts
client/vite.config.js
```

Os dois `.tsbuildinfo` e `client/vite.config.js` estão modificados. `client/vite.config.d.ts` está rastreado, mas não aparece alterado no status.

Não foram encontrados `dist`, `build` ou `coverage` rastreados fora de `node_modules`. Dentro de `client/node_modules`, milhares de arquivos de distribuição das próprias dependências são naturalmente rastreados porque o diretório inteiro entrou no histórico.

## Outros arquivos ignoráveis já rastreados

`git ls-files -ci --exclude-standard` encontrou 7.635 arquivos rastreados que hoje correspondem às regras de ignore:

- 7.620 em `client/node_modules`;
- 6 arquivos sob `.local/state/replit/agent/`;
- 2 `.tsbuildinfo`;
- `client/vite.config.js` e `client/vite.config.d.ts`;
- `client/.env` e `server/.env`;
- `client/.env.example`, `server/.env.example` e `server/.env.test.example`.

Arquivos já rastreados continuam aparecendo no Git mesmo quando passam a ser ignorados. `.gitignore` não os remove do índice.

# Situação do .gitignore

Existe somente o `.gitignore` da raiz:

```text
.gitignore
```

Não existem `client/.gitignore` nem `server/.gitignore` no worktree atual.

O arquivo raiz contém regras para:

- `node_modules`, `client/node_modules` e `server/node_modules`;
- `.env` e `.env.*`, com exceção explícita apenas para `.env.evolution.example`;
- `dist`, `build`, `coverage`, `.next`, `client/.vite`;
- `*.tsbuildinfo`, `vite.config.js` e `vite.config.d.ts`;
- logs, arquivos de sistema/editor, `.local`, `.replit` e `integrations/`.

O `.gitignore` está rastreado e não está modificado. Sua última alteração registrada foi no commit `d33a5c3` (`docs: disponibiliza exemplo de ambiente Evolution`).

## Avaliação

As regras cobrem as principais dependências e saídas de build atuais. O problema não é ausência da regra para `node_modules`; é que `client/node_modules` já foi adicionado ao índice em algum momento anterior.

Há dois pontos que exigem revisão futura:

1. `.env.*` também ignora os arquivos `client/.env.example`, `server/.env.example` e `server/.env.test.example`. Eles continuam disponíveis apenas por já estarem rastreados. Se forem exemplos que devem continuar versionados, precisam de exceções explícitas.
2. `client/.env` e `server/.env` estão rastreados e modificados. O conteúdo não foi reproduzido nesta auditoria. Eles podem conter dados sensíveis e devem ser tratados com cautela antes de qualquer stage ou publicação.

# Alterações que parecem ser código-fonte real

Fora de testes, dependências, ambientes e gerados, a captura encontrou 27 caminhos rastreados de código-fonte: 23 modificados e 4 ausentes. Além deles, há 14 novos arquivos de código não rastreados.

## Frontend rastreado modificado

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

## Backend rastreado modificado

```text
server/src/routes/agendamentos.ts
server/src/routes/auth.ts
server/src/routes/servicos.ts
server/src/services/horarios.service.ts
server/src/services/notificacao.service.ts
server/src/services/regras-agendamento.service.ts
```

## Código de produção rastreado ausente no worktree

```text
client/src/pages/agendar/AgendarPage.tsx
client/src/pages/painel/funcionarios/funcionarios.types.ts
client/src/pages/painel/funcionarios/funcionarios.utils.ts
server/src/services/agenda-lock.service.ts
```

Esses quatro caminhos possuem substitutos aparentes entre os não rastreados:

```text
AgendarPage.tsx              → PaginaAgendamento.tsx + useAgendamentoPublico.ts
funcionarios.types.ts        → tiposFuncionarios.ts
funcionarios.utils.ts        → utilitariosFuncionarios.ts
agenda-lock.service.ts       → bloqueio-agenda.service.ts
```

O primeiro par não é uma simples renomeação: a página foi reduzida e parte da lógica parece ter sido extraída para hook. Os demais também precisam ser revisados como conjuntos antigo/novo. Não registrar apenas as exclusões nem apenas os arquivos novos.

# Alterações que parecem pertencer à refatoração anterior

Os seguintes agrupamentos parecem formar trabalho funcional/estrutural anterior ainda não consolidado. “Parecem” é deliberado: somente o autor pode confirmar a intenção.

## Divisão do agendamento público

- ausência de `client/src/pages/agendar/AgendarPage.tsx`;
- novos `PaginaAgendamento.tsx` e `useAgendamentoPublico.ts`;
- ajuste de `client/src/App.tsx`;
- mudanças em autenticação/API relacionadas ao retorno e cadastro incompleto.

## Extração de lógica das páginas

Novos hooks:

- `useAgendaAdministrativa.ts`;
- `useAgendamentoAdministrativo.ts`;
- `useRegrasNegocio.ts`;
- `useAgendamentosCliente.ts`;
- `useMinhaConta.ts`;
- `useSpeechSynthesis.ts`.

Eles aparecem junto de reduções ou mudanças nas páginas/componentes consumidores.

## Divisão do backend de agendamentos

- ausência de `agenda-lock.service.ts`;
- novo `bloqueio-agenda.service.ts`;
- novos `criacao-agendamento.service.ts`, `manutencao-agendamento.service.ts` e `mensagem-notificacao.service.ts`;
- mudanças em `routes/agendamentos.ts`, `horarios.service.ts`, `notificacao.service.ts` e `regras-agendamento.service.ts`.

## Padronização de nomes de funcionários

- ausência de `funcionarios.types.ts` e `funcionarios.utils.ts`;
- novos `tiposFuncionarios.ts` e `utilitariosFuncionarios.ts`.

## Remoção ou desativação da infraestrutura de testes

- 46 arquivos de teste/configuração estão ausentes;
- scripts de teste foram removidos dos três `package.json`;
- dependências como Vitest, Testing Library e Supertest foram retiradas dos manifestos;
- lockfiles foram amplamente alterados;
- `docker-compose.test.yml` está ausente.

Esse conjunto é coerente entre si, mas representa perda ampla de cobertura e infraestrutura. Não deve ser aceito nem revertido automaticamente; precisa de decisão explícita do autor.

# Alterações que parecem ser artefatos

## Artefatos claros

- 477 alterações em `client/node_modules`;
- `client/tsconfig.node.tsbuildinfo`;
- `client/tsconfig.tsbuildinfo`;
- `client/vite.config.js`, aparentemente emitido a partir do TypeScript;
- metadados de `client/node_modules/.vite`.

## Arquivos gerados, mas semanticamente importantes

- `client/package-lock.json`;
- `server/package-lock.json`;
- `package-lock.json` não rastreado.

Lockfiles não devem ser classificados como descartáveis sem decidir quais mudanças de dependências são intencionais.

## Arquivos locais/sensíveis, não simples artefatos

- `client/.env`;
- `server/.env`.

Eles estão rastreados e modificados. Não devem ser incluídos automaticamente em commit, exibidos ou apagados. É necessário comparar somente nomes de variáveis, guardar valores com segurança e avaliar eventual rotação de segredos.

# Riscos para a próxima refatoração

1. Um `git add .` incluiria código real, exclusões de testes, ambientes, dependências rastreadas e todos os documentos não rastreados.
2. Um build ou `npm install` pode ampliar ainda mais as mudanças de `node_modules`, lockfiles, `.vite` e `.tsbuildinfo`.
3. Os pares antigo/novo podem ser perdidos se arquivos não rastreados não forem preservados junto das exclusões correspondentes.
4. As 46 exclusões de teste removem a rede de segurança necessária para a refatoração MVC.
5. `client/.env` e `server/.env` podem conter segredos em caminhos rastreados.
6. O volume de `node_modules` esconde alterações reais durante revisão.
7. Os dez documentos novos são isolados por arquivo, mas uma adição ampla da pasta também incluiria nove documentos anteriores.
8. `git diff` sozinho não mostra os 35/36 arquivos não rastreados; uma revisão baseada apenas nele seria incompleta.
9. Não há como afirmar quais mudanças são descartáveis sem confirmação do autor e validação funcional.

# Estratégia segura recomendada

Esta é uma recomendação para execução posterior, com revisão humana. Nenhum passo foi executado nesta auditoria.

## 1. Congelar o estado

- não executar instalação, build ou formatter antes de preservar o estado;
- fazer cópia externa do diretório ou backup equivalente;
- exportar separadamente o diff dos rastreados e uma lista dos não rastreados;
- proteger os valores de `.env` fora do Git.

## 2. Trabalhar em branch de segurança

Criar uma branch dedicada apontando para o HEAD atual e manter todas as decisões de baseline nela. A criação da branch, sozinha, não preserva arquivos não commitados; ela deve ser combinada com backup e commits revisados.

Nome sugerido:

```text
baseline/estado-atual-2026-09-23
```

## 3. Revisar o trabalho real por conjuntos

Revisar nesta ordem:

1. pares antigo/novo de agendamento, lock e utilitários;
2. demais source files e novos hooks/services;
3. exclusões de testes, scripts e dependências de teste;
4. manifestos e lockfiles;
5. documentação;
6. ambientes e arquivos gerados;
7. `node_modules` rastreado.

Não usar stage amplo. Adicionar listas explícitas de caminhos para cada conjunto aprovado.

## 4. Preservar o código válido antes da higiene do índice

Depois da revisão e validação, registrar o trabalho de código/documentação em commits de checkpoint escolhidos pelo usuário. Não iniciar a refatoração MVC enquanto arquivos importantes permanecerem apenas não rastreados.

## 5. Fazer a higiene do Git em mudança separada

Somente após backup, revisão e autorização específica:

- deixar de rastrear `client/node_modules` mantendo-o ignorado;
- deixar de rastrear `.tsbuildinfo`, `vite.config.js`/`.d.ts` gerados e `.local`;
- avaliar deixar de rastrear `.env` reais, preservando exemplos seguros;
- corrigir exceções de `.env.example` no `.gitignore`;
- reinstalar dependências a partir dos manifestos/lockfiles aprovados;
- validar o projeto.

Essa higiene deve ser um commit próprio, sem refatoração funcional. O mecanismo normal para retirar arquivos já ignorados apenas do índice envolve `git rm --cached`, mas ele **não deve ser executado sem aprovação e sem backup**.

## 6. Só então iniciar o MVC

Iniciar o domínio-piloto apenas quando:

- `git status` estiver compreendido e previsível;
- source files importantes estiverem preservados;
- a decisão sobre os testes estiver registrada;
- dependências puderem ser reproduzidas sem ruído rastreado;
- existir baseline de build/teste ou smoke test.

# Arquivos que NÃO devem ser descartados

Até revisão explícita, não descartar:

- todos os 14 arquivos de código não rastreados listados neste documento;
- os quatro pares antigo/novo de página, lock e utilitários;
- os 46 arquivos de teste/configuração ausentes, pois a remoção pode ou não ser intencional;
- mudanças nos 23 arquivos de produção modificados;
- `client/package.json`, `server/package.json`, `package.json` e seus lockfiles;
- os 20 documentos de `docs/refatoracao/` após a criação deste baseline;
- `artigo/roteiro-orientacao-tcc.md`;
- `docs/05-regras-de-negocio.md` e `docs/SYSTEM_SPECIFICATION.md` modificados;
- `client/.env` e `server/.env` até que seus valores estejam preservados com segurança;
- schema e migrations, que não aparecem alterados e servem de referência do estado atual.

O conteúdo de `client/node_modules` parece artefato reproduzível, mas nem ele deve ser removido do índice nesta etapa, porque a operação produziria uma mudança massiva e precisa ser isolada/autorizada.

# Próximo passo recomendado

O próximo passo exato é **não iniciar ainda a refatoração MVC**. Primeiro:

1. criar um backup externo verificável do worktree;
2. criar a branch de baseline;
3. revisar com o autor os quatro agrupamentos aparentes de refatoração anterior;
4. decidir explicitamente se a remoção dos testes/dependências de teste é válida;
5. preservar código e documentação aprovados em commits manuais e separados;
6. executar uma mudança exclusiva de higiene do índice para `node_modules`, gerados e `.env`;
7. reinstalar dependências e estabelecer build/teste/smoke test limpos;
8. somente depois iniciar o módulo-piloto de serviços.

Até essa sequência ser concluída, qualquer refatoração adicional aumentaria a dificuldade de atribuir mudanças e de recuperar o estado atual.
