# Guia do código para apresentação

O sistema tem duas partes simples: `client` é a interface React/Vite e `server`
é a API Express. PostgreSQL guarda os dados; Prisma é o ORM, a camada que
permite à API manipular o banco por TypeScript e migrations versionadas.

## Login

`LoginPage.tsx` envia o formulário ao contexto de autenticação, que chama
`POST /api/auth/login`. A rota em `server/src/routes/auth.ts` confere e-mail e
hash da senha no banco. Se os dados forem válidos, devolve um JWT: token
assinado que identifica a sessão nas próximas requisições. O middleware
`auth.ts` valida esse token. Autenticação identifica a pessoa; autorização
limita o que ela pode fazer, como acessar apenas os próprios agendamentos.

## Consultar horários

1. `AgendarPage.tsx` coleta profissional, serviço e data.
2. A página chama `GET /api/agendamentos/disponibilidade`, público e limitado a
   horários; ele não retorna reservas nem dados pessoais.
3. `horarios.service.ts` consulta jornada semanal, duração e agendamentos não
   cancelados.
4. Só retorna inícios que tenham todos os blocos consecutivos de 30 minutos
   necessários. A tela mostra o resultado em grade.

Em “Sem preferência”, a API procura os blocos realmente configurados de
profissionais ativos e escolhe o primeiro que possa atender.

## Criar agendamento

1. A revisão exige aceite e login apenas ao confirmar.
2. `POST /api/agendamentos` valida dados, antecedência, usuário, serviço,
   profissional e disponibilidade.
3. `agenda-lock.service.ts` abre uma transação e usa advisory lock por
   profissional e data. Transação agrupa operações para confirmar ou desfazer
   juntas; advisory lock evita que duas reservas concorrentes ocupem a mesma
   agenda após verificarem disponibilidade.
4. A disponibilidade é calculada novamente dentro da transação.
5. Prisma grava no PostgreSQL. A migration é o arquivo versionado que aplica
   mudanças na estrutura do banco.

## Segundo agendamento no mesmo dia

`repeticao-agendamento.service.ts` procura agendamentos ativos daquele cliente
na mesma data. Havendo resultado, a API devolve horário, serviço e profissional
para o aviso. O modal oferece “Voltar” e “Agendar mesmo assim”; a segunda
confirmação usa token assinado temporário ligado exatamente à tentativa.
Cancelados não entram no aviso.

## Cancelamento e remarcação

- Cancelar verifica dono ou administrador, aplica a antecedência do cliente,
  muda o status para `CANCELADO` e cria histórico. O horário volta a ficar
  disponível.
- Remarcar valida permissão, prazo e nova disponibilidade dentro do mesmo lock
  usado na criação, para não ignorar jornada nem criar sobreposição.

## Administração

As páginas de `client/src/pages/painel` usam rotas protegidas:

- `usuarios.ts`: clientes e contas;
- `profissionais.ts`: profissionais e disponibilidade semanal;
- `servicos.ts`: serviços, duração, preço e status;
- `configuracoes.ts`: regras de antecedência;
- `agendamentos.ts`: agenda, status, edição e histórico.

As entidades e relações ficam em `server/prisma/schema.prisma`; as migrations
em `server/prisma/migrations` permitem reproduzir o banco em outro ambiente.
