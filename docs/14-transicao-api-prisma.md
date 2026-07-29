# Arquitetura ativa: Vite, Express e Prisma

O cliente React/Vite em `client/` consome a API Express em `server/` pelo prefixo `/api`. Cada aplicação possui suas próprias dependências e comandos de execução.

O banco de dados é PostgreSQL e todo acesso passa pelo Prisma, localizado em `server/prisma/`. Configure `server/.env` com `DATABASE_URL` e `JWT_SECRET`, execute `npm run prisma:generate` dentro de `server/` e use `npm run seed` apenas quando quiser os dados de demonstração.

Autenticação usa JWT. Administradores gerenciam recursos do painel; clientes só acessam o próprio perfil e os próprios agendamentos. Supabase, mocks, pagamentos, assinaturas, produtos e upload de imagens não fazem parte deste ciclo.

O gerenciamento administrativo de agendamentos permite listar, filtrar, criar, editar, cancelar e excluir registros. As validações de cliente, profissional, serviço, data, hora, status e conflito de horário são executadas na API antes da persistência com Prisma.

O gerenciamento de funcionários usa os campos nome, telefone, e-mail e status ativo. A exclusão é lógica: o profissional é desativado para preservar o histórico de agendamentos.
