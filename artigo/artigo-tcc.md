# DESENVOLVIMENTO DE UM SISTEMA WEB PARA AGENDAMENTO E GESTÃO DE HORÁRIOS EM BARBEARIAS

## DEVELOPMENT OF A WEB SYSTEM FOR APPOINTMENT SCHEDULING AND TIME MANAGEMENT IN BARBERSHOPS

**[NOME COMPLETO DO AUTOR — PENDENTE DE CONFIRMAÇÃO]**

**[ORIENTADOR, TITULAÇÃO E FILIAÇÃO — PENDENTE DE CONFIRMAÇÃO]**

### Resumo

Pequenos estabelecimentos de atendimento pessoal frequentemente concentram no profissional a execução do serviço e a organização dos horários. Quando a agenda é conduzida por mensagens ou anotações dispersas, a consulta à disponibilidade e a confirmação de atendimentos podem interromper o trabalho e favorecer registros inconsistentes. Este trabalho apresenta o desenvolvimento de um sistema web voltado a uma única barbearia, delimitado à organização de profissionais, serviços, jornadas e agendamentos. O objetivo foi implementar uma solução responsiva que permita selecionar profissional, serviço, data e horário disponível, mantendo controles administrativos e prevenindo conflitos de agenda. O desenvolvimento tecnológico utilizou React, TypeScript e Vite no cliente; Express, JWT e Prisma na API; e PostgreSQL na persistência. A disponibilidade é calculada em blocos de trinta minutos, considerando a jornada do profissional, a duração do serviço e atendimentos ativos, e é novamente validada antes da gravação. Como resultado, foram implementados autenticação, autorização por nível, cadastro de serviços e profissionais, configuração de disponibilidade, agendamento em quatro etapas com revisão obrigatória, cancelamento, remarcação, histórico e painel administrativo. Na validação executada, lint, compilação e 129 testes unitários foram aprovados. A cobertura automatizada ainda ficou abaixo da meta configurada e os testes de integração com PostgreSQL permaneceram pendentes pela indisponibilidade local do Docker. Conclui-se que a solução atende ao núcleo de gestão de horários proposto, preservando limites técnicos e operacionais explícitos.

**Palavras-chave:** Agendamento. Barbearias. Sistemas web. Gestão de horários. Banco de dados.

### Abstract

Small personal-service establishments often require the professional to both provide the service and organize appointments. When schedules are managed through messages or scattered notes, checking availability and confirming appointments may interrupt work and lead to inconsistent records. This paper presents the development of a web system for a single barbershop, focused on managing professionals, services, work schedules, and appointments. The objective was to implement a responsive solution that allows users to select a professional, service, date, and available time while maintaining administrative controls and preventing scheduling conflicts. The technological development used React, TypeScript, and Vite on the client; Express, JWT, and Prisma in the API; and PostgreSQL for persistence. Availability is calculated in thirty-minute blocks, considering the professional’s schedule, service duration, and active appointments, and is validated again before persistence. The implemented results include authentication, role-based authorization, service and professional management, availability configuration, a four-step appointment flow with mandatory review, cancellation, rescheduling, history, and an administrative panel. In the executed validation, linting, compilation, and 129 unit tests passed. Automated coverage remained below the configured target, and PostgreSQL integration tests remained pending due to local Docker unavailability. The solution therefore meets the proposed core of schedule management while making its technical and operational limits explicit.

**Keywords:** Scheduling. Barbershops. Web systems. Time management. Database.

## 1 Introdução

O atendimento em uma barbearia depende da compatibilização entre o tempo necessário para cada serviço, a jornada dos profissionais e as escolhas dos clientes. Em um processo informal, a consulta e o registro desses horários tendem a ficar distribuídos entre conversas e anotações, sem uma fonte única para verificar a ocupação da agenda. O problema delimitado neste trabalho consiste, portanto, em organizar reservas sem permitir que dois atendimentos incompatíveis sejam atribuídos ao mesmo profissional e período.

O projeto foi refinado durante o desenvolvimento para uma única barbearia. Recursos inicialmente mais amplos, como pagamentos, relatórios avançados e fidelidade, não compõem o resultado apresentado. A delimitação favoreceu a concentração no fluxo de agendamento, na administração de jornadas e na confiabilidade das regras de disponibilidade.

A questão de pesquisa é: **como desenvolver um sistema web simples e responsivo capaz de organizar os agendamentos de uma barbearia, considerando a jornada dos profissionais, a duração dos serviços e a prevenção de conflitos de horários?** O objetivo geral foi desenvolver um sistema web para gerenciar esses agendamentos e disponibilizar controles administrativos. Especificamente, buscaram-se modelar as entidades principais; implementar seleção de profissionais, serviços, datas e horários; configurar jornadas; calcular disponibilidade; autenticar usuários; restringir ações por perfil; registrar alterações e validar regras críticas por testes.

As seções seguintes apresentam os fundamentos técnicos necessários, o processo de desenvolvimento, a arquitetura implementada, os resultados de validação e as limitações observadas.

## 2 Fundamentação técnica

Aplicações React são organizadas a partir de componentes e estado de interface, permitindo que cada tela responda às interações do usuário (REACT, 2026). No sistema, essa abordagem foi empregada para etapas de agendamento, carregamento de horários e mensagens de retorno. TypeScript complementa essa construção ao realizar verificação estática de tipos antes da execução, reduzindo incompatibilidades entre dados de interface e API (TYPESCRIPT, 2026).

No servidor, uma arquitetura cliente-servidor foi adotada: a interface envia requisições HTTP; a API valida, aplica regras e acessa a persistência. O Prisma foi empregado como ORM por combinar modelo declarativo, cliente tipado e migrations versionadas (PRISMA, 2026a). As migrations registram a evolução do banco e devem permanecer no controle de versão, pois também documentam mudanças que não são representadas apenas pelo estado final do schema (PRISMA, 2026b).

O banco relacional é relevante no problema por representar relações entre usuários, profissionais, serviços e reservas. Chaves e constraints constituem mecanismos de integridade do modelo relacional (POSTGRESQL GLOBAL DEVELOPMENT GROUP, 2026). Neste projeto, a regra de disponibilidade é também aplicada na API; a restrição no banco complementa a prevenção de disputa por um horário ativo.

Quanto à interface, foram incluídos elementos semânticos, foco por teclado, atalho para conteúdo principal, controles de acessibilidade e integração VLibras. Essas medidas se relacionam às recomendações da WCAG 2.2, que abrange necessidades visuais, auditivas, motoras e cognitivas, mas a própria diretriz pressupõe combinação de avaliação humana e automatizada (W3C, 2024). Assim, não se afirma conformidade integral de acessibilidade.

## 3 Materiais e métodos

O trabalho caracteriza-se como desenvolvimento tecnológico aplicado. A classificação metodológica detalhada deve ser confirmada com o orientador e referência metodológica específica antes da submissão. Foram realizadas identificação do problema, refinamento do escopo, levantamento de requisitos, modelagem de dados, implementação incremental, testes e documentação.

As ferramentas confirmadas no repositório são React 18.3.1, Vite 5.4.3, TypeScript 5.9.3, Express 5.2.1, Prisma 7.9.0, PostgreSQL, JWT, Vitest e Docker Compose. Não foram utilizados Next.js, Server Components ou Server Actions na implementação final. O código, schema, migrations, testes e resultados de execução foram tratados como fontes prioritárias; documentos históricos foram usados apenas para contextualização.

### 3.1 Arquitetura e modelagem

O repositório organiza o cliente em `client/` e a API em `server/`. As páginas e componentes React consomem a camada `client/src/lib/api.ts`; o servidor registra rotas Express, aplica middleware de autenticação e encaminha cálculos de domínio para serviços. Prisma acessa PostgreSQL a partir de `server/prisma/schema.prisma`.

As entidades persistidas são `Usuario`, `Profissional`, `Servico`, `Agendamento`, `DisponibilidadeProfissional`, `HistoricoAgendamento`, `NotificacaoAgendamento` e `Configuracao`. Um agendamento relaciona cliente, profissional e serviço. A disponibilidade semanal registra blocos por profissional e dia da semana. O histórico mantém autor e valores de alterações. A tabela de notificações registra tentativas e resultados de envio sem fazer da integração externa uma condição para criar a reserva.

### 3.2 Fluxo de agendamento e disponibilidade

O agendamento é apresentado em quatro etapas: profissional, serviço, data/horário e revisão. O cliente pode escolher um profissional ou a opção sem preferência. Após escolher uma data, a interface solicita os horários disponíveis. A confirmação somente ocorre na etapa de revisão, após aceite explícito; quando não autenticado, o usuário é direcionado ao login e retorna com os dados preservados.

No serviço `horarios.service.ts`, a jornada é representada em blocos de trinta minutos. A duração do serviço é arredondada para blocos e um horário de início é aceito apenas quando todos os blocos consecutivos necessários pertencem à disponibilidade configurada. Agendamentos com status diferente de cancelado são comparados por intervalos; há conflito quando o início de um período ocorre antes do término do outro. O endpoint de criação repete a validação imediatamente antes da persistência. Se ocorrer concorrência no banco, o erro de unicidade é convertido em HTTP 409, orientando a escolha de outro horário.

```text
para cada horário da jornada:
  se os blocos necessários não forem consecutivos: ignorar
  se sobrepuser agendamento ativo: ignorar
  incluir como horário disponível
antes de gravar: calcular novamente e validar a restrição do banco
```

### 3.3 Administração, segurança e integrações

O painel administrativo permite gerenciar serviços, profissionais, usuários, disponibilidade, agendamentos, status e regras de antecedência. Cancelamentos, remarcações e alterações relevantes geram histórico. JWT é emitido após login local ou Google e verificado pelo middleware. As rotas administrativas exigem nível de administrador; clientes são limitados aos próprios dados e agendamentos. Senhas são processadas por hash no servidor. As mensagens de erro retornadas ao cliente são controladas, sem expor detalhes do Prisma.

A integração Evolution/WhatsApp possui serviço, rotas administrativas, modelos de mensagem e composição Docker. Entretanto, a comunicação real não foi validada na execução mais recente e depende de variáveis de ambiente e QR Code que não são incluídos neste artigo. O login Google também depende de configuração externa. Ambas são apresentadas como integrações parciais.

## 4 Resultados e discussão

A implementação resultou em uma aplicação que permite ao cliente escolher serviço, profissional, data e horário, revisar dados e confirmar a reserva autenticada. A administração dispõe de controle de agenda, cadastros, jornadas e regras de prazo. O requisito central de prevenir conflitos é atendido pela combinação entre cálculo de blocos, verificação de sobreposição, revalidação na API e restrição parcial para horários não cancelados.

| Cenário | Resultado esperado | Resultado obtido | Evidência |
| --- | --- | --- | --- |
| Agendar horário livre | criar reserva | aprovado em testes unitários | `agendamentos.test.ts` |
| Horário conflitante | rejeitar operação | resposta 409 coberta | testes de agendamentos |
| Serviço não cabe na jornada | não listar início | regra de blocos consecutivos | `horarios.service.test.ts` |
| Cadastro pendente | bloquear reserva | resposta 403 coberta | testes de agendamentos |
| Cancelar reserva | liberar horário | migration/regra e testes | rotas e testes |
| Cliente acessar dados de outro | negar acesso | histórico e ações protegidos | testes de rotas |

Na execução de 02 de agosto de 2026, o lint do cliente, o build do cliente e servidor e os testes unitários foram aprovados, totalizando 129 testes. Esse resultado demonstra a execução dos cenários cobertos, mas não permite afirmar validação integral. A cobertura medida foi de 65,78% de linhas no cliente e 60% no servidor, abaixo da meta de 80%. Os testes de integração foram preparados com banco exclusivo e migrations automáticas, porém não foram executados até as asserções porque o Docker Desktop estava indisponível no ambiente local.

O sistema também possui recursos iniciais de responsividade e acessibilidade, sem auditoria humana formal. Pagamentos, estoque, fidelidade, relatórios avançados, métricas de negócio e implantação pública não foram implementados como resultados deste trabalho. Essa distinção é necessária para não confundir planejamento com entrega verificável.

## 5 Considerações finais

O trabalho respondeu à questão proposta ao implementar um sistema web para organizar agendamentos de uma barbearia a partir da jornada dos profissionais, da duração dos serviços e da prevenção de conflitos. O objetivo geral foi alcançado no núcleo de agendamento e administração: a solução mantém dados relacionais, autenticação, autorização, seleção em etapas, cálculo de disponibilidade, cancelamento, remarcação e histórico.

Como limitações, destacam-se a cobertura abaixo da meta configurada, a ausência de execução recente dos testes de integração com PostgreSQL, a necessidade de validação real das integrações Google e Evolution e a falta de auditoria formal de acessibilidade e uso por clientes reais. Trabalhos futuros podem ampliar a cobertura, concluir essas validações, realizar avaliação com usuários, adicionar implantação controlada e avaliar recursos como pagamentos, estoque, fidelidade e relatórios, sem comprometer a simplicidade da regra central de disponibilidade.

## Agradecimentos

[PENDENTE DE CONFIRMAÇÃO PELO AUTOR]

## Financiamento

[PENDENTE DE CONFIRMAÇÃO PELO AUTOR. Sugestão, se aplicável: “O desenvolvimento deste trabalho não recebeu financiamento externo.”]

## Conflito de interesses

[PENDENTE DE CONFIRMAÇÃO PELO AUTOR. Sugestão, se aplicável: “Os autores declaram não haver conflito de interesses.”]

## Contribuições dos autores

[PENDENTE DE CONFIRMAÇÃO PELO AUTOR. A contribuição de cada autor deve seguir a informação real e a taxonomia exigida pela revista.]

## Referências

POSTGRESQL GLOBAL DEVELOPMENT GROUP. **PostgreSQL 18 Documentation: Data Definition**. Disponível em: <https://www.postgresql.org/docs/current/ddl.html>. Acesso em: 2 ago. 2026.

PRISMA. **Prisma ORM**. Disponível em: <https://www.prisma.io/docs/orm>. Acesso em: 2 ago. 2026a.

PRISMA. **Migration histories**. Disponível em: <https://www.prisma.io/docs/orm/prisma-migrate/understanding-prisma-migrate/migration-histories>. Acesso em: 2 ago. 2026b.

REACT. **Quick Start**. Disponível em: <https://react.dev/learn>. Acesso em: 2 ago. 2026.

TYPESCRIPT. **The TypeScript Handbook**. Disponível em: <https://www.typescriptlang.org/docs/handbook/intro>. Acesso em: 2 ago. 2026.

WORLD WIDE WEB CONSORTIUM. **Web Content Accessibility Guidelines (WCAG) 2.2**. 2024. Disponível em: <https://www.w3.org/TR/WCAG22/>. Acesso em: 2 ago. 2026.
