# Limpeza controlada do Git

## Objetivo

Retirar do índice Git dependências instaladas, artefatos gerados, metadados locais e arquivos de ambiente reais, preservando integralmente os arquivos físicos e as alterações funcionais existentes no worktree.

A limpeza foi executada em 23 de setembro de 2026 na branch `baseline/estado-atual-2026-09-23`, sem `reset`, `clean`, descarte de arquivos, alteração de código de produção ou merge em `main`.

## Dependências e artefatos que deixaram de ser rastreados

O commit abaixo removeu os caminhos somente do índice:

```text
77625af885eea72785d7a282a480d4614911d112
chore: remover dependencias e artefatos gerados do git
```

Itens abrangidos:

- 7.620 caminhos em `client/node_modules/`;
- seis arquivos em `.local/state/replit/agent/`;
- `client/tsconfig.node.tsbuildinfo`;
- `client/tsconfig.tsbuildinfo`;
- `client/vite.config.js`;
- `client/vite.config.d.ts`.

`client/vite.config.js` e `client/vite.config.d.ts` foram confirmados como emissões derivadas de `client/vite.config.ts`. O script de build usa `tsc -b`, enquanto os scripts Vite apontam explicitamente para `vite.config.ts`.

Após o commit, todos esses grupos possuem zero caminhos rastreados. As regras correspondentes já existiam no `.gitignore`.

## Arquivos de ambiente

O commit abaixo retirou os ambientes reais do índice:

```text
805718fa57a41ef810fe1a974a2cd4d5131833bf
chore: remover arquivos de ambiente do versionamento
```

Arquivos retirados do versionamento:

```text
client/.env
server/.env
```

Os dois arquivos continuam fisicamente no computador e são ignorados pelo Git. Nenhum valor foi exibido durante a auditoria.

O `.gitignore` foi ajustado para manter versionáveis os nomes reais de exemplo encontrados:

```text
client/.env.example
server/.env.example
server/.env.test.example
.env.evolution.example
```

As regras relevantes ficaram conceitualmente assim:

```text
.env
.env.*
!.env.example
!.env.*.example
```

## Presença no histórico

Verificação realizada apenas pelo histórico de nomes, sem leitura ou impressão dos valores:

```text
client/.env já existia no histórico: SIM
server/.env já existia no histórico: SIM
```

Remover esses arquivos do índice atual não remove seus valores de commits anteriores. Credenciais reais devem ser revisadas e, quando aplicável, rotacionadas. O histórico não foi reescrito nesta etapa.

## Arquivos preservados localmente

Após os dois commits e as validações, continuavam presentes:

```text
client/node_modules/
.local/
client/tsconfig.node.tsbuildinfo
client/tsconfig.tsbuildinfo
client/vite.config.js
client/vite.config.d.ts
client/.env
server/.env
```

Nenhum deles foi apagado da máquina.

## Validações backend

Comando:

```text
npm --prefix server test
```

Resultado:

```text
Test Files  5 passed (5)
Tests      33 passed (33)
```

Comando:

```text
npm --prefix server run build
```

Resultado: aprovado. O script executou `tsc --noEmit` e não encontrou erros.

## Validações frontend

Typecheck sem emissão:

```text
node ./node_modules/typescript/bin/tsc --project tsconfig.json --noEmit --incremental false
```

Resultado: aprovado.

Lint sem cache:

```text
npm --prefix client run lint -- --no-cache
```

Resultado: aprovado.

Bundle:

- executado diretamente pelo Vite com `--config vite.config.ts`;
- saída direcionada a um diretório temporário em `/tmp`;
- 1.619 módulos transformados;
- build aprovado;
- nenhum artefato de build foi escrito no repositório.

Foram emitidos somente avisos sobre dados desatualizados de Browserslist e `baseline-browser-mapping`. Nenhuma dependência foi atualizada nesta etapa.

## Estado do índice após a limpeza

```text
client/node_modules rastreado: 0
alterações visíveis em client/node_modules: 0
.local rastreado: 0
*.tsbuildinfo rastreado: 0
client/vite.config.js e client/vite.config.d.ts rastreados: 0
client/.env e server/.env rastreados: 0
```

Antes da criação deste relatório, o worktree restante continha:

```text
73 caminhos rastreados alterados
25 caminhos não rastreados
98 entradas no total
```

Essas entradas são alterações históricas e funcionais preservadas para revisão posterior. Nenhuma delas foi incluída nos commits de limpeza.

## Próximo passo

Enviar os commits desta etapa para `origin/baseline/estado-atual-2026-09-23` e, depois, revisar as alterações funcionais restantes por domínio. A próxima ação de desenvolvimento recomendada é ampliar a baseline de testes para profissionais/disponibilidade antes de iniciar a refatoração MVC.
