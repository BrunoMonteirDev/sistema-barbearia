# 💈 03 - Stack Tecnológica

# Barbearia Web

---

# 1. Introdução

A stack tecnológica do Barbearia Web foi definida considerando os objetivos do projeto, o escopo do TCC e a necessidade de desenvolver uma aplicação moderna, organizada e de fácil manutenção.

As tecnologias foram escolhidas buscando equilíbrio entre:

- produtividade;
- desempenho;
- aprendizado;
- comunidade;
- aplicação profissional.

---

# 2. Visão Geral da Stack


```
Frontend
│
├── Next.js
├── React
├── TypeScript
├── Tailwind CSS
└── shadcn/ui


Backend
│
├── Next.js Route Handlers
└── Server Actions


Banco de Dados
│
├── PostgreSQL
└── Prisma ORM


Ferramentas
│
├── Git
├── GitHub
├── VS Code
├── ESLint
└── Prettier
```

---

# 3. Framework Principal

# Next.js


## Descrição

Next.js é um framework baseado em React utilizado para desenvolvimento de aplicações web modernas.

Ele permite criar aplicações completas contendo:

- páginas;
- componentes;
- APIs;
- integração com banco de dados.


## Utilização no projeto

O Next.js será responsável pela estrutura principal da aplicação.

Será utilizado para:

- criação das páginas;
- gerenciamento de rotas;
- renderização da interface;
- criação das APIs internas.


## Motivos da escolha

O Next.js foi escolhido por:

- possuir grande utilização no mercado;
- integração nativa com React;
- suporte ao TypeScript;
- permitir frontend e backend no mesmo projeto;
- facilitar o desenvolvimento inicial.


## Benefícios

- menor complexidade;
- melhor organização;
- boa performance;
- comunidade ativa.

---

# 4. Biblioteca de Interface

# React


## Descrição

React é uma biblioteca JavaScript utilizada para construção de interfaces através de componentes.


## Utilização no projeto

Será utilizado para criação dos elementos visuais.


Exemplos:

- formulários;
- cards;
- tabelas;
- menus;
- páginas.


## Motivos da escolha

React permite:

- reutilização de componentes;
- organização da interface;
- desenvolvimento baseado em componentes.


---

# 5. Linguagem de Programação

# TypeScript


## Descrição

TypeScript é uma linguagem baseada em JavaScript que adiciona tipagem estática.


## Utilização no projeto

Será utilizada em todo o desenvolvimento.


Exemplos:

- componentes;
- serviços;
- APIs;
- modelos.


## Motivos da escolha

A tipagem ajuda a:

- evitar erros;
- melhorar manutenção;
- facilitar entendimento do código.


## Exemplo


JavaScript:

```javascript
function criarUsuario(nome){
}
```


TypeScript:

```typescript
function criarUsuario(nome:string){
}
```


---

# 6. Estilização

# Tailwind CSS


## Descrição

Tailwind CSS é um framework de estilos baseado em classes utilitárias.


## Utilização no projeto

Será responsável pela criação da interface visual.


Aplicações:

- layouts;
- responsividade;
- cores;
- espaçamentos;
- componentes.


## Motivos da escolha

Foi escolhido por:

- acelerar desenvolvimento;
- manter padrão visual;
- reduzir CSS manual.


---

# 7. Biblioteca de Componentes

# shadcn/ui


## Descrição

shadcn/ui fornece componentes React acessíveis e personalizáveis.


## Utilização no projeto

Será utilizado para componentes como:


- botões;
- caixas de diálogo;
- formulários;
- tabelas;
- menus.


## Motivos da escolha

A biblioteca possui foco em:

- acessibilidade;
- qualidade visual;
- personalização.


---

# 8. Backend

# Next.js Route Handlers


## Descrição

Os Route Handlers permitem criar endpoints backend dentro do próprio Next.js.


## Utilização

Serão responsáveis por:

- receber requisições;
- validar dados;
- executar regras;
- retornar respostas.


Exemplo:


```
GET /api/servicos

POST /api/agendamentos
```


---

# Server Actions


## Descrição

Recurso do Next.js para executar funções no servidor diretamente.


## Utilização

Poderão ser utilizadas em operações como:

- criação de registros;
- atualização de dados;
- formulários.


---

# 9. Banco de Dados

# PostgreSQL


## Descrição

PostgreSQL é um sistema gerenciador de banco de dados relacional.


## Utilização no projeto

Será responsável por armazenar:


- usuários;
- profissionais;
- serviços;
- horários;
- agendamentos.


## Motivos da escolha

O sistema possui diversas relações entre dados, tornando um banco relacional adequado.


Exemplo:

```
Usuário

1:N

Agendamento

N:1

Profissional
```


## Benefícios

- estabilidade;
- segurança;
- código aberto;
- grande utilização profissional.


---

# 10. ORM

# Prisma


## Descrição

Prisma é uma ferramenta ORM que facilita a comunicação entre aplicação e banco de dados.


## Utilização no projeto

Será utilizado para:


- criar modelos;
- realizar consultas;
- controlar migrations;
- acessar dados.


## Exemplo


Consulta tradicional:


```sql
SELECT * FROM servicos;
```


Com Prisma:


```typescript
await prisma.servico.findMany();
```


## Motivos da escolha

O Prisma foi escolhido por:

- integração com TypeScript;
- facilidade de aprendizado;
- redução de código SQL;
- segurança de tipos.

---

# 11. Controle de Versão

# Git


## Descrição

Sistema utilizado para controle das alterações do código.


## Utilização

Será utilizado para:

- versionamento;
- histórico;
- organização das entregas.


---

# GitHub


## Descrição

Plataforma utilizada para armazenamento remoto do projeto.


## Utilização

Será utilizada para:

- backup;
- documentação;
- colaboração;
- apresentação do projeto.


---

# 12. Ferramentas de Desenvolvimento


# Visual Studio Code


Editor utilizado para desenvolvimento.


Motivos:

- extensões;
- integração com Git;
- suporte TypeScript.


---

# ESLint


Ferramenta para análise de qualidade do código.


Utilização:

- identificar problemas;
- padronizar escrita.


---

# Prettier


Ferramenta para formatação automática.


Objetivo:

Manter o código consistente.


---

# 13. Tecnologias Futuras Planejadas


Algumas tecnologias poderão ser adicionadas futuramente:


## Autenticação

Possíveis opções:

- NextAuth;
- Auth.js.


Objetivo:

Controle de usuários e permissões.


---

## Validação

Possível utilização:

- Zod.


Objetivo:

Validar dados enviados pelo usuário.


---

## Notificações

Possível integração:


- WhatsApp API;
- serviços externos.


---

## Automações

Possível utilização:


- n8n.


Objetivo:

Automatizar processos como:

- notificações;
- integrações;
- fluxos externos.


---

# 14. Resumo da Stack


| Categoria | Tecnologia |
|-|-|
| Framework | Next.js |
| Interface | React |
| Linguagem | TypeScript |
| Estilos | Tailwind CSS |
| Componentes | shadcn/ui |
| Backend | Next.js API |
| Banco | PostgreSQL |
| ORM | Prisma |
| Versionamento | Git/GitHub |
| Editor | VS Code |


---

# 15. Considerações Finais

A stack escolhida permite desenvolver uma aplicação moderna utilizando tecnologias amplamente utilizadas no mercado.

A combinação entre Next.js, TypeScript, Prisma e PostgreSQL fornece uma base sólida para construção de um sistema web organizado, escalável e adequado aos objetivos do Trabalho de Conclusão de Curso.