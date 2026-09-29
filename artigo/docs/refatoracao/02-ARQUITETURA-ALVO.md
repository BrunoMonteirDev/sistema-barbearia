# Arquitetura-alvo

## Princípios

A arquitetura-alvo deve aproximar o backend da sequência didática:

```text
Route
↓
Controller
↓
Service
↓
Repository
↓
Prisma
↓
PostgreSQL
```

Essa sequência é uma direção de dependência, não uma obrigação de criar cinco arquivos para qualquer operação. Uma camada só será criada quando tiver responsabilidade concreta. Funções puras pequenas podem permanecer em utilitários de domínio; modelos adicionais só existirão quando melhorarem a tipagem.

Regras da migração:

- preservar caminhos, métodos, status HTTP, payloads, mensagens e efeitos atuais;
- migrar um domínio por vez;
- manter `server/src/lib/prisma.ts` como única criação do Prisma Client;
- não duplicar regra em controller e service;
- não acessar Prisma em route ou controller ao final;
- não fazer uma reescrita geral.

## Backend desejado

```text
server/src/
├── routes/
├── controllers/
├── services/
├── repositories/
├── models/
├── middlewares/
├── lib/
├── types/
├── app.ts
└── index.ts
```

### `routes/`

Responsabilidade:

- declarar método e caminho;
- compor middlewares;
- apontar para um método de controller.

Uma route não valida regra de negócio, não monta resposta detalhada e não importa Prisma.

Exemplo proposto, sem compromisso com implementação imediata:

```text
POST /api/agendamentos
→ authenticate
→ AgendamentoController.criar
```

### `controllers/`

Responsabilidade:

- receber `Request` e `Response`;
- extrair `params`, `query`, `body` e identidade autenticada;
- executar validações estritamente HTTP/contratuais;
- chamar o service;
- converter o resultado ou erro conhecido em resposta HTTP.

Controller não acessa Prisma e não decide conflito de agenda, repetição ou antecedência.

### `services/`

Responsabilidade:

- implementar casos de uso e regras de negócio;
- coordenar repositories e integrações;
- trabalhar com dados tipados, sem depender de `Request` ou `Response`;
- lançar erros de domínio identificáveis.

Os services atuais de agendamento fornecem uma boa base. A migração deve reorganizá-los antes de substituí-los.

### `repositories/`

Responsabilidade:

- concentrar consultas e mutações Prisma de um domínio;
- esconder detalhes de `include`, `select`, filtros e transações;
- aceitar opcionalmente um `Prisma.TransactionClient` quando a operação participar de transação.

Não deve conter regra como “cliente precisa concluir cadastro” ou “cancelamento exige antecedência”.

Repositories inicialmente úteis no código real:

- `usuario.repository.ts`;
- `servico.repository.ts`;
- `profissional.repository.ts`;
- `disponibilidade.repository.ts` ou operações no repository de profissional enquanto pequenas;
- `agendamento.repository.ts`;
- `historico-agendamento.repository.ts` somente se a separação reduzir complexidade real;
- `configuracao.repository.ts`;
- `notificacao.repository.ts` somente quando extraído do service.

### `models/`

Responsabilidade:

- representar entradas, saídas e conceitos de domínio quando os tipos Prisma ou tipos locais não forem suficientes;
- centralizar uniões como status e tipos de notificação quando compartilhadas.

Não deve duplicar automaticamente todos os models do Prisma. `server/prisma/schema.prisma` continua sendo o modelo persistente.

Exemplos que podem justificar tipos próprios:

- `DadosCriacaoAgendamento`;
- `StatusAgendamento`;
- `TipoNotificacao`;
- `RegrasAgendamento`;
- DTOs de autenticação/resposta sem `senhaHash`.

### `middlewares/`

Responsabilidade:

- autenticação JWT;
- autorização por papel;
- tratamento central de erros, se introduzido gradualmente;
- preocupações transversais de Express.

`server/src/middlewares/auth.ts` permanece a base. O tipo de papéis deve ser alinhado com `server/src/types/express.d.ts` antes de ampliar abstrações.

### `lib/` e configuração

Responsabilidade:

- infraestrutura compartilhada e clientes externos;
- Prisma Client;
- leitura tipada/validada de configuração quando essa extração for feita;
- cliente HTTP da Evolution, separado das regras de negócio.

Possível evolução:

```text
lib/prisma.ts
lib/env.ts                         somente se eliminar leituras dispersas
lib/evolution-client.ts            somente quando separado de evolution.service.ts
```

## Aplicação aos domínios reais

### Autenticação local

```text
POST /api/auth/login
→ AuthController.login
→ AuthService.autenticarLocal
→ UsuarioRepository.buscarPorEmail
→ Prisma
→ Usuario
```

`AuthService` compara senha e emite/solicita emissão do JWT. `AuthController` conserva exatamente as respostas atuais. A política de senha continua em `senha.service.ts` ou em utilitário de domínio, por ser uma regra pura.

### Login Google

```text
POST /api/auth/google
→ AuthController.loginGoogle
→ AuthService.autenticarComGoogle
→ Google OAuth client
→ UsuarioRepository.buscar/atualizar/criar
→ Prisma
```

### Usuários e perfil

```text
PUT /api/usuarios/me
→ UsuarioController.atualizarMeuPerfil
→ UsuarioService.atualizarPerfil
→ UsuarioRepository.atualizar
→ Prisma
```

Hash de senha fica no service, e persistência no repository. O formato legado `data_nascimento` deve continuar sendo mapeado até que uma mudança de contrato seja planejada separadamente.

### Serviços

```text
POST /api/servicos
→ ServicoController.criar
→ ServicoService.criar
→ ServicoRepository.criar
→ Prisma
```

Esse é o melhor domínio-piloto: CRUD pequeno, contrato conhecido e ausência atual de service/repository.

### Profissionais

```text
PUT /api/profissionais/:id
→ ProfissionalController.atualizar
→ ProfissionalService.atualizar
→ ProfissionalRepository.atualizar
→ Prisma
```

### Disponibilidade

```text
PUT /api/profissionais/:id/disponibilidade
→ DisponibilidadeController.substituir
→ DisponibilidadeService.substituirSemana
→ ProfissionalRepository.buscarPorId
→ DisponibilidadeRepository.substituirEmTransacao
→ Prisma
```

O cálculo de horários disponíveis permanece relacionado ao domínio de agenda em `horarios.service.ts`. Disponibilidade cadastrada e cálculo de encaixe não precisam virar uma hierarquia complexa.

### Criação de agendamento

```text
POST /api/agendamentos
→ AgendamentoController.criar
→ CriacaoAgendamentoService.criar
→ UsuarioRepository / ProfissionalRepository / ServicoRepository
→ AgendamentoRepository e HorariosService
→ Prisma sob advisory lock
→ PostgreSQL
```

Os comportamentos atuais a preservar incluem profissional sem preferência, cadastro concluído, detecção de repetição, confirmação JWT, duração em blocos, revalidação sob lock e disparo assíncrono de notificação.

### Manutenção de agendamento

```text
PATCH /api/agendamentos/:id/remarcar
→ AgendamentoController.remarcar
→ ManutencaoAgendamentoService.remarcar
→ RegrasAgendamentoService + HorariosService
→ AgendamentoRepository
→ HistoricoRepository, se a separação se justificar
→ Prisma
```

Cancelar, remarcar, atualizar status, editar administrativamente e excluir podem compartilhar o mesmo controller e service de domínio, desde que cada método continue pequeno.

### Configurações e regras

```text
PUT /api/configuracoes/regras
→ ConfiguracaoController.salvarRegras
→ ConfiguracaoService.salvarRegras
→ ConfiguracaoRepository.obterOuCriar/atualizar
→ Prisma
```

### Notificações e Evolution

```text
AgendamentoService
→ NotificacaoService
→ MensagemNotificacaoService
→ EvolutionService
→ EvolutionClient
→ Evolution API

NotificacaoService
→ NotificacaoRepository
→ Prisma/NotificacaoAgendamento
```

Separar `EvolutionClient` só é útil porque o service atual também persiste configurações e valida modelos. Não é necessário criar interfaces genéricas de provider enquanto existir apenas Evolution.

## Tratamento de erros desejado

Durante a migração, erros de domínio pequenos e explícitos podem substituir comparações por texto, por exemplo:

- conflito/horário indisponível;
- recurso não encontrado;
- confirmação de repetição necessária, inválida ou expirada;
- cadastro incompleto;
- acesso negado.

Um middleware central de erro é opcional e deve ser introduzido somente depois que um domínio provar o padrão. Até lá, controllers podem mapear erros conhecidos sem alterar mensagens/status existentes.

## Frontend desejado

React será tratado como camada de view e interação, não como MVC tradicional:

```text
Page / View
↓
Componentes e hooks da funcionalidade
↓
Service/API
↓
Backend
```

Estrutura gradual:

```text
client/src/
├── pages/                   composição das telas e navegação
├── components/              componentes reutilizáveis ou partes visuais relevantes
├── services/                chamadas HTTP agrupadas por domínio
├── models/                  tipos compartilhados da interface/API
├── contexts/                estado transversal, como autenticação
├── hooks/                   lógica de interação reutilizável
├── styles/                  estilos realmente globais e tokens simples
├── utils/                   funções puras de apresentação
├── App.tsx
└── main.tsx
```

### `pages/`

Compõem telas, recebem dados dos hooks/services e escolhem componentes. Uma página pode ter estado local simples, mas não deve conter centenas de linhas de tabelas, modais, regras e transformações.

### `components/`

Componentes visuais com propósito claro. Componentes específicos podem ficar próximos à página, evitando transformar tudo em componente global.

Exemplo coerente com o projeto:

```text
pages/painel/agendamentos/
├── AgendamentosPage.tsx
├── AgendamentosPage.css
├── AgendaDiaria.tsx
├── AgendaDiaria.css
├── AgendaSemanal.tsx
└── FormularioAgendamento.tsx
```

A localização exata pode ser escolhida na etapa do domínio; o objetivo é legibilidade, não movimentação em massa.

### `services/`

O conteúdo de `client/src/lib/api.ts` pode ser dividido gradualmente:

```text
services/http.ts
services/auth.service.ts
services/usuarios.service.ts
services/agendamentos.service.ts
services/profissionais.service.ts
services/servicos.service.ts
services/configuracoes.service.ts
services/evolution.service.ts
```

Essa divisão deve manter uma única função HTTP base e os mesmos contratos.

### `models/`

Recebe os tipos hoje concentrados em `client/src/lib/api.ts`. Não é necessário um arquivo por interface; arquivos por domínio são suficientes.

### `contexts/`

`client/src/contexts/AuthContext.tsx` continua responsável pela sessão no React. Chamadas HTTP podem ser delegadas ao service de autenticação/usuário.

### `hooks/`

Concentram estado e efeitos de um fluxo, como já fazem `useAgendamentoPublico.ts`, `useMinhaConta.ts` e `useAgendamentosCliente.ts`. Hooks não substituem regras de negócio do backend; eles coordenam a experiência da tela.

### `styles/`

- `styles/index.css`: reset, base, acessibilidade e estilos verdadeiramente globais;
- CSS por página/componente: aparência local;
- sem CSS-in-JS, preprocessor ou sistema novo;
- Tailwind permanece até cada tela ser migrada e validada.

## Limites contra excesso de arquitetura

Não faz parte da arquitetura-alvo:

- criar interface para todo repository sem necessidade de múltiplas implementações;
- criar DTO, mapper e factory para cada operação simples;
- espelhar cada model Prisma em uma classe TypeScript vazia;
- aplicar dependency injection container;
- criar “BaseRepository”, “BaseService” ou controller genérico;
- mover toda função pura para uma camada própria;
- reproduzir Controller/Service/Repository no React.

O critério é: a extração torna o fluxo mais fácil de localizar, testar, explicar e manter? Se não, ela não deve ser feita.

## Estado final esperado

Ao final, deve ser possível explicar qualquer caso de uso de cima para baixo:

```text
rota declara endpoint e middlewares
→ controller traduz HTTP
→ service aplica regra
→ repository executa persistência
→ Prisma conversa com PostgreSQL
```

No frontend:

```text
página compõe a tela
→ componente apresenta uma parte
→ hook coordena interação quando necessário
→ service faz HTTP
→ CSS local descreve aparência
```
