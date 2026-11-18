# Guia para a apresentação do TCC

Ao finalizar a refatoração, criar na raiz o arquivo `GUIA_APRESENTACAO.md`. Ele deve ensinar o funcionamento real do sistema final, usando caminhos e funções que existirem naquele momento.

Para cada funcionalidade importante, incluir:

## Como explicar oralmente

Uma explicação simples, sem depender da leitura do código.

## Fluxo técnico

Representar o caminho real, por exemplo:

`View → Controller → Serviço → Model/persistência → Banco`

## Arquivos para abrir

Informar caminhos reais e a ordem de abertura durante a apresentação.

## O que mostrar

Destacar entrada de dados, funções importantes, validações, regras de negócio, persistência e retorno para a interface.

## Perguntas e respostas

Criar perguntas prováveis da banca, baseadas no código real, com respostas curtas e fáceis de explicar.

## Mapa rápido para a banca

Incluir atalhos como:

- “Mostre o login” → arquivos reais de View, API/rota, autenticação e serviço;
- “Mostre como a senha é validada” → arquivos reais de validação e autenticação;
- “Mostre como funciona o agendamento” → View, rota/controlador, regras de horário e persistência;
- “Mostre como evita conflito de horários” → disponibilidade, lock/transação e rota;
- “Mostre a administração” → painel, rotas protegidas e modelos correspondentes.

O guia não deve inventar uma arquitetura idealizada: deve refletir o sistema final.
