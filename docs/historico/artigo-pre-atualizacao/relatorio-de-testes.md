# Relatório de testes

Data da última execução: 02/08/2026.

| Comando ou cenário | Resultado | Evidência | Observação |
| --- | --- | --- | --- |
| `npm --prefix client run lint` | Aprovado | ESLint sem erros | cobre todo `client/src` |
| `npm run build` | Aprovado | TypeScript/Vite e TypeScript do servidor | build de produção concluído |
| `npm test` | Aprovado | 55 testes cliente + 74 servidor | total de 129 testes |
| `npm --prefix client run test:coverage` | Testes aprovados; meta falhou | 65,78% linhas | abaixo de 80% global |
| `npm --prefix server run test:coverage` | Testes aprovados; meta falhou | 60% linhas | abaixo de 80% global |
| `npm run test:integration` | Não executado até as asserções | Docker Desktop indisponível | PostgreSQL de teste em `localhost:5433` não iniciou |

## Cenários comprovados por testes

Os testes cobrem autenticação, rotas protegidas, criação de agendamento, etapa de revisão, disponibilidade, duração, conflito, cancelamento, remarcação, histórico, status, serviços, profissionais, usuários e notificações. Os arquivos de evidência estão em `client/src/**/*.test.*`, `server/src/**/*.test.ts` e `server/tests/integration`.

## Interpretação

Os testes unitários aprovados demonstram que os cenários automatizados listados continuam executáveis. Não demonstram cobertura completa do sistema nem substituem a validação manual de acessibilidade, Google em produção, Evolution/WhatsApp real e integração PostgreSQL enquanto o Docker estiver indisponível.
