# Status da refatoração

## Etapa atual

Etapa 9 — em andamento.

Subetapas 9A, 9B e 9C — concluídas.

## Concluído

- análise inicial;
- documentação da refatoração;
- plano inicial;
- validação da linha de base em `08-linha-base.md`;
- organização do fluxo de autenticação e usuários;
- organização do domínio de serviços oferecidos pela barbearia;
- organização da disponibilidade dos profissionais.
- organização da criação do agendamento no backend.
- organização do cancelamento, remarcação, status e histórico.
- organização do frontend público de agendamento.
- organização do frontend administrativo de agendamento;
- organização da estrutura e navegação do painel administrativo.
- organização da área pessoal do cliente.

## Em andamento

Nenhuma alteração desta etapa pendente.

## Próxima etapa

Etapa 8 — Configurações, notificações e Evolution.

## Pendências

- configurações, notificações e Evolution;
- padronização final e retirada dos testes;
- validação final e guia do TCC.

## Alterações importantes

- builds, typechecks, lint e testes unitários/HTTP passaram;
- dois testes de integração de agendamento falharam e estão registrados em `08-linha-base.md`;
- o fluxo de autenticação foi organizado em funções nomeadas na rota, sem criar camada repassadora;
- o contexto de autenticação do frontend foi formatado para separar restauração de sessão, login, cadastro e logout;
- a rota de serviços passou a validar nome, descrição, preço, duração e status no backend;
- a View administrativa de serviços passou a usar nomes mais descritivos para carregamento, edição, salvamento e desativação;
- o serviço continua sendo desativado logicamente e serviços públicos continuam limitados aos ativos;
- não houve alteração em schema, migrations, dependências ou testes;
- a verificação manual confirmou `/api/health`, listagem pública de serviços e rejeição de criação sem autenticação;
- a regra de disponibilidade permanece centralizada em `server/src/services/horarios.service.ts`;
- nomes internos de conversão de horários e dia da semana foram padronizados em português, mantendo aliases compatíveis;
- foram preservadas a duração em blocos de 30 minutos, a consulta de agendamentos não cancelados e a seleção sem preferência;
- a criação de agendamento foi extraída para `server/src/services/criacao-agendamento.service.ts`;
- a rota de agendamentos ficou responsável pela entrada, validação inicial, resposta e notificação pós-criação;
- foram preservados repetição, token de confirmação, lock transacional, validação final e persistência no Prisma;
- cancelamento, remarcação, status e histórico foram organizados em `server/src/services/manutencao-agendamento.service.ts`;
- a remarcação mantém lock, validação final de disponibilidade e registro de histórico;
- permissões, antecedência e respostas HTTP continuam na rota;
- não houve alteração em schema, migrations, frontend ou testes;
- os testes específicos da rota passaram e as duas falhas de integração de agendamento permaneceram iguais à linha de base.
- a página pública foi renomeada para `PaginaAgendamento.tsx`, mantendo `AgendarPage.tsx` como compatibilidade;
- a coordenação de estado, carregamento, disponibilidade e confirmação foi extraída para `useAgendamentoPublico.ts`;
- os testes da página pública passaram e o build/typecheck/lint permaneceram verdes;
- a inicialização do frontend ficou bloqueada nesta execução por `ENOSPC` do limite de file watchers do ambiente; o backend iniciou normalmente;
- as duas falhas de integração de agendamento permaneceram iguais à linha de base.
- a coordenação do wizard administrativo foi extraída para `client/src/pages/painel/useAgendamentoAdministrativo.ts`;
- `NovoAgendamentoWizard.tsx` ficou responsável pela composição visual das cinco etapas e mantém a criação administrativa;
- edição e remarcação continuam separadas em `AgendamentosPage.tsx`;
- o fluxo administrativo preserva seleção de cliente, profissional, serviço, disponibilidade, confirmação de repetição e criação pela API existente;
- o teste específico do wizard, build e lint passaram; o backend iniciou normalmente e o frontend continuou bloqueado por `ENOSPC` no limite de file watchers;
- os dois testes de integração de agendamento continuam com exatamente as falhas conhecidas da linha de base.
- a proteção das rotas administrativas foi reorganizada em `client/src/components/ProtectedRoute.tsx`, preservando os redirecionamentos existentes;
- a navegação e o logout do painel foram clarificados em `client/src/pages/PainelPage.tsx` e `client/src/components/layout/Sidebar.tsx`;
- as páginas administrativas existentes continuam organizadas por rota: dashboard, agenda, clientes, serviços, profissionais, configurações, regras de negócio e WhatsApp;
- build, typecheck, lint e testes existentes passaram; o backend iniciou normalmente;
- o frontend iniciou e ficou pronto, mas encerrou por `ENOSPC` ao atingir o limite de file watchers do ambiente;
- não houve alteração em backend, schema, migrations, dependências, regras de domínio ou testes.
- a área pessoal passou a concentrar a coordenação de perfil em `client/src/pages/user/useMinhaConta.ts`;
- listagem, cancelamento, remarcação, disponibilidade e histórico do cliente foram organizados em `client/src/pages/user/useAgendamentosCliente.ts`;
- `MinhaContaPage.tsx` e `UserAppointmentsPage.tsx` continuam responsáveis pela View e preservam os contratos da API;
- foram preservados `UserRoute`, `cadastroConcluido`, retorno após conclusão de cadastro, logout e proteção das rotas;
- build, typecheck e lint passaram; testes frontend (69) e backend (88) passaram;
- o backend iniciou normalmente; o frontend iniciou, mas encerrou por `ENOSPC` no limite de file watchers;
- `AgendamentosPage.tsx` permanece grande e deve ser reavaliado antes da padronização final;
- não houve alteração em backend, schema, migrations, dependências ou testes.
- 7C — Agenda administrativa concluída: o carregamento de agendamentos, clientes, profissionais, serviços e atualização de atrasados foi extraído para `client/src/pages/painel/useAgendaAdministrativa.ts`;
- `AgendamentosPage.tsx` continua compondo filtros, visualizações, criação, edição, cancelamento, status e histórico, sem reabrir as regras backend;
- os testes específicos da agenda passaram, assim como build, lint e testes frontend/backend;
- o backend iniciou normalmente; o frontend continuou limitado por `ENOSPC` no file watcher;
- `AgendamentosPage.tsx` permanece grande e deve ser reavaliado antes da padronização final.
- 8A — Configurações e regras de negócio concluída;
- a coordenação da View de regras foi extraída para `client/src/pages/painel/useRegrasNegocio.ts`;
- foram preservadas as quatro configurações reais: antecedência de cancelamento, antecedência de remarcação, antecedência mínima de agendamento e tolerância de atraso;
- leitura e atualização continuam usando `/api/configuracoes/regras`, com validação administrativa no backend;
- `regras-agendamento.service.ts` continua sendo a origem das decisões de antecedência e atualização de atrasados;
- build, typecheck, lint e testes frontend/backend passaram; o backend iniciou normalmente;
- o frontend continuou limitado por `ENOSPC` no limite de file watchers;
- a próxima subetapa é 8B — Notificações e Evolution/WhatsApp. A Etapa 8 ainda não está concluída.
- 8B — Notificações e integração Evolution/WhatsApp concluída;
- a montagem de mensagens foi extraída para `server/src/services/mensagem-notificacao.service.ts`;
- `notificacao.service.ts` continua decidindo eventos, envio automático e persistência dos resultados;
- `evolution.service.ts` permanece responsável pela integração externa, status, instância, autenticação por ambiente e tratamento de respostas;
- foram preservados os eventos de criação, remarcação, cancelamento, atualização de status e lembretes;
- build, typecheck, lint e testes frontend/backend passaram; nenhum envio real foi executado;
- o backend iniciou normalmente e o frontend continuou limitado por `ENOSPC` no limite de file watchers;
- a próxima etapa é a Etapa 9 — Padronização final e retirada dos testes.
- 9A — foram renomeados `agenda-lock.service.ts` para `bloqueio-agenda.service.ts`, `funcionarios.types.ts` para `tiposFuncionarios.ts` e `funcionarios.utils.ts` para `utilitariosFuncionarios.ts`;
- o callback próprio `submit` da página de login foi renomeado para `enviarFormulario`;
- endpoints, contratos externos, Evolution, WhatsApp, JWT, Prisma e nomes obrigatórios de bibliotecas foram preservados;
- o wrapper `client/src/pages/agendar/AgendarPage.tsx` foi mantido porque ainda é referenciado pelo teste existente; a rota continua apontando para o wrapper de compatibilidade;
- busca global não encontrou referências de produção aos nomes antigos dos arquivos renomeados;
- build, typecheck, lint e testes existentes passaram;
- a próxima subetapa é 9B — Remoção dos testes automatizados.
- 9B — testes automatizados e infraestrutura exclusiva removidos;
- foram removidos testes frontend, backend, HTTP e integração, além de setup, configurações Vitest e arquivos auxiliares exclusivos;
- foram removidas as dependências exclusivas de teste e scripts de teste dos três `package.json`, com lockfiles atualizados pelo npm;
- o wrapper `client/src/pages/agendar/AgendarPage.tsx` foi removido após a rota ser apontada diretamente para `PaginaAgendamento`;
- foram preservadas validações, autenticação, autorização, regras de negócio, Prisma, tratamento de erros e serviços da aplicação;
- build, typecheck, lint, geração do Prisma, backend, `/api/health` e frontend passaram;
- a próxima subetapa é 9C — Limpeza estrutural e código morto.
- 9C — limpeza estrutural e código morto concluída;
- removido o wrapper órfão `client/src/pages/agendar/AgendarPage.tsx` após a rota usar diretamente `PaginaAgendamento`;
- removida a dependência sem uso `react-router-dom` e atualizado o lockfile pelo npm;
- removidas também as dependências sem uso `react-icons` e `zustand`, após confirmação de ausência de imports e configuração dependente;
- removido comentário temporário de desenvolvimento em `HorariosModal.tsx`;
- confirmada a ausência de referências de produção a testes, nomes antigos, scripts órfãos e marcadores TODO/FIXME/TEMP/HACK;
- preservados migrations, schema, Prisma, integrações, validações, autenticação, autorização, locks, conflitos e tratamento de erros;
- build, typecheck, lint, Prisma generate, backend, `/api/health` e frontend passaram;
- a próxima subetapa é 9D — Revisão final de legibilidade e arquivos grandes.

## Validação manual em localhost

- Backend iniciado em `http://localhost:3002` e frontend em `http://localhost:5000`.
- Prisma Client gerado e conexão do servidor validada pelo funcionamento da API.
- `/api/health` respondeu `200`.
- Rotas públicas de configuração, serviços e profissionais responderam corretamente.
- Rotas frontend `/`, `/login`, `/agendamento`, `/minha-conta`, `/minha-conta/agendamentos`, `/painel` e principais rotas internas retornaram `200`.
- Endpoints protegidos de usuário, agendamentos, regras e Evolution retornaram `401` sem autenticação, conforme esperado.
- A consulta de disponibilidade sem parâmetros retornou `400` com validação clara.
- Não foram executadas operações destrutivas, mensagens reais ou alterações de dados.
- Não foi possível realizar cliques e fluxos completos de autenticação/agendamento porque não havia navegador CUA disponível nesta sessão.
- Pendentes: validação interativa de cadastro, login, logout, agendamento, área do cliente, painel e configuração persistida.
