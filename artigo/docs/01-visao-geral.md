# 💈 01 - Visão Geral do Projeto

# Sistema Web de Agendamento para Barbearias

---

# 1. Introdução

O Barbearia Web é um sistema web desenvolvido com o objetivo de auxiliar no gerenciamento de agendamentos em barbearias.

A aplicação busca substituir métodos tradicionais de controle de horários, como agendas físicas e aplicativos de mensagens, oferecendo uma solução digital centralizada, organizada e acessível.

O sistema permitirá que clientes realizem seus próprios agendamentos online, enquanto administradores poderão gerenciar profissionais, serviços e atendimentos.

---

# 2. Contexto do Problema

Muitas pequenas e médias barbearias ainda realizam o controle de seus atendimentos utilizando métodos manuais ou ferramentas genéricas de comunicação.

Apesar de serem soluções simples, esses métodos apresentam limitações como:

- dificuldade de organização;
- conflitos de horários;
- falta de histórico de atendimentos;
- dependência da comunicação manual;
- dificuldade no controle da agenda dos profissionais.

A ausência de um sistema especializado pode impactar diretamente a eficiência do estabelecimento e a experiência dos clientes.

---

# 3. Proposta de Solução

A proposta consiste no desenvolvimento de um sistema web capaz de automatizar o processo de agendamento.

O sistema permitirá que o cliente:

- visualize serviços disponíveis;
- escolha um profissional;
- selecione uma data;
- escolha um horário disponível;
- confirme seu atendimento.

Ao mesmo tempo, permitirá que administradores tenham controle sobre:

- profissionais;
- serviços;
- horários;
- agendamentos.

---

# 4. Objetivo Geral

Desenvolver um sistema web para gerenciamento de agendamentos em barbearias, permitindo que clientes realizem reservas online de forma independente e possibilitando o controle administrativo dos atendimentos.

---

# 5. Objetivos Específicos

O sistema tem como objetivos:

- analisar as necessidades relacionadas ao gerenciamento de agendas em barbearias;
- desenvolver uma aplicação web utilizando tecnologias modernas;
- modelar um banco de dados relacional;
- implementar cadastro de usuários, profissionais e serviços;
- desenvolver um fluxo de agendamento em múltiplas etapas;
- controlar disponibilidade de horários;
- evitar conflitos de agenda;
- permitir gerenciamento administrativo;
- implementar recursos de acessibilidade digital;
- possibilitar integrações futuras com serviços externos.

---

# 6. Público-Alvo

O sistema possui dois grupos principais de usuários.


## Clientes

Pessoas que desejam realizar agendamentos em uma barbearia.

Necessidades:

- praticidade;
- rapidez;
- autonomia;
- visualização de horários disponíveis.


---

## Administradores

Responsáveis pela gestão da barbearia.

Necessidades:

- organização da agenda;
- controle dos profissionais;
- gerenciamento dos serviços;
- acompanhamento dos atendimentos.


---

# 7. Benefícios Esperados

A implementação do sistema proporciona:


## Para clientes

- maior autonomia para realizar agendamentos;
- redução do tempo de espera;
- facilidade de acesso aos horários disponíveis;
- melhoria na experiência de atendimento.


---

## Para a barbearia

- melhor organização;
- redução de conflitos;
- centralização das informações;
- maior controle operacional.


---

# 8. Escopo Inicial

O MVP do projeto contemplará:


## Cadastro

- usuários;
- profissionais;
- serviços.


## Agendamento

- escolha do serviço;
- escolha do profissional;
- escolha da data;
- escolha do horário;
- confirmação.


## Administração

- gerenciamento básico dos dados;
- visualização dos agendamentos.


---

# 9. Funcionalidades Futuras

Além do MVP, o sistema poderá evoluir com:

- notificações automáticas via WhatsApp;
- pagamentos online;
- relatórios avançados;
- aplicativo mobile;
- inteligência artificial;
- automações utilizando ferramentas como n8n.


---

# 10. Diferenciais do Projeto

O principal diferencial do sistema é a preocupação com acessibilidade digital.

A aplicação buscará atender diferentes perfis de usuários, considerando:

- pessoas com deficiência visual;
- pessoas surdas;
- pessoas com daltonismo;
- pessoas com limitações motoras;
- pessoas com necessidades cognitivas específicas.


Entre os recursos planejados estão:

- compatibilidade com leitores de tela;
- navegação por teclado;
- alto contraste;
- ajustes visuais;
- integração com VLibras.

---

# 11. Tecnologias Previstas

O desenvolvimento utilizará:


## Frontend

- Next.js;
- React;
- TypeScript;
- Tailwind CSS.


## Backend

- Recursos backend do Next.js;
- APIs internas.


## Banco de Dados

- PostgreSQL;
- Prisma ORM.


---

# 12. Arquitetura Geral

O sistema seguirá uma arquitetura web organizada em camadas:


```
Usuário

↓

Interface Web

↓

Aplicação Next.js

↓

Regras de Negócio

↓

Banco PostgreSQL

```


---

# 13. Justificativa Acadêmica

O projeto permite aplicar conhecimentos adquiridos durante o curso de Análise e Desenvolvimento de Sistemas, envolvendo:

- desenvolvimento web;
- banco de dados;
- arquitetura de software;
- modelagem de sistemas;
- integração entre aplicações;
- acessibilidade digital.


Além disso, apresenta uma solução aplicada a um cenário real, possibilitando demonstrar como a tecnologia pode auxiliar pequenos negócios na otimização de seus processos.

---

# 14. Considerações Finais

O Barbearia Web busca desenvolver uma solução simples, funcional e acessível para gerenciamento de agendamentos.

O projeto será desenvolvido de forma incremental, iniciando com um MVP básico e evoluindo gradualmente conforme novas funcionalidades forem implementadas.

A prioridade será manter uma arquitetura organizada, código de qualidade e uma experiência adequada para diferentes tipos de usuários.
