# 💈 02 - Arquitetura do Sistema

# Barbearia Web

---

# 1. Introdução

A arquitetura do Barbearia Web foi planejada visando organização, manutenção e facilidade de evolução do sistema.

O projeto utilizará uma arquitetura web moderna baseada no framework Next.js, permitindo a construção do frontend e backend dentro da mesma aplicação.

A arquitetura foi definida buscando equilíbrio entre:

- simplicidade;
- boas práticas;
- desempenho;
- facilidade de aprendizado;
- adequação ao escopo do TCC.

---

# 2. Visão Geral da Arquitetura

O sistema será dividido nas seguintes camadas:


```
┌─────────────────────────┐
│        Usuário          │
│ Cliente / Administrador │
└────────────┬────────────┘
             │
             ▼

┌─────────────────────────┐
│       Frontend          │
│ Next.js + React         │
│ Interface do Sistema    │
└────────────┬────────────┘
             │
             ▼

┌─────────────────────────┐
│       Backend           │
│ Next.js API / Services  │
│ Regras de Negócio      │
└────────────┬────────────┘
             │
             ▼

┌─────────────────────────┐
│      ORM Prisma         │
│ Comunicação com Banco   │
└────────────┬────────────┘
             │
             ▼

┌─────────────────────────┐
│     PostgreSQL          │
│ Banco de Dados          │
└─────────────────────────┘
```

---

# 3. Modelo Arquitetural

O sistema seguirá uma arquitetura baseada em camadas.

As principais divisões serão:


## Camada de Apresentação

Responsável pela interface visual.

Tecnologias:

- React;
- Next.js;
- Tailwind CSS;
- shadcn/ui.


Responsabilidades:

- exibir informações;
- capturar ações do usuário;
- apresentar mensagens;
- controlar componentes visuais.


Exemplo:

Tela de agendamento.

---

# Camada de Aplicação

Responsável pela comunicação entre interface e regras do sistema.


Responsabilidades:

- receber requisições;
- validar dados;
- chamar serviços;
- retornar respostas.


Implementação:

- Route Handlers;
- Server Actions.


---

# Camada de Negócio

Responsável pelas regras do sistema.


Exemplos:


"Um profissional não pode possuir dois clientes no mesmo horário."


"Um cliente só pode cancelar com antecedência."


Essa camada ficará separada dos componentes visuais.


Implementação:


```
services/
```


Exemplo:

```
agendamento.service.ts
```


---

# Camada de Dados

Responsável pela persistência das informações.


Tecnologias:

- Prisma ORM;
- PostgreSQL.


Responsabilidades:

- consultar dados;
- inserir registros;
- atualizar informações;
- remover registros.


---

# 4. Arquitetura do Next.js


O projeto utilizará o padrão App Router do Next.js.


Estrutura:


```
src/

app/

├── page.tsx

├── layout.tsx

├── dashboard/

├── agendamento/

└── api/


components/

lib/

services/

types/
```


---

# 5. Frontend


O frontend será responsável pela interação com os usuários.


Principais tecnologias:


## React

Utilizado para criação de componentes reutilizáveis.


Exemplos:

- botões;
- formulários;
- cards;
- tabelas.


---

## TypeScript

Utilizado para garantir maior segurança durante o desenvolvimento.


Benefícios:

- prevenção de erros;
- melhor organização;
- melhor manutenção.


---

## Tailwind CSS

Responsável pela estilização.


Objetivos:

- interface responsiva;
- padronização visual;
- desenvolvimento mais rápido.


---

# 6. Backend


O backend será implementado utilizando recursos internos do Next.js.


Responsabilidades:


- processar requisições;
- aplicar regras de negócio;
- comunicar com banco;
- validar informações.


---

# 7. Comunicação entre Frontend e Backend


Fluxo:


```
Usuário

↓

Componente React

↓

Requisição

↓

API Route Handler

↓

Service

↓

Prisma

↓

PostgreSQL

↓

Resposta

↓

Interface atualizada
```


---

# 8. Banco de Dados


O sistema utilizará PostgreSQL.


O modelo relacional foi escolhido devido à existência de várias relações entre entidades.


Exemplo:


```
Usuário

1:N

Agendamento


Profissional

1:N

Agendamento


Serviço

1:N

Agendamento

```


---

# 9. Prisma ORM


O Prisma será responsável pela comunicação entre aplicação e banco.


Responsabilidades:


- criação de consultas;
- migrations;
- tipagem automática;
- organização dos modelos.


Fluxo:


```
Aplicação

↓

Prisma Client

↓

PostgreSQL
```


---

# 10. Integrações Externas


O sistema possui previsão de integração com serviços externos.


---

# WhatsApp


Objetivo:

Enviar mensagens automáticas.


Exemplos:


- confirmação de agendamento;
- lembrete de atendimento;
- alteração de horário.


Fluxo:


```
Sistema

↓

API WhatsApp

↓

Cliente
```


---

# VLibras


Objetivo:

Auxiliar usuários surdos através da tradução automática para Libras.


Fluxo:


```
Usuário

↓

Interface

↓

VLibras

↓

Tradução
```


---

# 11. Segurança da Arquitetura


O sistema deverá seguir boas práticas:


## Dados sensíveis

Nunca armazenar:

- senhas em texto puro;
- chaves privadas no código.


---

## Validação


Todos os dados recebidos devem ser validados.


Exemplo:

Formulário de cadastro.


---

## Controle de acesso


Usuários terão permissões diferentes:


Cliente:

- realizar agendamentos.


Administrador:

- gerenciar sistema.


---

# 12. Organização de Pastas


Estrutura planejada:


```
src/

├── app/
│
├── components/
│
├── hooks/
│
├── lib/
│
├── services/
│
├── types/
│
├── utils/


prisma/

docs/

public/
```


---

# 13. Princípios Arquiteturais


O projeto seguirá os seguintes princípios:


## Simplicidade

Evitar complexidade desnecessária.


---

## Separação de responsabilidades

Cada parte do sistema deve possuir uma função clara.


---

## Reutilização

Componentes e funções devem ser reaproveitados.


---

## Manutenibilidade

O código deve ser fácil de entender e modificar.


---

## Acessibilidade

Todos os componentes devem considerar diferentes usuários.


---

# 14. Decisões Arquiteturais


Principais decisões:


| Decisão | Motivo |
|-|-|
| Next.js | Unificar frontend e backend |
| TypeScript | Maior segurança |
| PostgreSQL | Banco relacional |
| Prisma | Facilidade de manutenção |
| Tailwind | Padronização visual |
| MVP incremental | Redução de complexidade |


---

# 15. Evolução da Arquitetura


A arquitetura foi planejada para permitir evolução futura.


Possíveis melhorias:


- separação do backend;
- aplicação mobile;
- microsserviços;
- filas de processamento;
- automações com n8n.


Entretanto, essas alterações não fazem parte do MVP inicial.

---

# 16. Conclusão


A arquitetura definida permite desenvolver um sistema moderno, organizado e adequado ao objetivo acadêmico do projeto.

A escolha das tecnologias busca equilibrar aprendizado, produtividade e qualidade, permitindo que o sistema evolua conforme novas funcionalidades sejam adicionadas.