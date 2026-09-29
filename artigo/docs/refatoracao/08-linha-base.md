# Linha de base

## Comandos do projeto

### Instalação

```bash
npm install
npm --prefix client install
npm --prefix server install
```

### Execução

```bash
npm run dev:client
npm run dev:server
```

Equivalentes diretos:

```bash
npm --prefix client run dev
npm --prefix server run dev
```

### Build, typecheck e lint

```bash
npm run build
npm --prefix client run build
npm --prefix server run build
npm --prefix client run lint
```

O build do cliente executa `tsc -b` antes do Vite. O build do servidor executa `tsc --noEmit`; não há script separado chamado `typecheck`.

### Banco e Prisma

```bash
npm --prefix server run prisma:generate
npm --prefix server run prisma:deploy
```

## Resultado das validações

| Validação | Resultado | Observação |
| --- | --- | --- |
| Build/typecheck do frontend | OK | TypeScript e Vite concluíram; houve apenas avisos de dados de browsers desatualizados. |
| Build/typecheck do backend | OK | `tsc --noEmit` concluiu. |
| Build da raiz | OK | Cliente e servidor concluíram. |
| Lint do frontend | OK | ESLint concluiu sem erros. |
| Testes unitários/HTTP atuais | OK | 25 arquivos/69 testes no cliente e 12 arquivos/88 testes no servidor. Os testes não fazem parte do resultado final planejado. |
| Testes de integração | FALHOU | 2 de 31 testes falharam em `server/tests/integration/agendamentos.test.ts`. |
| Inicialização do backend | OK | Servidor iniciou na porta 3002; o comando foi encerrado pelo timeout de verificação. |
| Inicialização do frontend | OK | Vite ficou disponível na porta 5000; o comando foi encerrado pelo timeout de verificação. |
| Verificação de imports | OK | Build e lint não apontaram imports quebrados. |
| Verificação de rotas e endpoints | OK | Rotas confirmadas estaticamente nos arquivos de aplicação. |
| Comunicação frontend/backend | OK | Cliente usa `/api` por padrão e o Vite encaminha `/api` para `http://localhost:3002`. |

Falhas de integração observadas antes da refatoração:

- o teste esperava apenas `{ horarios }`, mas a API também retorna `horariosComAvisoAntecedencia`;
- um cenário esperava HTTP 409 para conflito, mas recebeu HTTP 201.

Os avisos do build mencionam `baseline-browser-mapping` e `caniuse-lite` desatualizados. Não foram atualizadas dependências.

## Estrutura de execução

O frontend React/Vite roda na porta 5000. O cliente HTTP em `client/src/lib/api.ts` usa `VITE_API_URL` quando definida; caso contrário, usa `/api`. Em desenvolvimento, `client/vite.config.ts` encaminha `/api` para o backend em `http://localhost:3002`.

O backend Express sobe por `server/src/index.ts`, monta as rotas em `server/src/app.ts` e usa Prisma em `server/src/lib/prisma.ts`. O Prisma conecta ao PostgreSQL por `DATABASE_URL`; as migrations ficam em `server/prisma/migrations`.

## Rotas principais

### Frontend

- `/` — página inicial;
- `/login` — autenticação;
- `/agendamento` — fluxo público de agendamento;
- `/painel` e `/painel/:rest*` — painel protegido de administração;
- `/minha-conta` — conta protegida do cliente;
- `/minha-conta/agendamentos` — agendamentos do cliente;
- `/concluir-cadastro` — conclusão de cadastro;
- `/privacidade`, `/termos` e `/cookies` — páginas legais.

### Backend

- `/api/health` e `/api/configuracoes-publicas`;
- `/api/auth` — login local, cadastro e Google;
- `/api/usuarios` — perfil e usuários;
- `/api/servicos` — serviços públicos e administração;
- `/api/profissionais` — profissionais e disponibilidade;
- `/api/agendamentos` — criação, disponibilidade, alteração, cancelamento, histórico e status;
- `/api/configuracoes` — configuração e regras de agendamento;
- `/api/integracoes/evolution` — status, conexão e mensagens da Evolution/WhatsApp.

## Variáveis de ambiente

### Cliente

- `VITE_API_URL`
- `VITE_GOOGLE_CLIENT_ID`

### Servidor

- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`
- `EVOLUTION_API_URL`
- `EVOLUTION_API_KEY`
- `EVOLUTION_INSTANCE_NAME`

### Integração

- `DATABASE_URL_TEST` — usada somente nos testes de integração.

Os arquivos de ambiente também possuem variáveis legadas ou específicas locais; os valores não foram registrados.

## Problemas já existentes

- dois testes de integração de agendamento falham conforme descrito nos resultados;
- avisos de dados de browsers desatualizados aparecem no build;
- a execução de testes produz avisos de opções esbuild depreciadas no plugin React;
- há concentração de responsabilidades nas rotas e páginas já registrada no plano;
- o working tree já possuía alterações em arquivos da aplicação, ambientes e dependências antes desta etapa; elas não foram alteradas nesta execução e não devem ser atribuídas à linha de base;
- o servidor expõe `DOM_API_TOKEN` e `DOM_API_URL` no ambiente local, mas não foram encontrados usos no código de produção analisado; devem ser investigados antes de qualquer limpeza;
- os testes de integração dependem de PostgreSQL disponível na porta configurada e executaram contra o banco de teste existente.

## Dependências para revisar posteriormente

As seguintes dependências aparecem declaradas, mas não tiveram import encontrado no código de produção analisado:

- `react-router-dom`;
- `zustand`;
- `react-icons`.

Essa é apenas uma lista de revisão. Nenhuma dependência foi removida.
