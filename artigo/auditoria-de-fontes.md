# Auditoria de fontes

Consulta realizada em 02/08/2026. Fontes oficiais foram selecionadas para sustentar conceitos técnicos; nenhuma métrica de adoção, pesquisa de campo ou resultado de negócio é afirmado.

| Afirmação | Fonte | Tipo | URL | Verificada | Observação |
| --- | --- | --- | --- | --- | --- |
| React organiza interfaces em componentes e estado | React | documentação oficial | https://react.dev/learn | Sim | usada na arquitetura da interface |
| TypeScript verifica tipos estaticamente antes da execução | Microsoft | documentação oficial | https://www.typescriptlang.org/docs/handbook/intro | Sim | usada na justificativa de tipagem |
| Prisma oferece acesso tipado e migrations | Prisma | documentação oficial | https://www.prisma.io/docs/orm | Sim | usada na persistência |
| Histórico de migrations deve ficar versionado | Prisma | documentação oficial | https://www.prisma.io/docs/orm/prisma-migrate/understanding-prisma-migrate/migration-histories | Sim | condiz com `server/prisma/migrations` |
| PostgreSQL oferece constraints e chaves relacionais | PostgreSQL Global Development Group | documentação oficial | https://www.postgresql.org/docs/current/ddl.html | Sim | usada na integridade |
| WCAG orienta acessibilidade e requer avaliação humana além da automação | W3C | recomendação | https://www.w3.org/TR/WCAG22/ | Sim | fundamenta a limitação de acessibilidade |
| Testes com Vitest são executados por comando | Vitest | documentação oficial | https://vitest.dev/guide/ | Pendente de nova consulta | a ferramenta está confirmada no repositório; referência deve ser revisada antes da submissão |
| Metodologia aplicada/exploratória/qualitativa | [REFERÊNCIA PENDENTE DE VERIFICAÇÃO] | bibliografia metodológica | — | Não | requer validação com orientador e fonte acadêmica específica |

## Referências prontas para revisão editorial

POSTGRESQL GLOBAL DEVELOPMENT GROUP. **PostgreSQL 18 Documentation: Data Definition**. Disponível em: <https://www.postgresql.org/docs/current/ddl.html>. Acesso em: 2 ago. 2026.

PRISMA. **Prisma ORM**. Disponível em: <https://www.prisma.io/docs/orm>. Acesso em: 2 ago. 2026.

PRISMA. **Prisma Migrate: Database, schema, SQL migration tool**. Disponível em: <https://docs.prisma.io/docs/orm/prisma-migrate>. Acesso em: 2 ago. 2026.

REACT. **Quick Start**. Disponível em: <https://react.dev/learn>. Acesso em: 2 ago. 2026.

TYPESCRIPT. **The TypeScript Handbook**. Disponível em: <https://www.typescriptlang.org/docs/handbook/intro>. Acesso em: 2 ago. 2026.

WORLD WIDE WEB CONSORTIUM. **Web Content Accessibility Guidelines (WCAG) 2.2**. 2024. Disponível em: <https://www.w3.org/TR/WCAG22/>. Acesso em: 2 ago. 2026.
