# Sistema de Barbearia

Repositório do sistema acadêmico de agendamento para barbearias e de sua documentação de TCC. O conteúdo foi separado para que a aplicação possa ser executada sem misturar código-fonte, artigo, diagramas e registros históricos.

## Organização

| Caminho | Conteúdo |
| --- | --- |
| [`sistema/`](sistema/) | Aplicação completa: frontend, backend, banco, configurações e dependências do projeto |
| [`docs/tecnica/`](docs/tecnica/) | Backlog, relatório de acessibilidade e diagramas atuais |
| [`docs/tcc/`](docs/tcc/) | Manuscrito vigente e versão renderizada do TCC |
| [`docs/historico/`](docs/historico/) | Material antigo preservado apenas para consulta |

## Executar a aplicação

Entre na pasta do sistema antes de usar qualquer comando do projeto:

```bash
cd sistema
npm install
npm run prisma:generate
npm run dev
```

As instruções completas estão no [README da aplicação](sistema/README.md). Para localizar documentos atuais e históricos, consulte o [índice da documentação](docs/README.md).
