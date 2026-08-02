# DESENVOLVIMENTO DE UM SISTEMA WEB PARA AGENDAMENTO E GESTÃO DE HORÁRIOS EM BARBEARIAS

## DEVELOPMENT OF A WEB SYSTEM FOR APPOINTMENT SCHEDULING AND TIME MANAGEMENT IN BARBERSHOPS

**[AUTORIA, FILIAÇÃO E ORCID — PENDENTE DE CONFIRMAÇÃO]**

### Resumo

Pequenas barbearias precisam conciliar a execução dos serviços com a organização da própria agenda. Quando os horários são consultados e registrados por mensagens, anotações ou comunicação direta, o profissional pode interromper o atendimento para responder clientes e ainda enfrentar dificuldade para verificar se determinado período comporta o serviço solicitado. Este trabalho apresenta o desenvolvimento de um sistema web para uma única barbearia, com foco na organização de profissionais, serviços, jornadas e agendamentos. O objetivo foi construir uma solução responsiva que permitisse ao cliente consultar opções de atendimento e concluir uma reserva apenas em horários compatíveis, ao mesmo tempo em que oferecesse instrumentos administrativos para configurar a agenda. O projeto foi conduzido de forma incremental e teve o escopo refinado durante seu desenvolvimento: recursos inicialmente previstos, como pagamentos, produtos e relatórios avançados, foram retirados para priorizar o núcleo de agendamento. A solução divide a jornada dos profissionais em intervalos de trinta minutos e considera a duração de cada serviço, períodos ocupados e alterações de status para apresentar horários válidos. Foram implementados cadastro, autenticação, controle de acesso, gerenciamento de profissionais e serviços, configuração de jornadas, agendamento em etapas, cancelamento, remarcação, histórico e painel administrativo. Testes automatizados verificaram regras de disponibilidade, conflitos, permissões e alterações da agenda. Conclui-se que o sistema atende ao objetivo de organizar reservas e reduzir inconsistências no fluxo de horários, embora permaneçam limitações relativas à cobertura de testes, à validação de integrações externas e à avaliação formal com usuários.

**Palavras-chave:** Agendamento. Barbearias. Sistemas de informação. Gestão de horários. Desenvolvimento web.

### Abstract

Small barbershops must reconcile service delivery with schedule management. When appointments are handled through messages, notes, or direct communication, professionals may interrupt customer service to answer requests and still face difficulties in determining whether a time period accommodates the requested service. This paper presents the development of a web system for a single barbershop, focused on professionals, services, work schedules, and appointments. The project was developed incrementally and its scope was refined to prioritize the scheduling core. The system divides work schedules into thirty-minute intervals and considers service duration, occupied periods, and appointment status to present valid time slots. It includes authentication, access control, management features, appointment review, cancellation, rescheduling, history, and an administrative panel. Automated tests verified availability, conflict, permission, and schedule-change rules. The system meets the proposed objective while retaining explicit limitations concerning coverage, external integrations, and formal user evaluation.

**Keywords:** Scheduling. Barbershops. Information systems. Time management. Web development.

## 1 INTRODUÇÃO

Em estabelecimentos de serviços pessoais, a organização do tempo de atendimento é parte do próprio trabalho. Na barbearia, o mesmo profissional pode precisar cortar o cabelo, responder mensagens, consultar a agenda e confirmar a disponibilidade de um novo horário. Quando essas informações ficam distribuídas entre conversas, anotações e memória, torna-se mais difícil recuperar o que já foi marcado e compreender os períodos efetivamente livres.

O problema não se resume a identificar se existe um atendimento em determinado horário. Serviços possuem durações distintas. Um corte simples pode ocupar um período menor que um atendimento combinado; assim, um intervalo aparentemente vazio pode não ser suficiente para o serviço escolhido. Também é necessário considerar a jornada de cada profissional e impedir que duas reservas utilizem o mesmo período.

O presente trabalho teve origem no Projeto Integrador de 2025. O planejamento inicial incluía pagamentos, produtos, assinaturas, fidelidade, relatórios e notificações. Durante o TCC, verificou-se que esse conjunto superava o necessário para uma solução clara e confiável. O escopo foi então delimitado para uma única barbearia e passou a priorizar profissionais, serviços, jornadas e prevenção de conflitos. Essa decisão não representa abandono do projeto, mas refinamento para desenvolver e explicar adequadamente sua funcionalidade central.

A questão de pesquisa é: como desenvolver um sistema web simples e responsivo capaz de organizar os agendamentos de uma barbearia, considerando a jornada dos profissionais, a duração dos serviços e a prevenção de conflitos? O objetivo geral foi desenvolver essa solução. Como objetivos específicos, buscou-se modelar os dados principais, permitir o gerenciamento administrativo, disponibilizar o agendamento ao cliente, calcular horários compatíveis, controlar acessos e validar regras críticas.

## 2 DESENVOLVIMENTO

### 2.1 Fundamentação teórica

#### 2.1.1 Sistemas de informação aplicados a pequenos estabelecimentos

Pequenas empresas possuem características próprias de gestão e, em muitos casos, lidam com informações de maneira pouco formalizada. Moraes e Escrivão Filho (2006) destacam que a gestão da informação envolve identificar necessidades, obter, processar, distribuir e utilizar dados; os autores apontam dificuldades dessas organizações em tratar a informação como recurso para decisão. Para um estabelecimento de serviços, a agenda é precisamente uma informação operacional: ela orienta quem atende, quando atende e qual serviço será realizado.

Moraes, Terence e Escrivão Filho (2004) discutem que a tecnologia da informação precisa ser adequada às especificidades das pequenas empresas. Essa perspectiva orientou a escolha por uma solução limitada a uma barbearia, sem mecanismos empresariais desnecessários. O propósito não é prometer ganhos financeiros não medidos, mas centralizar dados necessários ao atendimento e tornar a consulta de horários mais consistente.

#### 2.1.2 Agendamento, disponibilidade e organização de serviços

Uma agenda de serviços precisa relacionar recursos, duração e períodos disponíveis. No sistema proposto, o recurso principal é o profissional. A disponibilidade não é tratada como uma lista fixa de horários: ela depende da jornada previamente definida, do serviço selecionado e dos atendimentos já existentes. Dessa forma, o cliente não recebe apenas uma confirmação posterior; visualiza opções que já passaram por uma verificação inicial de compatibilidade.

#### 2.1.3 Desenvolvimento web, dados e acessibilidade

A solução foi organizada como aplicação web com interface, operações de servidor, regras de negócio e banco relacional. Essa separação facilita a manutenção porque a tela não decide sozinha se uma reserva é válida. A interface foi construída com componentes React; TypeScript auxiliou a consistência de dados; a API organizou as operações; e o banco relacional preservou relações entre usuários, profissionais, serviços e reservas. O Prisma foi utilizado para manter o modelo de dados e seu histórico de alterações versionados (PRISMA, 2026a; PRISMA, 2026b).

Usabilidade e acessibilidade também foram consideradas na interface por meio de navegação por teclado, atalho para conteúdo principal, mensagens de retorno e recursos de apoio. A WCAG 2.2 orienta acessibilidade para diferentes necessidades e ressalta que a avaliação deve combinar recursos automatizados e análise humana (W3C, 2024). Por isso, o trabalho descreve medidas implementadas, mas não declara conformidade completa.

### 2.2 Materiais e métodos

O trabalho consistiu em desenvolvimento tecnológico aplicado, conduzido de forma incremental. Após a definição inicial do problema, foram levantados requisitos de cadastro, jornada, reserva, cancelamento, remarcação e administração. A modelagem reuniu as entidades necessárias para representar usuários, profissionais, serviços, disponibilidade, agendamentos, histórico e configurações. Em seguida, foram construídas telas, operações administrativas e regras de validação.

As tecnologias foram escolhidas como meios para a solução: React e Vite construíram a interface; Express organizou as operações de servidor; TypeScript reduziu incompatibilidades entre dados; PostgreSQL armazenou informações relacionadas; Prisma intermediou aplicação e banco; JWT identificou sessões autenticadas; e Vitest executou testes automatizados. A escolha não teve como finalidade demonstrar uma arquitetura complexa, mas manter responsabilidades compreensíveis para um sistema de escopo limitado.

### 2.3 Desenvolvimento do sistema

#### 2.3.1 Visão geral e usuários

O sistema possui fluxo público de consulta e agendamento, área do cliente e área administrativa. Clientes podem criar e acessar sua conta, realizar reservas, consultar seus agendamentos, cancelar ou remarcar dentro das regras estabelecidas. Administradores gerenciam profissionais, serviços, jornadas, usuários, agenda e regras de prazo. A separação de permissões impede que um cliente execute funções administrativas ou visualize dados de outros clientes.

[FIGURA PENDENTE — Figura 1: visão geral da solução, mostrando cliente, área administrativa, servidor e banco de dados.]

#### 2.3.2 Fluxo de agendamento

O agendamento ocorre em etapas. Inicialmente, o cliente seleciona um profissional ou informa não ter preferência. Em seguida, escolhe o serviço e uma data. Somente então a aplicação apresenta horários compatíveis. Depois de escolher um horário, o usuário visualiza uma revisão com profissional, serviço, data, duração e valor; a confirmação exige aceite explícito e autenticação quando necessária.

Antes da gravação, a disponibilidade é verificada novamente. Essa segunda conferência é importante porque outro cliente pode reservar o mesmo período entre a consulta e a confirmação. Além disso, o banco mantém uma restrição para impedir que duas reservas ativas ocupem simultaneamente o mesmo horário. Se isso ocorrer, a segunda solicitação é recusada e o cliente deve escolher outra opção.

[FIGURA PENDENTE — Figura 2: fluxo do agendamento.] [FIGURA PENDENTE — Figura 3: seleção de profissional.] [FIGURA PENDENTE — Figura 4: calendário e horários disponíveis.] [FIGURA PENDENTE — Figura 5: revisão e confirmação.]

#### 2.3.3 Jornada e cálculo dos horários

Cada profissional possui uma jornada semanal configurada em intervalos de trinta minutos. Ao escolher um serviço, o sistema determina quantos intervalos consecutivos são necessários. Para um serviço de 60 minutos, por exemplo, somente são oferecidos horários que possuam dois intervalos livres em sequência. Se houver um atendimento ocupando parte do período ou se a jornada terminar antes da duração necessária, o horário não é apresentado.

Essa estratégia também evita horários quebrados. Não basta que o início esteja livre: é preciso que todo o tempo do serviço esteja disponível. Agendamentos cancelados deixam de bloquear a agenda, permitindo que o período seja utilizado novamente. A remarcação reaproveita o mesmo cálculo e preserva o histórico das alterações.

#### 2.3.4 Área administrativa e banco de dados

A área administrativa reúne o cadastro de serviços, profissionais e usuários, a configuração da jornada, a agenda e os estados dos atendimentos. A agenda permite acompanhar reservas pendentes, confirmadas, concluídas, canceladas ou atrasadas. O banco registra a relação entre cliente, profissional e serviço; também mantém disponibilidade semanal, histórico de alterações e registros de notificações.

[FIGURA PENDENTE — Figura 6: painel administrativo.] [FIGURA PENDENTE — Figura 7: configuração da jornada.] [FIGURA PENDENTE — Figura 8: agenda administrativa.] [FIGURA PENDENTE — Figura 9: modelo relacional atualizado.]

Notificações por WhatsApp e login Google foram estruturados, mas dependem de configuração externa e não foram validados como integração de produção. Portanto, são tratados como recursos parciais.

### 2.4 Resultados e discussão

O resultado principal é um fluxo em que o cliente consegue iniciar uma reserva, consultar opções compatíveis, revisar suas escolhas e confirmar o atendimento. O sistema também permite ao administrador preparar a agenda antes da reserva, definindo quais profissionais estão ativos, quais serviços são oferecidos e em quais períodos cada profissional atende. Essa organização responde ao problema delimitado porque transforma a consulta de horário em uma verificação baseada em jornada, duração e ocupação.

Os testes automatizados verificaram criação de reservas, rejeição de horários indisponíveis, duração dos serviços, seleção sem preferência, permissões, cancelamento, remarcação e histórico. Na última execução, 129 testes unitários foram aprovados. Esses testes servem como evidência das regras implementadas, mas não substituem a observação de uso em situação real.

O refinamento de escopo foi decisivo para o resultado. Recursos como pagamentos, estoque, fidelidade e relatórios avançados foram preservados apenas como possibilidades futuras, enquanto o desenvolvimento concentrou esforço na confiabilidade da agenda. Como limitações, a cobertura automatizada permaneceu abaixo da meta de 80%; os testes de integração com PostgreSQL não foram concluídos na última execução por indisponibilidade local do Docker; não houve avaliação formal com usuários; e as integrações Google e WhatsApp dependem de configuração externa.

## 3 CONSIDERAÇÕES FINAIS

O sistema desenvolvido demonstra uma forma de organizar agendamentos para uma única barbearia, considerando que serviços diferentes exigem tempos diferentes e que o profissional precisa ter jornada disponível para atendê-los. A questão de pesquisa foi respondida por meio de um fluxo que apresenta horários compatíveis, exige revisão antes da confirmação e verifica novamente a reserva antes de armazená-la.

Foram alcançados os objetivos ligados ao núcleo de agendamento, à administração e ao controle de acesso. A principal contribuição do trabalho está no refinamento consciente do escopo e na transformação de regras de agenda em comportamento verificável pela aplicação. Como continuidade, recomendam-se ampliar os testes, executar a integração completa em banco isolado, avaliar acessibilidade e experiência com usuários, validar integrações externas e, somente então, avaliar recursos adicionais.

## AGRADECIMENTOS
[PENDENTE DE CONFIRMAÇÃO PELO AUTOR]

## FINANCIAMENTO
[PENDENTE DE CONFIRMAÇÃO PELO AUTOR]

## CONFLITO DE INTERESSES
[PENDENTE DE CONFIRMAÇÃO PELO AUTOR]

## CONTRIBUIÇÕES DOS AUTORES
[PENDENTE DE CONFIRMAÇÃO PELO AUTOR]

## REFERÊNCIAS

MORAES, Giseli Diniz de Almeida; ESCRIVÃO FILHO, Edmundo. A gestão da informação diante das especificidades das pequenas empresas. **Ciência da Informação**, v. 35, n. 3, p. 124-132, 2006. DOI: https://doi.org/10.1590/S0100-19652006000300012.

MORAES, Giseli Diniz de Almeida; TERENCE, Ana Cláudia Fernandes; ESCRIVÃO FILHO, Edmundo. A tecnologia da informação como suporte à gestão estratégica da informação na pequena empresa. **Journal of Information Systems and Technology Management**, v. 1, n. 1, p. 27-43, 2004. DOI: https://doi.org/10.4301/S1807-17752004000100003.

PRISMA. **Prisma ORM**. Disponível em: <https://www.prisma.io/docs/orm>. Acesso em: 2 ago. 2026a.

PRISMA. **Migration histories**. Disponível em: <https://www.prisma.io/docs/orm/prisma-migrate/understanding-prisma-migrate/migration-histories>. Acesso em: 2 ago. 2026b.

WORLD WIDE WEB CONSORTIUM. **Web Content Accessibility Guidelines (WCAG) 2.2**. 2024. Disponível em: <https://www.w3.org/TR/WCAG22/>. Acesso em: 2 ago. 2026.
