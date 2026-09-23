# Arquitetura atual

## Objetivo deste documento

Este documento registra o estado observado no repositório em 23 de setembro de 2026. Ele descreve o código existente; não representa ainda a arquitetura-alvo. Quando uma conclusão depende de execução manual, banco preenchido ou serviço externo, ela está marcada como **necessita validação**.

## Visão geral

O projeto é um monorepositório simples com dois pacotes:

```text
sistema-barbearia/
├── client/                  React 18 + Vite + TypeScript
├── server/                  Express 5 + TypeScript + Prisma 7
├── docs/
├── artigo/
├── package.json             scripts que delegam para client e server
└── docker-compose.evolution.yml
```

Fluxo técnico predominante hoje:

```text
Página ou hook React
↓
client/src/lib/api.ts
↓ HTTP /api
rota Express em server/src/routes
↓
service, quando existe, e/ou Prisma diretamente
↓
PostgreSQL
```

O backend ainda não possui as pastas `controllers/`, `repositories/` ou `models/`. Os callbacks das rotas cumprem a função de controller, e tanto rotas quanto services acessam o Prisma.

## Entradas da aplicação

### Frontend

- `client/index.html`: documento servido pelo Vite.
- `client/src/main.tsx`: monta `App` em `#root`, ativa `React.StrictMode` e importa `client/src/styles/index.css`.
- `client/src/App.tsx`: instala `ErrorBoundary`, `AuthProvider`, notificações, recursos globais de acessibilidade e o roteamento com Wouter.
- `client/vite.config.ts`: executa o desenvolvimento na porta 5000 e encaminha `/api` para `http://localhost:3002`.

Observação: `server/src/index.ts` usa `PORT` ou 3001 como padrão, enquanto o proxy do Vite aponta para 3002. O funcionamento local depende de `PORT=3002` no ambiente; **necessita validação** fora da configuração local atual.

### Backend

- `server/src/index.ts`: carrega `.env`, inicia o Express e agenda `notificacaoService.processarLembretes()` a cada 60 segundos.
- `server/src/app.ts`: configura CORS, JSON, health check, rota pública de contatos e monta os routers.
- `server/src/lib/prisma.ts`: cria uma única instância de `PrismaClient` com `PrismaPg` e `DATABASE_URL`.
- `server/prisma/schema.prisma`: define o modelo persistente.

## Estrutura atual do frontend

```text
client/src/
├── components/              componentes globais e de interface
│   ├── layout/Sidebar.tsx
│   └── ui/modal.tsx
├── contexts/AuthContext.tsx
├── hooks/useSpeechSynthesis.ts
├── lib/api.ts               tipos, armazenamento do token e todos os endpoints
├── pages/
│   ├── agendar/
│   ├── painel/
│   └── user/
├── styles/index.css
├── utils/
├── App.tsx
└── main.tsx
```

### Rotas de interface

As rotas são declaradas em `client/src/App.tsx`:

| Caminho | Componente | Proteção |
|---|---|---|
| `/` | `client/src/pages/HomePage.tsx` | pública |
| `/login` | `client/src/pages/LoginPage.tsx` | pública |
| `/agendamento` | `client/src/pages/agendar/PaginaAgendamento.tsx` | página pública; autenticação exigida na confirmação |
| `/privacidade`, `/termos`, `/cookies` | `client/src/pages/LegalPage.tsx` | pública |
| `/painel` e `/painel/:rest*` | `client/src/pages/PainelPage.tsx` | `AdminRoute` |
| `/minha-conta` | `client/src/pages/user/MinhaContaPage.tsx` | `UserRoute` |
| `/minha-conta/agendamentos` | `client/src/pages/user/UserAppointmentsPage.tsx` | `UserRoute` |
| `/concluir-cadastro` | `client/src/pages/user/CompleteRegistrationPage.tsx` | verificação feita dentro do componente |

O fallback atual renderiza apenas `Não encontrado.` em `client/src/App.tsx`. `client/src/pages/NotFoundPage.tsx` existe, mas não está conectado ao roteamento.

### Painel administrativo

`client/src/pages/PainelPage.tsx` contém um segundo `Switch`:

| Caminho | Página |
|---|---|
| `/painel` | `DashboardPage.tsx` |
| `/painel/clientes` | `ClientesPage.tsx` |
| `/painel/servicos` | `ServicosAdminPage.tsx` |
| `/painel/profissionais` | `FuncionariosPage.tsx` |
| `/painel/agendamentos` | `AgendamentosPage.tsx` |
| `/painel/configuracoes` | `WhatsAppConfigPage.tsx` |
| `/painel/regras-negocio` | `RegrasNegocioPage.tsx` |
| `/painel/whatsapp` | `EvolutionPage.tsx` |

### Comunicação HTTP

`client/src/lib/api.ts` concentra:

- tipos de `Usuario`, `Servico`, `Profissional`, `Agendamento`, regras e Evolution;
- `authStorage`, que guarda JWT em `localStorage` sob `barbearia.token`;
- `request`, que envia JSON, acrescenta `Authorization: Bearer` e converte erros para `ApiError`;
- os grupos `auth`, `usuarios`, `servicos`, `profissionais`, `agendamentos`, `configuracoes` e `evolution`.

Não há hoje uma pasta `client/src/services/`; `client/src/lib/api.ts` exerce essa responsabilidade em um arquivo único de 34 linhas muito densas, com linhas extensas.

## Estrutura atual do backend

```text
server/src/
├── app.ts
├── index.ts
├── lib/prisma.ts
├── middlewares/auth.ts
├── routes/
│   ├── agendamentos.ts
│   ├── auth.ts
│   ├── configuracoes.ts
│   ├── evolution.ts
│   ├── profissionais.ts
│   ├── servicos.ts
│   └── usuarios.ts
├── services/
│   ├── bloqueio-agenda.service.ts
│   ├── criacao-agendamento.service.ts
│   ├── evolution.service.ts
│   ├── horarios.service.ts
│   ├── manutencao-agendamento.service.ts
│   ├── mensagem-notificacao.service.ts
│   ├── notificacao.service.ts
│   ├── regras-agendamento.service.ts
│   ├── repeticao-agendamento.service.ts
│   ├── senha.service.ts
│   └── usuario.service.ts
└── types/express.d.ts
```

### Montagem e proteção das rotas

`server/src/app.ts` monta:

| Base | Router | Proteção aplicada na montagem |
|---|---|---|
| `/api/auth` | `routes/auth.ts` | nenhuma |
| `/api/servicos` | `routes/servicos.ts` | leitura pública; mutações protegidas dentro do router |
| `/api/profissionais` | `routes/profissionais.ts` | leitura pública; demais rotas protegidas dentro do router |
| `/api/agendamentos` | `routes/agendamentos.ts` | `authenticate`, exceto `GET /disponibilidade` |
| `/api/configuracoes` | `routes/configuracoes.ts` | `authenticate` + `requireAdmin` |
| `/api/integracoes/evolution` | `routes/evolution.ts` | `authenticate` + `requireAdmin` |
| `/api/usuarios` | `routes/usuarios.ts` | `authenticate`; o router adiciona `requireAdmin` depois das rotas `/me` |

Rotas declaradas diretamente em `server/src/app.ts`:

- `GET /api/health`;
- `GET /api/configuracoes-publicas`, que acessa `prisma.configuracao` diretamente.

### Endpoints reais

#### Autenticação — `server/src/routes/auth.ts`

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/google`

O próprio arquivo contém validação HTTP, comparação de senha, cadastro, integração com Google, emissão de JWT e mapeamento da resposta. Usa `usuarioService`, `validarSenha` e `signToken`.

#### Usuários — `server/src/routes/usuarios.ts`

- `GET /api/usuarios/me`
- `PUT /api/usuarios/me`
- `PUT /api/usuarios/me/concluir-cadastro`
- `DELETE /api/usuarios/me`
- `GET /api/usuarios` — administrador
- `POST /api/usuarios` — administrador
- `PUT /api/usuarios/:id` — administrador
- `DELETE /api/usuarios/:id` — administrador

O router normaliza payload, formata `data_nascimento`, valida perfil e chama `server/src/services/usuario.service.ts`. Exclusões são desativações (`ativo: false`).

#### Serviços — `server/src/routes/servicos.ts`

- `GET /api/servicos` — público, somente ativos
- `POST /api/servicos` — administrador
- `PUT /api/servicos/:id` — administrador
- `DELETE /api/servicos/:id` — administrador; desativa em vez de apagar

Validação, regra de ativo/inativo e Prisma estão todos no arquivo de rota.

#### Profissionais e disponibilidade — `server/src/routes/profissionais.ts`

- `GET /api/profissionais` — público, somente ativos
- `GET /api/profissionais/admin` — administrador, inclui inativos
- `GET /api/profissionais/:id/disponibilidade` — administrador
- `PUT /api/profissionais/:id/disponibilidade` — administrador
- `POST /api/profissionais` — administrador
- `PUT /api/profissionais/:id` — administrador
- `DELETE /api/profissionais/:id` — administrador; desativa

O router valida dados, converte disponibilidade, executa transação de substituição completa dos blocos e acessa Prisma diretamente.

#### Agendamentos — `server/src/routes/agendamentos.ts`

- `GET /api/agendamentos`
- `POST /api/agendamentos`
- `GET /api/agendamentos/disponibilidade` — público
- `PATCH /api/agendamentos/:id/cancelar`
- `GET /api/agendamentos/:id/historico`
- `PATCH /api/agendamentos/:id/remarcar`
- `PATCH /api/agendamentos/:id/status` — administrador
- `POST /api/agendamentos/:id/notificar` — equipe
- `PUT /api/agendamentos/:id` — administrador
- `DELETE /api/agendamentos/:id` — administrador; exclusão física

Esse é o router mais complexo. Ele valida entrada e autorização, traduz erros, acessa Prisma diretamente e orquestra `horarios.service`, `regras-agendamento.service`, `criacao-agendamento.service`, `manutencao-agendamento.service`, `bloqueio-agenda.service` e `notificacao.service`.

Ponto que **necessita validação**: `server/src/app.ts` pula `authenticate` para toda chamada `GET /agendamentos/disponibilidade`. Dentro do router, o parâmetro `ignorarAgendamentoId` exige `req.auth`. Como o middleware foi pulado, até uma requisição com bearer token tende a chegar sem `req.auth`, o que pode impedir a consulta de disponibilidade usada na remarcação em `client/src/pages/user/useAgendamentosCliente.ts`.

#### Configurações — `server/src/routes/configuracoes.ts`

- `GET /api/configuracoes`
- `PUT /api/configuracoes`
- `GET /api/configuracoes/regras`
- `PUT /api/configuracoes/regras`

Todas são protegidas como administrador na montagem. O router valida contatos/regras, cria a configuração quando necessário e acessa Prisma diretamente.

#### Evolution/WhatsApp — `server/src/routes/evolution.ts`

- `GET /api/integracoes/evolution/status`
- `POST /api/integracoes/evolution/instancia`
- `POST /api/integracoes/evolution/conectar`
- `POST /api/integracoes/evolution/reconectar`
- `POST /api/integracoes/evolution/desconectar`
- `DELETE /api/integracoes/evolution/instancia`
- `PUT /api/integracoes/evolution/nome-exibicao`
- `GET/PUT /api/integracoes/evolution/mensagens`
- `GET/PUT /api/integracoes/evolution/envio-automatico`
- `GET/PUT /api/integracoes/evolution/regras-envio-automatico`

O router delega quase tudo a `server/src/services/evolution.service.ts`.

## Persistência e modelos reais

`server/prisma/schema.prisma` define:

- `Usuario`: credenciais local/Google, nível, ativo, dados de perfil e agendamentos;
- `Profissional`: cadastro operacional separado de `Usuario`;
- `Servico`: nome, duração, preço e ativo;
- `Agendamento`: data e hora armazenadas como `String`, status como `String` e relações com usuário, profissional e serviço;
- `DisponibilidadeProfissional`: blocos de 30 minutos por dia da semana;
- `HistoricoAgendamento`: autor, tipo e snapshots JSON;
- `NotificacaoAgendamento`: tentativa, destino, status e erro;
- `Configuracao`: contatos, regras de agenda e parâmetros/modelos do WhatsApp.

Não existem enums Prisma para níveis, status ou tipos de notificação. A validade desses valores é controlada por arrays e tipos TypeScript distribuídos.

As migrations ficam em `server/prisma/migrations/`. A migration `20260802143000_permitir_horario_apos_cancelamento` troca a unicidade original por índice parcial para agendamentos não cancelados. Conflitos de intervalos maiores que o horário inicial são tratados na aplicação por `horarios.service.ts` e pelo advisory lock em `bloqueio-agenda.service.ts`.

## Serviços atuais e responsabilidades

| Arquivo | Responsabilidade atual |
|---|---|
| `services/usuario.service.ts` | regras simples de usuário, hash de senha e Prisma; na prática mistura service e repository |
| `services/senha.service.ts` | política de senha pura |
| `services/horarios.service.ts` | blocos, duração, conflitos, disponibilidade e consultas Prisma |
| `services/bloqueio-agenda.service.ts` | transação e `pg_advisory_xact_lock` por profissional/data |
| `services/criacao-agendamento.service.ts` | escolha de profissional, validação de recursos/cadastro, repetição, disponibilidade e criação |
| `services/manutencao-agendamento.service.ts` | cancelamento, remarcação, status e histórico |
| `services/regras-agendamento.service.ts` | leitura das regras, cálculos de antecedência e atualização de atrasados |
| `services/repeticao-agendamento.service.ts` | detecção e token JWT de confirmação de repetição por 60 segundos |
| `services/notificacao.service.ts` | lembretes, decisão de envio, envio e registro de resultado |
| `services/mensagem-notificacao.service.ts` | substituição de placeholders nos modelos |
| `services/evolution.service.ts` | cliente HTTP Evolution e persistência das configurações de WhatsApp |

## Autenticação e autorização atuais

Fluxo local:

```text
LoginPage.tsx
→ AuthContext.tsx
→ api.ts: api.auth.login
→ POST /api/auth/login
→ routes/auth.ts
→ usuario.service.ts
→ Prisma/Usuario
→ bcrypt.compare
→ signToken em middlewares/auth.ts
```

O JWT contém `sub` e `nivel`, expira em oito horas e é lido pelo middleware `authenticate`. `requireAdmin` aceita apenas `Administrador`; `requireStaff` aceita `Administrador`, `Funcionario` e `Funcionário`.

Há uma divergência de tipagem: `server/src/types/express.d.ts` declara somente `Administrador | Cliente`, enquanto `requireStaff` prevê níveis de funcionário e o banco armazena `nivel` como texto. **Necessita validação** qual modelo de papéis será mantido.

No frontend, `client/src/contexts/AuthContext.tsx` restaura a sessão consultando `/usuarios/me`. `client/src/components/ProtectedRoute.tsx` faz proteção de navegação, mas a segurança efetiva permanece no backend.

## Fluxos reais representativos

### Agendamento público

```text
client/src/pages/agendar/PaginaAgendamento.tsx
→ client/src/pages/agendar/useAgendamentoPublico.ts
→ client/src/lib/api.ts
→ GET /api/servicos e GET /api/profissionais
→ GET /api/agendamentos/disponibilidade
→ server/src/routes/agendamentos.ts
→ server/src/services/horarios.service.ts
→ Prisma
→ PostgreSQL
```

Na confirmação:

```text
useAgendamentoPublico.criarAgendamento
→ POST /api/agendamentos
→ routes/agendamentos.ts
→ criacao-agendamento.service.ts
→ repeticao-agendamento.service.ts
→ horarios.service.ts
→ bloqueio-agenda.service.ts
→ Prisma/Agendamento
→ notificacao.service.ts, sem aguardar o resultado
→ evolution.service.ts
```

### Administração de serviços

```text
client/src/pages/painel/ServicosAdminPage.tsx
→ client/src/lib/api.ts
→ server/src/routes/servicos.ts
→ Prisma/Servico diretamente
→ PostgreSQL
```

Não há service nem repository para esse domínio hoje.

### Profissionais e disponibilidade

```text
client/src/pages/painel/FuncionariosPage.tsx
→ api.profissionais.*
→ server/src/routes/profissionais.ts
→ Prisma/Profissional e Prisma/DisponibilidadeProfissional
→ PostgreSQL
```

### Perfil do cliente

```text
client/src/pages/user/MinhaContaPage.tsx
→ client/src/pages/user/useMinhaConta.ts
→ api.usuarios.updateMe
→ server/src/routes/usuarios.ts
→ server/src/services/usuario.service.ts
→ Prisma/Usuario
```

### Notificação automática

```text
server/src/index.ts ou mutação de agendamento
→ server/src/services/notificacao.service.ts
→ server/src/services/mensagem-notificacao.service.ts
→ server/src/services/evolution.service.ts
→ Evolution API
→ Prisma/NotificacaoAgendamento
```

## Configurações reais

Variáveis referenciadas pelo código:

- frontend: `VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID`;
- backend: `PORT`, `DATABASE_URL`, `NODE_ENV`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `EVOLUTION_API_URL`, `EVOLUTION_API_KEY`, `EVOLUTION_INSTANCE_NAME`.

Arquivos relacionados:

- `client/vite.config.ts`;
- `client/tailwind.config.js`;
- `client/postcss.config.js`;
- `server/prisma.config.ts`;
- `.env.evolution.example`;
- `docker-compose.evolution.yml`.

Arquivos `.env` existentes não foram usados como fonte documental para evitar registrar segredos.

## Pontos estruturais encontrados

### Arquivos grandes ou densos

| Arquivo | Linhas observadas | Sinal principal |
|---|---:|---|
| `client/src/pages/painel/AgendamentosPage.tsx` | 746 | página, filtros, múltiplas visões, formulários, modais e ações HTTP |
| `server/src/routes/agendamentos.ts` | 335 | HTTP, autorização, validação, Prisma e orquestração |
| `client/src/pages/agendar/PaginaAgendamento.tsx` | 315 | wizard e grande volume de marcação/estilos |
| `client/src/pages/painel/ClientesPage.tsx` | 276 | tabela, busca, formulário, senha e modais |
| `client/src/pages/HomePage.tsx` | 199 | header, seções e footer locais |
| `client/src/pages/painel/FuncionariosPage.tsx` | 183 | cadastro e editor completo de disponibilidade |
| `client/src/pages/painel/funcionarios/HorariosModal.tsx` | 178 | candidato antigo sem importador conhecido |
| `server/src/services/evolution.service.ts` | 156 | HTTP externo, validação e persistência |
| `server/src/routes/auth.ts` | 149 | controller e regras de autenticação juntas |

Quantidade de linhas não é defeito isolado; os casos acima também concentram responsabilidades ou possuem JSX em linhas muito extensas.

### Responsabilidades misturadas

- `server/src/routes/servicos.ts`, `profissionais.ts` e `configuracoes.ts` funcionam simultaneamente como route, controller, service e repository.
- `server/src/routes/agendamentos.ts` mantém validações, autorização por recurso, mapeamento de erros e consultas Prisma além de chamar services.
- `server/src/routes/auth.ts` contém fluxo local, cadastro e regra completa do Google.
- `server/src/services/usuario.service.ts` faz hash, transformação e persistência; não há repository.
- `server/src/services/evolution.service.ts` é cliente externo, service de negócio e repository de `Configuracao`.
- `server/src/app.ts` acessa Prisma na rota pública de configurações.
- `client/src/lib/api.ts` mistura modelos, infraestrutura HTTP e todos os serviços de API.

### Lógica de negócio no frontend

- `client/src/pages/painel/useAgendaAdministrativa.ts` decide quando um agendamento terminou e envia status `ATRASADO`; o backend também atualiza atrasados em `regras-agendamento.service.ts`, com critério diferente.
- `client/src/pages/agendar/useAgendamentoPublico.ts` controla passos, validações de avanço, confirmação de horário próximo e repetição.
- `client/src/pages/painel/AgendamentosPage.tsx` contém regras de ação por status e montagem de telefone de WhatsApp.
- `client/src/utils/senha.ts` replica a política de `server/src/services/senha.service.ts`. A validação no servidor é a autoridade; a cópia no cliente serve à experiência, mas pode divergir.
- `client/src/utils/horarios.ts` repete parte dos cálculos de blocos presentes em `server/src/services/horarios.service.ts`.

### Duplicações e inconsistências

- rótulos e classes de status aparecem em `DashboardPage.tsx`, `AgendamentosPage.tsx` e `ResumoAgendamentosCliente.tsx`;
- formatação de data reaparece em componentes diferentes;
- formulários de cliente existem em `ClientesPage.tsx`, `AgendamentosPage.tsx` e `useAgendamentoAdministrativo.ts`;
- há dois caminhos de criação administrativa: a lógica extensa dentro de `AgendamentosPage.tsx` e `NovoAgendamentoWizard.tsx` + `useAgendamentoAdministrativo.ts`;
- `Profissional` e usuário com nível de funcionário são conceitos separados, sem ligação no schema;
- a nomenclatura alterna `Funcionarios` no frontend e `Profissional` no backend/banco;
- erros são tratados ora com `try/catch`, ora deixados para o Express; não há middleware de erro central.

### Tailwind concentrado

Foram observadas 808 ocorrências de `className` nos arquivos TSX. Maiores concentrações:

- `AgendamentosPage.tsx`: 98;
- `PaginaAgendamento.tsx`: 80;
- `HomePage.tsx`: 67;
- `DashboardPage.tsx`: 65;
- `FuncionariosPage.tsx`: 63;
- `EvolutionPage.tsx`: 49.

`client/src/styles/index.css` ainda contém `@tailwind`, cinco componentes com `@apply` e CSS tradicional para acessibilidade, gradiente, scrollbar e botão Google.

### Possíveis arquivos mortos — necessita validação

Nenhuma remoção deve ocorrer sem busca, build e teste manual. No grafo de imports atual não foram encontrados consumidores para:

- `client/src/components/Header.tsx`;
- `client/src/components/Footer.tsx`;
- `client/src/pages/NotFoundPage.tsx`;
- `client/src/pages/painel/funcionarios/FuncionariosTable.tsx`;
- `client/src/pages/painel/funcionarios/HorariosModal.tsx`;
- `client/src/pages/painel/funcionarios/utilitariosFuncionarios.ts`.

`tiposFuncionarios.ts` é usado apenas pelos três arquivos da subestrutura de funcionários acima. Esses arquivos podem representar uma implementação antiga ou trabalho em andamento.

### Dependências para análise posterior

Não foi identificada autorização para remover dependências. Pontos para auditoria futura:

- Tailwind, PostCSS e Autoprefixer são necessários durante a migração e só podem sair ao final;
- todas as dependências listadas atualmente têm uso aparente no código (`wouter`, `react-hot-toast`, `lucide-react`, Prisma, JWT, bcrypt, Google Auth, Express, CORS, dotenv e PostgreSQL);
- o repositório contém `node_modules` rastreado/alterado no estado atual do Git, o que torna status e diffs muito ruidosos; tratar isso é uma tarefa separada;
- scripts de teste não aparecem nos `package.json` atuais, embora o histórico do worktree indique remoções de vários testes; o baseline de testes automatizados **necessita validação**.

### Divergência da documentação legada

Parte da documentação anterior descreve uma arquitetura planejada, não o código atual. Exemplos confirmados:

- `docs/02-arquitetura.md` e `docs/03-stack.md` descrevem Next.js, Route Handlers e Server Actions; o código real usa React/Vite e Express;
- `docs/06-banco-de-dados.md` descreve entidades como horário e pagamento que não existem em `server/prisma/schema.prisma` atual;
- `docs/AGENTS.md` ainda determina Tailwind como padrão, em conflito com a nova decisão explícita de migração gradual para CSS;
- `README.md` cita Vitest, Testing Library, Supertest e comandos de teste que não constam nos `package.json` atuais;
- `ROADMAP_PROJETO.txt` e `REQUISITOS_ATUALIZADOS.txt` ainda marcam como pendentes itens que possuem implementação atual, como Google e VLibras.

Esses arquivos não foram alterados nesta etapa. Eles devem ser classificados futuramente como histórico, planejamento ou documentação vigente. Até lá, esta pasta usa o código como fonte da verdade.

## Síntese

O sistema já tem services reais e relevantes, especialmente no domínio de agendamento, mas a separação é parcial. A principal oportunidade é introduzir controllers e repositories por domínio, sem alterar contratos HTTP, e dividir o frontend por responsabilidade sem tentar reproduzir MVC dentro do React.
