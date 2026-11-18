# Decisões arquiteturais

Registro inicial das decisões para a refatoração. As decisões descrevem a direção acordada; a implementação continua incremental.

## MVC semelhante a Java

**Status:** aceita.

**Decisão:** organizar o backend segundo a direção:

```text
Route → Controller → Service → Repository → Prisma → Banco
```

**Motivo:** facilitar separação de responsabilidades, manutenção, estudo e apresentação.

**Consequências:** routes deixam de acessar Prisma e de conter casos de uso; controllers tratam HTTP; services tratam regras; repositories concentram persistência.

## React como View

**Status:** aceita.

**Decisão:** não forçar MVC tradicional dentro do React.

**Motivo:** o frontend atual é naturalmente organizado por páginas, componentes, hooks, contexto e API. Introduzir controllers/repositories no navegador criaria cerimônia sem responsabilidade real.

**Consequência:** direção desejada:

```text
Page/View → Componentes/hooks → Service/API → Backend
```

## CSS tradicional

**Status:** aceita.

**Decisão:** migrar gradualmente de Tailwind para arquivos CSS tradicionais próximos das páginas/componentes.

**Motivo:** deixar TSX mais limpo e mais fácil de estudar e explicar, separando apresentação de estrutura/comportamento.

**Consequências:** Tailwind permanece instalado durante a migração; cada arquivo convertido preserva responsividade, estados e acessibilidade; remoção da dependência ocorre apenas ao final.

## Refatoração incremental

**Status:** aceita.

**Decisão:** nenhuma grande reescrita. Cada módulo deve ser migrado e validado individualmente.

**Motivo:** autenticação, agenda, concorrência e WhatsApp possuem efeitos interligados. Commits pequenos tornam regressões localizáveis.

**Consequência:** manter pontes temporárias é aceitável quando documentado; limpeza acontece após consumidores migrarem.

## Preservação de comportamento

**Status:** aceita.

**Decisão:** a refatoração estrutural não muda endpoints, métodos, payloads, mensagens, status HTTP, regras, schema, migrations ou efeitos externos.

**Motivo:** separar melhoria estrutural de mudança funcional permite demonstrar equivalência e reduz risco.

**Consequência:** problemas encontrados são registrados como pendências. Correções devem ocorrer em tarefas próprias com critérios próprios.

## Camadas somente com responsabilidade real

**Status:** aceita.

**Decisão:** não criar abstrações apenas para completar um diagrama.

**Motivo:** o projeto é um MVP/TCC e deve continuar didático.

**Consequências:** não usar `BaseRepository`, controller genérico, container de injeção ou classes-modelo vazias. Um repository pode atender um agregado pequeno; funções puras podem ficar em services/utilitários.

## Repositories sem interfaces obrigatórias

**Status:** aceita.

**Decisão:** repositories serão módulos concretos; interfaces só serão criadas se aparecer necessidade real de múltiplas implementações ou isolamento de teste que justifique o custo.

**Motivo:** uma interface por classe aumentaria volume sem ganho no estágio atual.

## Prisma centralizado

**Status:** mantida.

**Decisão:** continuar usando a instância única de `server/src/lib/prisma.ts`.

**Motivo:** o código atual já evita múltiplas conexões e configura o adapter PostgreSQL em um ponto.

**Consequência:** repositories importam essa instância ou recebem um `Prisma.TransactionClient` em operações transacionais.

## Banco e migrations fora da refatoração estrutural

**Status:** aceita.

**Decisão:** não alterar `server/prisma/schema.prisma` nem migrations para introduzir as camadas.

**Motivo:** as camadas podem ser separadas mantendo o modelo atual. Mudanças como enums, unificação de funcionário/usuário ou representação de data/hora são funcionais e exigem projeto próprio.

## Manter semântica de exclusão atual

**Status:** aceita para a refatoração.

**Decisão:** preservar exatamente os comportamentos atuais:

- usuários, profissionais e serviços são desativados;
- agendamento no endpoint administrativo `DELETE` é excluído fisicamente;
- históricos/notificações relacionados seguem o cascade definido no schema.

**Motivo:** uniformizar exclusões mudaria comportamento e dados.

## Advisory lock específico da agenda

**Status:** mantida.

**Decisão:** conservar `pg_advisory_xact_lock` por profissional/data durante criação e alterações que reservam horário.

**Motivo:** `server/src/services/bloqueio-agenda.service.ts` protege contra reservas concorrentes inclusive com mais de uma instância da API.

**Consequência:** o lock não deve ser escondido em uma infraestrutura genérica nem removido durante a extração de repositories.

## Autoridade das regras no backend

**Status:** aceita.

**Decisão:** validações no frontend servem à experiência; a decisão autoritativa continua no backend.

**Motivo:** dados do navegador são controláveis pelo cliente.

**Consequência:** duplicações como política de senha ou cálculo visual de horários devem ser mantidas sincronizadas ou reduzidas, mas nunca substituir a validação do servidor.

## Contratos HTTP como fronteira estável

**Status:** aceita.

**Decisão:** `client/src/lib/api.ts` define o mapa atual de consumo e os endpoints do servidor são a fronteira a preservar durante a migração.

**Motivo:** backend e frontend podem ser reorganizados separadamente se a fronteira não mudar.

**Consequência:** primeiro caracterizar respostas; depois mover implementação interna.

## API frontend dividida por domínio, com base HTTP única

**Status:** aceita como alvo.

**Decisão:** dividir gradualmente `client/src/lib/api.ts` em services por domínio, mantendo uma função HTTP compartilhada e um único armazenamento de token.

**Motivo:** o arquivo atual reúne tipos, infraestrutura e todos os endpoints em linhas muito densas.

**Consequência:** não duplicar `fetch`, headers ou tratamento de `ApiError` em cada service.

## CSS local, globais mínimos

**Status:** aceita.

**Decisão:** estilos específicos ficam ao lado do TSX; `client/src/styles/index.css` fica reservado a reset, base, acessibilidade e poucos estilos compartilhados.

**Motivo:** evita um CSS global gigante e torna cada tela fácil de localizar.

## Acessibilidade é requisito de equivalência

**Status:** aceita.

**Decisão:** uma tela não está migrada de Tailwind enquanto foco, teclado, alto contraste, fonte ampliada, redução de movimento e semântica não forem validados.

**Motivo:** esses recursos já existem no produto e fazem parte do comportamento.

**Consequência:** os seletores atuais de alto contraste baseados em classes `bg-`, `text-` e `border-` devem receber equivalentes semânticos antes da remoção do Tailwind.

## Integração Evolution separada em client e service

**Status:** aceita como alvo.

**Decisão:** separar detalhes HTTP da Evolution em um client de infraestrutura, regras em `EvolutionService` e persistência em `ConfiguracaoRepository`.

**Motivo:** `server/src/services/evolution.service.ts` atualmente acumula as três funções.

**Consequência:** não criar uma abstração genérica de provedores de WhatsApp enquanto houver somente Evolution.

## Testes de caracterização antes da movimentação crítica

**Status:** aceita.

**Decisão:** autenticação, disponibilidade, agendamentos, repetição, lock e notificações precisam de testes que descrevam o comportamento atual antes de grandes movimentações.

**Motivo:** o estado atual do repositório não expõe scripts de teste nos `package.json`, e o worktree mostra remoções de testes. Refatorar sem baseline aumentaria risco.

## Domínio-piloto: serviços

**Status:** recomendado; execução ainda não iniciada.

**Decisão:** usar serviços como primeiro módulo técnico para provar Controller/Service/Repository.

**Motivo:** `server/src/routes/servicos.ts` é pequeno, acessa Prisma diretamente e possui regras simples. O padrão pode ser avaliado com risco menor que autenticação ou agenda.

**Consequência:** após validar o piloto, aplicar a mesma simplicidade aos demais domínios sem copiar estruturas desnecessárias.

## Decisões pendentes — não resolver nesta etapa

### Papéis e profissionais

Definir posteriormente a relação entre `Usuario.nivel`, `requireStaff` e o model separado `Profissional`. A tipagem atual aceita apenas admin/cliente em um ponto e prevê funcionário em outro.

### Data e hora

Avaliar posteriormente se `Agendamento.data` e `hora` continuam strings. Alterar isso exige migration e revisão de fuso, portanto não pertence à refatoração estrutural.

### Estado `ATRASADO`

Escolher posteriormente a regra única entre o cálculo backend por início/tolerância e o cálculo frontend por término/duração.

### Scheduler de lembretes

Avaliar posteriormente idempotência com múltiplas instâncias, persistência do agendamento da tarefa e fuso horário. Primeiro preservar o comportamento atual.

### Possíveis arquivos mortos

Validar os candidatos por build, navegação e histórico antes de decidir exclusão. Esta análise não autoriza remoção.
