# Resultado da recuperação de testes

## Objetivo

Recuperar a primeira baseline automatizada do backend antes de qualquer refatoração MVC, limitada a cinco arquivos de teste previamente selecionados, uma configuração mínima do Vitest e três dependências de desenvolvimento.

Execução realizada em 23 de setembro de 2026 na branch:

```text
baseline/estado-atual-2026-09-23
```

HEAD durante toda a etapa:

```text
a14b7a1dda7505da9ef50e2d58e21eedbeb23423
```

Nenhum commit ou push foi realizado.

## Testes recuperados

Os cinco arquivos foram recuperados diretamente do `HEAD`:

```text
server/src/services/horarios.service.test.ts
server/src/routes/servicos.test.ts
server/src/middlewares/auth.test.ts
server/src/routes/auth.test.ts
server/src/routes/usuarios.test.ts
```

Após a recuperação, o SHA-256 de cada arquivo ficou idêntico ao conteúdo correspondente em `HEAD`. Portanto, nenhum dos cinco testes precisou ser reescrito ou enfraquecido.

## Infraestrutura recuperada

Foi criado somente:

```text
server/vitest.config.ts
```

Configuração mínima:

- ambiente Node;
- descoberta limitada a `src/**/*.test.ts`;
- sem setup global;
- sem coverage;
- sem configuração de integração;
- sem banco PostgreSQL de testes.

Nenhum helper, fixture, arquivo `.env.test`, configuração de integração ou Docker Compose foi necessário. Os cinco testes são autossuficientes e usam mocks locais.

Foi adicionado ao `server/package.json` somente o script:

```json
"test": "vitest run --config vitest.config.ts"
```

## Dependências adicionadas

Instalação executada somente em `server/`:

```text
npm install --save-dev 'vitest@^4.1.10' 'supertest@^7.2.2' '@types/supertest@^7.2.1'
```

Versões resolvidas e registradas:

```text
vitest             ^4.1.11
supertest          ^7.3.0
@types/supertest   ^7.2.1
```

Arquivos atualizados naturalmente pelo npm:

```text
server/package.json
server/package-lock.json
```

A instalação adicionou 66 pacotes ao `server/node_modules` local e auditou 376 pacotes. O npm informou seis vulnerabilidades no conjunto instalado — uma moderada e cinco altas. Nenhum `npm audit fix` foi executado, pois isso poderia alterar dependências fora do escopo controlado.

## Adaptações realizadas

### Testes

Nenhuma adaptação foi necessária. Os cinco arquivos atuais são byte a byte idênticos ao `HEAD`.

#### `server/src/services/horarios.service.test.ts`

ANTES:
usava exports como `isValidBlock` do service no `HEAD`.

AGORA:
o teste continua usando os mesmos nomes. O código atual preserva aliases compatíveis enquanto usa nomes internos em português.

MOTIVO:
como o contrato exportado foi preservado, não houve razão para alterar o teste.

#### `server/src/routes/servicos.test.ts`

ANTES:
testava listagem ativa, criação, edição parcial e desativação lógica.

AGORA:
os mesmos quatro contratos continuam presentes. Os dados válidos do teste também atendem às validações mais estritas atuais.

MOTIVO:
nenhuma mudança estrutural impediu o teste de exercitar o comportamento original.

#### `server/src/middlewares/auth.test.ts`

ANTES:
criava uma aplicação Express local e validava JWT e autorização administrativa.

AGORA:
o middleware e seus exports mantêm o mesmo contrato.

MOTIVO:
nenhuma adaptação foi necessária.

#### `server/src/routes/auth.test.ts`

ANTES:
mockava `usuarioService`, bcrypt e Google e exercitava os endpoints públicos.

AGORA:
a rota possui funções internas extraídas, mas os endpoints, chamadas de serviço e respostas cobertos permanecem equivalentes.

MOTIVO:
a reorganização interna não exigiu alteração do teste de contrato HTTP.

#### `server/src/routes/usuarios.test.ts`

ANTES:
mockava `usuarioService` e exercitava perfil, telefone, autorização, criação, senha e exclusão lógica.

AGORA:
os mesmos contratos continuam presentes.

MOTIVO:
nenhuma adaptação foi necessária.

### Infraestrutura

O `server/vitest.config.ts` anterior do `HEAD` continha configuração de coverage V8. A versão recuperada nesta etapa foi deliberadamente reduzida porque `@vitest/coverage-v8` não está entre as dependências autorizadas e coverage não é necessário para executar esta primeira baseline. Isso altera somente infraestrutura de teste, não expectativas nem comportamento de produção.

## Resultado individual dos testes

Execução na ordem solicitada:

| Ordem | Arquivo | Casos | Aprovados | Falhas | Adaptação após execução |
|---:|---|---:|---:|---:|---|
| 1 | `src/services/horarios.service.test.ts` | 7 | 7 | 0 | Nenhuma |
| 2 | `src/routes/servicos.test.ts` | 4 | 4 | 0 | Nenhuma |
| 3 | `src/middlewares/auth.test.ts` | 5 | 5 | 0 | Nenhuma |
| 4 | `src/routes/auth.test.ts` | 9 | 9 | 0 | Nenhuma |
| 5 | `src/routes/usuarios.test.ts` | 8 | 8 | 0 | Nenhuma |

Todos os processos finalizaram com exit code 0.

## Resultado da suíte

Comando:

```text
cd server
npm test
```

Resultado:

```text
Test Files  5 passed (5)
Tests      33 passed (33)
Falhas      0
```

O conjunto levou aproximadamente 288 ms segundo o Vitest.

## Typecheck

Comando:

```text
cd server
npm run build
```

Esse script executa:

```text
tsc --noEmit
```

Resultado: aprovado, exit code 0, sem erros TypeScript e sem emissão de arquivos.

Não há lint próprio do backend configurado; nenhuma infraestrutura de lint foi criada.

## Falhas ou divergências encontradas

Não foi encontrada divergência comportamental nos cinco domínios cobertos. Nenhum teste falhou e nenhum código de produção precisou ser alterado.

Limitações conhecidas:

- a baseline usa mocks e não acessa PostgreSQL;
- não cobre concorrência nem advisory lock real;
- não cobre criação/manutenção de agendamentos extraídas recentemente;
- não decide a semântica de antecedência mínima versus aviso;
- não cobre notificações, Evolution ou scheduler;
- não recupera coverage;
- o relatório do npm indica seis vulnerabilidades que necessitam análise separada, sem correção automática.

## Comportamentos protegidos pela baseline

### Horários e disponibilidade

- arredondamento em blocos de 30 minutos;
- validação de blocos;
- jornada consecutiva;
- conflito total e parcial;
- exclusão de intervalos ocupados;
- remarcação ignorando o próprio agendamento;
- escolha do primeiro profissional disponível;
- blocos configurados apenas para profissionais ativos.

### Serviços

- listagem pública somente de serviços ativos;
- criação administrativa;
- edição parcial;
- desativação lógica sem exclusão física.

### Autenticação e autorização

- rejeição de ausência/token inválido;
- acesso autenticado;
- bloqueio de cliente em rota administrativa;
- acesso de administrador;
- login local inválido e válido;
- conta inativa;
- cadastro local e e-mail duplicado;
- criação, vínculo e reativação via Google com serviço externo mockado.

### Usuários

- consulta do próprio perfil;
- validação e normalização de telefone;
- proteção da listagem administrativa;
- criação administrativa de cliente sem e-mail;
- rejeição de senha fraca;
- desativação lógica;
- confirmação explícita para excluir a própria conta.

## Arquivos alterados nesta etapa

Arquivos recuperados do `HEAD`, sem diferença final de conteúdo contra o commit:

```text
server/src/services/horarios.service.test.ts
server/src/routes/servicos.test.ts
server/src/middlewares/auth.test.ts
server/src/routes/auth.test.ts
server/src/routes/usuarios.test.ts
```

Infraestrutura/dependências:

```text
server/vitest.config.ts
server/package.json
server/package-lock.json
```

Documentação:

```text
docs/refatoracao/10-STATUS-DO-PROJETO.md
docs/refatoracao/14-RESULTADO-RECUPERACAO-TESTES.md
```

`server/node_modules` também foi atualizado localmente pela instalação, mas permanece ignorado e não está rastreado.

Não foram alterados:

```text
client/
client/node_modules/
client/.env
server/.env
qualquer arquivo de produção
qualquer migration ou schema Prisma
```

As assinaturas de status de `client/`, `client/.env` e `server/.env` foram comparadas antes e depois da instalação/testes e permaneceram iguais.

## Próximo passo recomendado

Manter a refatoração MVC pausada. O próximo passo seguro é revisar esta baseline e decidir se ela será registrada como checkpoint. Depois, ampliar a cobertura backend de forma incremental para:

1. teste unitário direto de `senha.service.ts`;
2. rotas de profissionais/disponibilidade;
3. novos services de criação e manutenção de agendamentos;
4. rota de agendamentos adaptada às extrações atuais;
5. integração PostgreSQL reduzida para conflito e advisory lock.

A regra de antecedência deve ser decidida antes da recuperação dos testes de agendamento que possuem expectativas conflitantes.
