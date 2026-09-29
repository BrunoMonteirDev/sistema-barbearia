# Arquitetura atual: API Prisma e JWT

O cliente React/Vite consome a API Express em `/api`. Esta é a arquitetura
oficial atual do projeto, não uma etapa de transição para Next.js.

O banco de dados é PostgreSQL e todo acesso passa pelo Prisma. Configure `DATABASE_URL` e `JWT_SECRET` conforme `.env.example`, aplique a migration inicial e execute `npm run seed` para os dados de demonstração.

Autenticação usa JWT. Administradores gerenciam recursos do painel; clientes só acessam o próprio perfil e os próprios agendamentos. Supabase, mocks, pagamentos, assinaturas, produtos e upload de imagens não fazem parte deste ciclo.

A consulta pública de disponibilidade retorna apenas horários para o fluxo de
agendamento antes do login. Criar, listar, remarcar e cancelar agendamentos
continuam exigindo JWT; a consulta não expõe dados de clientes ou reservas.

O gerenciamento administrativo de agendamentos permite listar, filtrar, criar,
editar, cancelar e excluir registros. As validações de cliente, profissional,
serviço, data, hora, status e conflito são executadas na API antes da
persistência com Prisma. Horários de agendamentos cancelados voltam a ficar
disponíveis. Criação, remarcação e edição administrativa obtêm, no PostgreSQL,
um `pg_advisory_xact_lock` por profissional e data; a disponibilidade é
revalidada e a gravação ocorre na mesma transação. Assim, conflitos
concorrentes retornam HTTP 409 também quando a API possui múltiplas instâncias.
Cancelamento não usa esse lock porque apenas libera o intervalo; uma reserva
posterior sempre revalida a agenda dentro da própria transação bloqueada.

O gerenciamento de funcionários usa os campos nome, telefone, e-mail e status ativo. A exclusão é lógica: o profissional é desativado para preservar o histórico de agendamentos.
