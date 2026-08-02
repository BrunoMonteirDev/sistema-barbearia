# AGENTS.md

# 💈 Barbearia Web - Guia de Desenvolvimento

Este documento define as regras, padrões e diretrizes que devem ser seguidas durante o desenvolvimento do projeto Barbearia Web.

Ele serve como referência para desenvolvedores humanos e ferramentas de inteligência artificial que contribuam com o projeto.

O objetivo principal é garantir que todo código produzido mantenha:

- organização;
- consistência;
- qualidade;
- facilidade de manutenção;
- boas práticas de desenvolvimento;
- alinhamento com o escopo do TCC.

---

# 1. Contexto do Projeto

## Nome

Barbearia Web

## Tipo

Sistema Web de Agendamento para Barbearias.

## Finalidade

Projeto desenvolvido como Trabalho de Conclusão de Curso (TCC) do curso de Análise e Desenvolvimento de Sistemas do Instituto Federal do Paraná (IFPR).

## Objetivo principal

Desenvolver uma aplicação web capaz de gerenciar agendamentos de uma barbearia, permitindo que clientes realizem reservas online e administradores controlem profissionais, serviços e horários.

---

# 2. Regra principal de desenvolvimento

Antes de implementar qualquer funcionalidade:

1. Consultar a documentação existente.
2. Verificar se a funcionalidade está dentro do escopo.
3. Avaliar impacto no banco de dados.
4. Manter o código simples.
5. Evitar soluções complexas sem necessidade.

O projeto tem finalidade acadêmica.

A melhor solução nem sempre é a mais avançada.

Priorizar:

> Código simples, organizado e explicável.

---

# 3. Stack Oficial

Todas as implementações devem utilizar preferencialmente as tecnologias abaixo.

---

# Frontend

## Framework

Next.js

Utilizar:

- App Router
- Server Components quando possível
- Client Components apenas quando necessário


## Linguagem

TypeScript obrigatório.

Não utilizar JavaScript puro.


## Interface

React


## Estilização

Tailwind CSS


## Componentes

shadcn/ui


## Ícones

Lucide React


---

# Backend

O backend será desenvolvido utilizando recursos nativos do Next.js.

Utilizar:

- Route Handlers
- Server Actions quando adequado
- Services para regras de negócio


Não utilizar inicialmente:

- Express
- NestJS
- outros frameworks backend


Motivo:

O próprio Next.js atende o escopo do projeto e reduz complexidade.

---

# Banco de Dados

## Banco

PostgreSQL


## ORM

Prisma ORM


Toda comunicação com banco deve passar pelo Prisma.

Evitar SQL manual quando não for necessário.


Exemplo:

Preferir:

```typescript
await prisma.usuario.findMany()
```

Ao invés de:

```sql
SELECT * FROM usuario;
```


---

# 4. Estrutura do Projeto

Manter a organização:

```
src/
│
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
│
└── styles/


prisma/

docs/

public/
```


---

# 5. Organização de Código

## Componentes

Componentes React devem:

- possuir responsabilidade única;
- ser reutilizáveis;
- evitar lógica de negócio.


Exemplo:

Correto:

```
components/
 └── Button.tsx
```


Evitar:

```
components/
 └── SistemaCompleto.tsx
```


---

# Services

Toda regra de negócio deve ficar separada.

Exemplo:

```
services/
 └── agendamento.service.ts
```


Responsabilidade:

- validar horários;
- criar agendamento;
- cancelar;
- remarcar.


Componentes não devem possuir regras complexas.

---

# 6. Padrão de Nomenclatura


## Arquivos

Utilizar:

kebab-case

Exemplo:

```
agendamento-form.tsx
```


## Componentes

PascalCase:

```typescript
AgendamentoForm
```


## Funções

camelCase:

```typescript
buscarAgendamentos()
```


## Banco

Utilizar:

camelCase no Prisma.


Exemplo:

```prisma
model Agendamento {
 id Int
 dataHora DateTime
}
```


---

# 7. TypeScript

TypeScript deve ser utilizado corretamente.


Evitar:

```typescript
any
```


Preferir:

```typescript
interface Usuario {
 nome:string;
 email:string;
}
```


Sempre criar tipos quando necessário.


Tipos compartilhados devem ficar em:

```
src/types
```


---

# 8. React

## Estado

Usar:

- useState
- useEffect
- useContext

somente quando necessário.


Priorizar:

- Server Components;
- Server Actions;
- busca no servidor.


---

# 9. Tailwind CSS

Toda estilização deve utilizar Tailwind.


Não criar:

```
arquivo.css
```


exceto quando realmente necessário.


Evitar:

classes gigantes.

Preferir:

componentização.


---

# 10. Banco de Dados

Antes de alterar o banco:

1. Atualizar schema.prisma.
2. Criar migration.
3. Testar.
4. Atualizar documentação.


Nunca alterar banco manualmente sem registrar.


---

# 11. Prisma

O client Prisma deve possuir uma única instância.


Utilizar:

```
src/lib/prisma.ts
```


Não criar múltiplas conexões.


---

# 12. Regras de Negócio Principais


## Agendamento

Nunca permitir:

- dois agendamentos no mesmo horário;
- profissional indisponível;
- horário fora do expediente.


Fluxo:

Cliente

↓

Seleciona serviço

↓

Seleciona profissional

↓

Seleciona data

↓

Sistema verifica disponibilidade

↓

Seleciona horário

↓

Confirma


---

# 13. Acessibilidade

A acessibilidade é requisito obrigatório do projeto.


Todo desenvolvimento deve considerar:


## Usuários cegos

Implementar:

- HTML semântico;
- aria-label;
- navegação por teclado;
- compatibilidade com leitores de tela.


## Daltonismo

Evitar depender apenas de cores.

Errado:

"Botão vermelho significa erro"


Correto:

"Mensagem de erro + ícone + texto"


## Autismo

Priorizar:

- interface previsível;
- poucos elementos por tela;
- evitar animações excessivas;
- mensagens claras.


## Usuários sem membros superiores

Considerar:

- navegação por teclado;
- comandos alternativos;
- evitar ações dependentes apenas de mouse.


## Libras

Planejado:

Integração com VLibras.


---

# 14. Segurança


Sempre:

- validar dados recebidos;
- proteger rotas administrativas;
- nunca salvar senha em texto puro;
- utilizar variáveis de ambiente.


Nunca:

- expor chaves privadas;
- colocar senha no código;
- confiar somente no frontend.


---

# 15. Git

Commits devem ser claros.


Exemplos:

```
feat: criar cadastro de serviços

fix: corrigir validação de horário

docs: atualizar documentação
```


Tipos:

feat
nova funcionalidade


fix
correção


docs
documentação


refactor
melhoria estrutural


---

# 16. Documentação

Toda alteração importante deve atualizar:


```
docs/
SYSTEM_SPECIFICATION.md
DECISIONS.md
ROADMAP.md
```


A documentação é parte do projeto.

---

# 17. Processo para criação de funcionalidades


Antes de programar:


## Etapa 1

Descrever a funcionalidade.


Exemplo:

"Cadastrar serviço"


## Etapa 2

Criar modelo de dados.


## Etapa 3

Criar regras de negócio.


## Etapa 4

Criar backend.


## Etapa 5

Criar interface.


## Etapa 6

Testar.


## Etapa 7

Atualizar documentação.


---

# 18. O que NÃO fazer


Não utilizar:

❌ bibliotecas sem necessidade

❌ código duplicado

❌ componentes gigantes

❌ lógica de negócio dentro da interface

❌ SQL espalhado pelo projeto

❌ soluções complexas para problemas simples


---

# 19. Prioridades do Projeto


A ordem de prioridade é:


1. Funcionamento correto

2. Código organizado

3. Experiência do usuário

4. Design

5. Otimizações


---

# 20. Filosofia final


O Barbearia Web deve ser desenvolvido como um sistema profissional, porém mantendo simplicidade acadêmica.

Toda decisão deve buscar:

- clareza;
- aprendizado;
- organização;
- facilidade de apresentação na banca.

Quando houver dúvida entre duas soluções:

Escolher a solução mais simples, documentar a decisão e seguir o padrão existente.