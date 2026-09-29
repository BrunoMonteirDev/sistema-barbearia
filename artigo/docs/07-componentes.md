# 💈 07 - Componentes do Sistema

# Barbearia Web

---

# 1. Introdução

Este documento define a organização dos componentes da interface do sistema Barbearia Web.

A aplicação será desenvolvida utilizando React dentro do framework Next.js.

A arquitetura de componentes seguirá os princípios:

- reutilização;
- separação de responsabilidades;
- organização;
- facilidade de manutenção.

---

# 2. Conceito de Componentes

Um componente representa uma parte independente da interface.

Exemplos:

- botão;
- formulário;
- card;
- tabela;
- menu;
- calendário.

Cada componente deve possuir uma responsabilidade clara.

---

# 3. Estrutura de Componentes


A organização seguirá:


```
src/

components/

├── ui/
├── layout/
├── forms/
├── shared/
├── agenda/
├── dashboard/
└── accessibility/
```


---

# 4. Componentes UI

Local:

```
components/ui
```


São componentes básicos utilizados em todo sistema.


Exemplos:


```
Button

Input

Modal

Card

Select

Table

Badge

Alert
```


---

# 4.1 Button


Responsável pelos botões do sistema.


Exemplos:


- Salvar;
- Confirmar;
- Cancelar;
- Editar.


Requisitos:

- acessível;
- suporte a teclado;
- estados de carregamento.

---

# 4.2 Input


Campos de entrada.


Exemplos:


- nome;
- email;
- telefone;
- senha.


Deve possuir:


- label;
- mensagem de erro;
- descrição auxiliar.


---

# 4.3 Modal


Componente para janelas de confirmação.


Exemplos:


- confirmar cancelamento;
- excluir registro.


---

# 4.4 Card


Utilizado para exibição de informações.


Exemplos:


- serviço;
- profissional;
- estatísticas.


---

# 5. Componentes de Layout


Local:

```
components/layout
```


Responsáveis pela estrutura visual.


---

# 5.1 Navbar


Barra superior.


Responsável por:


- logo;
- navegação;
- usuário logado.


---

# 5.2 Sidebar


Menu lateral administrativo.


Opções:


- Dashboard;
- Clientes;
- Profissionais;
- Serviços;
- Agenda.


---

# 5.3 Footer


Rodapé do sistema.


Informações:

- projeto;
- acessibilidade;
- créditos.


---

# 6. Componentes Compartilhados


Local:


```
components/shared
```


Componentes usados em diversas páginas.


---

# 6.1 Loading


Exibe carregamento.


Exemplos:


- consultas;
- envio de formulários.


---

# 6.2 EmptyState


Exibe ausência de dados.


Exemplo:


"Você não possui agendamentos."


---

# 6.3 ErrorMessage


Apresenta erros de forma amigável.


---

# 7. Componentes de Formulário


Local:


```
components/forms
```


Responsáveis por entradas de dados.


---

# 7.1 UserForm


Cadastro de usuários.


Campos:


- nome;
- email;
- telefone;
- senha.


---

# 7.2 ServiceForm


Cadastro de serviços.


Campos:


- nome;
- duração;
- preço.


---

# 7.3 ProfessionalForm


Cadastro de profissionais.


Campos:


- nome;
- especialidade.


---

# 8. Componentes de Agendamento


Local:


```
components/agenda
```


Responsáveis pelo fluxo principal do sistema.


---

# 8.1 ServiceSelector


Seleção do serviço.


Exemplo:


```
Escolha o serviço:


[ Corte ]

[ Barba ]

[ Corte + Barba ]
```


---

# 8.2 ProfessionalSelector


Seleção do profissional.


Exemplo:


```
Escolha o barbeiro:


[ João ]

[ Carlos ]
```


---

# 8.3 CalendarPicker


Seleção da data.


Responsável por:


- mostrar calendário;
- bloquear datas inválidas.


---

# 8.4 TimeSelector


Seleção de horário.


Responsável por:


- mostrar horários disponíveis;
- bloquear horários ocupados.


---

# 8.5 AppointmentSummary


Resumo antes da confirmação.


Exibe:


- serviço;
- profissional;
- data;
- horário;
- valor.


---

# 8.6 AppointmentConfirmation


Confirmação final.


Responsável por:


- enviar dados;
- criar agendamento;
- mostrar resultado.


---

# 9. Componentes Administrativos


Local:


```
components/dashboard
```


---

# 9.1 StatsCard


Exibe indicadores.


Exemplos:


- atendimentos hoje;
- clientes;
- serviços.


---

# 9.2 DataTable


Tabela administrativa.


Utilizada para:


- clientes;
- serviços;
- profissionais;
- agendamentos.


---

# 9.3 AppointmentCalendar


Calendário administrativo.


Exibe:


- agenda diária;
- horários ocupados;
- profissionais.


---

# 10. Componentes de Acessibilidade


Local:


```
components/accessibility
```


---

# 10.1 AccessibilityMenu


Menu de recursos acessíveis.


Opções:


- alto contraste;
- aumentar fonte;
- reduzir animações.


---

# 10.2 FontController


Controle do tamanho da fonte.


Permite:


- aumentar;
- diminuir;
- restaurar.


---

# 10.3 ContrastController


Alternância de contraste.


Modos:


- padrão;
- alto contraste.


---

# 10.4 VLibrasIntegration


Componente responsável pela integração com tradução em Libras.


---

# 11. Páginas Principais


Estrutura:


```
app/

├── page.tsx

├── agendamento/

├── login/

├── cadastro/

└── admin/
```


---

# 11.1 Página Inicial


Responsável por:


- apresentação;
- informações da barbearia;
- botão agendar.


---

# 11.2 Página de Agendamento


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


---

# 11.3 Área Administrativa


Páginas:


```
/admin/dashboard

/admin/clientes

/admin/profissionais

/admin/servicos

/admin/agendamentos
```


---

# 12. Regras para Criação de Componentes


Todo componente deve:


- possuir uma única responsabilidade;
- ser reutilizável quando possível;
- possuir nomes claros;
- evitar lógica de negócio;
- possuir acessibilidade.


---

# 13. Organização de Código


Exemplo:


```
components/

ServiceCard/

├── index.tsx

├── styles.ts

└── types.ts
```


Ou:


```
ServiceCard.tsx
```


Para componentes menores.

---

# 14. Comunicação entre Componentes


Os componentes devem utilizar:


- props;
- hooks;
- context quando necessário.


Evitar:


- estados globais desnecessários;
- passagem excessiva de propriedades.


---

# 15. Hooks Personalizados


Quando houver lógica reutilizada:


Criar:


```
hooks/
```


Exemplos:


```
useAuth()

useAppointment()

useAccessibility()
```


---

# 16. Considerações Finais


A organização dos componentes busca manter o sistema escalável e facilitar a evolução do projeto.

A separação entre componentes visuais, componentes de negócio e páginas permite que novas funcionalidades sejam adicionadas sem comprometer a estrutura existente.