# Barbearia Web

Sistema acadêmico de agendamento para uma única barbearia, desenvolvido como TCC do IFPR. Clientes reservam horários online; administradores e funcionários acompanham agenda, serviços e profissionais.

## Tecnologias

- Interface: React, JavaScript e Vite.
- API: Node.js, Express e JWT.
- Dados: PostgreSQL e Prisma ORM.

## Execução local

Execute os comandos desta seção dentro da pasta `sistema/`.

1. Configure `.env` a partir de `.env.example`, com `DATABASE_URL` e `JWT_SECRET`.
2. Instale dependências com `npm install` e gere o cliente Prisma com `npm run prisma:generate`.
3. Aplique as migrations com `npm run prisma:deploy`.
4. Inicie a aplicação com `npm run dev`, ou use `npm run dev:frontend` e `npm run dev:backend` em terminais separados.

Use uma versão do Node compatível com o campo `engines` do `package.json`. O Vite usa polling para detectar alterações no frontend, e o backend usa o modo `--watch` nativo do Node.

## Verificação

Use `npm run lint` e `npm run build` para verificar o código.

Execute `npm test` para os testes de recuperação de senha. Os testes de integração só rodam quando `TEST_DATABASE_URL` aponta para um PostgreSQL exclusivo de testes, com as migrations aplicadas. Sem essa variável, a integração é marcada como ignorada. O build do backend faz verificação sintática; ele não substitui os testes funcionais.

## Recuperação de senha por e-mail

O usuário escolhe **Esqueci minha senha** no login, informa seu e-mail e recebe um link válido por 30 minutos. Ao abrir o link, informa e confirma uma nova senha. Depois da redefinição, precisa entrar novamente; as sessões anteriores deixam de funcionar.

### Configuração do Mailtrap

Copie as variáveis de `.env.example` para seu `.env` local. As credenciais ficam somente no backend e nunca devem usar o prefixo `VITE_` ou ser incluídas no Git.

| Variável | Conteúdo |
| --- | --- |
| `APP_URL` | URL da interface, como `http://localhost:5000`; em produção, HTTPS |
| `SMTP_HOST` | Host exibido na integração SMTP do Mailtrap |
| `SMTP_PORT` | Porta SMTP fornecida pelo Mailtrap |
| `SMTP_USER` | Usuário SMTP |
| `SMTP_PASS` | Senha SMTP/token fornecido pelo Mailtrap |
| `EMAIL_FROM` | Remetente, como `Barbearia <nao-responda@seudominio.com>` |

No **Email Sandbox**, use as credenciais da caixa de testes (normalmente `sandbox.smtp.mailtrap.io`, porta `2525`). A mensagem aparece no painel do Mailtrap. Para entrega real, use **Email Sending**, domínio verificado, remetente autorizado e as credenciais correspondentes (`live.smtp.mailtrap.io`, porta `587`). Não misture credenciais de Sandbox e envio real. Consulte a [documentação SMTP do Mailtrap](https://docs.mailtrap.io/email-api-smtp/smtp-integration).

Após atualizar o código, execute na pasta `sistema/`:

```bash
npm install
npm run prisma:generate
npm run prisma:deploy
npm run dev
```

Sem configuração completa, a API retorna indisponibilidade temporária e o restante da autenticação continua disponível. Uma falha SMTP não expõe a existência da conta: a resposta permanece genérica, o token que falhou é removido e o servidor registra uma mensagem sem credenciais ou link. O sucesso da solicitação não é uma confirmação de entrega; confira a caixa de entrada/Sandbox e os logs do provedor.

### Código e roteiro para explicar o fluxo

1. `src/frontend/pages/EsqueciSenhaPage.jsx` envia o e-mail para `POST /api/auth/esqueci-senha`.
2. `src/backend/auth/recuperacao-senha.service.js` gera 32 bytes aleatórios, calcula SHA-256 e define o prazo de 30 minutos. O hash fica no banco; o token original vai no link. Um novo pedido substitui o link anterior.
3. `src/backend/auth/email.service.js` usa Nodemailer para entregar a mensagem ao SMTP do Mailtrap com TLS. `APP_URL` determina o destino do link, sem depender de cabeçalhos enviados pelo cliente.
4. `src/frontend/pages/RedefinirSenhaPage.jsx` lê o token do fragmento da URL (`#token=...`) e envia a nova senha com confirmação para `POST /api/auth/redefinir-senha`. O fragmento não é enviado ao servidor no GET nem no cabeçalho Referer; ele continua sendo um segredo que não deve ser compartilhado.
5. `src/backend/auth/recuperacao-senha.repository.js` executa um UPDATE condicional: verifica token, prazo e conta ativa, grava a senha com bcrypt, apaga o token e incrementa `versaoSessao`. Somente uma requisição consegue consumir o link, inclusive sob concorrência.
6. `src/backend/middlewares/auth.js` compara a versão do JWT com a versão atual do usuário. Assim, sessões anteriores são recusadas. A troca de senha pelo administrador também invalida links e sessões.

Fala sugerida para a apresentação:

> O sistema gera um link temporário quando o usuário esquece a senha. O Mailtrap é responsável pelo envio do e-mail por SMTP; as regras de recuperação são executadas pelo meu backend. No banco, guardo apenas o hash do token e sua validade. Quando a pessoa define uma nova senha, o servidor verifica o link, salva a senha como hash e invalida o token em uma única operação. Isso faz com que o link seja de uso único. Depois, a pessoa precisa entrar com a nova senha, pois as sessões antigas também são invalidadas.

Contas criadas apenas com Google continuam usando o acesso Google. Contas desativadas ou endereços não cadastrados recebem a mesma resposta pública, sem envio. Cadastros antigos com variações de maiúsculas são aceitos quando há uma única conta ativa correspondente; correspondências ambíguas não geram links.

As solicitações possuem limites de 10 por IP e 3 por e-mail em 15 minutos; a redefinição aceita até 20 tentativas por IP nesse intervalo. Os limites ficam na memória de cada processo. Para várias instâncias, configure um armazenamento compartilhado; atrás de proxy, configure `trust proxy` apenas para os proxies confiáveis da implantação. A resposta genérica reduz a exposição de contas, mas o envio SMTP síncrono pode produzir diferenças de tempo; uma implantação que exija uniformidade temporal deve usar uma fila de e-mails.

### Validação

Os testes cobrem expiração, uso único, concorrência real no PostgreSQL, troca administrativa, conta desativada, login com senha nova e invalidação da sessão antiga. O transporte SMTP é substituído nos testes, portanto eles não comprovam entrega pelo Mailtrap.

Para executar a integração, crie um banco exclusivo de testes e aplique as migrations nele. Nunca use o banco de produção:

```bash
DATABASE_URL="$TEST_DATABASE_URL" npm run prisma:deploy
npm test
```

Depois de configurar o Mailtrap: solicite um link para uma conta local de teste, confira o remetente e a URL recebida, redefina a senha, teste o login e tente reutilizar o mesmo link. A entrega real deve ser validada com as credenciais do ambiente de destino.

Verificação realizada em 23/11/2026: lint e build passaram; 14 testes passaram com PostgreSQL isolado. O fluxo de interface foi verificado no Chrome com respostas HTTP simuladas, em desktop e largura de 360 px, incluindo confirmação divergente, link incompleto, abertura de outro token na mesma aba, sucesso e retorno ao login. Não houve erros JavaScript nem rolagem horizontal no cenário móvel. O aviso global de cookies foi fechado pelo botão “Entendi” antes da interação.

O axe-core não encontrou violações nos formulários de solicitação (desktop) e redefinição (desktop e celular), no escopo das regras WCAG A/AA executadas. Essa checagem não certifica conformidade completa: navegação integral por teclado, leitura com NVDA/VoiceOver e zoom de 400% ainda precisam de revisão manual. A integração SMTP real permanece pendente das credenciais.

## Estrutura

| Caminho | Conteúdo |
| --- | --- |
| `src/frontend/` | Interface, páginas, componentes e serviços HTTP |
| `src/backend/` | Rotas, controllers, services e repositories por domínio |
| `prisma/` | Schema e histórico de migrations do banco |
| `scripts/` | Verificações auxiliares usadas pelo build |
| `public/` | Arquivos estáticos utilizados pela interface |

Consulte o [índice da documentação](../docs/README.md) para distinguir o material atual dos registros históricos. A configuração Vite válida é `vite.config.js`, na raiz de `sistema/`; a antiga pasta `client/`, que continha apenas uma configuração obsoleta, foi removida.
