# Padrões de código

## Nomenclatura

Elementos criados pelo sistema devem usar português brasileiro sempre que tecnicamente apropriado: arquivos, componentes, funções, métodos, variáveis, tipos, interfaces, controladores, serviços, utilitários, constantes e estruturas de domínio.

Não traduzir nomes impostos por tecnologias ou bibliotecas, como `useState`, `useEffect`, `Promise`, `Error`, `Request`, `Response`, APIs externas e convenções obrigatórias dos frameworks.

Preferir nomes que expressem a responsabilidade, como `PaginaAgendamento`, `ControladorAgendamento`, `ServicoAgendamento`, `buscarHorariosDisponiveis`, `confirmarAgendamento`, `servicoSelecionado` e `carregandoHorarios`. Evitar nomes vagos como `handle`, `process`, `execute`, `data` e `submit` quando houver nome mais específico.

## Organização visual

- manter indentação e espaçamento consistentes;
- organizar imports de forma previsível;
- manter JSX legível;
- distribuir objetos grandes em várias linhas;
- extrair callbacks grandes do JSX quando isso melhorar a leitura;
- manter funções com responsabilidade clara;
- evitar compactar código somente para reduzir linhas;
- evitar ternários complexos e preferir código explícito.

## Comentários

Não comentar cada linha. Em arquivos importantes, usar no máximo um comentário curto no início para explicar a responsabilidade, por exemplo:

`// Controla as operações e regras relacionadas aos agendamentos.`

O código deve se explicar principalmente por nomes e organização.
