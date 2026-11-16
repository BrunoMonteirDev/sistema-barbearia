# Backlog técnico para atualização do artigo do TCC

Este documento registra o estado do código após a atualização funcional. Foi elaborado a partir dos arquivos do projeto. O artigo em `artigo/artigo-tcc.md` e seus diagramas não foram alterados nesta etapa.

## 1. Inventário funcional da versão atual

### Funcionalidades mantidas

- Cadastro e autenticação de usuários por senha e por Google; perfil, conclusão de cadastro e encerramento da própria conta.
- Controle de acesso por perfil. Clientes consultam e alteram os próprios dados e agendamentos; operações administrativas exigem perfil de administrador.
- Cadastro, consulta, edição e desativação de serviços e profissionais.
- Configuração da disponibilidade semanal de cada profissional em blocos de 30 minutos.
- Consulta pública de profissionais, serviços e horários; agendamento em etapas com profissional (ou sem preferência), serviço, data, horário e revisão.
- Cálculo de disponibilidade considerando blocos consecutivos necessários à duração do serviço, jornada do profissional, agendamentos ativos e horários passados. A criação revalida a disponibilidade no backend e sob lock transacional.
- Aviso de possível repetição de reserva do mesmo cliente na mesma data, com confirmação explícita assinada por token temporário.
- Área do cliente com lista e histórico de agendamentos e ação de cancelamento dentro do prazo configurado.
- Painel administrativo com indicadores do dia e do mês, agenda em lista, dia e semana, filtros e ações para confirmar, concluir e cancelar reservas. O administrador também pode criar reservas pelo assistente em etapas, selecionando o cliente.
- Administração de dados de contato públicos (telefone, e-mail e Instagram). As regras de antecedência de cancelamento, aviso para agendamento próximo e tolerância de atraso são fixas no código.
- Recursos de acessibilidade já existentes: tamanho de texto, alto contraste, redução de animações, navegação por teclado, salto para conteúdo, VLibras e leitura de textos por voz do navegador. Termos, privacidade e cookies também permanecem.

### Funcionalidades adicionadas

- Gestão administrativa de dias bloqueados: listar, criar com motivo e remover.
- Bloqueio aplicado na consulta de disponibilidade e na validação final de criação, inclusive quando a criação escolhe um profissional sem preferência.
- Unicidade de data no banco e recusa de bloqueio quando há reservas pendentes, confirmadas ou atrasadas. A gravação usa lock transacional por data para serializar-se com novas reservas.

### Funcionalidades modificadas

- Mudança de data, horário, profissional ou serviço deixou de ser uma edição de reserva existente. Para escolher outro período, é necessário cancelar a reserva e criar outra pelo fluxo normal de horários.
- O administrador deixou de ter formulário de edição direta, endpoint de atualização ou exclusão definitiva de agendamento. A agenda administrativa mostra detalhes e mantém ações de estado, confirmação, conclusão e cancelamento.
- O cliente deixou de ter ação e diálogo de remarcação. Depois de cancelar, usa “Novo agendamento”.
- Cancelamento aplica a mesma antecedência mínima de 24 horas a cliente e administrador. O administrador pode cancelar reservas de clientes, mas segue o mesmo prazo.
- A página e as rotas administrativas de regras de negócio foram removidas. Os valores fixos são 24 horas para cancelar, aviso de 30 minutos e tolerância de atraso de zero minutos.
- Reservas canceladas não podem ser reativadas por mudança de status; a API mantém o cancelamento como operação própria. Os endpoints de estado não aceitam definir `CANCELADO`.
- Os arquivos de acompanhamento do dashboard e das reservas foram retirados da integração de notificações.

### Funcionalidades removidas

- Notificações manuais e automáticas por WhatsApp: criação, confirmação, alteração, cancelamento e lembretes.
- Área do painel para parear/gerenciar Evolution, QR Code, modelos de mensagem, regras e envio automático; card de status da integração no dashboard; rotas, serviço de lembretes, repositórios, API de frontend e variáveis de ambiente exclusivas.
- Persistência de logs e configurações de mensagens de notificação. A migration nova elimina a tabela de notificações e os campos de configuração correspondentes.
- Rotas e controles para remarcação, edição direta e exclusão de agendamento pelo administrador.
- Testes automatizados, arquivos de teste, configuração do Vitest, scripts de teste e dependências exclusivas (`vitest` e `supertest`). Validações de runtime e de segurança foram mantidas.

O telefone de contato da barbearia e o link público para iniciar uma conversa continuam como dados de contato independentes. Eles não enviam notificações de agendamento nem usam a Evolution. Esta distinção deve ser explícita no artigo para não descrever o contato como integração operacional.

## 2. Regras de negócio vigentes

### Criação e disponibilidade

1. O cliente escolhe profissional (ou “sem preferência”), serviço e data; a interface apresenta apenas inícios de horário válidos em blocos de 30 minutos.
2. O serviço precisa caber integralmente na jornada configurada e não pode se sobrepor a reservas ativas. Horários passados são descartados. A antecedência mínima padrão para reserva é 30 minutos; quando aplicável, a interface solicita confirmação de que o cliente consegue chegar a tempo.
3. A revisão é aceita antes da confirmação. A criação requer autenticação; cadastro incompleto deve ser concluído antes de reservar.
4. A API repete a validação no momento da gravação, dentro de lock e transação, para evitar aceitar um horário que foi ocupado após a consulta.
5. Se o cliente já tiver reserva ativa na mesma data, o sistema apresenta a possível repetição e requer confirmação explícita com token temporário. Isso não ignora conflitos de horário.

### Cancelamento e alteração

- O cancelamento altera o status para `CANCELADO`, grava histórico e libera os blocos ocupados para consultas futuras.
- O prazo mínimo padrão é 24 horas. A regra vale para clientes e administradores; administradores podem atuar sobre reserva de outro usuário, mas não ignoram o prazo.
- Uma reserva existente não pode receber nova data, hora, profissional ou serviço. Cliente ou administrador cancela primeiro e cria uma nova reserva, que passa por todas as validações atuais.
- Status de reservas canceladas é terminal na API. A agenda administrativa permite confirmar, concluir ou marcar como atrasado reservas não canceladas.

### Bloqueio de datas

- Administradores gerenciam datas em `/painel/bloqueios`. Cada data aceita um motivo de até 180 caracteres.
- A data é única no banco. A API devolve conflito para duplicidade e impede o bloqueio se houver reservas `PENDENTE`, `CONFIRMADO` ou `ATRASADO` na data; primeiro é necessário tratá-las pelo fluxo existente.
- A consulta retorna listas de horários vazias para data bloqueada. O serviço de criação também valida o bloqueio no backend; ocultar horários no cliente não é a única proteção.
- A remoção do bloqueio reabre a data para consulta segundo as jornadas, durações e reservas restantes.

### Papéis

- Cliente: cria reserva para si, consulta e cancela as próprias reservas, dentro da antecedência configurada.
- Administrador: gerencia cadastros, disponibilidade semanal e contatos; visualiza a agenda geral, cria reservas em nome de clientes e pode confirmar, concluir, marcar atraso ou cancelar. Para cancelar, respeita a mesma antecedência. Não edita diretamente nem reativa uma reserva cancelada.

## 3. Arquitetura e tecnologias observadas no código

### Tecnologias

- JavaScript em módulos ES para frontend e backend.
- React e Vite no cliente, com `wouter` para rotas, `react-hot-toast` para mensagens, Lucide para ícones e CSS responsivo.
- Node.js e Express para API REST, `jsonwebtoken` para sessões JWT, `bcryptjs` para senha e `google-auth-library` para autenticação Google.
- PostgreSQL e Prisma ORM; `pg` e `@prisma/adapter-pg` para conexão. As migrations Prisma versionam a estrutura.
- ESLint para análise estática. Não há framework ou suíte de testes automatizados na configuração atual.

### Organização

- `src/frontend`: `pages` e `components` da interface, `contexts` de autenticação, `services` para chamadas HTTP, `lib` para transporte e tratamento de erros e `styles` compartilhados.
- `src/backend`: domínio separado em `auth`, `usuarios`, `profissionais`, `servicos`, `agendamentos`, `configuracoes`, `middlewares` e `lib`; os domínios usam rotas, controllers, services e repositories quando aplicável.
- `prisma/schema.prisma` e `prisma/migrations`: modelos e alterações do PostgreSQL.
- `scripts/check-backend.js`: verificação sintática dos arquivos JavaScript do backend usada pelo build.
- `docs/BACKLOG_ATUALIZACAO_TCC.md`: este inventário técnico, separado do artigo acadêmico.

### Modelos e relações no Prisma

- `Usuario`: credenciais/perfil e relação um-para-muitos com `Agendamento`; e-mail e identificador Google são únicos.
- `Profissional`: cadastro e relações com agendamentos e disponibilidade semanal.
- `Servico`: nome, duração, preço e estado ativo; relacionado aos agendamentos.
- `Agendamento`: referencia um usuário, profissional e serviço; contém data, hora, status e observação. Tem índice por profissional/data/hora e relação com histórico.
- `HistoricoAgendamento`: eventos e dados anteriores/novos associados a uma reserva; excluído em cascata com a reserva.
- `DisponibilidadeProfissional`: dia da semana e hora; combinação profissional/dia/hora é única.
- `BloqueioData` (adicionado): data única, motivo e data de criação. Não tem relação direta com agendamento; a regra de conflito é verificada pelo service no backend.
- `Configuracao`: dados gerais, telefone usado como contato público e e-mail/Instagram. Os campos antigos de limites permanecem no banco, mas as regras em execução são fixas no código. Os campos de notificação e antecedência de remarcação foram removidos do schema.

### Rotas principais

- `/api/auth`: login, cadastro e autenticação Google.
- `/api/usuarios`: perfil e conclusão de cadastro; listagem e manutenção administrativa exigem administrador.
- `/api/servicos` e `/api/profissionais`: consulta pública e manutenção administrativa. Profissionais também expõem e atualizam disponibilidade semanal.
- `/api/agendamentos`: listar, criar, consultar disponibilidade, cancelar, consultar histórico e alterar status (status somente para administrador). As rotas de remarcação, PUT de atualização, exclusão e notificação foram retiradas.
- `/api/bloqueios-data`: GET, POST e DELETE, todos atrás de autenticação e autorização de administrador.
- `/api/configuracoes`: contatos, atrás de autenticação e autorização de administrador; `/api/configuracoes-publicas` fornece os dados exibidos no site. A rota de edição de regras foi removida.

O frontend envia JSON à API por `src/frontend/lib/http.js`. O middleware Express autentica a maioria das rotas de agendamento; a consulta de disponibilidade é pública. Controllers traduzem resultados e erros HTTP; services concentram regras; repositories e Prisma acessam o banco. O Vite encaminha `/api` para o backend local na porta 3001.

## 4. Diagramas e figuras a revisar na próxima etapa

O artigo existente contém quatro SVGs: `problema-objetivo-resultado.svg`, `arquitetura-aplicacao.svg`, `fluxo-agendamento.svg` e `modelo-relacional.svg`, além de figuras previstas como capturas de telas.

| Figura/diagrama existente | Revisão necessária |
| --- | --- |
| Figura 1 — Problema, objetivo, sistema e resultado | Ajustar o escopo final para incluir prevenção de datas indisponíveis e explicitar que notificações automáticas não fazem parte do sistema entregue. |
| Figura 2 — Arquitetura | Retirar Evolution/WhatsApp, fila ou rotina de notificações e registrar o endpoint/área de bloqueios de data entre frontend, API e PostgreSQL. Atualizar TypeScript para JavaScript e não desenhar testes como camada executável. |
| Figuras 3–9 — Capturas e fluxo do cliente | Atualizar capturas para a interface atual. No fluxo, incluir verificação de data bloqueada na consulta e novamente na criação. A tela de revisão continua precedendo gravação. |
| Figura 10 — Área do cliente e histórico | Remover botão/diálogo “Remarcar”; mostrar cancelamento seguido de criação de nova reserva pelo fluxo comum. |
| Figuras 11–12 — Painel e agenda administrativa | Remover item/card de notificações e captura Evolution. Incluir item/tela “Dias bloqueados”. Mostrar ações de agenda sem edição direta e com cancelamento antes de nova reserva. |
| Figura 13 — Modelo relacional/DER | Adicionar `BloqueioData` com data única e motivo; remover entidade de notificações e colunas de modelos/regras de WhatsApp e antecedência de remarcação de `Configuracao`. Manter telefone como contato público, se esse recurso permanecer no artigo. |

O artigo atual não apresenta diagramas específicos de casos de uso, classes, atividades ou sequência. Se a banca exigir esses artefatos, candidatos úteis são: caso de uso “Gerenciar datas bloqueadas”; atividade de cancelamento seguido de nova reserva; sequência de consulta/criação com validação de bloqueio no backend; e sequência de criação de bloqueio com checagem de reservas ativas. Um diagrama de classes não é necessário para explicar o desenho MVC simples; o DER atualizado cobre as relações persistidas.

## 5. Possibilidades de expansão — não implementadas

### Notificações por WhatsApp

Como trabalho futuro, pode-se integrar uma API de WhatsApp para confirmação, lembrete, cancelamento e avisos de atendimento. A versão atual não envia notificações, não agenda lembretes e não possui integração Evolution; o telefone público é apenas um meio de contato iniciado pelo visitante.

### Agente de IA via WhatsApp e n8n

Outra evolução possível é um agente conversacional criado no n8n e integrado a uma API de WhatsApp. O agente poderia consultar disponibilidade e serviços, orientar sobre a jornada e iniciar agendamentos, além de consultar/cancelar reservas após autenticar e validar a identidade do cliente. As operações devem ser executadas pelo backend atual, que permanece autoridade sobre regras e dados. Esse módulo poderia ser oferecido separadamente como serviço comercial adicional para uma barbearia. A proposta é futura; não existe agente, workflow n8n ou integração desse tipo no código atual.

## 6. Seções do artigo que provavelmente precisam de atualização

| Seção atual | O que rever e por quê |
| --- | --- |
| Resumo e Abstract | Atualizar stack para JavaScript; retirar remarcação direta e testes automatizados; incluir bloqueio de datas e cancelamento seguido de nova reserva. Não afirmar notificações implementadas. |
| Introdução e objetivos | Manter o problema de organização de agenda, mas registrar prevenção de datas sem atendimento como parte do escopo e delimitar notificações automáticas como trabalho futuro. |
| Fundamentação teórica | Revisar apenas referências a teste automatizado, notificações e integrações na medida em que a implementação mudou; não atribuir ao sistema capacidades não entregues. |
| Materiais e métodos | Retirar a execução de Vitest/Supertest como procedimento vigente; descrever análise do código, build, lint e validações manuais que forem efetivamente realizadas e documentadas na próxima etapa. |
| Quadro de tecnologias | Substituir TypeScript por JavaScript e Vitest por ESLint/verificação sintática do build. Não chamar lint de teste funcional. |
| Requisitos e regras de negócio | Acrescentar CRUD de bloqueios e suas regras; remover remarcação, edição de data/hora existente e notificações de WhatsApp da lista entregue. Descrever cancelamento seguido de nova reserva e prazo igual para cliente/admin. |
| Desenvolvimento/implementação | Atualizar telas e fluxos do cliente e painel, rotas, serviços, banco e migration de bloqueios/remoção de notificações. Explicar que a criação valida disponibilidade no servidor. |
| Modelagem | Atualizar DER, schema e campos de `Configuracao`; registrar a unicidade de `BloqueioData.data` e remoção da persistência de notificações. |
| Apresentação das funcionalidades | Atualizar capturas e menu do painel; substituir tela de WhatsApp por “Dias bloqueados”; conservar telefone somente como contato, se mostrado. |
| Resultados e validação | Remover números e afirmações de testes automatizados como evidência atual. Apresentar somente evidências novas e reproduzíveis (build, lint, operação manual e migration aplicada) quando realmente realizadas. |
| Considerações finais | Rever alegações sobre remarcação, cobertura de testes e integração externa. Relatar limites reais e o novo recorte. |
| Trabalhos futuros | Incluir notificações por WhatsApp e agente IA via n8n como possibilidades futuras, deixando explícito que não estão implementados; mencionar o agente como módulo comercial adicional opcional. |

## 7. Arquivos técnicos de referência desta atualização

- Bloqueio: `src/backend/agendamentos/bloqueio-data.{routes,controller,service}.js`, `src/frontend/pages/painel/BloqueiosDataPage.{jsx,css}`, `src/frontend/services/bloqueios.api.js`, `src/backend/agendamentos/disponibilidade.service.js`, `src/backend/agendamentos/horarios.service.js`, `prisma/schema.prisma` e a migration `20261116000000_bloqueios_datas_remover_notificacoes`.
- Cancelamento e criação: `src/backend/agendamentos/agendamento.routes.js`, `agendamento.controller.js`, `manutencao-agendamento.service.js`, `criacao-agendamento.service.js`, `src/frontend/pages/user/UserAppointmentsPage.jsx` e `src/frontend/pages/painel/AgendamentosPage.jsx`.
- Remoção das notificações e simplificação sem testes: `src/backend/app.js`, `src/backend/server.js`, `src/backend/agendamentos`, `src/backend/evolution` (removido), `src/frontend/pages/painel/DashboardPage.jsx`, `src/frontend/services`, `.env.example`, `package.json` e `package-lock.json`.

## 8. Pendências operacionais observadas

O build do cliente e a verificação sintática do backend passaram; o lint e a validação do schema Prisma também passaram. A migration ainda precisa ser aplicada no banco de desenvolvimento/produção e o fluxo conectado ao PostgreSQL precisa ser conferido nesse ambiente. Não há `DATABASE_URL` local configurada nem banco disponível neste workspace durante esta atualização; portanto, não se afirma que a migration ou as operações persistidas foram executadas contra um banco real.
