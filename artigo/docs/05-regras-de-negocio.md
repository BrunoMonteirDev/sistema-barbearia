# 💈 05 - Regras de Negócio

# Barbearia Web

## 1. Objetivo e vigência

Este é o catálogo das regras funcionais em vigor no sistema. Ele descreve o
comportamento implementado na API e na interface; prevalece sobre os documentos
de modelagem inicial quando houver divergência.

As regras configuráveis ficam em **Painel administrativo → Regras de negócio**.
Os valores atuais podem variar por instalação; os valores padrão indicados abaixo
correspondem ao sistema sem configuração prévia.

## 2. Usuários, autenticação e acesso

### RN001 — Cadastro e identificação

- Um e-mail pertence a apenas um usuário.
- O cadastro local exige nome, e-mail e senha.
- O login local só é aceito para conta ativa com senha cadastrada.
- O login gera uma sessão JWT válida por oito horas.
- Contas criadas pelo Google precisam concluir o cadastro antes de criar um
  agendamento; nessa etapa, nome e telefone brasileiro com DDD são obrigatórios.

### RN002 — Senhas

- Senhas locais são armazenadas somente como hash bcrypt; não há
  descriptografia ou recuperação da senha original.
- Uma nova senha deve ter ao menos 10 caracteres, letras maiúsculas e
  minúsculas, número e caractere especial (`! @ # $ % * ? _ -`).
- Espaços, três caracteres iguais em sequência e sequências numéricas como
  `123` ou `321` não são aceitos.

### RN003 — Perfis e permissões

| Perfil | Pode acessar |
| --- | --- |
| Cliente | O próprio perfil, seus agendamentos, cancelamento e remarcação dentro dos prazos. |
| Administrador | Todos os agendamentos, cadastros, jornada, regras e configurações. |
| Funcionário | Recursos de equipe autorizados, como o envio manual de notificações. |

O cliente não pode consultar, alterar, cancelar ou ver o histórico de um
agendamento de outra pessoa. O administrador pode criar uma reserva em nome de
um cliente ativo.

### RN004 — Desativação de conta

- A exclusão de conta e a remoção administrativa são lógicas: a conta fica
  inativa, sem apagar seu registro.
- Usuários inativos não conseguem iniciar sessão ou criar agendamentos.

## 3. Serviços e profissionais

### RN005 — Serviços ativos

- Só serviços ativos são mostrados ao cliente e aceitos em novos agendamentos.
- Um serviço possui duração, preço e status.
- A desativação preserva agendamentos antigos, mas impede novos usos.

### RN006 — Profissionais ativos

- Só profissionais ativos aparecem para novos agendamentos.
- O cadastro administrativo de profissional exige nome, e-mail válido e
  telefone brasileiro com DDD.
- A exclusão é lógica: o profissional fica inativo e seu histórico é mantido.

### RN007 — Jornada semanal

- Cada profissional possui blocos de disponibilidade por dia da semana.
- Cada bloco tem 30 minutos e começa em `HH:00` ou `HH:30`.
- A jornada é configurada pelo administrador; sem blocos para aquele dia, não
  há horários disponíveis para o profissional.

## 4. Disponibilidade e novos agendamentos

### RN008 — Composição do horário disponível

Um horário só é oferecido quando todas as condições abaixo são verdadeiras:

1. a data é válida e o início está em um bloco de 30 minutos;
2. o profissional e o serviço estão ativos;
3. há blocos consecutivos na jornada para acomodar toda a duração do serviço;
4. não existe sobreposição com agendamento não cancelado do profissional;
5. o horário ainda não passou;

A duração é arredondada para cima em blocos de 30 minutos. Por exemplo, um
serviço de 45 minutos ocupa dois blocos (60 minutos) para a agenda.

### RN009 — Aviso de proximidade para novos agendamentos

- O valor padrão é **30 minutos** e é configurável pelo administrador em
  minutos inteiros não negativos.
- Se o início do atendimento estiver dentro desse intervalo, o horário continua
  disponível, mas a interface mostra um aviso para o cliente confirmar que
  conseguirá chegar a tempo.
- Para um horário próximo no mesmo dia, o cliente precisa marcar uma confirmação
  específica antes de avançar para a revisão da reserva.
- Esse aviso não impede criação, remarcação ou edição administrativa.

Exemplo com aviso de 30 minutos: às 16:20, 16:30 pode ser escolhido, mas mostra
um aviso; 17:00 não mostra esse aviso. Em qualquer configuração, um horário que
acabou de iniciar ou já passou não pode ser escolhido nem confirmado.

### RN010 — Conflitos e concorrência

- Agendamentos em qualquer status diferente de `CANCELADO` bloqueiam o período
  correspondente à duração do serviço.
- Dois atendimentos que se sobrepõem para o mesmo profissional não são
  permitidos, mesmo que comecem em horários diferentes.
- A disponibilidade é calculada novamente dentro de uma transação protegida
  por bloqueio de agenda. Assim, duas confirmações simultâneas não ocupam o
  mesmo horário.

### RN011 — Profissional sem preferência

Quando o cliente escolhe “sem preferência”, o sistema procura, em ordem
alfabética, o primeiro profissional ativo que possa atender o serviço naquele
horário. Se nenhum puder atender, a reserva é recusada.

### RN012 — Confirmação e possível repetição

- Antes de gravar, a reserva exige profissional (ou “sem preferência”),
  serviço, data e horário válidos.
- A interface exige revisão e aceite explícito dos dados antes da confirmação.
- Se o cliente já tiver algum agendamento ativo (`PENDENTE`, `CONFIRMADO` ou
  `ATRASADO`) na mesma data, o sistema alerta sobre possível repetição.
- Para prosseguir, o cliente precisa confirmar com token temporário vinculado
  aos dados da tentativa; o token vale 60 segundos.

### RN013 — Reserva cancelada

Um agendamento `CANCELADO` não bloqueia a agenda. Seu intervalo volta a poder
ser oferecido, desde que todas as outras regras sejam atendidas.

## 5. Alterações, cancelamento e histórico

### RN014 — Cancelamento pelo cliente

- O cliente só cancela o próprio agendamento.
- Deve respeitar a antecedência de cancelamento configurada, em horas inteiras.
- O padrão é 24 horas; o intervalo permitido é de 0 a 720 horas.
- Administradores podem cancelar qualquer agendamento sem essa restrição.

### RN015 — Remarcação

- O cliente só remarca o próprio agendamento e deve respeitar a antecedência
  de remarcação configurada (padrão: 24 horas; de 0 a 720 horas).
- Administradores podem remarcar qualquer agendamento sem essa restrição sobre
  o atendimento original.
- O novo horário, para qualquer perfil, precisa respeitar data futura, jornada,
  duração e ausência de conflito. A proximidade do horário apenas gera aviso.

### RN016 — Edição administrativa

O administrador pode alterar dados, horário e status. Ao modificar data,
horário, profissional ou serviço, a nova reserva passa novamente pelas regras
de disponibilidade; a proximidade do horário apenas gera aviso.

### RN017 — Histórico

Cancelamentos, remarcações, alterações administrativas e mudanças de status
geram histórico com autor, data, dados anteriores e novos dados. O cliente vê
somente o histórico das próprias reservas; o administrador vê todos.

### RN018 — Status do agendamento

Os status aceitos são `PENDENTE`, `CONFIRMADO`, `CONCLUIDO`, `CANCELADO` e
`ATRASADO`.

- Apenas o administrador altera o status diretamente.
- Ao listar agendamentos, o sistema atualiza para `ATRASADO` os registros
  pendentes ou confirmados cujo início ultrapassou a tolerância configurada.
- A tolerância padrão é 0 minuto, configurável de 0 a 720 minutos.

## 6. Configurações e notificações

### RN019 — Regras configuráveis

| Regra | Unidade | Padrão | Limite |
| --- | --- | ---: | --- |
| Aviso de proximidade para novo agendamento | minutos | 30 | inteiro ≥ 0 |
| Antecedência para cancelamento | horas | 24 | 0 a 720 |
| Antecedência para remarcação | horas | 24 | 0 a 720 |
| Tolerância para atraso | minutos | 0 | 0 a 720 |

Somente administradores podem alterar essas regras.

### RN020 — Notificações por WhatsApp

- A notificação manual é permitida à equipe; notificações automáticas dependem
  de configuração administrativa e da Evolution API.
- O cliente precisa ter telefone cadastrado para receber WhatsApp.
- O sistema registra o resultado como enviada, falha, ignorada ou pendente de
  configuração.
- Há modelos para criação, remarcação, cancelamento, atualização, status e
  lembrete. Eles podem usar cliente, serviço, profissional, data e hora.
- Lembretes automáticos só são enviados quando habilitados e não são repetidos
  para o mesmo agendamento após envio bem-sucedido.

## 7. Referências técnicas

- Cálculo de jornada, duração e conflitos: `server/src/services/horarios.service.ts`.
- Antecedência, atraso e regras configuradas: `server/src/services/regras-agendamento.service.ts`.
- Criação, disponibilidade, cancelamento, remarcação e histórico:
  `server/src/routes/agendamentos.ts`.
- Configuração administrativa: `server/src/routes/configuracoes.ts`.
- Notificações: `server/src/services/notificacao.service.ts`.

Este documento deve ser atualizado junto com qualquer alteração de regra na API.
