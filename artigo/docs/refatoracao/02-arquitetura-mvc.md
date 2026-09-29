# Arquitetura MVC adaptada

MVC será aplicado de forma compatível com React no cliente e Express/Prisma no servidor. Não será usado um MVC clássico artificial.

## View

No cliente, páginas e componentes React representam a View. São responsáveis por interface, exibição de dados, interação do usuário e estados puramente visuais. Não devem concentrar regras importantes de negócio, como autorização, disponibilidade ou prevenção de conflitos.

## Controller

No backend, as rotas Express atuam como camada de entrada/controller: recebem requisições, validam o formato mínimo, coordenam autenticação e chamam serviços ou persistência. Essa camada deve devolver o status e a resposta HTTP apropriados, mas não concentrar toda a regra de negócio.

## Model

Os modelos do domínio são representados principalmente pelo schema Prisma: `Usuario`, `Profissional`, `Servico`, `Agendamento`, `DisponibilidadeProfissional`, `Configuracao`, histórico e notificações. O Model inclui os conceitos e dados persistidos, em conjunto com o cliente Prisma.

## Serviços

Serviços serão usados quando houver regra significativa, como horários e disponibilidade, regras de agendamento, bloqueio concorrente da agenda, repetição, senha, usuário, notificações e Evolution. Não criar um Service que apenas repasse uma chamada sem agregar responsabilidade.

## Persistência

Usar Prisma diretamente ou por serviços quando isso for claro. Não criar Repository apenas para cumprir nomenclatura; o ORM já fornece uma solução adequada para as consultas e transações existentes.

## Fluxo esperado

Para agendamento, o fluxo-alvo é próximo de:

`AgendarPage/NovoAgendamentoWizard → controlador/rota de agendamento → regras e disponibilidade → Prisma/Model → PostgreSQL`

O fluxo real será documentado após cada etapa. Evitar factories, adapters, repositories genéricos, classes base abstratas, interfaces sem benefício, arquivos que apenas repassam chamadas e dezenas de arquivos minúsculos.
