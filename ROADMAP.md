# 💈 ROADMAP.md

# Barbearia Web

Plano de Desenvolvimento do Sistema

Versão inicial: MVP 0.1

---

# Atualizacao de interface

- Padronizar formularios administrativos em janelas modais e usar confirmacoes internas para acoes destrutivas.

---

# 1. Objetivo

Este documento define o planejamento de desenvolvimento do sistema Barbearia Web.

O projeto será desenvolvido de forma incremental, utilizando pequenas entregas funcionais.

Cada etapa deve gerar uma evolução do sistema.

---

# 2. Estratégia de Desenvolvimento

O desenvolvimento seguirá o conceito de MVP (Minimum Viable Product).

A prioridade será:

1. Criar uma base funcional.
2. Validar o fluxo principal.
3. Adicionar melhorias.
4. Implementar requisitos avançados.

O foco inicial será:

```
Cliente

↓

Escolhe serviço

↓

Escolhe profissional

↓

Escolhe horário

↓

Confirma agendamento
```

---

# 3. Versões do Sistema


# MVP 0.1 - Fundação

Status:

🟡 Em desenvolvimento


Objetivo:

Criar a estrutura inicial do projeto.


## Tarefas


### Documentação

[x] Criar README.md

[x] Criar AGENTS.md

[x] Criar SYSTEM_SPECIFICATION.md

[x] Criar DECISIONS.md

⬜ Criar documentação técnica completa


---

### Ambiente

⬜ Instalar Node.js

⬜ Configurar Next.js

⬜ Configurar TypeScript

⬜ Configurar Tailwind CSS

⬜ Configurar shadcn/ui

⬜ Configurar Git

⬜ Criar repositório


---

### Estrutura

⬜ Criar estrutura de pastas

⬜ Configurar padrões de código

⬜ Configurar ESLint

⬜ Configurar Prettier


---

# MVP 0.2 - Interface Inicial


Status:

⬜ Planejado


Objetivo:

Criar as primeiras telas.


## Tarefas


### Página Inicial

⬜ Criar página inicial

⬜ Apresentar informações da barbearia

⬜ Criar botão de agendamento


---

### Componentes Base


⬜ Criar Header

⬜ Criar Footer

⬜ Criar Button

⬜ Criar Card

⬜ Criar Modal

⬜ Criar Formulários


---

# MVP 0.3 - Banco de Dados


Status:

⬜ Planejado


Objetivo:

Criar persistência dos dados.


## Tarefas


### Configuração


⬜ Instalar Prisma

⬜ Configurar PostgreSQL

⬜ Criar schema.prisma


---

### Modelos


Criar:


⬜ Usuario

⬜ Profissional

⬜ Servico

⬜ Agendamento


---

### Banco


⬜ Criar migrations

⬜ Popular dados iniciais

⬜ Testar consultas


---

# MVP 0.4 - Cadastro Administrativo


Status:

⬜ Planejado


Objetivo:

Permitir gerenciamento básico.


## Funcionalidades


## Serviços

⬜ Criar serviço

⬜ Editar serviço

⬜ Excluir serviço

⬜ Listar serviços


---

## Profissionais

⬜ Criar profissional

⬜ Editar profissional

⬜ Ativar/desativar profissional

⬜ Listar profissionais


---

# MVP 0.5 - Sistema de Agendamento


Status:

⬜ Planejado


Objetivo:

Implementar o principal fluxo do sistema.


## Fluxo


```
Selecionar serviço

↓

Selecionar profissional

↓

Selecionar data

↓

Buscar disponibilidade

↓

Selecionar horário

↓

Confirmar
```


---

## Funcionalidades


⬜ Seleção de serviço

⬜ Seleção de profissional

⬜ Calendário

⬜ Geração de horários

⬜ Validação de conflitos

⬜ Salvar agendamento


---

# MVP 0.6 - Usuários e Autenticação


Status:

⬜ Planejado


Objetivo:

Adicionar controle de acesso.


## Funcionalidades


⬜ Cadastro de usuário

⬜ Login

⬜ Logout

⬜ Recuperação de senha

⬜ Controle de permissões


Perfis:


- Cliente
- Administrador


---

# MVP 0.7 - Painel Administrativo


Status:

⬜ Planejado


Objetivo:

Criar área administrativa.


## Funcionalidades


⬜ Dashboard

⬜ Agenda geral

⬜ Próximos atendimentos

⬜ Estatísticas básicas

⬜ Gerenciamento completo


---

# MVP 0.8 - Acessibilidade


Status:

⬜ Planejado


Objetivo:

Aplicar requisitos de acessibilidade.


---

## Recursos


### Leitores de tela


⬜ HTML semântico

⬜ ARIA

⬜ Navegação por teclado


---

### Daltonismo


⬜ Alto contraste

⬜ Paleta acessível

⬜ Indicadores visuais alternativos


---

### Limitações motoras


⬜ Navegação sem mouse

⬜ Foco correto dos elementos


---

### Autismo


⬜ Interface previsível

⬜ Redução de animações

⬜ Linguagem simples


---

### Libras


⬜ Integração VLibras


---

# MVP 0.9 - Integrações


Status:

⬜ Planejado


Objetivo:

Adicionar comunicação automática.


## WhatsApp


⬜ API de mensagens

⬜ Confirmação de agendamento

⬜ Lembretes


---

# MVP 1.0 - Versão Final TCC


Status:

⬜ Planejado


Objetivo:

Preparação para apresentação.


## Checklist


⬜ Sistema funcionando

⬜ Banco finalizado

⬜ Testes realizados

⬜ Documentação atualizada

⬜ Artigo finalizado

⬜ Apresentação preparada


---

# 4. Backlog Futuro


Funcionalidades que podem ser adicionadas futuramente.


## Aplicativo Mobile

Possível implementação:

React Native


---

## Pagamentos Online

Possibilidades:

- PIX;
- cartão;
- gateways externos.


---

## Inteligência Artificial

Possibilidades:


- previsão de horários;
- sugestões;
- chatbot.


---

## Automações

Integrações futuras:


- n8n;
- webhooks;
- CRM;
- notificações avançadas.


---

## Relatórios Avançados


Possibilidades:


- faturamento;
- serviços mais utilizados;
- profissionais com maior demanda.


---

# 5. Critério de Priorização


As funcionalidades serão priorizadas seguindo:


## Prioridade Alta

Necessárias para o funcionamento:


- banco;
- serviços;
- profissionais;
- agendamento.


---

## Prioridade Média

Melhoram experiência:


- dashboard;
- login;
- notificações.


---

## Prioridade Baixa

Recursos extras:


- IA;
- pagamentos;
- aplicativo.


---

# 6. Regra de Evolução


Nenhuma nova funcionalidade deve ser adicionada antes que:


1. O requisito esteja documentado.
2. O impacto seja analisado.
3. O banco seja avaliado.
4. A decisão seja registrada.


---

# 7. Estado Atual


Última atualização:

Julho de 2026


Versão:

MVP 0.1


Próximo objetivo:

Finalizar documentação e iniciar configuração do ambiente Next.js.
## Concluído: transição de persistência

- API REST com Prisma e JWT;
- migration inicial e seed idempotente;
- remoção das rotas ativas de Supabase, mock, pagamentos, produtos e assinaturas.
