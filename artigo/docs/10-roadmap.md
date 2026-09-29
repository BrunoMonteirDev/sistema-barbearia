# 💈 10 - Roadmap do Projeto

# Barbearia Web

---

# 1. Introdução

Este documento apresenta o planejamento de desenvolvimento do sistema Barbearia Web.

O projeto será desenvolvido de forma incremental, utilizando etapas organizadas em sprints.

Cada sprint possui objetivos específicos e entregas definidas.

O objetivo principal é construir inicialmente um MVP funcional e posteriormente adicionar recursos avançados.

---

# 2. Estratégia de Desenvolvimento

O desenvolvimento seguirá a seguinte abordagem:


```
Planejamento

↓

Modelagem

↓

Implementação

↓

Testes

↓

Melhorias

↓

Entrega
```


---

# 3. MVP Inicial

O primeiro objetivo será construir uma versão mínima funcional do sistema.


O MVP deverá permitir:


✓ Visualização dos serviços

✓ Visualização dos profissionais

✓ Escolha de data

✓ Escolha de horário

✓ Criação de agendamento

✓ Armazenamento no banco de dados


Neste momento não serão implementados:


- pagamentos;
- notificações;
- dashboard avançado;
- autenticação completa.

---

# 4. Sprint 0 - Fundação e Documentação

## Objetivo

Preparar a base do projeto.


## Atividades


- Criar documentação;
- Definir arquitetura;
- Definir tecnologias;
- Criar diagramas;
- Definir banco inicial;
- Configurar repositório.


## Entregas


✓ README.md

✓ SYSTEM_SPECIFICATION.md

✓ AGENTS.md

✓ DECISIONS.md

✓ Documentação técnica


Status:

```
Concluído
```

---

# 5. Sprint 1 - Configuração do Projeto

## Objetivo

Criar a estrutura inicial da aplicação.


## Atividades


- Criar projeto Next.js;
- Configurar TypeScript;
- Configurar Tailwind;
- Configurar ESLint;
- Configurar Prettier;
- Criar estrutura de pastas;
- Criar layout inicial.


## Entregas


Sistema executando localmente.


Status:

```
Planejado
```

---

# 6. Sprint 2 - Banco de Dados

## Objetivo

Criar a estrutura persistente do sistema.


## Atividades


Criar modelos:


- Usuário;
- Profissional;
- Serviço;
- Agendamento.


Configurar:


- PostgreSQL;
- Prisma ORM;
- Migrações.


## Entregas


Banco funcionando.


Status:

```
Planejado
```

---

# 7. Sprint 3 - Cadastros Básicos

## Objetivo

Criar gerenciamento das informações principais.


## Funcionalidades


## Serviços

Permitir:


- cadastrar;
- editar;
- remover;
- listar.


## Profissionais

Permitir:


- cadastrar;
- editar;
- ativar/desativar;
- listar.


## Clientes

Permitir:


- cadastro;
- consulta.


## Entregas


CRUDs principais funcionando.


Status:

```
Planejado
```

---

# 8. Sprint 4 - Sistema de Agendamento

## Objetivo

Implementar o principal recurso do sistema.


## Fluxo:


```
Escolher serviço

↓

Escolher profissional

↓

Escolher data

↓

Escolher horário

↓

Confirmar
```


## Implementações:


- calendário;
- horários disponíveis;
- validação de conflitos;
- criação de agendamento.


## Entregas


Cliente consegue realizar um agendamento completo.


Status:

```
Planejado
```

---

# 9. Sprint 5 - Área Administrativa

## Objetivo

Criar ferramentas de gerenciamento.


## Funcionalidades:


Dashboard:


- quantidade de agendamentos;
- atendimentos;
- informações gerais.


Agenda:


- visualizar horários;
- atualizar status;
- cancelar.


Gerenciamento:


- clientes;
- serviços;
- profissionais.


## Entregas


Painel administrativo funcional.


Status:

```
Planejado
```

---

# 10. Sprint 6 - Autenticação e Segurança

## Objetivo

Adicionar controle de acesso.


## Implementações:


- cadastro de usuários;
- login;
- sessão;
- proteção de rotas;
- níveis de acesso.


Perfis:


Cliente

Administrador


## Entregas


Sistema com autenticação.


Status:

```
Planejado
```

---

# 11. Sprint 7 - Recursos de Acessibilidade

## Objetivo

Implementar recursos inclusivos.


## Implementações:


- HTML semântico;
- ARIA;
- navegação por teclado;
- alto contraste;
- controle de fonte;
- redução de animações;
- VLibras.


## Testes:


- Lighthouse;
- testes manuais;
- leitor de tela.


## Entregas


Sistema adaptado para acessibilidade.


Status:

```
Planejado
```

---

# 12. Sprint 8 - Integrações

## Objetivo

Adicionar funcionalidades externas.


## Implementações:


## WhatsApp


Envio:


- confirmação de agendamento;
- lembrete próximo ao horário.


## Outras APIs


Possíveis integrações:


- calendário;
- mapas;
- serviços externos.


## Entregas


Sistema integrado.


Status:

```
Planejado
```

---

# 13. Sprint 9 - Testes e Melhorias

## Objetivo


Garantir qualidade.


## Atividades:


- testes funcionais;
- correção de erros;
- melhorias de interface;
- revisão de código.


---

# 14. Sprint 10 - Preparação da Banca

## Objetivo


Finalizar o projeto acadêmico.


## Atividades:


- documentação final;
- screenshots;
- vídeo demonstrativo;
- preparação da apresentação;
- revisão do artigo.


---

# 15. Cronograma Geral


| Etapa | Objetivo |
|-|-|
| Sprint 0 | Documentação |
| Sprint 1 | Estrutura inicial |
| Sprint 2 | Banco de dados |
| Sprint 3 | Cadastros |
| Sprint 4 | Agendamento |
| Sprint 5 | Administração |
| Sprint 6 | Segurança |
| Sprint 7 | Acessibilidade |
| Sprint 8 | Integrações |
| Sprint 9 | Testes |
| Sprint 10 | Entrega |

---

# 16. Prioridades do Projeto


## Prioridade Alta

Funcionalidades essenciais:


- banco;
- serviços;
- profissionais;
- agenda;
- agendamento.


---

## Prioridade Média


- autenticação;
- dashboard;
- relatórios.


---

## Prioridade Baixa


- pagamentos;
- integrações extras;
- funcionalidades avançadas.


---

# 17. Critério de Sucesso


O projeto será considerado concluído quando:


✓ Cliente conseguir realizar agendamento online.

✓ Administrador conseguir gerenciar agenda.

✓ Dados estiverem armazenados corretamente.

✓ Sistema possuir recursos de acessibilidade.

✓ Documentação estiver finalizada.

---

# 18. Considerações Finais


O roadmap permite que o desenvolvimento seja realizado de forma organizada, evitando aumento excessivo de escopo e garantindo uma entrega funcional dentro do período do TCC.