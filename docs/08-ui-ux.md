# 💈 08 - UI/UX

# Barbearia Web

---

# 1. Introdução

Este documento apresenta as diretrizes de interface e experiência do usuário do sistema Barbearia Web.

O objetivo é definir uma interface:

- simples;
- intuitiva;
- moderna;
- acessível;
- responsiva.

A aplicação deve permitir que qualquer usuário consiga realizar um agendamento sem necessidade de treinamento.

---

# 2. Princípios de Design

O desenvolvimento da interface seguirá os seguintes princípios:

---

# 2.1 Simplicidade

A interface deve apresentar somente informações necessárias para cada momento.

Exemplo:

Durante um agendamento, o usuário deve visualizar apenas a etapa atual.

---

# 2.2 Clareza

Os elementos devem possuir:

- textos objetivos;
- ações evidentes;
- mensagens compreensíveis.

Exemplo:


Evitar:

```
Erro 500
```


Utilizar:

```
Não foi possível concluir o agendamento.
Tente novamente.
```

---

# 2.3 Consistência

Elementos semelhantes devem possuir o mesmo comportamento.


Exemplo:

Todos os botões principais devem seguir o mesmo padrão visual.

---

# 2.4 Feedback ao usuário

Toda ação deve apresentar retorno.


Exemplos:


Após salvar:


```
Serviço cadastrado com sucesso.
```


Durante carregamento:


```
Salvando informações...
```

---

# 3. Público Usuário

O sistema será utilizado principalmente por:


## Clientes

Necessidades:

- rapidez;
- facilidade;
- poucos passos;
- informações claras.


## Administradores

Necessidades:

- organização;
- visualização de dados;
- controle da agenda.

---

# 4. Fluxo Principal do Cliente


O fluxo principal será:


```
Página Inicial

↓

Escolher Agendamento

↓

Escolher Serviço

↓

Escolher Profissional

↓

Escolher Data

↓

Escolher Horário

↓

Confirmar

↓

Resultado
```


---

# 5. Tela Inicial


Objetivo:

Apresentar a barbearia e direcionar o usuário.


Elementos:


- logo;
- apresentação;
- serviços;
- botão de agendamento;
- informações de contato.


---

# 6. Tela de Agendamento


A tela principal do sistema.


O processo será dividido em etapas.


---

# Etapa 1 - Serviço


Usuário escolhe o procedimento.


Exemplo:


```
Escolha o serviço:


✂ Corte

30 minutos

R$40


🧔 Barba

20 minutos

R$25
```


---

# Etapa 2 - Profissional


Usuário escolhe o barbeiro.


Exemplo:


```
Escolha o profissional:


João

Especialista em cortes


Carlos

Especialista em barba
```

---

# Etapa 3 - Data


Usuário escolhe o dia.


Regras:


- datas passadas bloqueadas;
- dias sem funcionamento desabilitados.

---

# Etapa 4 - Horário


Sistema mostra somente horários disponíveis.


Exemplo:


```
09:00

09:30

10:00
```


Horários ocupados não devem aparecer.

---

# Etapa 5 - Confirmação


Apresentar resumo:


```
Serviço:
Corte


Profissional:
João


Data:
15/08/2026


Horário:
14:30
```


Botão:

```
Confirmar agendamento
```

---

# 7. Área Administrativa


A interface administrativa terá foco em produtividade.


Estrutura:


```
Sidebar

Dashboard

Conteúdo
```


---

# 8. Dashboard


Informações previstas:


Cards:


```
Agendamentos hoje

Clientes cadastrados

Serviços realizados
```


---

# 9. Agenda Administrativa


Visualização:


- calendário;
- horários;
- profissionais.


Objetivo:

Facilitar organização da barbearia.

---

# 10. Responsividade


O sistema deverá funcionar em:


- computadores;
- tablets;
- smartphones.


---

# Estratégia Mobile First


A interface será desenvolvida pensando primeiro em telas menores.


Depois será adaptada para telas maiores.


---

# 11. Navegação


A navegação deve ser simples.


Cliente:


```
Início

Agendar

Meus horários

Perfil
```


Administrador:


```
Dashboard

Clientes

Serviços

Profissionais

Agenda
```


---

# 12. Identidade Visual


A interface deverá transmitir:


- profissionalismo;
- confiança;
- modernidade.


Possíveis características:


- cores neutras;
- contraste elevado;
- aparência elegante.


Exemplo de conceito:


```
Barbearia moderna

+
Tecnologia

+
Simplicidade
```


---

# 13. Tipografia


A interface deverá utilizar fontes:


- legíveis;
- com boa separação;
- adequadas para leitura prolongada.


Evitar:


- fontes decorativas;
- textos pequenos.

---

# 14. Cores


As cores devem seguir:


- contraste adequado;
- acessibilidade;
- consistência.


Não utilizar somente cores para transmitir informações.


Exemplo:


Errado:


```
Vermelho = cancelado
```


Correto:


```
❌ Cancelado
```


---

# 15. Componentes Visuais


Elementos padronizados:


- botões;
- campos;
- cards;
- tabelas;
- alertas.


A biblioteca shadcn/ui será utilizada como base.

---

# 16. Estados da Interface


Todos componentes devem possuir estados:


## Normal


Usuário pode interagir.


---

## Hover


Indicação visual ao passar mouse.


---

## Loading


Indicação de processamento.


---

## Disabled


Elemento indisponível.


---

## Error


Informação de erro.


---

# 17. Formulários


Os formulários devem:


- possuir labels;
- informar erros;
- validar campos;
- evitar informações ambíguas.


---

# 18. Mensagens do Sistema


As mensagens devem ser:


- curtas;
- claras;
- amigáveis.


Exemplo:


Evitar:


```
Invalid input.
```


Utilizar:


```
Informe um email válido.
```

---

# 19. Experiência para Pessoas com Necessidades Específicas


A interface deverá considerar:


- pessoas cegas;
- pessoas com baixa visão;
- pessoas surdas;
- pessoas com daltonismo;
- pessoas com dificuldades cognitivas;
- pessoas com limitações motoras.


---

# 20. Considerações Finais


A interface do Barbearia Web será desenvolvida com foco na experiência do usuário.

O objetivo não é apenas criar uma aplicação funcional, mas uma solução simples, inclusiva e agradável para diferentes perfis de usuários.