# Padrões de código

## Objetivo

Este guia prioriza código legível, previsível e explicável de cima para baixo. Ele vale para novas alterações durante a refatoração. Arquivos existentes não devem ser renomeados ou reformatados em massa apenas para cumprir o guia.

## Princípios gerais

- uma função deve ter uma responsabilidade principal;
- nomes devem explicar intenção, não implementação acidental;
- fluxo feliz deve ser visível, usando retornos antecipados para erros;
- abstrações só devem surgir quando eliminam uma responsabilidade real;
- regra de negócio fica no backend, mesmo que o frontend também valide para melhorar a experiência;
- persistência fica em repositories;
- Request/Response ficam em controllers/middlewares;
- JSX descreve a tela, não esconde algoritmos extensos;
- comportamento existente tem prioridade durante refatoração.

## Idioma

O projeto atual usa majoritariamente português em domínios, funções e mensagens, com nomes técnicos comuns em inglês (`service`, `controller`, `repository`, `request`). Manter esse padrão:

- domínio: `agendamento`, `servico`, `profissional`, `usuario`;
- conceitos técnicos: sufixos `.service`, `.controller`, `.repository`;
- APIs de bibliotecas: manter o nome original.

Evitar alternar sinônimos dentro do mesmo domínio. A diferença existente entre “funcionário” no frontend e `Profissional` no backend deve ser documentada e resolvida apenas em etapa própria.

## Nomes de arquivos

### Backend

Usar nome de domínio no singular e sufixo da camada:

```text
agendamento.controller.ts
agendamento.service.ts
agendamento.repository.ts
notificacao.service.ts
senha.service.ts
```

Routes podem manter os nomes plurais atuais por representarem coleções/endpoints:

```text
routes/agendamentos.ts
routes/profissionais.ts
```

Não renomear os arquivos existentes apenas por estética. Novos arquivos devem seguir o padrão da camada.

### Frontend

Páginas e componentes React em PascalCase, como já ocorre:

```text
LoginPage.tsx
PaginaAgendamento.tsx
Modal.tsx ou modal.tsx enquanto o arquivo existente for preservado
```

Hooks começam com `use`:

```text
useAgendamentoPublico.ts
useMinhaConta.ts
```

O CSS local usa o mesmo nome-base do TSX:

```text
PaginaAgendamento.tsx
PaginaAgendamento.css
```

Não fazer uma campanha de renomeação entre PascalCase e kebab-case durante extrações de responsabilidade.

## Classes, interfaces e tipos

- componentes e classes: PascalCase;
- interfaces e type aliases: PascalCase, sem prefixo `I`;
- erros de domínio: PascalCase terminado em `Error`;
- uniões devem expressar os valores reais.

```typescript
type StatusAgendamento =
  | 'PENDENTE'
  | 'CONFIRMADO'
  | 'CONCLUIDO'
  | 'CANCELADO'
  | 'ATRASADO'

class HorarioIndisponivelError extends Error {}
```

Preferir `interface` para formas de objetos extensíveis e `type` para uniões, aliases e composições. Não duplicar os models Prisma em classes vazias.

## Funções e métodos

Usar camelCase e verbo que expresse a ação:

```text
buscarPorEmail
listarHorariosDisponiveis
criarAgendamento
atualizarPerfil
responderConflitoDeAgenda
```

Evitar:

```text
processar
fazer
handleData
doStuff
exec
```

Nomes genéricos podem ser aceitáveis somente em contexto muito local, como `map`, `filter` ou callback curto.

Uma função deve ser extraída quando:

- possui uma regra nomeável;
- é reutilizada;
- reduz um bloco difícil de acompanhar;
- permite testar uma decisão importante sem Express/React.

Não extrair uma função de uma linha apenas para aumentar o número de camadas.

## Variáveis

- camelCase;
- substantivos específicos;
- booleanos com pergunta clara: `usuarioAtivo`, `podeCancelar`, `possuiConflito`;
- coleções no plural;
- IDs com o domínio: `agendamentoId`, não apenas `id` quando há mais de uma entidade.

Evitar `data` quando o valor não for uma data do calendário. No código Prisma, `data` é a propriedade exigida pela biblioteca e pode ser mantida; em regra de negócio, preferir `dadosAtualizacao`, `dadosCriacao` etc.

## Routes

Uma route deve mostrar o contrato de forma imediata:

```typescript
router.post('/', authenticate, requireAdmin, servicoController.criar)
```

Permitido:

- método e path;
- middlewares;
- controller.

Evitar na route:

- consulta Prisma;
- validação extensa;
- `try/catch` do caso de uso;
- montagem de objetos de domínio;
- comparação de mensagens de erro.

## Controllers

Controllers:

- recebem `Request`/`Response`;
- leem `req.body`, `req.params`, `req.query`, `req.auth`;
- convertem tipos básicos de entrada;
- chamam um service;
- escolhem status e formato da resposta;
- encaminham ou mapeiam erros conhecidos.

Controllers não:

- importam `prisma`;
- calculam conflito de horários;
- comparam senha;
- tomam decisão de repetição;
- conhecem detalhes de tabelas.

Manter um método por endpoint quando os contratos diferirem. Não criar um controller genérico de CRUD.

## Services

Services recebem dados simples/tipados, nunca `Request` ou `Response`.

```typescript
await agendamentoService.criar({
  usuarioAutenticadoId,
  nivelUsuario,
  profissionalId,
  servicoId,
  data,
  hora,
})
```

Responsabilidades:

- regras e casos de uso;
- coordenação entre repositories;
- transações/locks por meio de infraestrutura específica;
- integração externa por meio de clients/services.

Evitar “service pass-through” que apenas chama um repository sem regra. Para CRUD simples, um service ainda pode ser útil para validação e semântica de desativação; se não houver responsabilidade, documentar e manter a cadeia mínima.

## Repositories

Repositories contêm Prisma e linguagem de persistência:

```typescript
buscarPorId(id)
listarAtivos()
criar(dados)
atualizar(id, dados)
desativar(id)
```

Regras:

- não importar Express;
- não decidir status HTTP;
- não emitir toast/log de interface;
- aceitar `TransactionClient` quando necessário;
- usar `select` para dados sensíveis quando apropriado;
- não criar `BaseRepository`.

Um repository pode servir um agregado pequeno. Não é obrigatório um arquivo separado para cada tabela de apoio.

## Models e DTOs

Criar tipo próprio quando:

- a entrada do caso de uso é compartilhada;
- a resposta precisa excluir campos sensíveis;
- uma união evita strings inválidas;
- o formato não corresponde diretamente ao Prisma.

Não criar tipo apenas para renomear outro tipo idêntico sem ganho.

No frontend, tipos de API devem sair gradualmente de `client/src/lib/api.ts` para `client/src/models/`, agrupados por domínio.

## Páginas React

Uma página:

- compõe seções;
- conecta hooks/services;
- controla navegação e estado exclusivo da tela;
- delega blocos visuais extensos.

Evitar:

- chamadas HTTP espalhadas no JSX;
- `map` com dezenas de elementos e callbacks inline complexos;
- ternários com mais de duas decisões;
- regra de negócio escondida em condição visual;
- arquivo de centenas de linhas contendo várias telas/modais.

`client/src/pages/painel/AgendamentosPage.tsx` deve ser dividido por responsabilidade, preservando seu comportamento.

## Componentes React

- PascalCase;
- props tipadas e com nomes claros;
- eventos nomeados pelo efeito: `aoConfirmar`, `onConfirm`, seguindo a convenção local escolhida;
- componentes não devem buscar dados se a busca é responsabilidade da página/hook, salvo componente autônomo documentado;
- usar HTML semântico e atributos de acessibilidade.

Não componentizar cada `<div>`. Extraia quando houver identidade visual, responsabilidade ou reutilização.

## Hooks

- começam com `use`;
- coordenam estado, efeitos e handlers da interface;
- não substituem a regra autoritativa do backend;
- devem retornar uma API compreensível, não dezenas de estados sem agrupamento quando isso dificultar uso;
- dependências de `useEffect` devem refletir valores lidos pelo efeito.

Funções puras de data/formatação não precisam ser hooks.

## CSS

- um CSS por página/componente quando o estilo for local;
- classes semânticas em português ou nome claro consistente;
- modificador `--estado`;
- mobile first;
- preservar `:focus-visible`, `:hover`, `:disabled` e acessibilidade;
- evitar `!important`, exceto nas regras globais de acessibilidade em que o override é deliberado;
- evitar seletores profundos e dependentes da ordem do DOM.

Exemplo:

```css
.cartao-agendamento {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
  padding: 16px;
}

.cartao-agendamento--cancelado {
  opacity: 0.72;
}
```

## Tratamento de erros

### Backend

- erros esperados devem ter tipo/código estável;
- controller traduz erro conhecido para status/payload atual;
- erro inesperado deve ser registrado sem expor stack/segredo ao cliente;
- não usar texto da mensagem como único identificador quando o domínio for migrado;
- não engolir erros silenciosamente.

Enquanto não houver middleware central, usar `try/catch` no controller de forma consistente.

### Frontend

- `client/src/lib/api.ts`/futuro `http.ts` converte resposta não OK em `ApiError`;
- página/hook apresenta mensagem compreensível;
- não depender apenas da mensagem para decisões quando existe `codigo`;
- estados de loading devem ser encerrados em `finally`;
- não exibir detalhes internos.

## Async/await

- preferir `async/await` em fluxos com várias etapas;
- `Promise.all` quando operações são independentes;
- usar `void` apenas quando o efeito é deliberadamente não aguardado e o erro é tratado dentro da promise ou explicitamente com `.catch`;
- não misturar `.then` e `await` no mesmo fluxo sem motivo;
- não usar `forEach(async ...)`;
- documentar operações fire-and-forget, como notificações atuais.

## Try/catch

Usar quando a função:

- transforma um erro em resultado/status;
- adiciona contexto;
- garante cleanup/finally;
- é um limite de infraestrutura.

Não usar apenas para relançar o mesmo erro sem contexto.

No Express 5, promises rejeitadas podem chegar ao tratamento de erro; ainda assim, o projeto deve escolher um padrão explícito e uniforme durante a migração.

## Request e Response

- tipar params/body/query quando isso simplificar o controller;
- validar todo dado externo em runtime; TypeScript não valida JSON;
- não usar `req.auth!` antes do middleware correspondente estar garantido pela rota;
- não devolver entidades com campos sensíveis por conveniência;
- conservar o formato atual enquanto a tarefa for apenas refatoração.

## Imports

Ordem recomendada:

1. módulos da plataforma (`node:*`);
2. dependências externas;
3. aliases internos (`@/` no client);
4. imports relativos;
5. imports de tipo junto do módulo ou separados quando melhorar leitura.

Remover imports não usados no arquivo tocado. Não reorganizar o repositório inteiro no mesmo commit.

## Exports

- preferir named exports para services, repositories, helpers e componentes reutilizáveis;
- default export pode ser mantido para pages e routers, como no código atual;
- não criar arquivos `index.ts` de reexportação até existir ganho real;
- não exportar função interna sem consumidor/teste previsto.

## TypeScript

- evitar `any`; usar `unknown` e estreitar;
- evitar `Record<string, unknown>` atravessando todas as camadas; converter na borda;
- evitar `as` para silenciar incompatibilidade sem validação;
- usar `satisfies`, uniões literais e tipos derivados quando deixam o contrato claro;
- não usar `Partial<Entidade>` indiscriminadamente para entradas que aceitam apenas alguns campos;
- manter o nível de rigor de cada pacote durante a refatoração: `server/tsconfig.json` usa `strict: true`, enquanto `client/tsconfig.json` usa `strict: false`; elevar o frontend deve ser uma etapa separada;
- alinhar tipos de nível/status com os valores reais antes de torná-los globais.

## Ternários e condicionais

Aceitável:

```typescript
const destino = admin ? '/painel' : '/minha-conta'
```

Evitar ternários aninhados em JSX. Preferir variável nomeada, retorno antecipado ou componente auxiliar.

## Tamanho e leitura

Não estabelecer limite rígido de linhas. Sinais para dividir:

- função exige rolagem extensa;
- mais de um caso de uso completo no mesmo bloco;
- JSX mistura várias seções/modais;
- nomes locais deixam de indicar qual fluxo está ativo;
- teste exige montar dependências não relacionadas.

O resultado deve poder ser explicado na ordem em que aparece no arquivo.

## Definição de pronto para uma refatoração

- comportamento observável preservado;
- camada tem responsabilidade real;
- imports seguem a direção esperada;
- nenhuma chamada Prisma em route/controller;
- validações executadas;
- diff não inclui formatação alheia;
- documentação e checklist atualizados.
