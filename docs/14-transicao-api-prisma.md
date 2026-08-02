# Arquitetura atual: API Prisma e JWT

O cliente React/Vite consome a API Express em `/api`. Esta é a arquitetura
oficial atual do projeto, não uma etapa de transição para Next.js.

O banco de dados é PostgreSQL e todo acesso passa pelo Prisma. Configure `DATABASE_URL` e `JWT_SECRET` conforme `.env.example`, aplique a migration inicial e execute `npm run seed` para os dados de demonstração.

Autenticação usa JWT. Administradores gerenciam recursos do painel; clientes só acessam o próprio perfil e os próprios agendamentos. Supabase, mocks, pagamentos, assinaturas, produtos e upload de imagens não fazem parte deste ciclo.

O gerenciamento administrativo de agendamentos permite listar, filtrar, criar,
editar, cancelar e excluir registros. As validações de cliente, profissional,
serviço, data, hora, status e conflito são executadas na API antes da
persistência com Prisma. Horários de agendamentos cancelados voltam a ficar
disponíveis; conflitos concorrentes retornam HTTP 409.

O gerenciamento de funcionários usa os campos nome, telefone, e-mail e status ativo. A exclusão é lógica: o profissional é desativado para preservar o histórico de agendamentos.
