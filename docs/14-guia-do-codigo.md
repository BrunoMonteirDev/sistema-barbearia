# Guia do código para apresentação

## Visão geral

O sistema tem duas aplicações simples: `client` apresenta a interface React/Vite; `server` expõe uma API REST Express. O cliente chama `/api`, as rotas autenticam o usuário e delegam regras aos serviços. Prisma é a única camada que acessa PostgreSQL.

| Área | Responsabilidade |
| --- | --- |
| `client/src/pages` | telas públicas, do cliente e administrativas |
| `client/src/lib/api.ts` | chamadas HTTP tipadas e token JWT |
| `server/src/routes` | endpoints, validação de entrada e respostas HTTP |
| `server/src/services/horarios.service.ts` | disponibilidade, duração e conflitos |
| `server/src/services/regras-agendamento.service.ts` | prazos de cancelamento/remarcação e atraso |
| `server/src/middlewares/auth.ts` | JWT e autorização por nível |
| `server/prisma/schema.prisma` | entidades, relações e índices |

## Fluxo de agendamento

1. `AgendarPage.tsx` coleta profissional, serviço, data e horário.
2. Ao escolher a data, `api.agendamentos.disponibilidade` chama `GET /api/agendamentos/disponibilidade`.
3. `listarHorariosDisponiveis` considera jornada semanal, duração e agendamentos ativos.
4. A tela mostra a revisão; autenticação e aceite explícito só são exigidos na confirmação.
5. `POST /api/agendamentos` valida dados, usuário, serviço, profissional e disponibilidade novamente.
6. Prisma grava `Agendamento`; o índice único parcial impede a disputa por horário ativo no banco.
7. O cliente recebe sucesso e segue para seus agendamentos.

## Fluxo administrativo

`ProtectedRoute` restringe a interface. No servidor, `authenticate`, `requireAdmin` e `requireStaff` confirmam o JWT e o nível. A administração mantém serviços, profissionais, disponibilidades, usuários, regras e agenda; toda alteração relevante gera histórico de agendamento.

## Funções importantes

- `listarHorariosDisponiveis(profissionalId, servicoId, data)`: devolve apenas inícios que cabem na jornada e não sobrepõem reservas.
- `validarDisponibilidade(...)`: reutiliza o cálculo antes de criar ou remarcar.
- `temConflito(...)`: compara intervalos de tempo, inclusive serviços com mais de um bloco de 30 minutos.
- `respeitaAntecedencia(...)`: impede que o cliente altere/cancele fora do prazo configurado.

## Banco de dados

`Usuario` agenda; `Profissional` atende; `Servico` define preço e duração; `DisponibilidadeProfissional` define blocos semanais; `Agendamento` liga as três entidades. `HistoricoAgendamento` fornece auditoria e `NotificacaoAgendamento` registra o resultado de notificações. `Configuracao` mantém dados da barbearia e regras globais.

## Perguntas da banca

- **Como evita duplicidade?** O servidor recalcula disponibilidade e PostgreSQL possui restrição para horário de profissional que não esteja cancelado.
- **Por que TypeScript e Prisma?** Tipos antecipam erros e Prisma mantém consultas/migrations legíveis e versionadas.
- **Onde ficam as regras?** Em `server/src/services`, para que rotas e interface não dupliquem decisões.
- **Como poderia crescer?** Separar relatórios ou notificações quando houver necessidade real; o escopo atual continua uma única barbearia, sem multitenancy.
