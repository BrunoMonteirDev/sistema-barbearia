# Guia de estudo para o TCC

## Como usar este guia

Escolha uma funcionalidade, leia o fluxo e abra os arquivos na ordem indicada. A intenção não é decorar respostas, e sim conseguir apontar no código onde cada responsabilidade está hoje e como ela será separada gradualmente.

## Inicialização da aplicação

### O que faz

Inicia o React, monta os providers/rotas e inicia a API Express com o processamento periódico de lembretes.

### Fluxo

```text
client/index.html → client/src/main.tsx → client/src/App.tsx

server/src/index.ts → server/src/app.ts → routes
```

### Arquivos principais

- `client/src/main.tsx`
- `client/src/App.tsx`
- `server/src/index.ts`
- `server/src/app.ts`
- `client/vite.config.ts`

### Conceitos envolvidos

- ReactDOM e StrictMode
- Context API
- roteamento com Wouter
- Express e middlewares
- variáveis de ambiente
- proxy do Vite

### Perguntas que podem surgir

- Qual arquivo inicia frontend e backend?
- Como `/api` chega ao Express no desenvolvimento?
- Onde as rotas são registradas?
- Por que o lembrete começa junto do servidor?
- Qual porta é usada em cada processo?

## Autenticação local

### O que faz

Valida e-mail/senha, cria um JWT de oito horas e mantém o usuário autenticado no frontend.

### Fluxo

```text
LoginPage → AuthContext → api.auth.login → routes/auth.ts
→ usuario.service.ts → Prisma/Usuario → bcrypt → JWT
```

### Arquivos principais

- `client/src/pages/LoginPage.tsx`
- `client/src/contexts/AuthContext.tsx`
- `client/src/lib/api.ts`
- `server/src/routes/auth.ts`
- `server/src/services/usuario.service.ts`
- `server/src/middlewares/auth.ts`

### Conceitos envolvidos

- React `useState`
- Context API
- HTTP POST
- hash com bcrypt
- JWT
- localStorage
- middleware de autenticação

### Perguntas que podem surgir

- A senha é guardada em texto puro?
- O que existe dentro do token?
- Quanto tempo dura a sessão?
- Quem protege as rotas: frontend ou backend?
- O que acontece com usuário inativo?
- Onde o token é armazenado?

## Cadastro local

### O que faz

Cria um cliente com credenciais locais, valida política de senha e já retorna sessão autenticada.

### Fluxo

```text
LoginPage (cadastro) → AuthContext.signUp → POST /auth/register
→ senha.service.ts → usuario.service.ts → bcrypt.hash → Prisma
```

### Arquivos principais

- `client/src/pages/LoginPage.tsx`
- `client/src/contexts/AuthContext.tsx`
- `server/src/routes/auth.ts`
- `server/src/services/senha.service.ts`
- `server/src/services/usuario.service.ts`

### Conceitos envolvidos

- formulários controlados
- validação client/server
- unicidade de e-mail
- HTTP 201/400/409/500
- hash de senha

### Perguntas que podem surgir

- Onde a senha é validada de verdade?
- Como e-mail duplicado é tratado?
- Por que existe validação também no frontend?
- Qual nível é atribuído ao novo usuário?

## Login com Google

### O que faz

Valida um ID token do Google, vincula ou cria usuário e exige complemento do cadastro quando necessário.

### Fluxo

```text
GoogleLoginButton → LoginPage → AuthContext.signInGoogle
→ POST /auth/google → OAuth2Client.verifyIdToken
→ usuario.service.ts → Prisma → JWT
→ CompleteRegistrationPage quando cadastroConcluido=false
```

### Arquivos principais

- `client/src/components/GoogleLoginButton.tsx`
- `client/src/pages/LoginPage.tsx`
- `client/src/pages/user/CompleteRegistrationPage.tsx`
- `server/src/routes/auth.ts`
- `server/src/services/usuario.service.ts`

### Conceitos envolvidos

- OAuth/OpenID Connect via ID token
- variável de ambiente client ID
- conta local vinculada por e-mail
- autenticação federada
- fluxo de cadastro incompleto

### Perguntas que podem surgir

- O backend confia diretamente no frontend?
- Como confirma que o e-mail Google é verificado?
- O que acontece se já existe conta com o mesmo e-mail?
- Por que o telefone é solicitado depois?
- Como uma conta inativa é tratada?

## Autorização e rotas protegidas

### O que faz

Restringe páginas no frontend e endpoints no backend com base no JWT e no nível do usuário.

### Fluxo

```text
ProtectedRoute.tsx → experiência de navegação

Authorization: Bearer → authenticate → requireAdmin/requireStaff
→ handler da rota
```

### Arquivos principais

- `client/src/components/ProtectedRoute.tsx`
- `client/src/contexts/AuthContext.tsx`
- `server/src/middlewares/auth.ts`
- `server/src/types/express.d.ts`
- `server/src/app.ts`

### Conceitos envolvidos

- autenticação versus autorização
- middleware
- claims JWT
- status 401 e 403
- tipagem global do Express

### Perguntas que podem surgir

- Esconder uma página no React é segurança suficiente?
- Qual a diferença entre 401 e 403?
- Quais papéis existem realmente?
- Por que `requireStaff` e a tipagem atual divergem?

## Perfil e exclusão de conta

### O que faz

Permite consultar/editar nome e telefone e desativar a própria conta mediante frase de confirmação.

### Fluxo

```text
MinhaContaPage → useMinhaConta → api.usuarios
→ routes/usuarios.ts → usuario.service.ts → Prisma/Usuario
```

### Arquivos principais

- `client/src/pages/user/MinhaContaPage.tsx`
- `client/src/pages/user/useMinhaConta.ts`
- `server/src/routes/usuarios.ts`
- `server/src/services/usuario.service.ts`

### Conceitos envolvidos

- custom hook
- formulário controlado
- PUT e DELETE
- soft delete/desativação lógica
- normalização de telefone

### Perguntas que podem surgir

- A conta é apagada fisicamente?
- Por que manter histórico?
- Onde o telefone é validado?
- O e-mail pode ser alterado?

## Gestão de clientes

### O que faz

Permite ao administrador listar, pesquisar, cadastrar, atualizar e desativar clientes.

### Fluxo

```text
ClientesPage → api.usuarios.* → routes/usuarios.ts
→ requireAdmin → usuario.service.ts → Prisma
```

### Arquivos principais

- `client/src/pages/painel/ClientesPage.tsx`
- `client/src/utils/senha.ts`
- `server/src/routes/usuarios.ts`
- `server/src/services/usuario.service.ts`

### Conceitos envolvidos

- CRUD
- modal e confirmação
- busca no frontend
- senha gerada
- desativação lógica

### Perguntas que podem surgir

- Quem pode cadastrar outro cliente?
- Como funciona cliente sem e-mail informado no fluxo administrativo?
- Como a senha forte é gerada e validada?
- O que ocorre com os agendamentos ao desativar o cliente?

## Gestão de serviços

### O que faz

Cadastra serviços com nome, descrição, preço, duração e estado ativo.

### Fluxo

```text
ServicosAdminPage → api.servicos → routes/servicos.ts
→ validação no router → Prisma/Servico
```

### Arquivos principais

- `client/src/pages/painel/ServicosAdminPage.tsx`
- `client/src/lib/api.ts`
- `server/src/routes/servicos.ts`
- `server/prisma/schema.prisma`

### Conceitos envolvidos

- CRUD REST
- Prisma Decimal
- validação
- soft delete
- rota pública versus mutação administrativa

### Perguntas que podem surgir

- Por que a listagem é pública?
- A exclusão apaga registros?
- Como duração influencia a agenda?
- Por que este domínio é bom para iniciar a refatoração?

## Gestão de profissionais

### O que faz

Mantém profissionais, dados de contato, estado ativo e disponibilidade semanal.

### Fluxo

```text
FuncionariosPage → api.profissionais → routes/profissionais.ts
→ Prisma/Profissional
```

### Arquivos principais

- `client/src/pages/painel/FuncionariosPage.tsx`
- `client/src/lib/api.ts`
- `server/src/routes/profissionais.ts`
- model `Profissional` em `server/prisma/schema.prisma`

### Conceitos envolvidos

- CRUD
- validação de e-mail/telefone
- estado ativo
- separação entre usuário e profissional

### Perguntas que podem surgir

- Profissional também é um usuário do sistema?
- Por que frontend chama de funcionário?
- O que acontece ao desativar?
- Como a listagem pública difere da administrativa?

## Disponibilidade semanal

### O que faz

Define blocos de 30 minutos por dia da semana para cada profissional.

### Fluxo

```text
FuncionariosPage → api.profissionais.salvarDisponibilidade
→ PUT /profissionais/:id/disponibilidade
→ routes/profissionais.ts → transação Prisma
→ DisponibilidadeProfissional
```

### Arquivos principais

- `client/src/pages/painel/FuncionariosPage.tsx`
- `client/src/utils/horarios.ts`
- `server/src/routes/profissionais.ts`
- `server/src/services/horarios.service.ts`
- model `DisponibilidadeProfissional` no schema.

### Conceitos envolvidos

- grade de horários
- dia da semana `0..6`
- conjunto (`Set`) para deduplicação
- transação
- relação Prisma

### Perguntas que podem surgir

- Por que os blocos têm 30 minutos?
- Como salva uma semana inteira?
- O que ocorre se o serviço dura 60 minutos?
- Como evita horários duplicados?

## Consulta de horários

### O que faz

Retorna inícios em que o serviço cabe integralmente na disponibilidade e não se sobrepõe a agendamentos ativos.

### Fluxo

```text
hook de agendamento → GET /agendamentos/disponibilidade
→ routes/agendamentos.ts → horarios.service.ts
→ Prisma: Servico + Disponibilidade + Agendamentos
→ cálculo de blocos/conflitos
```

### Arquivos principais

- `client/src/pages/agendar/useAgendamentoPublico.ts`
- `client/src/pages/painel/useAgendamentoAdministrativo.ts`
- `client/src/pages/user/useAgendamentosCliente.ts`
- `server/src/routes/agendamentos.ts`
- `server/src/services/horarios.service.ts`

### Conceitos envolvidos

- query parameters
- `useEffect`
- duração arredondada
- intervalo semiaberto e sobreposição
- consulta relacional Prisma

### Perguntas que podem surgir

- Como um serviço de 45 minutos ocupa a grade?
- Agendamento cancelado bloqueia horário?
- Como funciona “sem preferência”?
- Por que ignorar um ID na remarcação?
- A consulta pública aceita autenticação para remarcação atualmente?

## Criação de agendamento

### O que faz

Valida usuário, serviço, profissional, horário, repetição e concorrência antes de persistir.

### Fluxo

```text
PaginaAgendamento → useAgendamentoPublico → api.agendamentos.create
→ routes/agendamentos.ts → criacao-agendamento.service.ts
→ repeticao-agendamento.service.ts + horarios.service.ts
→ bloqueio-agenda.service.ts → Prisma/Agendamento
```

### Arquivos principais

- `client/src/pages/agendar/PaginaAgendamento.tsx`
- `client/src/pages/agendar/useAgendamentoPublico.ts`
- `server/src/routes/agendamentos.ts`
- `server/src/services/criacao-agendamento.service.ts`
- `server/src/services/bloqueio-agenda.service.ts`
- `server/src/services/horarios.service.ts`

### Conceitos envolvidos

- wizard React
- autenticação tardia
- caso de uso/service
- transação
- PostgreSQL advisory lock
- concorrência
- validação dupla antes/depois do lock

### Perguntas que podem surgir

- Como evita dois agendamentos concorrentes?
- Por que validar disponibilidade duas vezes?
- Quem é usado quando não há preferência?
- O cliente Google incompleto pode agendar?
- Onde o agendamento é realmente criado?

## Detecção de repetição

### O que faz

Pede confirmação quando o mesmo cliente já possui agendamento ativo na mesma data.

### Fluxo

```text
criacao-agendamento.service.ts → repeticao-agendamento.service.ts
→ Prisma → JWT temporário → resposta 409
→ ConfirmacaoAgendamentoRepetidoModal → nova tentativa com token
```

### Arquivos principais

- `server/src/services/repeticao-agendamento.service.ts`
- `server/src/services/criacao-agendamento.service.ts`
- `server/src/routes/agendamentos.ts`
- `client/src/components/ConfirmacaoAgendamentoRepetidoModal.tsx`

### Conceitos envolvidos

- prevenção de duplicidade sem bloquear definitivamente
- JWT temporário
- HTTP 409
- snapshot da tentativa

### Perguntas que podem surgir

- O que é considerado repetição?
- Quanto tempo a confirmação vale?
- Como impede usar o token em outro horário?
- Por que retorna 409 em vez de criar diretamente?

## Cancelamento

### O que faz

Marca o agendamento como cancelado, respeita antecedência para cliente e registra histórico.

### Fluxo

```text
UserAppointmentsPage/AgendamentosPage → PATCH /cancelar
→ routes/agendamentos.ts → regras-agendamento.service.ts
→ manutencao-agendamento.service.ts
→ Prisma/Agendamento + HistoricoAgendamento
```

### Arquivos principais

- `client/src/pages/user/useAgendamentosCliente.ts`
- `server/src/routes/agendamentos.ts`
- `server/src/services/regras-agendamento.service.ts`
- `server/src/services/manutencao-agendamento.service.ts`

### Conceitos envolvidos

- autorização por dono
- regra de antecedência
- atualização de status
- histórico/auditoria
- notificação assíncrona

### Perguntas que podem surgir

- Admin também precisa respeitar antecedência?
- Cancelar libera o horário?
- Por que não usa lock?
- O histórico guarda o quê?

## Remarcação

### O que faz

Troca data/hora e opcionalmente profissional/serviço, garantindo permissão, antecedência e disponibilidade.

### Fluxo

```text
UserAppointmentsPage → useAgendamentosCliente
→ consulta disponibilidade ignorando o agendamento atual
→ PATCH /remarcar
→ routes/agendamentos.ts
→ manutencao-agendamento.service.ts
→ lock + validação + update + histórico
```

### Arquivos principais

- `client/src/pages/user/UserAppointmentsPage.tsx`
- `client/src/pages/user/useAgendamentosCliente.ts`
- `server/src/routes/agendamentos.ts`
- `server/src/services/manutencao-agendamento.service.ts`

### Conceitos envolvidos

- atualização concorrente
- autorização
- antecedência
- transação
- histórico antes/depois

### Perguntas que podem surgir

- Por que ignorar o próprio agendamento?
- Quem pode remarcar?
- Como evita ocupar intervalo existente?
- A notificação ocorre antes ou depois da resposta?

## Status e atraso

### O que faz

Permite atualização administrativa de status e marca atrasados ao listar; o frontend administrativo também contém uma verificação.

### Fluxo

```text
GET /agendamentos → atualizarAtrasados no backend

useAgendaAdministrativa → calcula término → PATCH /status ATRASADO
```

### Arquivos principais

- `server/src/services/regras-agendamento.service.ts`
- `server/src/routes/agendamentos.ts`
- `server/src/services/manutencao-agendamento.service.ts`
- `client/src/pages/painel/useAgendaAdministrativa.ts`

### Conceitos envolvidos

- regra temporal
- status
- lógica duplicada client/server
- histórico

### Perguntas que podem surgir

- Qual é a fonte da verdade do status?
- Backend e frontend usam o mesmo critério?
- Por que listar altera dados?
- Essa regra deve virar job no futuro?

## Painel e dashboard

### O que faz

Agrega dados de agendamento, clientes, equipe e WhatsApp para exibir métricas e atalhos.

### Fluxo

```text
PainelPage → DashboardPage
→ Promise.all de APIs existentes
→ useMemo para métricas
→ cards/listas
```

### Arquivos principais

- `client/src/pages/PainelPage.tsx`
- `client/src/pages/painel/DashboardPage.tsx`
- `client/src/components/layout/Sidebar.tsx`
- `client/src/lib/api.ts`

### Conceitos envolvidos

- rotas aninhadas
- `Promise.all`
- `useMemo`
- agregação no frontend
- responsividade

### Perguntas que podem surgir

- Existe endpoint próprio de dashboard?
- Onde a receita é calculada?
- Quais chamadas carregam em paralelo?
- Como o painel é protegido?

## Notificações por WhatsApp

### O que faz

Monta mensagens com dados do agendamento, envia pela Evolution e registra o resultado.

### Fluxo

```text
evento/manual → notificacao.service.ts
→ mensagem-notificacao.service.ts
→ evolution.service.ts → Evolution API
→ Prisma/NotificacaoAgendamento
```

### Arquivos principais

- `server/src/services/notificacao.service.ts`
- `server/src/services/mensagem-notificacao.service.ts`
- `server/src/services/evolution.service.ts`
- `server/src/routes/agendamentos.ts`
- model `NotificacaoAgendamento` no schema.

### Conceitos envolvidos

- API externa
- templates com placeholders
- normalização de telefone
- fire-and-forget
- registro de sucesso/falha

### Perguntas que podem surgir

- O agendamento falha se o WhatsApp falhar?
- Onde a mensagem é configurada?
- Quais estados de notificação são gravados?
- Como telefone brasileiro recebe DDI?
- Chaves da Evolution ficam onde?

## Lembretes automáticos

### O que faz

Procura agendamentos próximos do intervalo configurado e envia lembrete uma vez quando encontra registro enviado.

### Fluxo

```text
server/src/index.ts → setInterval 60s
→ notificacaoService.processarLembretes
→ Prisma/Agendamento + NotificacaoAgendamento
→ Evolution
```

### Arquivos principais

- `server/src/index.ts`
- `server/src/services/notificacao.service.ts`
- `server/src/services/evolution.service.ts`

### Conceitos envolvidos

- scheduler em memória
- janela temporal
- idempotência por consulta
- fuso horário

### Perguntas que podem surgir

- O que acontece se houver dois servidores?
- O lembrete sobrevive a reinício?
- Como evita enviar novamente?
- Qual antecedência é aceita?

## Gestão da Evolution

### O que faz

Administra a instância WhatsApp e configura nome, mensagens e regras de envio.

### Fluxo

```text
EvolutionPage → api.evolution → routes/evolution.ts
→ evolution.service.ts → Evolution API e Prisma/Configuracao
```

### Arquivos principais

- `client/src/pages/painel/EvolutionPage.tsx`
- `server/src/routes/evolution.ts`
- `server/src/services/evolution.service.ts`
- `.env.evolution.example`
- `docker-compose.evolution.yml`

### Conceitos envolvidos

- integração REST externa
- QR code/pairing code
- configuração por ambiente
- persistência JSON
- tratamento de indisponibilidade

### Perguntas que podem surgir

- Como o sistema sabe se a instância está conectada?
- O que fica no banco e o que fica em `.env`?
- Como trata Evolution desligada?
- Por que o service atual precisa ser dividido?

## Configurações e regras

### O que faz

Mantém contatos públicos e limites de antecedência/tolerância usados pela agenda.

### Fluxo

```text
WhatsAppConfigPage/RegrasNegocioPage
→ api.configuracoes
→ routes/configuracoes.ts
→ Prisma/Configuracao
```

### Arquivos principais

- `client/src/pages/painel/WhatsAppConfigPage.tsx`
- `client/src/pages/painel/RegrasNegocioPage.tsx`
- `client/src/pages/painel/useRegrasNegocio.ts`
- `server/src/routes/configuracoes.ts`
- `server/src/services/regras-agendamento.service.ts`

### Conceitos envolvidos

- configuração persistida
- validação numérica
- defaults
- projeção pública de dados

### Perguntas que podem surgir

- Existe apenas uma linha de configuração?
- O que acontece se ela não existir?
- Quais campos são públicos?
- Onde cada regra é consumida?

## Acessibilidade

### O que faz

Oferece skip link, foco destacado, navegação por setas, leitura em voz alta, fonte ampliada, redução de movimento, alto contraste e VLibras.

### Fluxo

```text
App.tsx → componentes globais de acessibilidade
→ classes no elemento html/localStorage
→ styles/index.css
```

### Arquivos principais

- `client/src/components/AcessibilidadeControls.tsx`
- `client/src/hooks/useSpeechSynthesis.ts`
- `client/src/components/KeyboardArrowNavigation.tsx`
- `client/src/components/SkipToContent.tsx`
- `client/src/components/VLibras.tsx`
- `client/src/styles/index.css`

### Conceitos envolvidos

- Web Speech API
- teclado e foco
- ARIA
- persistência local
- CSS de alto contraste
- script externo VLibras

### Perguntas que podem surgir

- Como a preferência é mantida?
- O modo de alto contraste depende das classes Tailwind?
- Como a remoção de Tailwind preservará acessibilidade?
- Por que VLibras é ocultado no painel?

## Prisma e banco

### O que faz

Mapeia entidades para PostgreSQL e centraliza a conexão.

### Fluxo

```text
service/route atual → server/src/lib/prisma.ts
→ PrismaPg → PostgreSQL
```

### Arquivos principais

- `server/src/lib/prisma.ts`
- `server/prisma/schema.prisma`
- `server/prisma/migrations/`
- `server/prisma.config.ts`

### Conceitos envolvidos

- ORM
- migrations
- relações e índices
- transações
- soft delete e cascade

### Perguntas que podem surgir

- Por que existe uma única instância Prisma?
- Quais entidades se relacionam?
- Data/hora são DateTime?
- Como cancelados deixam de bloquear o índice?
- Onde SQL manual é usado e por quê?

## Refatoração proposta

### O que faz

Separa responsabilidades sem mudar comportamento.

### Fluxo-alvo

```text
Route → Controller → Service → Repository → Prisma → Banco
```

### Arquivos de estudo

- `docs/refatoracao/01-ARQUITETURA-ATUAL.md`
- `docs/refatoracao/02-ARQUITETURA-ALVO.md`
- `docs/refatoracao/03-PLANO-REFATORACAO-MVC.md`
- `docs/refatoracao/06-MAPA-DE-FLUXOS.md`

### Conceitos envolvidos

- separação de responsabilidades
- dependência entre camadas
- refatoração incremental
- characterization test
- preservação de contrato

### Perguntas que podem surgir

- Por que não refatorar tudo de uma vez?
- Quando um service/repository não é necessário?
- Por que React não seguirá MVC?
- Como comprovar que o comportamento foi preservado?
