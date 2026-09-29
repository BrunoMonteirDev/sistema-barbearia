# Status do projeto

> Atualizado em 23 de setembro de 2026. Este documento acompanha somente a iniciativa de refatoração estrutural e migração de estilos.

## Estado atual

Análise estática, auditoria Git e limpeza controlada do índice concluídas. A primeira baseline automatizada do backend permanece válida: cinco arquivos, 33 testes aprovados e typecheck aprovado.

Dependências instaladas, artefatos gerados, metadados locais e arquivos `.env` reais deixaram de ser rastreados sem serem apagados do computador. Os exemplos de ambiente continuam versionáveis.

A branch de segurança `baseline/estado-atual-2026-09-23` foi criada no mesmo HEAD de `main`, sem alterar o worktree.

O código continua em arquitetura híbrida: routes acessam Prisma em vários domínios, services existem principalmente para agenda/usuários/Evolution e ainda não há controllers ou repositories.

Tailwind continua ativo e nenhuma classe foi migrada nesta etapa.

## Última etapa concluída

Limpeza controlada do índice Git:

- 7.620 caminhos de `client/node_modules/` deixaram de ser rastreados;
- seis arquivos de `.local/`, dois `.tsbuildinfo`, `client/vite.config.js` e `client/vite.config.d.ts` deixaram de ser rastreados;
- `client/.env` e `server/.env` deixaram de ser rastreados, mas permanecem locais;
- `.gitignore` passou a permitir `.env.example` e `.env.*.example`;
- nenhum código de produção, teste, manifesto, lockfile, migration ou banco foi alterado;
- validações backend e frontend foram aprovadas após a limpeza.

## Etapa em andamento

Registro documental e backup remoto da limpeza do repositório. A refatoração MVC ainda não começou.

## Próxima etapa

Revisar e preservar em commits controlados as alterações funcionais que continuam no worktree. Em seguida, recuperar o próximo incremento da baseline de testes — preferencialmente profissionais/disponibilidade — e decidir a regra de antecedência antes dos testes de agendamento. Não iniciar MVC enquanto mudanças funcionais relevantes permanecerem não rastreadas.

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
- revisar e rotacionar credenciais reais, pois remover `.env` do índice não remove seus valores do histórico Git;

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
- limpeza do índice registrada nos commits `77625af885eea72785d7a282a480d4614911d112` e `805718fa57a41ef810fe1a974a2cd4d5131833bf`;
- após a limpeza: 0 caminhos rastreados em `client/node_modules`, `.local`, `*.tsbuildinfo`, `client/vite.config.js` e `client/vite.config.d.ts`;
- `client/.env` e `server/.env` continuam presentes localmente e não estão mais rastreados;
- suíte backend reaprovada: 5 arquivos e 33 testes;
- typecheck backend reaprovado;
- typecheck frontend sem emissão aprovado;
- lint frontend sem cache aprovado;
- bundle frontend aprovado com saída em diretório temporário fora do repositório.

Banco, Google real e Evolution real não foram executados. Os testes de Google usam mock. Testing Library e jsdom continuam ausentes porque o frontend permaneceu fora do escopo. O build frontend declarado não foi executado diretamente para evitar escrita em `dist` e `.tsbuildinfo`; seu typecheck e bundle foram validados anteriormente por comandos seguros equivalentes.

## Observações

- nenhum arquivo de produção deve ser alterado até a próxima etapa ser explicitamente iniciada;
- os arquivos anteriores já existentes em `docs/refatoracao/` foram preservados;
- todas as correções funcionais levantadas permanecem como “necessita validação” ou pendência separada.
- a limpeza não apagou arquivos físicos e não reescreveu o histórico Git;
- antes do registro documental restavam 98 entradas no status: 73 caminhos rastreados alterados e 25 não rastreados.
