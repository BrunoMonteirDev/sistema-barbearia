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
| Pequenas empresas possuem especificidades na gestão da informação | Moraes e Escrivão Filho | artigo científico | https://doi.org/10.1590/S0100-19652006000300012 | Sim | fundamenta a contextualização do problema |
| TI deve considerar a realidade das pequenas empresas | Moraes, Terence e Escrivão Filho | artigo científico | https://doi.org/10.4301/S1807-17752004000100003 | Sim | fundamenta o refinamento de escopo |
| Recomendações brasileiras orientam acessibilidade digital | Governo Digital | fonte institucional | https://www.gov.br/governodigital/pt-br/acessibilidade-e-usuario/acessibilidade-digital/modelo-de-acessibilidade | Sim | complementar à WCAG |
| Autorização deve ser verificada para cada solicitação | OWASP | guia técnico institucional | https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html | Sim | fundamenta autenticação e autorização |
| Qualidade de software envolve requisitos e avaliação | ISO/IEC 25010 | norma técnica | https://www.iso.org/standard/35733.html | Sim | usada para contextualizar os testes |
| Desenvolvimento tecnológico aplicado pode combinar decisões de método e evidências | Creswell e Creswell | bibliografia metodológica | https://us.sagepub.com/en-us/nam/research-design/book255675 | Sim | fundamenta a descrição metodológica sem caracterizar pesquisa de campo |
| Testes com Vitest são executados por comando | Vitest | documentação oficial | https://vitest.dev/guide/ | Pendente de nova consulta | ferramenta confirmada no repositório; não utilizada como referência central no artigo |

## Referências prontas para revisão editorial

POSTGRESQL GLOBAL DEVELOPMENT GROUP. **PostgreSQL 18 Documentation: Data Definition**. Disponível em: <https://www.postgresql.org/docs/current/ddl.html>. Acesso em: 2 ago. 2026.

PRISMA. **Prisma ORM**. Disponível em: <https://www.prisma.io/docs/orm>. Acesso em: 2 ago. 2026.

PRISMA. **Prisma Migrate: Database, schema, SQL migration tool**. Disponível em: <https://docs.prisma.io/docs/orm/prisma-migrate>. Acesso em: 2 ago. 2026.

REACT. **Quick Start**. Disponível em: <https://react.dev/learn>. Acesso em: 2 ago. 2026.

TYPESCRIPT. **The TypeScript Handbook**. Disponível em: <https://www.typescriptlang.org/docs/handbook/intro>. Acesso em: 2 ago. 2026.

WORLD WIDE WEB CONSORTIUM. **Web Content Accessibility Guidelines (WCAG) 2.2**. 2024. Disponível em: <https://www.w3.org/TR/WCAG22/>. Acesso em: 2 ago. 2026.

MORAES, Giseli Diniz de Almeida; ESCRIVÃO FILHO, Edmundo. **A gestão da informação diante das especificidades das pequenas empresas**. Ciência da Informação, v. 35, n. 3, p. 124-132, 2006. DOI: <https://doi.org/10.1590/S0100-19652006000300012>.

MORAES, Giseli Diniz de Almeida; TERENCE, Ana Cláudia Fernandes; ESCRIVÃO FILHO, Edmundo. **A tecnologia da informação como suporte à gestão estratégica da informação na pequena empresa**. Journal of Information Systems and Technology Management, v. 1, n. 1, p. 27-43, 2004. DOI: <https://doi.org/10.4301/S1807-17752004000100003>.

CRESWELL, John W.; CRESWELL, J. David. **Research design: qualitative, quantitative, and mixed methods approaches**. 6. ed. Thousand Oaks: SAGE, 2023.

OWASP. **Authorization Cheat Sheet**. Disponível em: <https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html>. Acesso em: 2 ago. 2026.

ISO. **ISO/IEC 25010:2011: Systems and software engineering — Systems and software Quality Requirements and Evaluation**. Disponível em: <https://www.iso.org/standard/35733.html>. Acesso em: 2 ago. 2026.
