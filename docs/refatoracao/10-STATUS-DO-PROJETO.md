# Status do projeto

> Atualizado em 23 de setembro de 2026. Este documento acompanha somente a iniciativa de refatoração estrutural e migração de estilos.

## Estado atual

Análise estática e auditoria Git concluídas. A primeira baseline automatizada do backend foi recuperada e está registrada em `docs/refatoracao/14-RESULTADO-RECUPERACAO-TESTES.md`: cinco arquivos, 33 testes aprovados e typecheck aprovado.

A branch de segurança `baseline/estado-atual-2026-09-23` foi criada no mesmo HEAD de `main`, sem alterar o worktree.

O código continua em arquitetura híbrida: routes acessam Prisma em vários domínios, services existem principalmente para agenda/usuários/Evolution e ainda não há controllers ou repositories.

Tailwind continua ativo e nenhuma classe foi migrada nesta etapa.

## Última etapa concluída

Primeira baseline automatizada backend:

- recuperados `horarios.service.test.ts`, `servicos.test.ts`, `middlewares/auth.test.ts`, `routes/auth.test.ts` e `routes/usuarios.test.ts`;
- adicionada configuração Vitest mínima exclusiva do backend;
- instalados somente Vitest, Supertest e tipos de Supertest no servidor;
- cada arquivo passou isoladamente;
- suíte conjunta aprovada: 5 arquivos e 33 testes;
- `tsc --noEmit` aprovado;
- nenhum código de produção foi alterado.

## Etapa em andamento

Revisão da primeira baseline automatizada e preparação do próximo incremento de testes. A refatoração MVC ainda não começou.

## Próxima etapa

Decidir se a baseline será registrada como checkpoint e escolher o próximo incremento: senha, profissionais/disponibilidade ou services de criação/manutenção de agendamentos. Antes dos testes de agendamento, decidir a regra de antecedência. Não iniciar MVC ainda.

## Pendências conhecidas

- worktree já contém muitas alterações preexistentes e precisa ser isolado antes de refatorar;
- somente o script mínimo de teste backend foi recuperado; frontend e integração continuam sem scripts;
- validar divergência entre proxy Vite 3002 e porta padrão do backend 3001;
- validar remarcação via disponibilidade com `ignorarAgendamentoId`;
- decidir futuramente a fonte da verdade para status `ATRASADO`;
- validar possíveis arquivos frontend sem importador;
- alinhar papéis de usuário com `requireStaff` e tipagem Express;
- validar scheduler/lembretes em múltiplas instâncias e fuso.
- classificar e atualizar documentação legada que ainda descreve Next.js, entidades inexistentes e testes ausentes da configuração atual;
- revisar 46 exclusões de testes e a retirada de suas dependências/scripts;
- decidir como retirar `client/node_modules`, `.env` e gerados do índice sem perder o estado atual;
- preservar 14 arquivos de código-fonte não rastreados antes de qualquer limpeza;
- decidir se a mudança de antecedência mínima para aviso representa o comportamento desejado;
- revisar a simplificação funcional e visual de `NovoAgendamentoWizard.tsx`;
- decidir se os componentes e utilitários de funcionários ainda fazem parte do grafo ativo;
- analisar separadamente as seis vulnerabilidades reportadas pelo npm, sem correção automática;
- adaptar os testes de agendamento ao novo nome da página, aos services extraídos e ao contrato de disponibilidade;

## Riscos

- regressão de concorrência ao mover agenda;
- mudança acidental em contratos HTTP;
- perda de acessibilidade durante migração de CSS;
- envio duplicado ou ausente de WhatsApp;
- confusão entre mudanças preexistentes e mudanças da refatoração;
- remoção prematura de Tailwind ou arquivos supostamente mortos.

## Validações realizadas

- inventário de arquivos, tamanhos e imports;
- leitura de entradas, routes, services, middleware, API frontend e schema Prisma;
- extração de todos os endpoints declarados;
- busca de acessos Prisma por arquivo;
- contagem estática de `className`, variantes responsivas e estados Tailwind;
- busca de consumidores para candidatos a código morto;
- registro do status/diff preexistente do Git.
- contagem de 7.620 arquivos rastreados em `client/node_modules`;
- classificação das 563 alterações rastreadas e 35 não rastreadas da captura inicial;
- verificação do `.gitignore` e de arquivos ignorados que já estão no índice.
- leitura dos 46 caminhos de testes/infraestrutura diretamente no `HEAD` e classificação A–E;
- typecheck frontend sem emissão aprovado;
- lint frontend sem cache aprovado;
- bundle frontend aprovado com saída redirecionada para diretório temporário;
- build/typecheck backend com `tsc --noEmit` aprovado.
- cinco testes backend executados individualmente: 33 casos aprovados no total;
- suíte backend conjunta aprovada: 5 arquivos e 33 testes;
- typecheck backend reaprovado depois da instalação da infraestrutura mínima.

Banco, Google real e Evolution real não foram executados. Os testes de Google usam mock. Testing Library e jsdom continuam ausentes porque o frontend permaneceu fora do escopo. O build frontend declarado não foi executado diretamente para evitar escrita em `dist` e `.tsbuildinfo`; seu typecheck e bundle foram validados anteriormente por comandos seguros equivalentes.

## Observações

- nenhum arquivo de produção deve ser alterado até a próxima etapa ser explicitamente iniciada;
- os arquivos anteriores já existentes em `docs/refatoracao/` foram preservados;
- todas as correções funcionais levantadas permanecem como “necessita validação” ou pendência separada.
