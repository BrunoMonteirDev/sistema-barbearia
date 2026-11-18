# Mapa do Sistema — Barbearia Web

Atualizado em 02/08/2026. Este documento prioriza o código executável, o schema Prisma e os testes sobre documentos históricos.

## 1. Estrutura e responsabilidades

| Área | Responsabilidade |
| --- | --- |
| `client/src/pages` | telas públicas, do cliente e administrativas |
| `client/src/components` | elementos reutilizáveis, proteção de rota e acessibilidade |
| `client/src/lib/api.ts` | cliente HTTP, token JWT e tipos compartilhados do cliente |
| `server/src/routes` | endpoints REST, validação de entrada e respostas HTTP |
| `server/src/services` | disponibilidade, regras de agendamento, autenticação e notificações |
| `server/src/middlewares/auth.ts` | autenticação JWT e autorização por nível |
| `server/prisma` | schema e migrations PostgreSQL |
| `integrations/evolution-api` | cópia local da Evolution API usada somente como dependência de integração externa |
| `artigo` | material editorial, template e saídas do artigo |

## 2. Tecnologias confirmadas

| Tecnologia | Versão configurada | Local | Finalidade |
| --- | --- | --- | --- |
| React | 18.3.1 | `client/package.json` | interface web |
| Vite | 5.4.3 | `client/package.json` | desenvolvimento e build do cliente |
| TypeScript | 5.9.3 | pacotes cliente/servidor | tipagem estática |
| Express | 5.2.1 | `server/package.json` | API REST |
| Prisma | 7.9.0 | `server/package.json` | ORM e migrations |
| PostgreSQL | provider Prisma | `server/prisma/schema.prisma` | persistência relacional |
| JWT | jsonwebtoken 9.0.3 | `server/package.json` | sessão autenticada |
| Vitest | 4.1.10 | pacotes cliente/servidor | testes automatizados |
| Docker Compose | arquivos de composição | raiz | banco isolado de testes e Evolution opcional |

Não foram confirmados Next.js, Server Components, Server Actions, shadcn/ui ou uma implantação pública.

## 3. Entidades persistidas

| Entidade | Finalidade e relações | Restrições relevantes |
| --- | --- | --- |
| `Usuario` | cliente, funcionário ou administrador; possui agendamentos | e-mail único; `googleSubject` único; conta pode estar inativa |
| `Profissional` | prestador que atende e configura disponibilidade | e-mail opcional único; relação com agendamentos e disponibilidade |
| `Servico` | nome, duração, preço e estado ativo | duração e preço são usados na disponibilidade |
| `Agendamento` | relaciona usuário, profissional e serviço, com data/hora/status | índice por profissional/data/hora; migration cria unicidade parcial para reservas não canceladas |
| `DisponibilidadeProfissional` | blocos semanais de 30 minutos por profissional | único por profissional, dia da semana e hora |
| `HistoricoAgendamento` | auditoria de alterações | pertence a um agendamento e registra autor |
| `NotificacaoAgendamento` | resultado de envio de notificação | pertence a um agendamento; exclusão em cascata |
| `Configuracao` | dados da barbearia, regras de prazo e mensagens | registro consultado como configuração global |

## 4. Funcionalidades confirmadas

| Funcionalidade | Implementada | Parcial | Evidência |
| --- | --- | --- | --- |
| Cadastro/login local e Google | Sim | Google depende de configuração externa | `server/src/routes/auth.ts`, `AuthContext.tsx` |
| Perfis e autorização | Sim | Não | `middlewares/auth.ts`, `ProtectedRoute.tsx` |
| Agendamento em quatro etapas com revisão | Sim | Não | `client/src/pages/agendar/AgendarPage.tsx` |
| Profissional sem preferência | Sim | Não | `escolherPrimeiroProfissionalDisponivel` |
| Disponibilidade por jornada e duração | Sim | Não | `server/src/services/horarios.service.ts` |
| Cancelamento, remarcação e histórico | Sim | Não | `server/src/routes/agendamentos.ts` |
| CRUD de serviços e profissionais | Sim | Não | rotas e páginas administrativas correspondentes |
| Agenda administrativa e status | Sim | Não | `AgendamentosPage.tsx`, rotas de agendamentos |
| Acessibilidade básica | Sim | Parcial: sem auditoria formal completa | controles, skip link, teclado e VLibras |
| Notificações WhatsApp/Evolution | Sim | Parcial: integração real não validada neste ambiente | `evolution.service.ts`, `notificacao.service.ts` |
| Testes unitários | Sim | Não | 22 suítes no cliente e 12 no servidor |
| Testes de integração PostgreSQL | Preparados | Sim: bloqueados pelo Docker local desligado | `server/tests/integration` |

## 5. Planejado ou não confirmado como resultado

Pagamentos, controle de produtos/estoque, assinaturas, fidelidade, relatórios avançados, aplicativo móvel, métricas de uso, pesquisa com usuários e implantação produtiva não possuem evidência para serem apresentados como resultados. A integração Evolution não deve ser descrita como validada em produção.

## 6. Regras de negócio

- Os horários são blocos de 30 minutos; serviços ocupam a quantidade arredondada de blocos necessária.
- Um início só é exibido se todos os blocos consecutivos necessários fizerem parte da jornada do profissional.
- Agendamentos não cancelados são comparados por sobreposição de intervalos.
- A API revalida disponibilidade imediatamente antes de persistir; disputa de banco retorna conflito HTTP 409.
- Somente proprietário ou administração pode consultar/alterar um agendamento conforme a ação e o nível.
- Cancelamento e remarcação do cliente respeitam antecedência configurada; a administração possui permissões próprias.
- Agendamentos pendentes/confirmados podem receber status `ATRASADO` conforme tolerância configurada.

## 7. Fluxos principais

- **Autenticação:** rota de login/cadastro gera JWT; cliente armazena token; middleware valida token; nível limita a ação.
- **Agendamento:** escolhas → disponibilidade → revisão/aceite → autenticação quando necessária → revalidação no servidor → Prisma/PostgreSQL.
- **Cancelamento/remarcação:** autorização → antecedência → atualização → histórico → notificação assíncrona quando habilitada.
- **Administração:** rota protegida → CRUD de serviços/profissionais/usuários → configuração de disponibilidade e agenda.

## 8. Integrações

| Integração | Estado | Observação |
| --- | --- | --- |
| Google Identity | Parcial | fluxo existe; ambiente de produção requer credenciais/configuração |
| Evolution API/WhatsApp | Parcial | código e Docker disponíveis; conexão real não foi validada na execução mais recente |
| PostgreSQL de integração | Preparado | `DATABASE_URL_TEST` e migrations automáticas; Docker Desktop estava desligado |

## 9. Testes e validação observada

Em 02/08/2026, `npm --prefix client run lint`, `npm run build` e `npm test` foram aprovados. Foram aprovados 55 testes do cliente e 74 do servidor. A cobertura observada ficou abaixo da meta configurada de 80%: cliente, 65,78% de linhas; servidor, 60% de linhas. O teste de integração não iniciou por indisponibilidade do Docker Desktop, não por falha de asserção da aplicação.
