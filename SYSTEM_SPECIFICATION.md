# 💈 SYSTEM SPECIFICATION

# Barbearia Web

Sistema Web de Agendamento para Barbearias

Versão inicial: MVP 0.1

---

# 1. Informações do Projeto

## Nome

Barbearia Web

## Tipo

Sistema Web de Gerenciamento de Agendamentos.

## Finalidade

Projeto desenvolvido como Trabalho de Conclusão de Curso (TCC) do curso de Análise e Desenvolvimento de Sistemas do Instituto Federal do Paraná (IFPR).

## Autor

Bruno Monteiro Alves

## Orientador

Klenilmar Lopes Dias


---

# 2. Visão Geral

O Barbearia Web é um sistema desenvolvido para auxiliar pequenas e médias barbearias no gerenciamento de seus atendimentos.

O sistema tem como objetivo substituir métodos manuais de controle de agenda, como:

- agendas físicas;
- mensagens por aplicativos;
- planilhas;
- anotações individuais.

A aplicação permitirá que clientes realizem seus próprios agendamentos online, enquanto administradores poderão controlar serviços, profissionais e horários disponíveis.

---

# 3. Problema Identificado

Muitas barbearias ainda utilizam métodos informais para organizar seus atendimentos.

Isso pode gerar problemas como:

- conflitos de horários;
- esquecimento de clientes;
- dificuldade de visualizar disponibilidade;
- falta de histórico;
- dificuldade de gerenciamento.

O sistema busca solucionar esses problemas através de uma plataforma centralizada.

---

# 4. Objetivo Geral

Desenvolver um sistema web para gerenciamento de agendamentos em barbearias, permitindo que clientes realizem reservas online de forma independente e administradores controlem a operação do estabelecimento.

---

# 5. Objetivos Específicos

O sistema deverá permitir:

- cadastro de clientes;
- cadastro de profissionais;
- cadastro de serviços;
- gerenciamento de horários;
- realização de agendamentos;
- controle de disponibilidade;
- cancelamento e remarcação;
- gerenciamento administrativo;
- integração com serviços externos;
- aplicação de recursos de acessibilidade.

---

# 6. Escopo do Sistema

## Incluído no projeto

### Cliente

- visualizar serviços;
- escolher profissional;
- escolher data;
- escolher horário;
- realizar agendamento;
- consultar seus agendamentos;
- cancelar;
- remarcar.


### Administrador

- gerenciar clientes;
- gerenciar profissionais;
- gerenciar serviços;
- visualizar agenda;
- controlar agendamentos;
- visualizar informações gerais.


---

## Fora do escopo inicial

Inicialmente não serão implementados:

- múltiplas unidades;
- marketplace;
- aplicativo mobile;
- sistema financeiro completo;
- controle de estoque;
- emissão fiscal.


Essas funcionalidades podem ser consideradas evoluções futuras.

---

# 7. Usuários do Sistema


# Cliente

Usuário responsável por realizar agendamentos.

Permissões:

- criar conta;
- visualizar serviços;
- realizar agendamento;
- consultar histórico;
- cancelar;
- remarcar.


---

# Administrador

Responsável pelo gerenciamento da barbearia.

Permissões:

- cadastrar profissionais;
- cadastrar serviços;
- visualizar agenda;
- gerenciar clientes;
- controlar agendamentos.


---

# 8. Fluxo Principal do Sistema


## Agendamento


```
Cliente acessa sistema

↓

Seleciona serviço

↓

Seleciona profissional

↓

Escolhe data

↓

Sistema verifica disponibilidade

↓

Exibe horários disponíveis

↓

Cliente confirma

↓

Sistema registra agendamento

↓

Envia confirmação
```


---

# 9. Arquitetura do Sistema


O sistema será dividido em três camadas:


```
┌──────────────────┐
│    Frontend      │
│ Next.js + React  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│     Backend      │
│ Next API Routes  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│    Database      │
│ PostgreSQL       │
└──────────────────┘

```


---

# 10. Tecnologias


## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui


## Backend

- Next.js Route Handlers
- Server Actions


## Banco

- PostgreSQL


## ORM

- Prisma


## Controle de versão

- Git
- GitHub


---

# 11. Modelo Conceitual Inicial


Entidades principais:


```
Usuário

Profissional

Serviço

Agendamento

Horário

Pagamento
```


---

# 12. Modelo de Dados Inicial


## Usuário


Representa clientes e administradores.


Campos:


```
id
nome
telefone
email
senha
tipo
status
createdAt
updatedAt
```


---

## Profissional


Representa os barbeiros.


Campos:


```
id
nome
especialidade
ativo
createdAt
updatedAt
```


---

## Serviço


Representa serviços oferecidos.


Exemplo:

- Corte
- Barba
- Corte + Barba


Campos:


```
id
nome
descricao
duracao
preco
ativo
createdAt
updatedAt
```


---

## Agendamento


Representa uma reserva realizada.


Campos:


```
id

usuarioId

profissionalId

servicoId

dataHora

status

observacao

createdAt

updatedAt
```


Status possíveis:


```
PENDENTE

CONFIRMADO

CANCELADO

FINALIZADO

REMARCADO
```


---

# 13. Regras de Negócio


## RN001

Um profissional não pode possuir dois atendimentos no mesmo horário.


---

## RN002

O cliente somente pode visualizar horários disponíveis.


---

## RN003

Um agendamento cancelado não ocupa horário.


---

## RN004

Cancelamentos e remarcações podem possuir regras de antecedência.


Regra inicial:

O cliente pode cancelar ou remarcar até 24 horas antes.


---

## RN005

Serviços possuem duração.


Exemplo:


Corte:

30 minutos


Barba:

30 minutos


Corte + Barba:

60 minutos


O sistema deve considerar essa duração para evitar conflitos.


---

# 14. Telas do Sistema


## Área Pública


### Página inicial

Objetivo:

Apresentar a barbearia.


Elementos:

- informações;
- serviços;
- botão agendar.


---

## Agendamento


Etapas:


### Etapa 1

Selecionar serviço.


### Etapa 2

Selecionar profissional.


### Etapa 3

Selecionar data.


### Etapa 4

Selecionar horário.


### Etapa 5

Confirmar.


---

# Área Administrativa


## Dashboard

Informações:

- próximos atendimentos;
- quantidade de clientes;
- serviços realizados.


---

## Gestão de Serviços


Funções:

- criar;
- editar;
- remover.


---

## Gestão de Profissionais


Funções:

- criar;
- editar;
- ativar/desativar.


---

## Agenda

Visualização:

- calendário;
- horários;
- profissional.


---

# 15. Acessibilidade


A acessibilidade é requisito fundamental.


O sistema deve considerar:


## Deficiência visual

Implementar:

- HTML semântico;
- contraste adequado;
- leitores de tela;
- textos alternativos.


---

## Daltonismo

Evitar comunicação baseada apenas em cores.


Exemplo:


Errado:

Botão vermelho = cancelar


Correto:

Ícone + texto + cor


---

## Usuários com limitações motoras


Suporte:

- teclado;
- navegação sem mouse;
- componentes acessíveis.


---

## Autismo


Interface deve possuir:

- previsibilidade;
- poucos elementos por tela;
- mensagens claras;
- ausência de estímulos excessivos.


---

## Libras


Planejado:

Integração com VLibras.


---

# 16. Integrações Externas


## WhatsApp

Objetivo:

Enviar:

- confirmação;
- lembrete;
- alterações.


---

## VLibras

Objetivo:

Auxiliar usuários surdos através da tradução automática.


---

# 17. Segurança


Requisitos:


- autenticação;
- controle de acesso;
- proteção de dados;
- validação de entrada;
- variáveis de ambiente.


Senhas nunca devem ser armazenadas em texto puro.


---

# 18. MVP Inicial


O primeiro MVP terá:


## Implementado


✅ Estrutura Next.js

✅ Interface inicial

✅ Cadastro de serviços

✅ Cadastro de profissionais

✅ Fluxo de agendamento

✅ Persistência no banco


---

## Futuro


⬜ Login

⬜ Dashboard

⬜ WhatsApp

⬜ Pagamentos

⬜ Relatórios

⬜ Recursos avançados de acessibilidade


---

# 19. Critérios de Sucesso


O sistema será considerado funcional quando:


- cliente conseguir realizar agendamento;
- sistema impedir conflitos;
- administrador conseguir visualizar agenda;
- dados forem armazenados corretamente;
- interface funcionar em dispositivos diferentes.


---

# 20. Filosofia do Sistema


O Barbearia Web deve ser:

- simples;
- organizado;
- acessível;
- seguro;
- fácil de manter.


Toda evolução deve preservar esses princípios.
