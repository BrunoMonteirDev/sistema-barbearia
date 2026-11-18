# Documentação do projeto

Esta pasta reúne todo o material que não faz parte da execução da aplicação. A separação evita misturar código-fonte, documentos acadêmicos, diagramas e registros antigos.

## Documentação atual

| Caminho | Conteúdo | Uso recomendado |
| --- | --- | --- |
| [`tecnica/BACKLOG_ATUALIZACAO_TCC.md`](tecnica/BACKLOG_ATUALIZACAO_TCC.md) | Inventário funcional, regras de negócio e correspondência com o código atual | Referência técnica principal |
| [`tecnica/RELATORIO_ACESSIBILIDADE.md`](tecnica/RELATORIO_ACESSIBILIDADE.md) | Escopo, resultados e limites da verificação de acessibilidade | Evidência técnica e pendências de avaliação |
| [`tecnica/diagrama-relacionamentos.svg`](tecnica/diagrama-relacionamentos.svg) | Diagrama de relacionamentos do banco | Consulta e inclusão no TCC |
| [`tecnica/diagrama-banco-mysql.sql`](tecnica/diagrama-banco-mysql.sql) | Modelo auxiliar para visualização no MySQL Workbench | Somente geração de diagrama; a aplicação usa PostgreSQL |
| [`tecnica/MER - TCC.png`](<tecnica/MER - TCC.png>) | Imagem do modelo entidade-relacionamento | Material visual do sistema |
| [`tcc/TCC - BRUNO MONTEIRO ALVES - V7 REVISADO.docx`](<tcc/TCC - BRUNO MONTEIRO ALVES - V7 REVISADO.docx>) | Versão editável revisada do artigo, com referências corrigidas e 23 páginas na renderização de conferência | Edição, revisão e entrega |
| [`tcc/TCC - BRUNO MONTEIRO ALVES - V4 ORIENTADOR.pdf`](<tcc/TCC - BRUNO MONTEIRO ALVES - V4 ORIENTADOR.pdf>) | Versão recebida com a revisão do orientador e usada como fonte da versão final | Consulta e conferência histórica |

## Material histórico

`historico/artigo-pre-atualizacao/` preserva uma versão anterior do artigo, seus relatórios, capturas e documentos de refatoração. Os arquivos `tcc/TCC - BRUNO MONTEIRO ALVES v2.md` e `tcc/TCC - BRUNO MONTEIRO ALVES.pdf` também são versões históricas. Esse conteúdo menciona recursos que já foram removidos ou alterados, como remarcação direta, notificações automáticas, TypeScript e uma suíte antiga de testes. Ele deve ser usado apenas para recuperar decisões, evidências ou trechos, não como descrição do sistema atual. As versões V5 e V6 permanecem em `tcc/` para comparação; a V6 foi a base da revisão V7.

Os caminhos internos e as figuras desse material foram preservados juntos para não quebrar as referências relativas do artigo antigo.

## Onde fica o código

O código executável permanece fora de `docs/`, concentrado em `sistema/`:

| Caminho | Responsabilidade |
| --- | --- |
| `sistema/src/frontend/` | Interface React, páginas, componentes e acesso à API |
| `sistema/src/backend/` | API Express, autenticação e regras de negócio |
| `sistema/prisma/` | Schema e histórico de migrations do PostgreSQL |
| `sistema/scripts/` | Verificações auxiliares do projeto |
| `sistema/public/` | Imagens estáticas usadas pela interface |
| `sistema/` | Configurações de build, lint, ambiente e dependências |

`sistema/node_modules/` e `sistema/dist/` são artefatos gerados e ignorados pelo Git. Eles não são documentação nem código-fonte mantido.
