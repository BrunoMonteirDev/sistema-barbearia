# Mapa de fluxos atuais

## Como ler

Os diagramas abaixo representam o código existente. Como ainda não existem controllers e repositories separados, os callbacks em `server/src/routes/` exercem o papel equivalente a controller e vários services/routers acessam Prisma diretamente.

## Inicialização do frontend

```text
client/index.html
↓
client/src/main.tsx
↓
client/src/App.tsx
├─ client/src/contexts/AuthContext.tsx
├─ componentes globais de acessibilidade
└─ rotas Wouter
```

`main.tsx` importa `client/src/styles/index.css`. `App.tsx` envolve a aplicação em `ErrorBoundary` e `AuthProvider`.

## Inicialização do backend

```text
server/src/index.ts
↓
dotenv.config
↓
server/src/app.ts
↓
Express + routers
↓
listen(PORT ou 3001)
```

Em paralelo, `server/src/index.ts` chama `notificacaoService.processarLembretes()` ao iniciar e a cada 60 segundos.

## Login local

```text
client/src/pages/LoginPage.tsx
↓ useAuth.signIn
client/src/contexts/AuthContext.tsx
↓ api.auth.login
client/src/lib/api.ts
↓ POST /api/auth/login
server/src/routes/auth.ts
↓ autenticarUsuario
server/src/services/usuario.service.ts
↓ prisma.usuario.findUnique
server/src/lib/prisma.ts
↓
PostgreSQL / Usuario
↓
bcrypt.compare em server/src/routes/auth.ts
↓
signToken em server/src/middlewares/auth.ts
↓
token + user
↓
authStorage/localStorage + estado do AuthContext
```

Arquivos principais:

- `client/src/pages/LoginPage.tsx`
- `client/src/contexts/AuthContext.tsx`
- `client/src/lib/api.ts`
- `server/src/routes/auth.ts`
- `server/src/services/usuario.service.ts`
- `server/src/middlewares/auth.ts`

## Cadastro local

```text
LoginPage.tsx, modo cadastro
↓ AuthContext.signUp
api.auth.register
↓ POST /api/auth/register
routes/auth.ts
├─ verifica nome, e-mail e senha presentes
├─ senha.service.ts: validarSenha
├─ usuario.service.ts: buscarPorEmail
└─ usuario.service.ts: criar
   ├─ bcrypt.hash
   └─ prisma.usuario.create
↓
signToken
↓
token + user armazenados no AuthContext
```

O backend cria nível `Cliente`. O telefone é opcional nesse fluxo.

## Login Google

```text
client/src/components/GoogleLoginButton.tsx
↓ Google Identity Services no navegador
client/src/pages/LoginPage.tsx
↓ useAuth.signInGoogle(idToken)
client/src/contexts/AuthContext.tsx
↓ api.auth.google
client/src/lib/api.ts
↓ POST /api/auth/google
server/src/routes/auth.ts
↓ OAuth2Client.verifyIdToken
Google
↓ perfil verificado
usuario.service.ts
├─ buscarPorGoogleSubject
├─ buscarPorEmail
├─ atualizar conta existente/inativa
└─ ou criar conta Google incompleta
↓ Prisma/Usuario
↓
JWT + user
↓
LoginPage decide /concluir-cadastro ou destino normal
```

Configuração envolvida:

- frontend: `VITE_GOOGLE_CLIENT_ID`;
- backend: `GOOGLE_CLIENT_ID`.

Conta Google nova recebe `cadastroConcluido: false`. O complemento ocorre no fluxo seguinte.

## Conclusão de cadastro Google

```text
client/src/pages/user/CompleteRegistrationPage.tsx
↓ api.usuarios.concluirCadastro
client/src/lib/api.ts
↓ PUT /api/usuarios/me/concluir-cadastro
server/src/app.ts: authenticate
↓
server/src/routes/usuarios.ts
├─ valida nome e telefone
└─ usuarioService.concluirCadastro
   ↓ prisma.usuario.update
↓
AuthContext.atualizarUsuario
↓
retorno seguro ou /minha-conta
```

## Restauração da sessão

```text
client/src/contexts/AuthContext.tsx monta
↓ authStorage.get()
localStorage: barbearia.token
↓ api.usuarios.me
GET /api/usuarios/me
↓ authenticate em server/src/middlewares/auth.ts
↓ routes/usuarios.ts
↓ usuarioService.buscarPorId
↓ Prisma/Usuario
```

Token inválido limpa o storage e o usuário local.

## Perfil do cliente

### Consultar e atualizar

```text
client/src/pages/user/MinhaContaPage.tsx
↓ client/src/pages/user/useMinhaConta.ts
├─ api.usuarios.me
└─ api.usuarios.updateMe
   ↓ PUT /api/usuarios/me
server/src/middlewares/auth.ts
↓ server/src/routes/usuarios.ts
├─ normaliza nome/telefone
├─ valida dados
└─ usuarioService.atualizarPerfil
   ↓ prisma.usuario.update
```

### Excluir a própria conta

```text
MinhaContaPage.tsx
↓ confirmação "EXCLUIR MINHA CONTA"
useMinhaConta.excluirConta
↓ DELETE /api/usuarios/me
routes/usuarios.ts
↓ usuarioService.excluirPropriaConta
↓ prisma.usuario.update({ ativo: false })
↓ AuthContext.signOut
```

É uma desativação lógica, não exclusão física.

## Gestão administrativa de clientes

```text
client/src/pages/painel/ClientesPage.tsx
↓ api.usuarios.list/create/update/remove
client/src/lib/api.ts
↓ /api/usuarios
server/src/app.ts: authenticate
↓ server/src/routes/usuarios.ts: router.use(requireAdmin)
↓ usuario.service.ts
↓ Prisma/Usuario
```

A página também usa `client/src/utils/senha.ts` para gerar e validar senha antes do envio. O backend valida novamente com `server/src/services/senha.service.ts`.

## Criação e gestão de serviço

```text
client/src/pages/painel/ServicosAdminPage.tsx
↓ api.servicos.create/update/remove
client/src/lib/api.ts
↓ POST/PUT/DELETE /api/servicos
server/src/routes/servicos.ts
├─ authenticate
├─ requireAdmin
├─ validarDadosServico
└─ prisma.servico.create/update
↓
PostgreSQL / Servico
```

Listagem pública:

```text
PaginaAgendamento/useAgendamentoPublico
↓ api.servicos.list
GET /api/servicos
↓ routes/servicos.ts
↓ prisma.servico.findMany({ ativo: true })
```

`DELETE` desativa o serviço.

## Gestão de profissionais

```text
client/src/pages/painel/FuncionariosPage.tsx
↓ api.profissionais.listAdmin/create/update/remove
client/src/lib/api.ts
↓ /api/profissionais
server/src/routes/profissionais.ts
├─ authenticate + requireAdmin nas rotas administrativas
├─ getPayload/hasValidData
└─ Prisma/Profissional
```

Listagem pública usada pelo agendamento:

```text
useAgendamentoPublico.ts
↓ api.profissionais.list
GET /api/profissionais
↓ prisma.profissional.findMany({ ativo: true })
```

`DELETE` também é desativação lógica.

## Cadastro de disponibilidade do profissional

### Consultar

```text
FuncionariosPage.openEdit
↓ api.profissionais.disponibilidade(id)
GET /api/profissionais/:id/disponibilidade
↓ routes/profissionais.ts
↓ prisma.disponibilidadeProfissional.findMany
↓ reduce para Record<diaSemana, horas[]>
```

### Salvar

```text
FuncionariosPage.save
↓ api.profissionais.salvarDisponibilidade
PUT /api/profissionais/:id/disponibilidade
↓ routes/profissionais.ts
├─ valida objeto, dias 0..6 e blocos de 00/30 minutos
├─ confirma Profissional existente
└─ prisma.$transaction
   ├─ deleteMany da disponibilidade anterior
   └─ createMany dos novos blocos
```

A interface usa `client/src/utils/horarios.ts` para gerar 48 blocos entre 00:00 e 24:00.

## Consulta de horários disponíveis

```text
useAgendamentoPublico.ts
ou useAgendamentoAdministrativo.ts
ou useAgendamentosCliente.ts
↓ api.agendamentos.disponibilidade
GET /api/agendamentos/disponibilidade
↓ server/src/routes/agendamentos.ts
├─ valida profissional, serviço e data
├─ regrasAgendamento para aviso de antecedência
└─ horarios.service.ts
   ├─ busca Servico ativo
   ├─ busca DisponibilidadeProfissional do dia
   ├─ busca Agendamentos não cancelados
   ├─ calcula blocos consecutivos pela duração
   └─ elimina sobreposições
↓
{ horarios, horariosComAvisoAntecedencia }
```

Para `profissionalId=sem-preferencia`, a rota percorre blocos configurados e usa `escolherPrimeiroProfissionalDisponivel`.

Para remarcação, `ignorarAgendamentoId` deveria permitir ignorar o próprio agendamento. O middleware público em `server/src/app.ts` não autentica essa rota, embora o handler exija `req.auth` nesse caso. Esse fluxo **necessita validação**.

## Criação de agendamento público

### Seleção e revisão

```text
client/src/pages/agendar/PaginaAgendamento.tsx
↓ client/src/pages/agendar/useAgendamentoPublico.ts
├─ carrega serviços/profissionais
├─ controla etapas
├─ consulta disponibilidade
├─ exige revisão aceita
├─ redireciona para login se necessário
└─ redireciona para concluir cadastro se necessário
```

### Persistência

```text
useAgendamentoPublico.criarAgendamento
↓ api.agendamentos.create
POST /api/agendamentos
↓ authenticate em server/src/app.ts
↓ server/src/routes/agendamentos.ts
├─ valida data/hora/campos
├─ rejeita horário iniciado/passado
└─ server/src/services/criacao-agendamento.service.ts
   ├─ escolhe profissional, se sem preferência
   ├─ busca usuário/profissional/serviço ativos no Prisma
   ├─ exige cadastro concluído
   ├─ repeticao-agendamento.service.ts
   ├─ horarios.service.ts: valida disponibilidade
   └─ bloqueio-agenda.service.ts
      ├─ prisma.$transaction
      ├─ pg_advisory_xact_lock por profissional:data
      ├─ revalida disponibilidade
      └─ cria Agendamento
↓
routes/agendamentos.ts responde 201
↓
notificacaoService.enviarSeAutomatico, sem aguardar
```

## Criação administrativa de agendamento

Há lógica em dois conjuntos do frontend:

- `client/src/pages/painel/AgendamentosPage.tsx`;
- `client/src/pages/painel/NovoAgendamentoWizard.tsx` com `useAgendamentoAdministrativo.ts`.

O fluxo do hook dedicado:

```text
NovoAgendamentoWizard
↓ useAgendamentoAdministrativo
├─ escolhe ou cria cliente por api.usuarios.create
├─ escolhe profissional/serviço/data/hora
├─ consulta disponibilidade
└─ api.agendamentos.create com usuarioId
↓ POST /api/agendamentos
↓ criacao-agendamento.service.ts
```

No backend, `usuarioId` fornecido só é aceito quando `req.auth.nivel === Administrador`; caso contrário usa o usuário autenticado.

## Confirmação de possível repetição

```text
criarAgendamento
↓ repeticao-agendamento.service.ts
↓ prisma.agendamento.findMany
   mesmo usuário + mesma data + status ativo
↓ repetição encontrada
↓ validarTokenConfirmacaoRepeticao
├─ sem token: cria JWT de 60 segundos e lança CONFIRMACAO_REPETICAO_NECESSARIA
├─ expirado: CONFIRMACAO_REPETICAO_EXPIRADA
├─ dados diferentes: CONFIRMACAO_REPETICAO_INVALIDA
└─ válido: continua criação
↓
routes/agendamentos.ts transforma em HTTP 409 com codigo/dados
↓
ConfirmacaoAgendamentoRepetidoModal.tsx
↓ segunda chamada POST com tokenConfirmacaoRepeticao
```

O token inclui usuário, serviço, profissional, data e hora.

## Listagem de agendamentos

```text
ResumoAgendamentosCliente.tsx
ou useAgendamentosCliente.ts
ou useAgendaAdministrativa.ts
ou DashboardPage.tsx
↓ api.agendamentos.list
GET /api/agendamentos
↓ routes/agendamentos.ts
├─ regras-agendamento.service.ts: atualizarAtrasados
└─ prisma.agendamento.findMany
   ├─ admin: todos
   └─ demais: somente req.auth.sub
↓ inclui usuario, profissional e servico
```

`useAgendaAdministrativa.ts` também calcula no frontend se o atendimento terminou e pode enviar `PATCH /status` para `ATRASADO`. O critério frontend usa fim conforme duração; o backend usa início mais tolerância. Essa duplicidade deve ser preservada durante refatoração e analisada em tarefa funcional separada.

## Atualização administrativa de agendamento

```text
client/src/pages/painel/AgendamentosPage.tsx
↓ api.agendamentos.update
PUT /api/agendamentos/:id
↓ authenticate + requireAdmin
↓ routes/agendamentos.ts
├─ busca Agendamento
├─ valida campos/status
├─ verifica profissional/serviço ativos
├─ rejeita novo horário passado
└─ bloqueio-agenda.service.ts
   ├─ advisory lock
   ├─ validarDisponibilidade ignorando o próprio ID
   └─ prisma.agendamento.update
↓ prisma.historicoAgendamento.create
↓ resposta atualizada
```

Esse endpoint não chama notificação automática no código atual.

## Atualização de status

```text
AgendamentosPage.tsx ou useAgendaAdministrativa.ts
↓ api.agendamentos.status
PATCH /api/agendamentos/:id/status
↓ requireAdmin
↓ routes/agendamentos.ts
↓ manutencao-agendamento.service.ts
├─ prisma.agendamento.update
└─ prisma.historicoAgendamento.create tipo ATUALIZACAO_STATUS
↓ notificacaoService.enviarSeAutomatico(tipo=status)
```

## Cancelamento

```text
useAgendamentosCliente.ts ou AgendamentosPage.tsx
↓ api.agendamentos.cancel
PATCH /api/agendamentos/:id/cancelar
↓ routes/agendamentos.ts
├─ busca agendamento
├─ verifica dono ou admin
├─ para cliente, consulta antecedência em regras-agendamento.service.ts
└─ manutencao-agendamento.service.ts: cancelarAgendamento
   ├─ status CANCELADO
   └─ histórico CANCELAMENTO
↓ notificacaoService.enviarSeAutomatico(CANCELAMENTO)
```

Cancelar não usa advisory lock porque libera o horário; a próxima reserva revalida sob lock, conforme comentário do código.

## Remarcação

```text
client/src/pages/user/UserAppointmentsPage.tsx
↓ client/src/pages/user/useAgendamentosCliente.ts
├─ consulta disponibilidade ignorando o próprio agendamento
└─ api.agendamentos.remarcar
PATCH /api/agendamentos/:id/remarcar
↓ routes/agendamentos.ts
├─ verifica dono/admin
├─ aplica antecedência para cliente
├─ valida data/hora/recursos
└─ manutencao-agendamento.service.ts
   └─ bloqueio-agenda.service.ts
      ├─ valida disponibilidade ignorando ID
      └─ atualiza
   ↓ cria histórico REMARCACAO
↓ notificacaoService.enviarSeAutomatico(REMARCACAO)
```

## Histórico

```text
UserAppointmentsPage.tsx
↓ useAgendamentosCliente.abrirHistorico
↓ api.agendamentos.historico
GET /api/agendamentos/:id/historico
↓ routes/agendamentos.ts
├─ verifica dono/admin
└─ manutencao-agendamento.service.ts
   ↓ prisma.historicoAgendamento.findMany
```

## Exclusão administrativa de agendamento

```text
AgendamentosPage.tsx
↓ api.agendamentos.remove
DELETE /api/agendamentos/:id
↓ requireAdmin
↓ routes/agendamentos.ts
↓ prisma.agendamento.delete
↓ 204
```

Ao contrário de usuários, profissionais e serviços, essa exclusão é física. Relações de histórico/notificação têm `onDelete: Cascade` no schema.

## Notificação manual por WhatsApp

```text
AgendamentosPage.tsx
↓ api.agendamentos.notificar
POST /api/agendamentos/:id/notificar
↓ requireStaff
↓ routes/agendamentos.ts
├─ valida tipo
├─ notificacaoService.podeEnviar
└─ notificacaoService.enviar
   ├─ busca agendamento + relações
   ├─ normaliza telefone para +55
   ├─ mensagem-notificacao.service.ts
   │  └─ evolutionService.obterModelosMensagens
   ├─ evolutionService.enviarTexto
   │  └─ fetch Evolution API
   └─ prisma.notificacaoAgendamento.create
```

O frontend também monta o telefone de destino para a mensagem de confirmação visual; a autoridade de normalização/envio está no backend.

## Notificação automática após alteração

```text
criação/cancelamento/remarcação/status
↓ notificacaoService.enviarSeAutomatico
↓ evolutionService.envioAutomaticoAtivo
↓ prisma.configuracao.findFirst
↓ se regra ativa: notificacaoService.enviar
↓ Evolution + registro em NotificacaoAgendamento
```

As chamadas são feitas com `void` nas routes; a resposta HTTP do agendamento não aguarda a entrega.

## Lembretes automáticos

```text
server/src/index.ts
↓ a cada 60 segundos
notificacaoService.processarLembretes
↓ evolutionService.regrasEnvioAutomatico
↓ calcula janela de ±60 segundos do alvo
↓ prisma.agendamento.findMany
↓ filtra PENDENTE/CONFIRMADO na data/hora
↓ verifica NotificacaoAgendamento ENVIADA do tipo LEMBRETE
↓ notificacaoService.enviar
```

Execução com múltiplas instâncias do servidor e comportamento de fuso **necessitam validação**.

## Gestão da Evolution

```text
client/src/pages/painel/EvolutionPage.tsx
↓ api.evolution.*
client/src/lib/api.ts
↓ /api/integracoes/evolution/*
server/src/app.ts
↓ authenticate + requireAdmin
↓ server/src/routes/evolution.ts
↓ server/src/services/evolution.service.ts
├─ lê EVOLUTION_API_URL/API_KEY/INSTANCE_NAME
├─ fetch para Evolution
└─ lê/grava Configuracao via Prisma quando aplicável
```

Operações reais: status, criar, conectar, reconectar, desconectar, excluir instância, nome de exibição, mensagens, envio automático e regras.

## Configurações públicas

```text
client/src/pages/HomePage.tsx
↓ api.configuracoes.publico
GET /api/configuracoes-publicas
↓ server/src/app.ts
↓ prisma.configuracao.findFirst
↓ telefoneWhatsApp + email + instagram
```

## Configurações administrativas de contato

```text
client/src/pages/painel/WhatsAppConfigPage.tsx
↓ api.configuracoes.get/update
GET/PUT /api/configuracoes
↓ authenticate + requireAdmin
↓ server/src/routes/configuracoes.ts
├─ valida WhatsApp, e-mail e Instagram
└─ prisma.configuracao.findFirst + update/create
```

Apesar do nome da página, ela configura contatos públicos; a gestão da instância WhatsApp está em `EvolutionPage.tsx`.

## Regras de negócio configuráveis

```text
client/src/pages/painel/RegrasNegocioPage.tsx
↓ client/src/pages/painel/useRegrasNegocio.ts
↓ api.configuracoes.regras/salvarRegras
GET/PUT /api/configuracoes/regras
↓ routes/configuracoes.ts
↓ Prisma/Configuracao
```

Campos atuais:

- `antecedenciaCancelamentoHoras`;
- `antecedenciaRemarcacaoHoras`;
- `antecedenciaAgendamentoMinutos`;
- `toleranciaAtrasoMinutos`.

Consumidores no backend ficam em `server/src/services/regras-agendamento.service.ts` e na rota de disponibilidade.

## Dashboard administrativo

```text
client/src/pages/painel/DashboardPage.tsx
↓ Promise.all
├─ api.agendamentos.list
├─ api.usuarios.list
├─ api.profissionais.listAdmin
└─ api.evolution.status
↓
cálculos useMemo no frontend
↓ métricas, receita, próximos atendimentos e estado WhatsApp
```

Não existe endpoint específico de dashboard; a página agrega endpoints existentes no cliente.

## Acessibilidade global

```text
client/src/App.tsx
├─ SkipToContent.tsx
├─ AcessibilidadeControls.tsx
│  └─ hooks/useSpeechSynthesis.ts
├─ KeyboardArrowNavigation.tsx
├─ VLibras.tsx
└─ styles/index.css
   ├─ foco de teclado
   ├─ fonte grande
   ├─ redução de animação
   └─ alto contraste
```

Preferências de acessibilidade são persistidas no dispositivo. VLibras é ocultado no painel pelo componente atual.
