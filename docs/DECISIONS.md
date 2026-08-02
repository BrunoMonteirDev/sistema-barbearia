# 💈 DECISIONS.md

# Registro de Decisões Técnicas

## Barbearia Web

Este documento registra as principais decisões arquiteturais e técnicas tomadas durante o desenvolvimento do projeto.

O objetivo é manter histórico das escolhas realizadas, evitando dúvidas futuras e facilitando a manutenção do sistema.

---

# DEC-017

# Validação de disponibilidade em duas camadas

## Status

Aceita

## Contexto

O horário apresentado ao cliente pode deixar de estar livre entre a consulta e a confirmação.

## Decisão

Calcular os horários no serviço `horarios.service.ts`, validar novamente no endpoint de criação e manter uma restrição parcial no PostgreSQL para reservas não canceladas.

## Motivo e consequências

A combinação mantém a interface rápida, concentra a regra reutilizável e transforma disputa simultânea em resposta HTTP 409, sem expor erro interno. A solução é simples para o escopo de uma barbearia e evita confiar apenas no frontend.

---

# DEC-016

# Arquitetura atual com React/Vite e Express

## Status

Aceita

## Decisão

Adotar React/Vite no cliente e uma API REST Express no servidor, usando
Prisma como única camada de persistência, PostgreSQL como banco e JWT para
sessões autenticadas.

## Contexto

Os documentos iniciais registravam Next.js como intenção. A implementação em
produção local evoluiu para aplicações separadas `client` e `server`, já
cobertas por testes e scripts próprios.

## Motivo

A estrutura atual é simples de executar, separa claramente interface e API e
corresponde ao código efetivamente mantido no repositório. Esta decisão
substitui DEC-001 somente quanto à escolha do framework; o registro histórico
da decisão original permanece para fins acadêmicos.

## Impacto

Documentação, instruções de desenvolvimento e diagramas novos devem referir
React/Vite + Express. Não planejar migração para Next.js sem nova decisão.

---

# DEC-015

# Dialogos padronizados para formularios e confirmacoes

## Status

Aceita

## Decisao

Cadastros e edicoes do painel administrativo devem usar janelas modais reutilizaveis. Acoes destrutivas devem pedir confirmacao no proprio sistema, sem alertas nativos do navegador.

## Motivo

Manter a interface previsivel, acessivel por teclado e consistente entre clientes, servicos, funcionarios e agendamentos, sem adicionar bibliotecas.

---

# DEC-001

# Utilização do Next.js como framework principal

## Data

Julho de 2026


## Status

Aceita


## Decisão

Utilizar o framework Next.js para desenvolvimento da aplicação web.


## Contexto

O projeto necessita de uma aplicação web moderna contendo:

- interface frontend;
- lógica backend;
- APIs;
- integração com banco de dados.


Foram avaliadas diferentes abordagens:

- React puro;
- React + Express;
- Laravel;
- Next.js.


## Motivo da escolha

O Next.js permite desenvolver frontend e backend dentro da mesma aplicação, reduzindo a complexidade inicial do projeto.

Além disso, oferece:

- roteamento integrado;
- renderização otimizada;
- organização de páginas;
- suporte ao TypeScript;
- comunidade ampla.


## Alternativas consideradas


### React + Express

Vantagem:

Separação clara entre frontend e backend.


Desvantagem:

Aumenta a quantidade de tecnologias necessárias.


---

### Laravel

Vantagem:

Framework completo.


Desvantagem:

Necessidade de aprender PHP e outro ecossistema.


## Impacto

O projeto terá uma arquitetura mais simples e adequada ao escopo acadêmico.


---

# DEC-002

# Utilização de TypeScript


## Data

Julho de 2026


## Status

Aceita


## Decisão

Utilizar TypeScript como linguagem principal.


## Contexto

Sistemas web modernos possuem grande quantidade de dados e regras.

O JavaScript puro permite erros que poderiam ser evitados durante o desenvolvimento.


## Motivo da escolha

TypeScript adiciona tipagem estática, permitindo:

- maior segurança;
- melhor manutenção;
- identificação antecipada de erros;
- melhor documentação do código.


## Impacto

O desenvolvimento inicial pode ser um pouco mais complexo, porém aumenta a qualidade do sistema.


---

# DEC-003

# Utilização do PostgreSQL como banco de dados


## Data

Julho de 2026


## Status

Aceita


## Decisão

Utilizar PostgreSQL como banco de dados principal.


## Contexto

O sistema necessita armazenar:

- usuários;
- profissionais;
- serviços;
- horários;
- agendamentos.


O modelo possui relacionamento entre diversas entidades, sendo necessário um banco relacional.


## Motivo da escolha

PostgreSQL foi escolhido por:

- ser gratuito;
- possuir grande estabilidade;
- suportar relacionamentos complexos;
- possuir ampla utilização profissional.


## Alternativas consideradas


### MongoDB

Vantagem:

Modelo flexível.


Desvantagem:

O sistema possui muitas relações, tornando um banco relacional mais adequado.


## Impacto

O banco permitirá aplicar conceitos de modelagem relacional estudados no curso.


---

# DEC-004

# Utilização do Prisma ORM


## Data

Julho de 2026


## Status

Aceita


## Decisão

Utilizar Prisma como camada de comunicação com banco.


## Contexto

O desenvolvimento direto utilizando SQL aumentaria a complexidade inicial.


## Motivo da escolha

O Prisma oferece:

- integração com TypeScript;
- migrations;
- tipagem automática;
- facilidade de manutenção.


Exemplo:


SQL:

```sql
SELECT * FROM usuario;
```


Prisma:


```typescript
await prisma.usuario.findMany()
```


## Impacto

O código ficará mais organizado e seguro.


---

# DEC-005

# Utilização de Tailwind CSS


## Data

Julho de 2026


## Status

Aceita


## Decisão

Utilizar Tailwind CSS para estilização.


## Contexto

O projeto necessita de uma interface responsiva e padronizada.


## Motivo da escolha

Tailwind permite:

- desenvolvimento rápido;
- padronização visual;
- menor quantidade de CSS manual.


## Alternativas consideradas


### CSS tradicional

Desvantagem:

Pode gerar muitos arquivos e dificuldade de manutenção.


## Impacto

O desenvolvimento da interface será mais rápido e consistente.


---

# DEC-006

# Utilização do shadcn/ui


## Data

Julho de 2026


## Status

Aceita


## Decisão

Utilizar componentes baseados em shadcn/ui.


## Contexto

O sistema necessita de componentes como:

- botões;
- formulários;
- diálogos;
- tabelas.


## Motivo da escolha

A biblioteca fornece componentes acessíveis e personalizáveis.


## Impacto

Reduz tempo de desenvolvimento mantendo qualidade visual.


---

# DEC-007

# Desenvolvimento inicial sem autenticação


## Data

Julho de 2026


## Status

Aceita temporariamente


## Decisão

O primeiro MVP será desenvolvido sem sistema completo de login.


## Contexto

A autenticação adiciona diversas complexidades:

- controle de sessão;
- criptografia;
- permissões;
- recuperação de senha.


## Motivo da escolha

O objetivo inicial é validar o fluxo principal:

Cliente → Serviço → Profissional → Horário → Agendamento.


Após validação do MVP, a autenticação será adicionada.


## Impacto

Permite aprendizado progressivo e entrega mais rápida.


---

# DEC-008

# Desenvolvimento incremental por MVP


## Data

Julho de 2026


## Status

Aceita


## Decisão

O sistema será desenvolvido em pequenas versões funcionais.


## Contexto

O escopo original possui muitas funcionalidades:

- pagamentos;
- WhatsApp;
- dashboard;
- acessibilidade;
- relatórios.


Tentar desenvolver tudo inicialmente aumentaria o risco do projeto.


## Motivo da escolha

O desenvolvimento incremental permite:

- validar funcionalidades;
- corrigir problemas cedo;
- aprender tecnologias gradualmente.


## Impacto

O sistema será evoluído conforme novas versões.


---

# DEC-009

# Não utilizar arquitetura complexa inicialmente


## Data

Julho de 2026


## Status

Aceita


## Decisão

Não utilizar inicialmente arquiteturas como:

- Clean Architecture;
- Microservices;
- DDD completo.


## Contexto

Apesar de serem arquiteturas importantes, elas aumentariam a complexidade do projeto.


## Motivo da escolha

O sistema possui escopo limitado e finalidade acadêmica.


A prioridade é:

- funcionamento;
- entendimento;
- organização.


## Impacto

A arquitetura poderá evoluir caso necessário.


---

# DEC-010

# Sistema inicialmente desenvolvido para uma única barbearia


## Data

Julho de 2026


## Status

Aceita


## Decisão

Não implementar arquitetura MultiTenant.


## Contexto

Um sistema comercial poderia atender várias barbearias.


Porém isso exigiria:

- isolamento de dados;
- planos;
- pagamentos;
- gerenciamento de empresas.


## Motivo da escolha

O objetivo do TCC é demonstrar um sistema funcional de agendamento.


## Impacto

O banco e a arquitetura permanecem mais simples.


---

# DEC-011

# Prioridade em acessibilidade


## Data

Julho de 2026


## Status

Aceita


## Decisão

A acessibilidade será considerada requisito principal do sistema.


## Contexto

O projeto possui orientação acadêmica para inclusão digital.


## Motivo da escolha

O sistema deve atender diferentes usuários, incluindo:

- pessoas com deficiência visual;
- pessoas surdas;
- pessoas com daltonismo;
- pessoas com limitações motoras;
- pessoas com necessidades cognitivas.


## Impacto

A acessibilidade será considerada durante todo desenvolvimento, não apenas no final.


---

# DEC-012

# Documentação como parte do desenvolvimento


## Data

Julho de 2026


## Status

Aceita


## Decisão

Manter documentação atualizada durante o projeto.


## Contexto

Projetos acadêmicos frequentemente possuem problemas de organização.


## Motivo da escolha

A documentação facilita:

- manutenção;
- apresentação na banca;
- continuidade do desenvolvimento.


## Impacto

Toda alteração relevante deverá possuir atualização documental.


---

# DEC-013

# Separação entre regra de negócio e interface


## Data

Julho de 2026


## Status

Aceita


## Decisão

As regras do sistema devem ficar separadas dos componentes visuais.


## Contexto

Misturar interface e regras dificulta manutenção.


## Motivo da escolha

Separação permite:

- testes mais fáceis;
- código organizado;
- reutilização.


## Impacto

Será utilizada uma camada de services.


---

# DEC-014

# Evolução futura


## Data

Julho de 2026


## Status

Planejada


## Possíveis evoluções:


- integração oficial WhatsApp API;
- pagamentos online;
- aplicativo mobile;
- relatórios avançados;
- inteligência artificial;
- recomendações;
- automações com n8n.


Essas funcionalidades não fazem parte do MVP inicial.


---

# Observação Final

Todas as decisões podem ser revisadas durante o desenvolvimento caso novas necessidades sejam identificadas.

Qualquer alteração importante deve gerar uma nova decisão neste documento.
## Transição Prisma e JWT

A aplicação usa Express como etapa de transição, Prisma como única camada de dados e JWT para autenticação. Administrador gerencia o painel; Cliente acessa apenas o próprio perfil e os próprios agendamentos. Supabase e mocks foram removidos das rotas ativas.
