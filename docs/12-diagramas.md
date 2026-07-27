# 💈 12 - Diagramas do Sistema

# Barbearia Web

---

# 1. Introdução

Este documento apresenta os diagramas utilizados para representar a estrutura, funcionamento e organização do sistema Barbearia Web.

Os diagramas têm como objetivo facilitar a compreensão da arquitetura, dos processos e dos relacionamentos entre os componentes do sistema.

---

# 2. Diagrama Geral da Arquitetura

O sistema será desenvolvido utilizando uma arquitetura web baseada em camadas.

Fluxo principal:


```
Usuário

↓

Frontend
(Next.js + React)

↓

Backend
(Route Handlers)

↓

ORM
(Prisma)

↓

Banco de Dados
(PostgreSQL)
```


---

# 3. Descrição da Arquitetura


## Frontend


Responsável pela interface do usuário.


Tecnologias:


- Next.js
- React
- TypeScript
- Tailwind CSS


Responsabilidades:


- apresentar telas;
- capturar informações;
- realizar interações;
- consumir APIs.


---

## Backend


Responsável pelas regras de negócio.


Responsabilidades:


- validar informações;
- controlar permissões;
- processar agendamentos;
- comunicar com banco.


---

## Banco de Dados


Responsável pelo armazenamento das informações.


Principais dados:


- usuários;
- profissionais;
- serviços;
- agendamentos.


---

# 4. Diagrama de Casos de Uso


## Atores


O sistema possui dois atores principais:


```
Cliente

Administrador
```


---

# Cliente


Pode:


```
Cadastrar conta

Realizar login

Visualizar serviços

Escolher profissional

Realizar agendamento

Consultar horários

Cancelar agendamento

Remarcar agendamento
```


---

# Administrador


Pode:


```
Realizar login

Gerenciar clientes

Gerenciar profissionais

Gerenciar serviços

Visualizar agenda

Gerenciar agendamentos

Consultar relatórios
```


---

# Representação


```
                 Sistema Barbearia Web


Cliente ---------------------> Agendar horário

Cliente ---------------------> Consultar agenda

Cliente ---------------------> Cancelar horário



Administrador ---------------> Gerenciar serviços

Administrador ---------------> Gerenciar profissionais

Administrador ---------------> Gerenciar agenda

Administrador ---------------> Relatórios

```

---

# 5. Fluxo de Agendamento


O fluxo principal do sistema:


```
Início

↓

Cliente acessa sistema

↓

Seleciona serviço

↓

Seleciona profissional

↓

Seleciona data

↓

Sistema consulta disponibilidade

↓

Exibe horários disponíveis

↓

Cliente escolhe horário

↓

Confirma informações

↓

Sistema salva agendamento

↓

Envia confirmação

↓

Fim
```


---

# 6. Regras do Fluxo de Agendamento


Antes de criar um agendamento o sistema deve verificar:


```
Serviço existente

+

Profissional ativo

+

Data válida

+

Horário disponível

+

Ausência de conflito
```


Somente após todas as validações o agendamento será criado.

---

# 7. Modelo Entidade-Relacionamento


Modelo inicial do banco:


```
USUARIO

id
nome
email
telefone
senha
status



        1:N


AGENDAMENTO


id
data_hora
status
observacao



        N:1


PROFISSIONAL

id
nome
especialidade
ativo



        N:1


SERVICO

id
nome
duracao
preco

```


---

# 8. Relacionamentos


## Usuário x Agendamento


Um usuário pode possuir vários agendamentos.


Relacionamento:


```
Usuario 1 -------- N Agendamento
```


---

## Profissional x Agendamento


Um profissional pode possuir vários atendimentos.


Relacionamento:


```
Profissional 1 -------- N Agendamento
```


---

## Serviço x Agendamento


Um serviço pode estar associado a vários atendimentos.


Relacionamento:


```
Servico 1 -------- N Agendamento
```


---

# 9. Diagrama de Sequência - Criar Agendamento


Processo:


```
Cliente

 |

 | Escolhe serviço

 ↓

Frontend

 |

 | Solicita disponibilidade

 ↓

API

 |

 | Consulta banco

 ↓

PostgreSQL

 |

 | Retorna horários

 ↓

API

 |

 | Retorna dados

 ↓

Frontend

 |

 | Cliente confirma

 ↓

API

 |

 | Cria registro

 ↓

Banco

 |

 | Retorna sucesso

 ↓

Cliente
```


---

# 10. Diagrama de Componentes


Estrutura:


```
Aplicação

│

├── Interface

│    ├── Pages

│    ├── Components

│    └── Forms


├── Regras

│    ├── Services

│    ├── Validations

│    └── Controllers


├── Banco

│    ├── Prisma

│    └── PostgreSQL


└── Integrações

     ├── WhatsApp API

     └── VLibras
```


---

# 11. Fluxo de Dados


Exemplo:


```
Usuário informa dados

↓

Componente React

↓

API

↓

Validação

↓

Prisma

↓

Banco

↓

Resposta

↓

Atualização da interface

```


---

# 12. Diagrama de Integrações Externas


O sistema poderá possuir integrações:


```
Sistema

|

├── API WhatsApp

│
└── VLibras
```


---

# 13. Evolução dos Diagramas


Os diagramas serão atualizados conforme novas funcionalidades forem adicionadas.


Possíveis evoluções:


- autenticação;
- pagamentos;
- notificações;
- relatórios avançados;
- inteligência artificial.


---

# 14. Considerações Finais


Os diagramas auxiliam na documentação e comunicação do projeto, permitindo compreender tanto a estrutura técnica quanto os processos realizados pelos usuários.

Eles também serão utilizados como apoio durante a apresentação do Trabalho de Conclusão de Curso.