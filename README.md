# Barbearia Web

Sistema acadêmico de agendamento para uma única barbearia, desenvolvido como TCC do IFPR. Clientes reservam horários online; administradores e funcionários acompanham agenda, serviços e profissionais.

## Tecnologias

- Interface: React, JavaScript e Vite.
- API: Node.js, Express e JWT.
- Dados: PostgreSQL e Prisma ORM.

## Execução local

1. Configure `.env` a partir de `.env.example`, com `DATABASE_URL` e `JWT_SECRET`.
2. Instale dependências com `npm install` e gere o cliente Prisma com `npm run prisma:generate`.
3. Aplique as migrations com `npm run prisma:deploy`.
4. Inicie a aplicação com `npm run dev`, ou use `npm run dev:frontend` e `npm run dev:backend` em terminais separados.

O Vite usa polling para detectar alterações no frontend, e o backend usa `nodemon --legacy-watch`.

## Verificação

Use `npm run lint` e `npm run build` para verificar o código.

## Estrutura

`src/frontend` contém interface, páginas e serviços HTTP. `src/backend` organiza rotas, controllers, services e repositories por domínio. `prisma` contém o schema e as migrations do banco.
