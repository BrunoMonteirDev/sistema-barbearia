# Plano incremental de refatoração do backend

## Regra principal

> Refatorar sem alterar comportamento.

Cada etapa deve preservar endpoints, autenticação, autorização, status HTTP, payloads, mensagens, persistência e efeitos externos. Mudanças funcionais descobertas durante a refatoração devem ser registradas, mas implementadas em tarefa separada.

## Método de execução de cada etapa

1. Registrar o comportamento observável e os contratos atuais.
2. Criar characterization tests quando houver infraestrutura de teste disponível.
3. Extrair primeiro o repository, mantendo a chamada antiga funcionando.
4. Extrair o controller e deixar a route declarativa.
5. Mover regras para o service sem reescrevê-las.
6. Executar build, testes disponíveis e validação manual do domínio.
7. Comparar respostas antes/depois.
8. Atualizar estes documentos e o status.

Não misturar na mesma etapa:

- mudança estrutural e correção de bug;
- backend e migração visual ampla;
- renomeação de contrato e extração de camada;
- alteração de schema/migration e reorganização de arquivos.

## Etapa 1 — preparação e baseline

### Arquivos atuais envolvidos

- `package.json`
- `client/package.json`
- `server/package.json`
- `server/src/app.ts`
- `server/src/index.ts`
- `server/prisma/schema.prisma`
- todos os arquivos em `server/src/routes/`
- `client/src/lib/api.ts`
- documentação em `docs/refatoracao/`

### Problema atual

- o worktree analisado já contém muitas alterações não relacionadas, inclusive em `node_modules` e exclusões de testes;
- não há scripts de teste nos `package.json` atuais;
- o proxy do Vite aponta para 3002, mas o backend assume 3001 sem `PORT`;
- faltam snapshots simples dos contratos HTTP;
- alguns fluxos dependem de PostgreSQL, Google e Evolution.

### Destino desejado

Uma linha de base repetível antes de mover responsabilidades.

### Arquivos que provavelmente serão criados

- testes de caracterização por rota, somente quando a infraestrutura for decidida;
- possível documento de matriz de endpoints/respostas;
- fixtures mínimas de desenvolvimento/teste, se necessárias.

### Arquivos que podem ser alterados

- scripts dos `package.json` para restaurar validações automatizadas;
- configuração de testes;
- documentação.

Não alterar runtime só para “arrumar” o baseline.

### Responsabilidades movidas

Nenhuma. Esta etapa mede e registra.

### Riscos

- confundir falhas preexistentes com regressões;
- incluir mudanças alheias no commit;
- depender de dados locais não reproduzíveis;
- vazar segredos de `.env` em fixtures ou documentação.

### Como validar

- registrar `git status --short` antes de iniciar;
- rodar builds atuais de client e server;
- verificar health check;
- executar manualmente login, listagens e um ciclo de agendamento em ambiente seguro;
- guardar exemplos de status/payload sem dados pessoais.

### Critério de conclusão

- baseline documentado;
- comandos de validação conhecidos;
- alterações preexistentes separadas da refatoração;
- nenhum comportamento modificado.

## Etapa 2 — autenticação e usuários

### Arquivos atuais envolvidos

- `server/src/routes/auth.ts`
- `server/src/routes/usuarios.ts`
- `server/src/services/usuario.service.ts`
- `server/src/services/senha.service.ts`
- `server/src/middlewares/auth.ts`
- `server/src/types/express.d.ts`
- `client/src/contexts/AuthContext.tsx`
- `client/src/pages/LoginPage.tsx`
- `client/src/pages/user/CompleteRegistrationPage.tsx`
- `client/src/pages/user/MinhaContaPage.tsx`
- `client/src/pages/user/useMinhaConta.ts`
- `client/src/pages/painel/ClientesPage.tsx`
- `client/src/lib/api.ts`

### Problema atual

- `auth.ts` mistura HTTP, regras locais, Google, bcrypt e JWT;
- `usuarios.ts` mistura mapeamento de contrato, validação e controller;
- `usuario.service.ts` mistura regra/hash e Prisma;
- papéis aceitos em `requireStaff` divergem da tipagem de `req.auth`;
- payload de usuário pode conter detalhes além do necessário em algumas listagens;
- política de senha é duplicada no frontend para feedback.

### Destino desejado

```text
auth.routes → auth.controller → auth.service → usuario.repository
usuarios.routes → usuario.controller → usuario.service → usuario.repository
```

### Arquivos que provavelmente serão criados

- `server/src/controllers/auth.controller.ts`
- `server/src/controllers/usuario.controller.ts`
- `server/src/repositories/usuario.repository.ts`
- possíveis tipos em `server/src/models/auth.ts` e `usuario.ts`, somente se reutilizados.

### Arquivos que podem ser alterados

- os cinco arquivos atuais do backend listados acima;
- `server/src/app.ts` apenas se a montagem precisar referenciar novas exports;
- testes e documentação.

### Responsabilidades a mover

- leitura de Request/Response e status HTTP → controllers;
- autenticação local, Google, cadastro e hash → services;
- `findUnique`, `create`, `update`, `findMany` → repository;
- mapeamento seguro de usuário → função/DTO compartilhado do domínio.

### Riscos

- alterar acidentalmente token, validade de oito horas ou campos da resposta;
- mudar reativação/vinculação de conta Google;
- expor `senhaHash`;
- mudar a desativação lógica;
- “corrigir” níveis durante refatoração e quebrar autorização.

### Como validar

- login local válido e inválido;
- cadastro válido, senha inválida e e-mail repetido;
- login Google: novo usuário, e-mail existente, conta inativa e cadastro incompleto;
- restauração da sessão por `/usuarios/me`;
- edição e exclusão da própria conta;
- CRUD administrativo de clientes;
- respostas 401 e 403 atuais.

### Critério de conclusão

- routes sem regra e sem Prisma;
- controllers sem Prisma;
- repository concentra persistência de usuário;
- todos os fluxos acima preservados.

## Etapa 3 — serviços da barbearia

### Arquivos atuais envolvidos

- `server/src/routes/servicos.ts`
- `client/src/pages/painel/ServicosAdminPage.tsx`
- `client/src/pages/agendar/useAgendamentoPublico.ts`
- `client/src/lib/api.ts`

### Problema atual

`routes/servicos.ts` concentra validação, controller, regra de desativação e Prisma.

### Destino desejado

```text
servicos.routes
→ ServicoController
→ ServicoService
→ ServicoRepository
→ Prisma
```

### Arquivos que provavelmente serão criados

- `server/src/controllers/servico.controller.ts`
- `server/src/services/servico.service.ts`
- `server/src/repositories/servico.repository.ts`
- `server/src/models/servico.ts`, apenas se o tipo de entrada for compartilhado.

### Arquivos que podem ser alterados

- `server/src/routes/servicos.ts`
- `server/src/app.ts`, se necessário;
- testes e documentação.

### Responsabilidades a mover

- extração de body/resposta → controller;
- validação de nome, descrição, preço, duração e ativo → service;
- CRUD e filtro de ativos → repository;
- decisão de desativar no `DELETE` → service.

### Riscos

- Prisma `Decimal` mudar de serialização;
- atualização parcial passar a apagar campos;
- `GET` passar a incluir inativos;
- `DELETE` virar exclusão física.

### Como validar

- listagem pública;
- create/update/delete como admin;
- bloqueio para cliente/anônimo;
- validações de nome, preço e duração;
- serviço desativado deixa de aparecer na listagem pública.

### Critério de conclusão

- contrato idêntico;
- route declarativa;
- nenhuma chamada Prisma fora do repository do domínio;
- domínio aprovado como padrão-piloto simples.

## Etapa 4 — profissionais

### Arquivos atuais envolvidos

- `server/src/routes/profissionais.ts`
- `client/src/pages/painel/FuncionariosPage.tsx`
- `client/src/pages/agendar/useAgendamentoPublico.ts`
- `client/src/lib/api.ts`

### Problema atual

CRUD, normalização, validação e Prisma estão no router. A nomenclatura frontend “funcionário” difere do domínio persistido “profissional”.

### Destino desejado

```text
profissionais.routes
→ ProfissionalController
→ ProfissionalService
→ ProfissionalRepository
→ Prisma
```

### Arquivos que provavelmente serão criados

- `server/src/controllers/profissional.controller.ts`
- `server/src/services/profissional.service.ts`
- `server/src/repositories/profissional.repository.ts`

### Arquivos que podem ser alterados

- `server/src/routes/profissionais.ts`
- testes e documentação.

Renomear arquivos/telas não faz parte desta etapa.

### Responsabilidades a mover

- normalização de telefone/e-mail e validação → service;
- persistência e filtros ativo/todos → repository;
- resposta/status → controller.

### Riscos

- mudar exigência atual de nome, telefone e e-mail;
- omitir inativos na listagem administrativa;
- transformar desativação em delete;
- confundir `Profissional` com `Usuario` de nível funcionário.

### Como validar

- listagem pública e administrativa;
- cadastro, edição e desativação;
- e-mail duplicado;
- profissional desativado fora do agendamento público;
- histórico de agendamentos preservado.

### Critério de conclusão

- CRUD separado nas três camadas;
- conceitos `Profissional` e `Usuario` documentados sem tentativa de unificação nesta refatoração.

## Etapa 5 — disponibilidade

### Arquivos atuais envolvidos

- trechos de `server/src/routes/profissionais.ts`
- `server/src/services/horarios.service.ts`
- `server/src/services/bloqueio-agenda.service.ts`
- `client/src/pages/painel/FuncionariosPage.tsx`
- `client/src/utils/horarios.ts`

### Problema atual

- endpoints de disponibilidade ficam misturados ao CRUD de profissional;
- a route transforma, valida e substitui blocos via Prisma;
- `horarios.service.ts` combina cálculos puros e consultas;
- parte dos cálculos existe também no frontend.

### Destino desejado

```text
DisponibilidadeController
→ DisponibilidadeService
→ DisponibilidadeRepository
→ Prisma

HorariosService
→ cálculos de encaixe + coordenação de consultas
```

Os endpoints podem continuar no router `/profissionais` para não mudar a API.

### Arquivos que provavelmente serão criados

- `server/src/controllers/disponibilidade.controller.ts`
- `server/src/services/disponibilidade.service.ts`
- `server/src/repositories/disponibilidade.repository.ts`

### Arquivos que podem ser alterados

- `server/src/routes/profissionais.ts`
- `server/src/services/horarios.service.ts`
- testes e documentação.

### Responsabilidades a mover

- validação do mapa de dias/blocos → service;
- substituição transacional → repository;
- cálculo puro de blocos pode permanecer em `horarios.service.ts` ou utilitário de domínio;
- queries de disponibilidade/agendamentos → repositories apropriados.

### Riscos

- mudar a substituição completa da semana;
- alterar deduplicação de horários;
- mudar representação do dia `0..6`;
- quebrar blocos de 30 minutos ou duração arredondada;
- introduzir consultas excessivas.

### Como validar

- salvar semana vazia, parcial e completa;
- copiar dia/semana pela UI;
- rejeitar dias/horários inválidos;
- consultar horários para serviços de 30, 60 e durações não múltiplas de 30;
- confirmar que cancelados não bloqueiam e ativos bloqueiam sobreposição.

### Critério de conclusão

- persistência fora das routes/services de cálculo;
- mesmos horários retornados para um conjunto conhecido de dados.

## Etapa 6 — agendamentos

### Arquivos atuais envolvidos

- `server/src/routes/agendamentos.ts`
- todos os services de agenda em `server/src/services/`
- `server/prisma/schema.prisma` apenas como referência, sem mudança
- `client/src/pages/agendar/useAgendamentoPublico.ts`
- `client/src/pages/painel/AgendamentosPage.tsx`
- `client/src/pages/painel/useAgendaAdministrativa.ts`
- `client/src/pages/painel/useAgendamentoAdministrativo.ts`
- `client/src/pages/user/useAgendamentosCliente.ts`
- `client/src/lib/api.ts`

### Problema atual

- maior concentração de complexidade do backend;
- Prisma ainda aparece em route e vários services;
- mensagens de erro são usadas como identificadores;
- autorização por recurso está misturada ao HTTP;
- atualização administrativa faz histórico na route;
- status atrasado tem critérios no frontend e backend;
- possível falha na autenticação de disponibilidade para remarcação.

### Destino desejado

```text
agendamentos.routes
→ AgendamentoController
→ CriacaoAgendamentoService / ManutencaoAgendamentoService / ConsultaAgendaService
→ AgendamentoRepository + repositories auxiliares
→ Prisma sob transação/lock quando necessário
```

### Arquivos que provavelmente serão criados

- `server/src/controllers/agendamento.controller.ts`
- `server/src/repositories/agendamento.repository.ts`
- possível `server/src/repositories/historico-agendamento.repository.ts`
- possíveis erros/tipos em `server/src/models/agendamento.ts`.

### Arquivos que podem ser alterados

- `server/src/routes/agendamentos.ts`
- services de agenda atuais;
- testes e documentação.

O frontend só deve mudar se for necessário para preservar o contrato; refatoração visual fica em outro plano.

### Responsabilidades a mover

- parsing e respostas → controller;
- busca/listagem/create/update/delete/histórico → repositories;
- autorização do dono/admin, antecedência e transições → services;
- mapeamento de erros conhecidos → controller;
- lock continua em infraestrutura de agenda, sem ser genericizado.

### Riscos

- concorrência e dupla reserva;
- intervalos de serviços longos;
- profissional “sem preferência”;
- confirmação de repetição expirar ou perder vínculo;
- histórico ficar fora da mesma garantia operacional atual;
- notificação disparar duas vezes ou deixar de disparar;
- mudar exclusão física administrativa;
- alterar diferenças atuais de antecedência para admin/cliente.

### Como validar

- criar como cliente e admin;
- criar com e sem preferência;
- conflito simultâneo no mesmo profissional/data;
- duração ocupando múltiplos blocos;
- cadastro Google incompleto;
- repetição: necessária, confirmada, inválida e expirada;
- listar como admin e cliente;
- cancelar/remarcar dentro e fora da antecedência;
- editar e excluir como admin;
- status e histórico;
- consulta de disponibilidade normal e com `ignorarAgendamentoId`;
- notificações acionadas nos mesmos pontos.

### Critério de conclusão

- route sem Prisma e com pouca lógica;
- services sem `Request/Response`;
- concorrência preservada por advisory lock;
- testes de caracterização dos fluxos críticos;
- nenhum contrato alterado.

## Etapa 7 — painel administrativo

### Arquivos atuais envolvidos

- `client/src/pages/PainelPage.tsx`
- `client/src/pages/painel/DashboardPage.tsx`
- `client/src/pages/painel/AgendamentosPage.tsx`
- `client/src/pages/painel/NovoAgendamentoWizard.tsx`
- hooks em `client/src/pages/painel/`
- `client/src/components/layout/Sidebar.tsx`
- `client/src/lib/api.ts`

### Problema atual

- `AgendamentosPage.tsx` tem 746 linhas e duas representações de agenda;
- alguns hooks existem, mas parte relevante permanece na página;
- há lógica semelhante de criação em mais de um caminho;
- JSX em linhas extensas dificulta leitura e apresentação.

### Destino desejado

Páginas como composição, componentes menores por função e services de API por domínio. Não criar MVC no React.

### Arquivos que provavelmente serão criados

- componentes de agenda diária/semanal, filtros, detalhes e formulário;
- service frontend de agendamentos;
- modelos frontend por domínio;
- CSS local conforme `04-PLANO-TAILWIND-PARA-CSS.md`.

### Arquivos que podem ser alterados

- páginas/hooks do painel;
- `client/src/lib/api.ts` por extração gradual;
- arquivos de CSS locais.

### Responsabilidades a mover

- blocos visuais → componentes;
- coordenação de estado → hooks quando reduzir a página;
- HTTP → services;
- formatação repetida → utilitários pequenos;
- aparência → CSS.

### Riscos

- mudar atalhos, filtros, ações por status ou acessibilidade;
- duplicar chamadas HTTP;
- perder foco/estado de modais;
- tentar resolver regra backend no frontend.

### Como validar

- navegar em todas as rotas do painel;
- comparar listas, filtros, visões e modais;
- criar/editar/cancelar/concluir/excluir;
- validar teclado, foco, leitor e layouts responsivos.

### Critério de conclusão

- páginas principais explicáveis de cima para baixo;
- componentes com responsabilidade clara;
- mesmas chamadas e comportamento visual equivalente.

## Etapa 8 — área do cliente

### Arquivos atuais envolvidos

- `client/src/pages/user/MinhaContaPage.tsx`
- `client/src/pages/user/UserAppointmentsPage.tsx`
- `client/src/pages/user/CompleteRegistrationPage.tsx`
- hooks correspondentes;
- `client/src/components/ResumoAgendamentosCliente.tsx`
- `client/src/contexts/AuthContext.tsx`

### Problema atual

- formatação/status repetidos;
- componentes compactados em linhas extensas;
- resumo e lista consultam agendamentos separadamente;
- fluxo de remarcação depende do ponto de autenticação indicado como dúvida.

### Destino desejado

Views pequenas, hooks de interação e service de usuário/agendamento compartilhado.

### Arquivos que provavelmente serão criados

- CSS por página;
- componentes de cartão/histórico/remarcação se houver responsabilidade real;
- modelos/services extraídos de `api.ts`.

### Arquivos que podem ser alterados

- todos os arquivos listados nesta etapa.

### Responsabilidades a mover

- apresentação repetida de agendamento → componente/utilitário;
- HTTP → services;
- CSS utilitário → arquivos locais.

### Riscos

- quebrar redirecionamento após Google;
- perder retorno para revisão do agendamento;
- alterar cancelamento/remarcação;
- regressão de sessão e exclusão da conta.

### Como validar

- perfil, edição e exclusão;
- cadastro complementar;
- lista, histórico, cancelamento e remarcação;
- retorno entre login, revisão e conta;
- acessibilidade.

### Critério de conclusão

- todos os fluxos preservados e arquivos visualmente legíveis.

## Etapa 9 — notificações

### Arquivos atuais envolvidos

- `server/src/services/notificacao.service.ts`
- `server/src/services/mensagem-notificacao.service.ts`
- `server/src/index.ts`
- rota de notificação em `server/src/routes/agendamentos.ts`
- models `NotificacaoAgendamento` e `Agendamento` no schema.

### Problema atual

- Prisma está no service;
- scheduler está acoplado à inicialização do processo;
- não há trava visível contra duas execuções do lembrete em múltiplas instâncias;
- envio disparado com `void` não é aguardado nas mutações;
- montagem da mensagem depende do service Evolution para obter modelos.

### Destino desejado

```text
NotificacaoController, para envio manual
→ NotificacaoService
→ NotificacaoRepository
→ EvolutionService/Client
```

O scheduler pode continuar simples no `index.ts` durante a refatoração, preservando comportamento.

### Arquivos que provavelmente serão criados

- `server/src/repositories/notificacao.repository.ts`
- controller separado apenas se a rota manual deixar o controller de agendamento mais claro.

### Arquivos que podem ser alterados

- services atuais, controller/route de agendamento e documentação.

### Responsabilidades a mover

- queries e registros de tentativa → repository;
- decisão/tipo/destino → service;
- HTTP manual → controller.

### Riscos

- envio duplicado;
- perda do registro `IGNORADA`, `PENDENTE_CONFIGURACAO`, `ENVIADA` ou `FALHOU`;
- diferença de fuso no lembrete;
- mudar comportamento assíncrono.

### Como validar

- cliente sem telefone;
- Evolution sem configuração;
- envio bem-sucedido e falho;
- cada tipo de mensagem;
- lembrete na janela configurada e idempotência observada.

### Critério de conclusão

- persistência separada;
- mesmos registros e chamadas externas;
- scheduler documentado.

## Etapa 10 — Evolution/WhatsApp

### Arquivos atuais envolvidos

- `server/src/routes/evolution.ts`
- `server/src/services/evolution.service.ts`
- `client/src/pages/painel/EvolutionPage.tsx`
- `client/src/pages/painel/WhatsAppConfigPage.tsx`
- `client/src/lib/api.ts`
- `.env.evolution.example`
- `docker-compose.evolution.yml`

### Problema atual

O service une cliente HTTP externo, configuração de ambiente, modelos/regras de mensagem e persistência Prisma.

### Destino desejado

```text
EvolutionController
→ EvolutionService
→ EvolutionClient para HTTP externo
→ ConfiguracaoRepository para persistência
```

### Arquivos que provavelmente serão criados

- `server/src/controllers/evolution.controller.ts`
- `server/src/lib/evolution-client.ts`
- uso de `server/src/repositories/configuracao.repository.ts`

### Arquivos que podem ser alterados

- route/service atuais;
- testes e documentação.

### Responsabilidades a mover

- Request/Response → controller;
- `fetch`, headers e parsing Evolution → client;
- modelos, regras e coordenação → service;
- Prisma → repository.

### Riscos

- mudar paths/métodos esperados pela versão da Evolution;
- expor API key;
- alterar defaults das mensagens/regras;
- perder estado quando não existe linha em `Configuracao`.

### Como validar

- status sem configuração e com serviço indisponível;
- criar, conectar, reconectar, desconectar e excluir instância;
- QR/pairing code;
- nome de exibição;
- modelos e regras de envio;
- envio real em ambiente autorizado — **necessita validação externa**.

### Critério de conclusão

- route curta;
- service sem detalhes HTTP/Prisma;
- cliente externo isolado sem abstração genérica desnecessária.

## Etapa 11 — configurações

### Arquivos atuais envolvidos

- `server/src/app.ts`, rota pública;
- `server/src/routes/configuracoes.ts`;
- `server/src/services/regras-agendamento.service.ts`;
- partes de `server/src/services/evolution.service.ts`;
- `client/src/pages/painel/WhatsAppConfigPage.tsx`;
- `client/src/pages/painel/RegrasNegocioPage.tsx`;
- `client/src/pages/painel/useRegrasNegocio.ts`;
- `client/src/pages/HomePage.tsx`.

### Problema atual

Acesso a `Configuracao` está espalhado por app, route e services.

### Destino desejado

```text
ConfiguracaoController
→ ConfiguracaoService
→ ConfiguracaoRepository
→ Prisma
```

### Arquivos que provavelmente serão criados

- `server/src/controllers/configuracao.controller.ts`
- `server/src/services/configuracao.service.ts`
- `server/src/repositories/configuracao.repository.ts`

### Arquivos que podem ser alterados

- todos os consumidores backend de `prisma.configuracao`;
- route pública pode ir para o controller sem mudar o caminho.

### Responsabilidades a mover

- obter/criar registro único → repository/service;
- validações e defaults → service;
- resposta pública reduzida → controller.

### Riscos

- criar múltiplas linhas de configuração;
- mudar defaults;
- expor campos administrativos na rota pública;
- alterar validação de contatos/regras.

### Como validar

- banco sem configuração e com configuração;
- contatos públicos;
- salvar contatos e regras;
- HomePage exibindo contatos;
- consumo por agenda e Evolution.

### Critério de conclusão

- um único ponto de persistência de configuração;
- projeção pública continua limitada.

## Etapa 12 — limpeza final

### Arquivos atuais envolvidos

Todo o repositório, com foco em imports, tipos, documentação e candidatos sem uso.

### Problema atual

Migrações incrementais deixam compatibilidades, aliases e arquivos temporariamente duplicados.

### Destino desejado

Estrutura consistente, sem camadas vazias, e documentação correspondente ao código final.

### Arquivos que provavelmente serão criados

Nenhum obrigatório.

### Arquivos que podem ser alterados

- imports e exports;
- tipos compartilhados;
- documentação;
- arquivos candidatos a remoção, somente após validação e autorização específica.

### Responsabilidades a mover

- remover apenas pontes temporárias cuja migração terminou;
- alinhar nomenclatura sem mudar contratos públicos.

### Riscos

- apagar código usado por carregamento indireto;
- misturar limpeza com mudança funcional;
- remover dependência ainda necessária;
- ampliar demais o commit final.

### Como validar

- busca por imports/exportações órfãs;
- build completo;
- suíte automatizada restaurada;
- smoke test de todos os fluxos;
- revisão de endpoints e schema;
- `git diff` focado e revisável.

### Critério de conclusão

- nenhum Prisma em routes/controllers;
- nenhuma dependência removida sem comprovação;
- possíveis arquivos mortos decididos explicitamente;
- documentação, checklist e status atualizados;
- comportamento preservado.

## Ordem recomendada

A ordem sugerida pelo objetivo foi validada contra o código real, com dois ajustes de entendimento:

1. serviços é o melhor domínio-piloto técnico, embora autenticação/usuários venha antes na lista funcional proposta;
2. notificações e Evolution devem permanecer depois de agendamentos porque são efeitos desse domínio e usam `Configuracao`.

Se a prioridade for reduzir risco e provar o padrão, iniciar por **serviços**. Se a prioridade acadêmica for seguir a narrativa do sistema, iniciar por **autenticação/usuários**, mas com escopo controlado.
