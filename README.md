# Barbearia Web

Sistema acadêmico de agendamento para uma única barbearia, desenvolvido como TCC do IFPR. Clientes reservam horários online; equipe e administração gerenciam agenda, serviços, profissionais e regras.

## Tecnologias

- Cliente: React, TypeScript, Vite e Tailwind CSS.
- API: Node.js, Express e JWT.
- Dados: PostgreSQL e Prisma.
- Qualidade: Vitest, React Testing Library e Supertest.

## Execução local

1. Configure `client/.env` e `server/.env` a partir dos exemplos disponíveis, sem versionar credenciais.
2. Instale dependências com `npm install`, `npm --prefix client install` e `npm --prefix server install`.
3. Execute migrations: `npm --prefix server run prisma:deploy`.
4. Inicie cliente e servidor, em terminais separados: `npm run dev:client` e `npm run dev:server`.

## Verificação

`npm --prefix client run lint` · `npm run build` · `npm test` · `npm run test:integration`

Os testes de integração exigem PostgreSQL exclusivo configurado em `DATABASE_URL_TEST`; o comando aplica as migrations automaticamente e recusa usar a URL de desenvolvimento.

## Estrutura

`client/src` contém interface e componentes; `server/src/routes` recebe HTTP; `server/src/services` concentra regras; `server/prisma` define dados e migrations. Consulte [docs/14-guia-do-codigo.md](docs/14-guia-do-codigo.md) e [docs/15-mapa-de-fluxos.md](docs/15-mapa-de-fluxos.md) para apresentação.

## Limitações conhecidas

A validação manual de acessibilidade, a configuração Google de produção e a conexão real controlada da Evolution/WhatsApp permanecem etapas operacionais. A meta de 80% de cobertura ainda é pendente.
