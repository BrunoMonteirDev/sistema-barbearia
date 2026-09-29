# Barbearia Web

Sistema acadêmico de agendamento para uma única barbearia, desenvolvido como TCC do IFPR. Clientes reservam horários online; equipe e administração gerenciam agenda, serviços, profissionais e regras.

## Tecnologias

- Cliente: React, JavaScript e Vite.
- API: Node.js, Express e JWT.
- Dados: PostgreSQL e Prisma.
- Qualidade: Vitest e Supertest.

## Execução local

1. Configure `.env` a partir de `.env.example`, sem versionar credenciais.
2. Instale as dependências com `npm install` e gere o cliente Prisma com `npm run prisma:generate`.
3. Aplique as migrations existentes com `npm run prisma:deploy`.
4. Execute frontend e backend com `npm run dev`, ou separadamente com `npm run dev:frontend` e `npm run dev:backend`.

O comando `npm run dev` usa polling para detectar alterações sem consumir os watchers do `inotify`: Vite usa Chokidar e o backend usa `nodemon --legacy-watch`. Isso evita `ENOSPC: System limit for number of file watchers reached` em máquinas com o limite ocupado por outros aplicativos, mas pode usar um pouco mais de CPU. Para executar apenas o frontend com polling, use `CHOKIDAR_USEPOLLING=1 npm run dev:frontend`.

## Verificação

`npm run lint` · `npm run build` · `npm test`

## Estrutura

`src/frontend` contém a interface; `src/backend` organiza rotas, controllers, services e repositories por domínio; `prisma` contém o schema e as migrations. A API mantém as rotas em `/api`.

## Limitações conhecidas

A validação manual de acessibilidade, a configuração Google de produção e a conexão real controlada da Evolution/WhatsApp permanecem etapas operacionais. A meta de 80% de cobertura ainda é pendente.
