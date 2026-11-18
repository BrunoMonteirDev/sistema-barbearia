# Barbearia Web

Sistema acadêmico de agendamento para uma única barbearia, desenvolvido como TCC do IFPR. Clientes reservam horários online; administradores e funcionários acompanham agenda, serviços e profissionais.

## Tecnologias

- Interface: React, JavaScript e Vite.
- API: Node.js, Express e JWT.
- Dados: PostgreSQL e Prisma ORM.

## Execução local

Execute os comandos desta seção dentro da pasta `sistema/`.

1. Configure `.env` a partir de `.env.example`, com `DATABASE_URL` e `JWT_SECRET`.
2. Instale dependências com `npm install` e gere o cliente Prisma com `npm run prisma:generate`.
3. Aplique as migrations com `npm run prisma:deploy`.
4. Inicie a aplicação com `npm run dev`, ou use `npm run dev:frontend` e `npm run dev:backend` em terminais separados.

Use uma versão do Node compatível com o campo `engines` do `package.json`. O Vite usa polling para detectar alterações no frontend, e o backend usa o modo `--watch` nativo do Node.

## Verificação

Use `npm run lint` e `npm run build` para verificar o código.

O projeto ainda não possui uma suíte de testes automatizados. O build do backend faz verificação sintática; ele não substitui testes funcionais ou de segurança.

## Estrutura

| Caminho | Conteúdo |
| --- | --- |
| `src/frontend/` | Interface, páginas, componentes e serviços HTTP |
| `src/backend/` | Rotas, controllers, services e repositories por domínio |
| `prisma/` | Schema e histórico de migrations do banco |
| `scripts/` | Verificações auxiliares usadas pelo build |
| `public/` | Arquivos estáticos utilizados pela interface |

Consulte o [índice da documentação](../docs/README.md) para distinguir o material atual dos registros históricos. A configuração Vite válida é `vite.config.js`, na raiz de `sistema/`; a antiga pasta `client/`, que continha apenas uma configuração obsoleta, foi removida.
