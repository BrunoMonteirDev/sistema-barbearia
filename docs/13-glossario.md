# 💈 13 - Glossário

# Barbearia Web

---

# 1. Introdução

Este documento apresenta a definição dos principais termos técnicos utilizados no desenvolvimento do sistema Barbearia Web.

O objetivo é facilitar a compreensão da documentação, da arquitetura e das decisões técnicas do projeto.

---

# A

## API (Application Programming Interface)

Interface que permite a comunicação entre diferentes sistemas ou partes de uma aplicação.

No projeto, será utilizada para:

- comunicação entre frontend e backend;
- integração com serviços externos;
- envio de notificações.

---

## API REST

Modelo de comunicação entre sistemas utilizando requisições HTTP.

Principais operações:

```
GET     → consultar dados

POST    → criar dados

PUT     → atualizar dados

DELETE  → remover dados
```

---

## Acessibilidade Digital

Práticas utilizadas para permitir que pessoas com diferentes limitações consigam utilizar sistemas digitais.

Inclui:

- leitores de tela;
- navegação por teclado;
- contraste;
- Libras;
- adaptações cognitivas.

---

## ARIA (Accessible Rich Internet Applications)

Conjunto de atributos HTML utilizados para melhorar a interpretação de interfaces por tecnologias assistivas.

Exemplos:

```
aria-label

aria-hidden

aria-expanded
```

---

# B

## Backend

Parte do sistema responsável pelas regras de negócio, processamento e comunicação com o banco de dados.

No projeto será desenvolvido utilizando recursos do Next.js.

Responsabilidades:

- validar dados;
- controlar permissões;
- processar agendamentos.

---

## Banco de Dados

Sistema utilizado para armazenar informações de forma organizada.

No projeto será utilizado:

```
PostgreSQL
```

---

# C

## Cliente

Usuário final que utiliza o sistema para realizar agendamentos.

Pode:

- visualizar serviços;
- escolher profissionais;
- marcar horários.

---

## Componente

Pequena parte reutilizável da interface.

Exemplos:

- botão;
- formulário;
- card;
- calendário.

No projeto serão utilizados componentes React.

---

## CRUD

Conjunto das quatro operações básicas de gerenciamento de dados:


```
Create

Read

Update

Delete
```


Exemplo:

Cadastro de serviços:


Criar serviço

Consultar serviço

Editar serviço

Excluir serviço

---

# D

## Dashboard

Painel visual utilizado para apresentar informações importantes.

Exemplo:

- quantidade de agendamentos;
- clientes;
- serviços.

---

# F

## Frontend

Parte visual da aplicação responsável pela interação com o usuário.

No projeto utiliza:


- Next.js;
- React;
- TypeScript;
- Tailwind CSS.

---

# H

## Hook

Função especial do React utilizada para adicionar comportamentos aos componentes.

Exemplos:


```
useState

useEffect
```


Também serão criados hooks personalizados.


Exemplo:


```
useAppointment()
```

---

# J

## JavaScript

Linguagem de programação utilizada como base do desenvolvimento web moderno.

O TypeScript utilizado no projeto é baseado em JavaScript.

---

# M

## Middleware

Camada intermediária responsável por executar ações antes de uma requisição continuar.

Pode ser utilizado para:

- autenticação;
- proteção de rotas;
- validações.

---

## MVP (Minimum Viable Product)

Produto Mínimo Viável.

É uma primeira versão funcional contendo apenas os recursos essenciais.

No projeto:


Cliente consegue realizar um agendamento completo.

---

# N

## Next.js

Framework baseado em React utilizado para desenvolvimento de aplicações web modernas.

Responsável por:

- páginas;
- rotas;
- backend;
- renderização;
- otimizações.

---

## Node.js

Ambiente que permite executar JavaScript fora do navegador.

Utilizado para executar ferramentas do projeto.

---

# O

## ORM (Object-Relational Mapping)

Tecnologia que permite manipular bancos de dados utilizando objetos da linguagem de programação.

No projeto será utilizado:

```
Prisma ORM
```

---

# P

## PostgreSQL

Sistema gerenciador de banco de dados relacional.

Será responsável por armazenar:

- usuários;
- serviços;
- profissionais;
- agendamentos.

---

## Prisma

ORM utilizado para comunicação entre aplicação e banco de dados.

Exemplo:


Sem ORM:

```sql
SELECT * FROM usuarios;
```


Com Prisma:


```typescript
prisma.usuario.findMany()
```


---

# R

## React

Biblioteca JavaScript utilizada para criação de interfaces.

O sistema será construído utilizando componentes React.

---

## Responsividade

Capacidade da aplicação se adaptar a diferentes tamanhos de tela.

Exemplos:

- computador;
- tablet;
- celular.

---

## Route Handler

Recurso do Next.js utilizado para criação de APIs dentro da aplicação.

Responsável por:

- receber requisições;
- executar regras;
- retornar respostas.

---

# S

## Schema

Definição da estrutura dos dados.

Exemplo:

No Prisma:

```prisma
model Usuario {

id Int

nome String

}
```

---

## Sprint

Período de desenvolvimento com objetivos específicos.

Utilizado para organizar o roadmap do projeto.

---

# T

## Tailwind CSS

Framework CSS baseado em classes utilitárias.

Utilizado para criação da interface.


Exemplo:


```html
<button class="rounded-lg p-4">
Salvar
</button>
```

---

## TypeScript

Linguagem baseada em JavaScript que adiciona tipagem estática.

Benefícios:

- menos erros;
- melhor organização;
- maior manutenção.

---

# U

## UI (User Interface)

Interface visual do sistema.

Relacionada a:

- cores;
- botões;
- telas;
- componentes.

---

## UX (User Experience)

Experiência do usuário durante a utilização do sistema.

Relacionada a:

- facilidade;
- organização;
- fluxo de navegação.

---

# V

## VLibras

Ferramenta desenvolvida para tradução automática de conteúdos digitais para Libras.

Será utilizada como recurso de acessibilidade.

---

# W

## WCAG (Web Content Accessibility Guidelines)

Diretrizes internacionais para criação de conteúdo web acessível.

Baseia-se em quatro princípios:

```
Perceptível

Operável

Compreensível

Robusto
```

---

# WhatsApp API

Interface utilizada para integração com o WhatsApp.

No projeto poderá ser utilizada para:

- confirmação de agendamento;
- lembrete de atendimento.

---

# 2. Termos do Domínio

## Agendamento

Registro de um atendimento marcado para determinado cliente, profissional, serviço e horário.

---

## Profissional

Pessoa responsável pela realização dos serviços da barbearia.

Exemplo:

- barbeiro;
- especialista.

---

## Serviço

Procedimento oferecido pela barbearia.

Exemplos:

- corte;
- barba;
- corte + barba.

---

## Horário Disponível

Período no qual um profissional está livre para realizar um atendimento.

---

## Conflito de Horário

Situação onde dois agendamentos tentam utilizar o mesmo profissional no mesmo período.

O sistema deve impedir esse cenário.

---

# 3. Considerações Finais

Este glossário tem como objetivo facilitar a compreensão da documentação técnica do projeto.

Novos termos poderão ser adicionados conforme novas tecnologias e funcionalidades forem incorporadas ao sistema.