# 💈 06 - Banco de Dados

# Barbearia Web

---

# 1. Introdução

Este documento apresenta a modelagem do banco de dados do sistema Barbearia Web.

O banco será responsável pelo armazenamento das informações utilizadas pela aplicação, garantindo organização, integridade e persistência dos dados.

A solução utilizará um banco de dados relacional baseado em PostgreSQL.

O acesso aos dados será realizado através do Prisma ORM.

---

# 2. Sistema Gerenciador de Banco de Dados

## PostgreSQL

O PostgreSQL foi escolhido por ser um sistema gerenciador de banco de dados relacional robusto, gratuito e amplamente utilizado no mercado.

Características utilizadas:

- relacionamentos entre tabelas;
- integridade referencial;
- consultas estruturadas;
- segurança;
- escalabilidade.

---

# 3. ORM

## Prisma ORM

O Prisma será utilizado como camada de comunicação entre a aplicação e o banco de dados.

Responsabilidades:

- definição dos modelos;
- criação das migrations;
- consultas;
- manipulação dos registros.


Fluxo:


```
Aplicação

↓

Prisma ORM

↓

PostgreSQL

↓

Banco de Dados
```

---

# 4. Modelo Conceitual


O sistema possui como principais entidades:


```
Usuário

Profissional

Serviço

Horário

Agendamento

Pagamento
```


---

# 5. Modelo Relacional


Representação simplificada:


```
USUARIO

1
|
|
N

AGENDAMENTO

N
|
|
1

PROFISSIONAL


AGENDAMENTO

N
|
|
1

SERVICO



PROFISSIONAL

N
|
|
N

HORARIO
```


---

# 6. Entidades do Sistema

---

# 6.1 Usuário


Representa clientes e administradores do sistema.


Tabela:

```
usuario
```


## Atributos


| Campo | Tipo | Descrição |
|-|-|-|
| id | UUID | Identificador único |
| nome | String | Nome completo |
| telefone | String | Telefone |
| email | String | Email de acesso |
| senha | String | Senha criptografada |
| tipo | Enum | Cliente ou administrador |
| status | Boolean | Usuário ativo |
| created_at | DateTime | Data criação |
| updated_at | DateTime | Última alteração |


---

## Relacionamentos


Um usuário pode possuir vários agendamentos.


```
Usuario

1:N

Agendamento
```


---

# 6.2 Profissional


Representa os barbeiros cadastrados.


Tabela:


```
profissional
```


## Atributos


| Campo | Tipo | Descrição |
|-|-|-|
| id | UUID | Identificador |
| nome | String | Nome profissional |
| especialidade | String | Área de atuação |
| ativo | Boolean | Status |
| created_at | DateTime | Criação |


---

## Relacionamentos


Um profissional pode possuir vários agendamentos.


```
Profissional

1:N

Agendamento
```


Um profissional pode possuir vários horários.


```
Profissional

N:N

Horario
```


---

# 6.3 Serviço


Representa os serviços oferecidos.


Tabela:


```
servico
```


## Atributos


| Campo | Tipo | Descrição |
|-|-|-|
| id | UUID | Identificador |
| nome | String | Nome serviço |
| descricao | String | Descrição |
| duracao | Integer | Tempo em minutos |
| preco | Decimal | Valor |
| ativo | Boolean | Status |


---

## Exemplos


```
Corte

30 minutos

R$40


Barba

20 minutos

R$25
```


---

## Relacionamento


Um serviço pode estar em vários agendamentos.


```
Servico

1:N

Agendamento
```


---

# 6.4 Horário


Representa períodos disponíveis de trabalho.


Tabela:


```
horario
```


## Atributos


| Campo | Tipo | Descrição |
|-|-|-|
| id | UUID | Identificador |
| dia_semana | Integer | Dia da semana |
| hora_inicio | Time | Início |
| hora_fim | Time | Fim |


---

# 6.5 Profissional_Horario


Tabela associativa responsável pelo relacionamento N:N.


Tabela:


```
profissional_horario
```


## Campos


| Campo | Tipo |
|-|-|
| profissional_id | FK |
| horario_id | FK |


---

# 6.6 Agendamento


Principal entidade do sistema.


Representa um atendimento marcado.


Tabela:


```
agendamento
```


## Atributos


| Campo | Tipo | Descrição |
|-|-|-|
| id | UUID | Identificador |
| usuario_id | FK | Cliente |
| profissional_id | FK | Barbeiro |
| servico_id | FK | Serviço |
| data_hora | DateTime | Data atendimento |
| status | Enum | Situação |
| observacao | String | Observações |
| created_at | DateTime | Criação |


---

# Status possíveis


```
PENDENTE

CONFIRMADO

CANCELADO

FINALIZADO

REMARCADO
```


---

## Relacionamentos


Um agendamento possui:


```
1 Cliente

1 Profissional

1 Serviço
```


---

# 6.7 Pagamento


Funcionalidade futura.


Tabela:


```
pagamento
```


## Atributos


| Campo | Tipo |
|-|-|
| id | UUID |
| agendamento_id | FK |
| tipo | Enum |
| status | Enum |
| valor | Decimal |


---

# 7. Relacionamentos


## Usuário → Agendamento


Cardinalidade:


```
1:N
```


Um usuário pode realizar vários agendamentos.


---

## Profissional → Agendamento


Cardinalidade:


```
1:N
```


Um profissional pode atender vários clientes.


---

## Serviço → Agendamento


Cardinalidade:


```
1:N
```


Um serviço pode ser utilizado várias vezes.


---

## Profissional ↔ Horário


Cardinalidade:


```
N:N
```


Um profissional pode possuir vários horários e um horário pode pertencer a vários profissionais.


---

## Agendamento → Pagamento


Cardinalidade:


```
1:1
```


Pagamento é opcional.


---

# 8. Regras de Integridade


## Chaves primárias


Todas as tabelas devem possuir identificador único.


Padrão:

```
UUID
```


---

## Chaves estrangeiras


Relacionamentos devem utilizar referências entre tabelas.


Exemplo:


```
agendamento.usuario_id

↓

usuario.id
```


---

# 9. Índices


Índices previstos:


## Usuário

```
email
```


Motivo:

Busca rápida durante login.


---

## Agendamento


```
data_hora

profissional_id
```


Motivo:

Consulta de disponibilidade.


---

# 10. Exclusão de Dados


O sistema deve evitar exclusões permanentes.


Será utilizado:

Soft Delete.


Exemplo:


```
ativo = false
```


Motivos:

- preservar histórico;
- manter relatórios;
- evitar perda de informações.

---

# 11. Evolução do Banco


O banco poderá receber futuramente:


## Notificações


Tabela:

```
notificacao
```


Armazenará:

- mensagem;
- tipo;
- envio.


---

## Auditoria


Tabela:

```
log
```


Armazenará:

- usuário;
- ação;
- data.


---

## Pagamentos completos


Integração com:

- PIX;
- cartão;
- gateways.


---

# 12. Modelo Inicial do MVP


Para a primeira versão funcional serão utilizadas:


```
Usuario

Profissional

Servico

Agendamento
```


As demais entidades serão adicionadas conforme evolução.


---

# 13. Considerações Finais


A modelagem foi criada buscando equilíbrio entre simplicidade e possibilidade de evolução.

O banco inicial atende ao fluxo principal do sistema:

```
Cliente

↓

Escolhe Serviço

↓

Escolhe Profissional

↓

Escolhe Horário

↓

Cria Agendamento
```


Essa estrutura permite desenvolver o MVP e posteriormente adicionar funcionalidades mais avançadas sem necessidade de reconstrução completa.