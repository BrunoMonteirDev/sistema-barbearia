# 💈 Barbearia Web

Sistema Web de Agendamento para Barbearias desenvolvido como Trabalho de Conclusão de Curso (TCC) do curso de Análise e Desenvolvimento de Sistemas do Instituto Federal do Paraná (IFPR) – Campus Umuarama.

O sistema tem como objetivo modernizar o gerenciamento de agendamentos em barbearias, oferecendo uma plataforma web intuitiva para clientes e administradores, com foco em organização, acessibilidade e facilidade de uso.

---

# 📖 Sobre o Projeto

Atualmente muitas barbearias realizam seus agendamentos através de agendas físicas ou aplicativos de mensagens, dificultando o controle da agenda, ocasionando conflitos de horários e aumentando o tempo gasto na organização dos atendimentos.

Este projeto busca solucionar esse problema através de um sistema web capaz de:

- permitir que clientes realizem seus próprios agendamentos;
- controlar a disponibilidade dos profissionais;
- evitar conflitos de horários;
- facilitar o gerenciamento da barbearia;
- oferecer recursos de acessibilidade digital.

---

# 🎯 Objetivos

O projeto possui como objetivo principal desenvolver um sistema web para gerenciamento de agendamentos em barbearias.

Entre os principais recursos estão:

- Cadastro de clientes
- Cadastro de profissionais
- Cadastro de serviços
- Agendamento online
- Controle de disponibilidade
- Painel administrativo
- Dashboard
- Notificações
- Recursos de acessibilidade

---

# 🚀 Tecnologias

## Frontend

- React
- TypeScript
- Tailwind CSS
- Vite

## Backend

- Express
- Prisma ORM
- PostgreSQL

## Ferramentas

- Git
- GitHub
- ESLint
- Prettier
- VS Code

---

# 🏗 Arquitetura

O sistema seguirá uma arquitetura simples e organizada.

```
Cliente
      │
      ▼
Interface (React + Vite)
      │
      ▼
API (Express)
      │
      ▼
Prisma ORM
      │
      ▼
PostgreSQL
```

Toda a arquitetura foi planejada para facilitar a manutenção, aprendizado e apresentação do projeto durante a banca.

---

# 📁 Estrutura do Projeto

```
client/
├── src/
└── package.json

server/
├── src/
├── prisma/
└── package.json

docs/
```

---

# ✨ Funcionalidades

## Cliente

- Cadastro
- Login
- Agendamento online
- Consulta de agendamentos
- Cancelamento
- Remarcação

## Administrador

- Dashboard
- Cadastro de clientes
- Cadastro de profissionais
- Cadastro de serviços
- Controle da agenda
- Gerenciamento de agendamentos

---

# ♿ Acessibilidade

Este projeto possui forte foco em acessibilidade digital.

Entre os recursos planejados estão:

- HTML semântico
- Compatibilidade com leitores de tela
- Alto contraste
- Ajuste do tamanho da fonte
- Navegação por teclado
- Redução de animações
- Compatibilidade com usuários daltônicos
- Integração com VLibras

As implementações seguirão, sempre que possível, as recomendações da WCAG.

---

# 📚 Documentação

Toda a documentação do projeto encontra-se na pasta:

```
docs/
```

Os principais documentos são:

- Visão Geral
- Arquitetura
- Requisitos
- Banco de Dados
- Componentes
- Regras de Negócio
- Acessibilidade
- Diagramas
- Roadmap

Além disso, o projeto possui documentos auxiliares:

- AGENTS.md
- SYSTEM_SPECIFICATION.md
- DECISIONS.md
- ROADMAP.md

---

# 🛣 Roadmap

O desenvolvimento será dividido em etapas.

## Sprint 0

- Documentação
- Arquitetura
- Banco de Dados
- Diagramas

## Sprint 1

- Estrutura do projeto
- Componentes base
- Autenticação

## Sprint 2

- Cadastro de usuários
- Cadastro de profissionais
- Cadastro de serviços

## Sprint 3

- Sistema de agendamento

## Sprint 4

- Dashboard
- Relatórios
- Acessibilidade

## Sprint 5

- Testes
- Deploy
- Ajustes finais

---

# 🎓 Projeto Acadêmico

Este projeto foi desenvolvido como Trabalho de Conclusão de Curso (TCC) do curso de Análise e Desenvolvimento de Sistemas do Instituto Federal do Paraná.

**Aluno**

Bruno Monteiro Alves

**Orientador**

Klenilmar Lopes Dias

---

# 📌 Filosofia do Projeto

Este projeto possui finalidade acadêmica.

As principais decisões técnicas seguem os seguintes princípios:

- simplicidade;
- organização;
- legibilidade;
- boas práticas;
- facilidade de manutenção;
- código didático;
- arquitetura compreensível.

Sempre que houver duas soluções tecnicamente corretas, será escolhida a mais simples.

O objetivo é desenvolver um sistema moderno, organizado e de fácil compreensão para apresentação durante a banca do TCC.

---

# 📄 Licença

Projeto desenvolvido exclusivamente para fins acadêmicos.
## Arquitetura atual

## Executar localmente

Em dois terminais, execute:

```bash
cd server
npm install
npm run dev
```

```bash
cd client
npm install
npm run dev
```

A API fica disponível em `http://localhost:3001` e o cliente em `http://localhost:5000`. Para validar a API, acesse `http://localhost:3001/api/health`.

O cliente React/Vite consome a API Express em `/api`. A API usa Prisma/PostgreSQL e autenticação JWT. Configure `server/.env` com `DATABASE_URL` e `JWT_SECRET`. Para preparar o Prisma, dentro de `server/`, execute `npm run prisma:generate`; para popular dados de demonstração, execute `npm run seed`.
