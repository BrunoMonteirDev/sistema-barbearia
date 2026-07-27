# 💈 04 - Requisitos do Sistema

# Barbearia Web

---

# 1. Introdução

Este documento apresenta os requisitos funcionais e não funcionais do sistema Barbearia Web.

Os requisitos definem as funcionalidades que o sistema deve possuir e as características de qualidade esperadas.

Eles servem como base para:

- planejamento;
- desenvolvimento;
- testes;
- validação do sistema.

---

# 2. Atores do Sistema

O sistema possui dois atores principais.


# Cliente

Usuário que utiliza o sistema para realizar agendamentos.


Permissões:

- visualizar serviços;
- escolher profissionais;
- consultar horários;
- realizar agendamento;
- cancelar;
- remarcar.


---

# Administrador

Usuário responsável pelo gerenciamento da barbearia.


Permissões:

- gerenciar serviços;
- gerenciar profissionais;
- visualizar agenda;
- controlar agendamentos;
- acessar informações administrativas.


---

# 3. Requisitos Funcionais

Requisitos funcionais descrevem as funcionalidades que o sistema deve oferecer.

---

# RF01 - Cadastro de Usuários


## Descrição

O sistema deve permitir o cadastro de usuários.


## Dados:

- nome;
- telefone;
- email;
- senha;
- data de nascimento.


## Ator

Cliente / Administrador


## Prioridade

Alta


## Critérios de aceitação

- Usuário consegue criar uma conta.
- Sistema valida dados obrigatórios.
- Sistema impede cadastro duplicado de email.

---

# RF02 - Autenticação de Usuários


## Descrição

O sistema deve permitir autenticação através de email e senha.


## Ator

Cliente / Administrador


## Prioridade

Alta


## Critérios de aceitação

- Usuário consegue realizar login.
- Sistema identifica o tipo de usuário.
- Acesso é restringido conforme permissão.

---

# RF03 - Cadastro de Profissionais


## Descrição

O administrador deve conseguir cadastrar profissionais.


## Dados:

- nome;
- especialidade;
- status.


## Ator

Administrador


## Prioridade

Alta


## Critérios de aceitação

- Administrador consegue criar profissional.
- Profissional pode ser ativado ou desativado.
- Profissionais inativos não aparecem para clientes.

---

# RF04 - Cadastro de Serviços


## Descrição

O administrador deve conseguir cadastrar serviços oferecidos pela barbearia.


## Dados:

- nome;
- descrição;
- duração;
- preço.


## Ator

Administrador


## Prioridade

Alta


## Critérios de aceitação

- Serviço pode ser criado.
- Serviço pode ser alterado.
- Serviço pode ser removido ou desativado.

---

# RF05 - Visualização de Serviços


## Descrição

O cliente deve conseguir visualizar os serviços disponíveis.


## Ator

Cliente


## Prioridade

Alta


## Critérios de aceitação

- Serviços ativos são exibidos.
- Informações principais aparecem corretamente.

---

# RF06 - Agendamento Online


## Descrição

O sistema deve permitir que o cliente realize um agendamento através de etapas.


Fluxo:

```
Serviço

↓

Profissional

↓

Data

↓

Horário

↓

Confirmação
```


## Ator

Cliente


## Prioridade

Alta


## Critérios de aceitação

- Cliente consegue completar o fluxo.
- Dados são armazenados.
- Horário reservado deixa de ficar disponível.

---

# RF07 - Controle de Disponibilidade


## Descrição

O sistema deve exibir somente horários disponíveis.


## Regras:

- não permitir conflitos;
- considerar agenda do profissional;
- considerar duração do serviço.


## Ator

Cliente


## Prioridade

Alta


## Critérios de aceitação

- Horários ocupados não aparecem.
- Dois clientes não conseguem reservar o mesmo horário.

---

# RF08 - Consulta de Agendamentos


## Descrição

O cliente deve conseguir visualizar seus agendamentos.


## Ator

Cliente


## Prioridade

Média


## Critérios de aceitação

- Cliente visualiza próximos horários.
- Sistema mostra informações do atendimento.

---

# RF09 - Cancelamento de Agendamento


## Descrição

O cliente poderá cancelar agendamentos conforme regras definidas.


## Ator

Cliente


## Prioridade

Média


## Critérios de aceitação

- Cancelamento altera status.
- Horário volta a ficar disponível.

---

# RF10 - Remarcação de Agendamento


## Descrição

O cliente poderá alterar a data ou horário do atendimento.


## Ator

Cliente


## Prioridade

Média


## Critérios de aceitação

- Sistema verifica disponibilidade.
- Novo horário é registrado corretamente.

---

# RF11 - Gerenciamento Administrativo de Agendamentos


## Descrição

Administrador poderá visualizar e gerenciar todos os agendamentos.


## Ator

Administrador


## Prioridade

Alta


## Critérios de aceitação

- Administrador visualiza agenda.
- Pode alterar status.
- Pode cancelar atendimento.

---

# RF12 - Dashboard Administrativo


## Descrição

O sistema deverá apresentar informações resumidas.


Informações previstas:

- quantidade de atendimentos;
- próximos horários;
- serviços realizados.


## Ator

Administrador


## Prioridade

Média


---

# RF13 - Notificações Automáticas


## Descrição

O sistema deverá enviar notificações relacionadas aos agendamentos.


Exemplos:

- confirmação;
- lembrete;
- alteração.


## Integração prevista:

WhatsApp API


## Ator

Sistema


## Prioridade

Baixa


---

# RF14 - Integração com Libras


## Descrição

O sistema deverá permitir integração com ferramentas de tradução em Libras.


Exemplo:

VLibras


## Ator

Sistema


## Prioridade

Média


---

# 4. Requisitos Não Funcionais

Requisitos não funcionais definem características de qualidade do sistema.

---

# RNF01 - Usabilidade


## Descrição

O sistema deve possuir interface simples e intuitiva.


## Critério

Usuários devem conseguir realizar tarefas sem treinamento complexo.


---

# RNF02 - Responsividade


## Descrição

O sistema deve funcionar em diferentes tamanhos de tela.


Abrangência:

- computadores;
- tablets;
- smartphones.


---

# RNF03 - Desempenho


## Descrição

O sistema deve responder rapidamente às ações do usuário.


Critérios:

- páginas carregadas de forma eficiente;
- consultas otimizadas.


---

# RNF04 - Segurança


## Descrição

O sistema deve proteger dados dos usuários.


Requisitos:

- autenticação;
- controle de acesso;
- proteção de dados sensíveis.


---

# RNF05 - Manutenibilidade


## Descrição

O código deve possuir organização e facilidade de evolução.


Critérios:

- componentes reutilizáveis;
- documentação;
- padrões definidos.


---

# RNF06 - Compatibilidade


## Descrição

O sistema deve funcionar nos principais navegadores modernos.


Exemplos:

- Chrome;
- Firefox;
- Edge.


---

# RNF07 - Acessibilidade


## Descrição

O sistema deve atender boas práticas de acessibilidade.


Incluindo:


- leitores de tela;
- navegação por teclado;
- HTML semântico;
- ARIA.


---

# RNF08 - Alto Contraste e Daltonismo


## Descrição

A interface deve considerar usuários com deficiência visual.


Critérios:

- contraste adequado;
- não depender somente de cores;
- textos claros.


---

# RNF09 - Inclusão Cognitiva


## Descrição

A interface deve considerar usuários com necessidades cognitivas.


Exemplos:

- pessoas autistas;
- pessoas com dificuldades de concentração.


Critérios:

- layout previsível;
- mensagens simples;
- redução de estímulos.


---

# RNF10 - Portabilidade


## Descrição

O sistema deve ser executado em diferentes ambientes.


Incluindo:

- Windows;
- Linux;
- navegadores modernos.


---

# 5. Priorização


## Alta prioridade

Essenciais para o funcionamento:


- cadastro;
- serviços;
- profissionais;
- agendamento;
- disponibilidade.


---

## Média prioridade

Melhorias importantes:


- login;
- dashboard;
- cancelamento;
- acessibilidade.


---

## Baixa prioridade

Funcionalidades futuras:


- pagamentos;
- WhatsApp;
- relatórios avançados.


---

# 6. Considerações Finais

Os requisitos apresentados representam a primeira versão do sistema.

Durante o desenvolvimento, novos requisitos podem surgir ou sofrer alterações.

Toda mudança relevante deve ser registrada na documentação do projeto.