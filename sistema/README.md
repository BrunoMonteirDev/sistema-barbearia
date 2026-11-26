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

O usuário escolhe **Esqueci minha senha**, informa seu e-mail e recebe um código de **6 dígitos**, válido por **10 minutos**. Na mesma tela, digita o código, a nova senha e sua confirmação. É possível solicitar outro código a cada **60 segundos**; cada novo envio aceito substitui o anterior. A tela mostra a contagem regressiva para o reenvio.

O código é de uso único e aceita até **5 tentativas**. Depois da redefinição, é necessário entrar novamente; as sessões anteriores deixam de funcionar. Esgotar as tentativas do código não bloqueia o login normal.

### Configuração do Mailtrap

Copie as variáveis de `.env.example` para seu `.env` local. As credenciais ficam somente no backend e nunca devem usar o prefixo `VITE_` ou ser incluídas no Git.

| Variável | Conteúdo |
| --- | --- |
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

Sem configuração SMTP completa, a API retorna indisponibilidade temporária e o restante da autenticação continua disponível. Uma falha SMTP mantém a resposta genérica, remove somente o código cujo envio falhou e preserva o intervalo de reenvio. O sucesso da solicitação não confirma entrega: confira a caixa de entrada/Sandbox e os logs do provedor. `APP_URL` não é mais necessária para recuperação.

### Funcionamento

1. `EsqueciSenhaPage.jsx` envia `{ email }` para `POST /api/auth/esqueci-senha`. A resposta contém uma mensagem genérica e `reenvioEmSegundos: 60`.
2. O serviço gera seis dígitos com `crypto.randomInt`, preservando zeros à esquerda. Apenas o HMAC-SHA-256 do código vinculado ao usuário fica no banco, usando `JWT_SECRET` como chave. Alterar esse segredo invalida códigos pendentes e sessões.
3. O repositório substitui o código com um UPDATE condicional, verificando o intervalo de 60 segundos persistido no PostgreSQL. Pedidos simultâneos, reinícios ou múltiplas instâncias não permitem enviar dois códigos nesse intervalo. O prazo de 10 minutos começa na emissão.
4. `EmailService` envia o código e seu prazo via SMTP com TLS, sem link de redefinição.
5. `RedefinirSenhaPage.jsx` recebe o código e envia `{ email, codigo, senha, confirmacaoSenha }` para `POST /api/auth/redefinir-senha`. O código é uma string de exatamente seis dígitos; não é colocado na URL nem no armazenamento do navegador.
6. Uma transação contabiliza a tentativa, verifica o código e o prazo, grava a senha com bcrypt, apaga o código e incrementa `versaoSessao`. A linha fica bloqueada até o commit para garantir o limite de tentativas e o uso único sob concorrência. Após cinco tentativas incorretas, é necessário solicitar outro código.
7. O middleware de autenticação recusa as sessões anteriores. A troca administrativa de senha também invalida a recuperação pendente e as sessões.

Contas apenas Google, desativadas, inexistentes ou ambíguas recebem a mesma resposta pública, sem envio. O código de uma conta não pode redefinir outra. O limitador HTTP por e-mail permite uma solicitação por minuto, inclusive para contas inexistentes, e devolve HTTP 429 com `Retry-After` e `reenvioEmSegundos` quando excedido. Há limites adicionais de 30 solicitações e 20 redefinições por IP em 15 minutos.

Os limitadores HTTP usam memória por processo; múltiplas instâncias devem compartilhar um store para uniformizar esses limites. O intervalo de emissão e as cinco tentativas por código são persistidos no banco. Atrás de proxy, configure `trust proxy` somente para proxies confiáveis. O envio SMTP síncrono ainda pode produzir diferenças de tempo entre contas existentes e inexistentes.

### Atualização e validação

A migration `20261126000000_recuperacao_codigo` acrescenta o horário da última solicitação e o contador de tentativas, e invalida links do fluxo antigo. Aplique-a antes de iniciar a nova versão do backend:

```bash
npm run prisma:generate
npm run prisma:deploy
```

Os testes cobrem prazo de 10 minutos, fronteira exata dos 60 segundos, reenvios simultâneos, invalidação do código anterior, uso único, cinco tentativas sob concorrência, zeros à esquerda, conta incorreta, troca administrativa, login com senha nova e invalidação de sessões. O transporte SMTP é substituído nos testes; a entrega real deve ser validada no ambiente de destino.

Para executar a integração, use um PostgreSQL exclusivo de testes com as migrations aplicadas:

```bash
DATABASE_URL="$TEST_DATABASE_URL" npm run prisma:deploy
npm test
```

No navegador, confira o fluxo completo, a contagem regressiva, a possibilidade de colar o código, os erros e o retorno ao login em desktop e celular. Os campos têm rótulos, o código aceita preenchimento automático e as mensagens de resultado usam regiões de status/alerta. A revisão manual com teclado e leitor de tela continua necessária.

## Estrutura

| Caminho | Conteúdo |
| --- | --- |
| `src/frontend/` | Interface, páginas, componentes e serviços HTTP |
| `src/backend/` | Rotas, controllers, services e repositories por domínio |
| `prisma/` | Schema e histórico de migrations do banco |
| `scripts/` | Verificações auxiliares usadas pelo build |
| `public/` | Arquivos estáticos utilizados pela interface |

Consulte o [índice da documentação](../docs/README.md) para distinguir o material atual dos registros históricos. A configuração Vite válida é `vite.config.js`, na raiz de `sistema/`; a antiga pasta `client/`, que continha apenas uma configuração obsoleta, foi removida.
