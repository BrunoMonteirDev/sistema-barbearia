# 💈 05 - Regras de Negócio

# Barbearia Web

---

# 1. Introdução

Este documento apresenta as regras de negócio que definem o funcionamento do sistema Barbearia Web.

As regras representam as condições e comportamentos que devem ser respeitados pela aplicação.

Elas independem da tecnologia utilizada e representam as necessidades do domínio da aplicação.

---

# 2. Conceitos Principais


## Cliente

Pessoa que utiliza o sistema para realizar agendamentos.


---

## Profissional

Barbeiro responsável pela realização dos serviços.


---

## Serviço

Procedimento realizado pela barbearia.

Exemplos:

- Corte;
- Barba;
- Corte + Barba.


---

## Agendamento

Registro que representa um atendimento marcado entre cliente, profissional e serviço.

---

# 3. Regras de Usuários


# RN001 - Cadastro de usuário


## Descrição

Todo cliente deve possuir cadastro para realizar agendamentos.


## Regras

- Nome é obrigatório.
- Email deve ser único.
- Telefone deve possuir formato válido.
- Senha deve ser armazenada de forma segura.


---

# RN002 - Tipos de usuário


O sistema possui dois tipos principais:


## Cliente

Permissões:

- realizar agendamento;
- visualizar seus horários;
- cancelar;
- remarcar.


## Administrador

Permissões:

- gerenciar sistema;
- cadastrar serviços;
- cadastrar profissionais;
- visualizar todos os agendamentos.


---

# 4. Regras de Serviços


# RN003 - Cadastro de serviços


Cada serviço deve possuir:


- nome;
- duração;
- valor;
- status.


Exemplo:


```
Corte

Duração:
30 minutos

Valor:
R$40,00
```


---

# RN004 - Serviços inativos


Serviços desativados:

- não aparecem para clientes;
- não podem receber novos agendamentos.


Agendamentos antigos permanecem registrados.

---

# 5. Regras de Profissionais


# RN005 - Cadastro de profissional


Todo profissional deve possuir:


- nome;
- especialidade;
- status.


---

# RN006 - Profissional inativo


Profissionais inativos:


- não aparecem para novos agendamentos;
- não recebem novos horários.


Histórico antigo permanece salvo.

---

# 6. Regras de Horários


# RN007 - Jornada de trabalho


Cada profissional possui uma agenda própria.


Exemplo:


```
João

Segunda:
08:00 - 18:00


Terça:
08:00 - 18:00

```


---

# RN008 - Geração de horários disponíveis


Os horários devem ser gerados considerando:


- jornada do profissional;
- duração do serviço;
- agendamentos existentes.


---

# RN009 - Intervalo entre horários


O sistema deve respeitar a duração do serviço.


Exemplo:


Serviço:

Corte

Duração:

30 minutos


Horários possíveis:


```
09:00

09:30

10:00

10:30

```


---

# 7. Regras de Agendamento


# RN010 - Fluxo de agendamento


O agendamento deve seguir:


```
Escolher serviço

↓

Escolher profissional

↓

Escolher data

↓

Consultar disponibilidade

↓

Escolher horário

↓

Confirmar
```


---

# RN011 - Dados obrigatórios


Todo agendamento deve possuir:


- cliente;
- profissional;
- serviço;
- data;
- horário;
- status.


---

# RN012 - Não permitir conflito de horário


Um profissional não pode possuir dois atendimentos no mesmo período.


Exemplo:


Agendamento existente:


```
João

10:00 até 10:30
```


Novo agendamento:


```
João

10:15 até 10:45
```


Resultado:

❌ Não permitido.


---

# RN013 - Verificação de disponibilidade


Antes de confirmar um agendamento, o sistema deve verificar:


- se o profissional está ativo;
- se o serviço existe;
- se o horário está disponível;
- se o horário está dentro da jornada.


---

# RN014 - Reserva de horário


Após confirmação:


- o horário fica indisponível;
- o agendamento é salvo;
- o cliente recebe confirmação.


---

# 8. Regras de Status


Todo agendamento possui um status.


Valores possíveis:


## PENDENTE


Agendamento criado aguardando confirmação.


---

## CONFIRMADO


Atendimento confirmado.


---

## CANCELADO


Atendimento cancelado.


---

## FINALIZADO


Atendimento realizado.


---

## REMARCADO


Atendimento alterado para outro horário.


---

# 9. Regras de Cancelamento


# RN015 - Cancelamento pelo cliente


O cliente poderá cancelar seus próprios agendamentos.


Condições:


- deve ser proprietário do agendamento;
- deve respeitar prazo mínimo.


---

# RN016 - Prazo de cancelamento


Regra inicial:


O cancelamento deve ocorrer com no mínimo:

```
24 horas de antecedência
```


Exemplo:


Atendimento:

15/08 às 14:00


Cancelamento permitido até:

14/08 às 14:00


---

# RN017 - Cancelamento administrativo


Administrador poderá cancelar qualquer agendamento.


Motivo deve ser registrado.


---

# 10. Regras de Remarcação


# RN018 - Remarcação


O cliente poderá alterar:


- data;
- horário.


---

# RN019 - Validação de nova data


Antes da remarcação:


O sistema deve verificar:


- disponibilidade;
- jornada do profissional;
- conflitos.


---

# RN020 - Histórico


Ao remarcar:


O sistema deve manter registro da alteração.


---

# 11. Regras de Pagamento


# RN021 - Pagamento opcional


O pagamento não faz parte do MVP inicial.


Caso implementado:


Deverá possuir:


- método;
- status;
- valor.


---

# 12. Regras Administrativas


# RN022 - Exclusão de dados


Dados importantes não devem ser removidos permanentemente.


Preferir:

Soft Delete.


Exemplo:


```
ativo = false
```


---

# RN023 - Controle administrativo


Somente administradores podem:


- cadastrar profissionais;
- cadastrar serviços;
- alterar configurações.


---

# 13. Regras de Notificações


# RN024 - Confirmação


Após agendamento:


Sistema poderá enviar:


- confirmação;
- dados do atendimento.


---

# RN025 - Lembrete


Antes do atendimento:


Sistema poderá enviar lembrete.


Exemplo:


3 horas antes.


---

# 14. Regras de Acessibilidade


# RN026 - Interface acessível


Todos componentes devem considerar:


- leitores de tela;
- teclado;
- contraste.


---

# RN027 - Comunicação visual


Informações importantes nunca devem depender somente de cores.


Exemplo:


Errado:

"Vermelho significa cancelado"


Correto:


"❌ Cancelado"


---

# RN028 - Navegação alternativa


O sistema deve permitir:


- teclado;
- tecnologias assistivas.


---

# 15. Regras Futuras


Possíveis evoluções:


## Inteligência artificial

Sugestões de horários.


---

## WhatsApp

Notificações automáticas.


---

## n8n

Automação de processos.


---

# 16. Considerações Finais


As regras de negócio representam o comportamento esperado do sistema.

Durante o desenvolvimento, qualquer alteração deve ser registrada e revisada para manter consistência entre:

- documentação;
- banco de dados;
- código;
- funcionalidades.