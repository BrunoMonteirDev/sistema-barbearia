# Guia de Defesa do TCC — Sistema de Agendamento para Barbearia

> Material interno para preparação da apresentação e arguição. Não faz parte do artigo submetido.

## 1. Mensagem central do trabalho

O trabalho não procura criar uma plataforma completa para todas as barbearias. Ele resolve um problema delimitado: organizar os agendamentos de uma única barbearia considerando quem atende, qual serviço foi escolhido, quanto tempo ele dura e quando o profissional está disponível. A principal ideia a defender é que um horário aparentemente vazio não é necessariamente válido; o sistema precisa verificar se todo o período necessário está livre.

Use esta frase de abertura: “O sistema transforma a consulta informal de horários em uma verificação baseada em jornada, duração do serviço e reservas já existentes.”

## 2. Explicação simples de cada parte do artigo

### Introdução

Explique que pequenas barbearias costumam conciliar atendimento e organização por mensagens, anotações ou memória. Isso pode gerar demora na resposta e conflitos de agenda. O problema escolhido não foi “falta de tecnologia” em geral; foi a dificuldade de saber se um serviço cabe em determinado período.

Se perguntarem por que o projeto foi reduzido, responda: “O Projeto Integrador inicialmente previa pagamentos, produtos, fidelidade e relatórios. No TCC, o escopo foi refinado para concluir e validar o núcleo que resolve a agenda. Foi uma decisão de engenharia, não uma retirada aleatória de funcionalidades.”

### Fundamentação teórica

Moraes e Escrivão Filho ajudam a explicar por que a informação é relevante para pequenas empresas. Creswell sustenta a necessidade de deixar claro como o trabalho foi conduzido. Sommerville apoia a perspectiva de engenharia de software, isto é, requisitos, construção e validação de uma solução. WCAG e eMAG orientam cuidados de acessibilidade; OWASP diferencia autenticação de autorização; ISO 25010 contextualiza qualidade e testes.

Não diga que as referências “provam que a barbearia precisava do sistema”. Elas sustentam conceitos usados para formular e avaliar a solução.

### Materiais e métodos

O método foi desenvolvimento tecnológico aplicado e incremental. Em linguagem simples: o problema foi delimitado, os requisitos foram priorizados, os dados foram modelados, as telas e regras foram implementadas e cenários foram testados. Não houve entrevista, pesquisa de campo ou avaliação formal com usuários; nunca afirme que houve.

### Desenvolvimento do sistema

Esta seção mostra como a solução foi construída: arquitetura, telas, regras de jornada e disponibilidade, confirmação, administração, segurança e banco. O foco não é decorar nomes de arquivos, mas mostrar a responsabilidade de cada parte.

### Resultados e discussão

Os resultados são as funcionalidades obtidas e as regras verificadas. Os 129 testes são evidência, não o resultado principal. A afirmação principal é que o sistema consegue oferecer e confirmar reservas compatíveis com as condições cadastradas. Limitações devem ser apresentadas com tranquilidade: cobertura abaixo de 80%, integração PostgreSQL pendente na última execução, integrações externas parciais e ausência de avaliação formal com usuários.

### Considerações finais

O objetivo foi alcançado dentro do recorte adotado. O aprendizado principal foi que um escopo menor, bem testado e bem documentado, é mais defensável do que um sistema amplo com funcionalidades incompletas.

## 3. Arquitetura: explicação para a banca

O cliente é a interface web feita com React e Vite. Ele apresenta telas, coleta escolhas e mostra mensagens. O servidor, implementado com Express, recebe as solicitações e aplica regras. Os serviços de negócio verificam disponibilidade, duração, permissões e conflitos. Prisma faz a mediação entre a aplicação e PostgreSQL, que armazena os dados relacionados.

Uma resposta curta para “por que separar cliente e servidor?” é: “Para que a validade de um agendamento não dependa somente da tela. Mesmo que alguém tente enviar uma solicitação fora do fluxo visual, o servidor repete as verificações antes de gravar.”

### Justificativas das tecnologias

| Tecnologia | Como explicar |
| --- | --- |
| React e Vite | Construíram uma interface em componentes e com navegação fluida entre as etapas. |
| Express | Organizou as operações do servidor e separou a interface das regras. |
| TypeScript | Ajudou a identificar incompatibilidades no uso de dados durante o desenvolvimento. |
| Prisma | Facilitou a comunicação da aplicação com o modelo de dados e as alterações de esquema. |
| PostgreSQL | Armazena relações entre usuários, profissionais, serviços e reservas. |
| JWT | Identifica a sessão do usuário autenticado. |
| Vitest | Executa verificações automatizadas das regras importantes. |

Evite dizer que uma tecnologia é “a melhor”. Diga que ela foi adequada ao escopo e à separação de responsabilidades proposta.

## 4. Entidades do banco de dados

### Usuário

Representa quem utiliza o sistema. Pode ser cliente ou administrador. O perfil influencia as permissões, mas não substitui as verificações no servidor. Cliente consulta e administra as próprias reservas; administrador gerencia os recursos da barbearia.

### Profissional

Representa o barbeiro que presta o serviço. Tem dados próprios e jornada semanal. Ele não é apenas um texto dentro do agendamento: é uma entidade separada porque sua rotina e disponibilidade precisam ser administradas.

### Serviço

Representa o atendimento oferecido, como corte ou combinação de serviços. Seus atributos mais importantes para o problema são duração e valor. A duração define quanto espaço consecutivo o atendimento precisa ocupar.

### Jornada/disponibilidade

Representa os períodos em que cada profissional pode atender. Ela define a condição geral da agenda, antes de considerar as reservas específicas. Por isso, mudar a jornada não exige modificar os dados do cliente nem recriar um profissional.

### Agendamento

É a entidade central. Une usuário, profissional, serviço, data, horário e situação. Sua existência indica ocupação real de um período. Cancelamento e remarcação alteram o estado ou criam histórico, em vez de apagar a rastreabilidade do atendimento.

### Histórico e notificação

O histórico registra alterações relevantes da reserva. A notificação registra tentativas ou estados de comunicação. Eles complementam o agendamento; não são a fonte principal da reserva.

## 5. Regras de negócio: como explicá-las

RN01 significa que selecionar um horário não cria a reserva automaticamente. O usuário precisa confirmar e estar autenticado. RN02 separa operações administrativas das operações do cliente. RN03 exige que a reserva esteja dentro da jornada do profissional. RN04 exige que o tempo inteiro do serviço esteja disponível. RN05 impede sobreposição em reservas ativas. RN06 faz cancelamentos deixarem de bloquear o horário. RN07 faz remarcações passarem pela mesma validação da criação.

O exemplo mais didático é: “Se um serviço dura sessenta minutos e a agenda trabalha com blocos de trinta minutos, o sistema precisa encontrar dois blocos consecutivos livres. Um único bloco livre não é suficiente.”

Não afirme que o sistema otimiza matematicamente toda a agenda. A afirmação correta é que ele reduz a oferta de opções incompatíveis e impede reservas que ultrapassem os períodos disponíveis.

## 6. Fluxo de agendamento demonstrável

1. O cliente inicia o fluxo.
2. Escolhe um profissional ou a opção sem preferência.
3. Escolhe um serviço.
4. Escolhe uma data.
5. O sistema consulta jornada, duração e reservas ativas.
6. São apresentados horários compatíveis.
7. O cliente escolhe um horário e revisa todos os dados.
8. Ele aceita a revisão e se autentica, se necessário.
9. O servidor confere novamente a disponibilidade.
10. O agendamento é armazenado e o resultado é apresentado.

O passo 9 é essencial. Explique que duas pessoas podem consultar o mesmo horário quase ao mesmo tempo. A conferência no momento de salvar diminui a chance de uma reserva inválida ser confirmada.

### Opção “sem preferência”

Ela não significa “qualquer horário, mesmo ocupado”. Significa que o cliente aceita ser atendido por qualquer profissional ativo que possua um período compatível. A regra de jornada, duração e conflito continua sendo aplicada.

## 7. APIs importantes

Use “API” como o conjunto de operações que a interface pede ao servidor. Não é necessário citar todos os caminhos durante a apresentação, mas conheça os principais.

| Operação | Função no sistema |
| --- | --- |
| `POST /api/auth/login` | Autentica o usuário e inicia a sessão. |
| `POST /api/auth/register` | Cria a conta do cliente. |
| `GET /api/agendamentos/disponibilidade` | Consulta horários compatíveis para a escolha feita. |
| `POST /api/agendamentos` | Cria a reserva depois das validações. |
| `PATCH /api/agendamentos/:id/cancelar` | Cancela uma reserva dentro das regras. |
| `PATCH /api/agendamentos/:id/remarcar` | Solicita nova data/horário e valida novamente a disponibilidade. |
| `GET/PUT /api/profissionais/:id/disponibilidade` | Consulta ou altera a jornada do profissional, com perfil administrativo. |

Se perguntarem o que acontece se a API receber dados inválidos, responda que o servidor valida os dados e as regras antes de gravar. A tela ajuda o usuário, mas o servidor continua sendo responsável pela decisão final.

## 8. Segurança e permissões

Autenticação responde “quem é o usuário?”. Autorização responde “o que ele pode fazer?”. JWT identifica a sessão autenticada. Nas operações de agendamento, o servidor também verifica se o usuário é dono da reserva ou administrador. Isso impede, por exemplo, que um cliente cancele o agendamento de outra pessoa apenas descobrindo um identificador.

O painel administrativo exige perfil adequado. A segurança implementada não torna o sistema “invulnerável”; ela aplica controles proporcionais ao escopo e deve continuar evoluindo com testes, revisão de dependências e configuração correta do ambiente.

## 9. Testes: o que os 129 testes significam

Os 129 testes automatizados aprovados verificam principalmente comportamentos repetíveis: horário ocupado, horário livre, duração incompatível, permissões, cancelamento, remarcação, histórico e seleção sem preferência. Eles ajudam a detectar regressões quando uma parte do sistema é alterada.

Não diga “o sistema está 100% testado”. A cobertura ficou abaixo de 80% e os testes de integração com PostgreSQL não foram concluídos na última execução porque Docker estava indisponível localmente. A resposta madura é: “Os testes fornecem evidência relevante das regras unitárias, mas a validação integrada e a avaliação com usuários continuam como próximos passos.”

## 10. Roteiro de apresentação de 15 a 20 minutos

| Tempo | Conteúdo | Objetivo |
| --- | --- | --- |
| 0–2 min | Contexto e problema | Mostrar por que a agenda é difícil quando serviços têm durações diferentes. |
| 2–4 min | Objetivo e recorte | Explicar uma barbearia e o refinamento do escopo. |
| 4–6 min | Arquitetura | Apresentar cliente, API, regras e banco. |
| 6–10 min | Demonstração do fluxo | Profissional, serviço, data, horário, revisão e confirmação. |
| 10–12 min | Jornada e cálculo | Usar o exemplo de dois blocos de trinta minutos. |
| 12–14 min | Administração e DER | Mostrar cadastros, jornada, agenda e relacionamentos. |
| 14–16 min | Resultados e testes | Mostrar regras atendidas e cenários validados. |
| 16–18 min | Limitações e trabalhos futuros | Demonstrar honestidade e domínio do escopo. |
| 18–20 min | Conclusão | Retomar resposta à pergunta de pesquisa. |

Durante a demonstração, use dados demonstrativos. Prepare previamente uma jornada, um profissional, serviços com durações diferentes e pelo menos um horário ocupado. Assim você mostra tanto um horário permitido quanto uma situação rejeitada.

## 11. Perguntas prováveis da banca e respostas sugeridas

### “Por que não implementou pagamento?”

“Pagamento foi previsto no escopo inicial, mas exigiria regras, integrações e validações próprias. Priorizei o núcleo de agendamento para entregar uma solução coerente, testada e bem documentada. Ele permanece como evolução futura.”

### “O que impede dois clientes de agendarem o mesmo horário?”

“A aplicação verifica a sobreposição antes de confirmar. Também há uma proteção adicional no banco contra reservas ativas com o mesmo profissional, data e horário inicial. A disponibilidade é consultada novamente no momento da criação.”

### “O sistema elimina todos os horários ociosos?”

“Não. Ele não busca otimização global da agenda. O que ele garante dentro do escopo é não oferecer uma opção que não comporte integralmente o serviço escolhido ou que extrapole a jornada e reservas ativas.”

### “Por que usar banco relacional?”

“Porque os dados possuem vínculos claros: um agendamento relaciona usuário, profissional e serviço; cada profissional tem jornada; alterações devem ter histórico. O modelo relacional ajuda a preservar esses vínculos.”

### “Como você validou a acessibilidade?”

“Foram adotadas medidas como navegação por teclado, foco e mensagens de retorno. Não houve auditoria formal completa nem estudo com usuários; por isso o artigo apresenta acessibilidade como medida implementada e limitação a aprofundar.”

### “O WhatsApp está funcionando?”

“A estrutura da integração foi desenvolvida, mas a validação em produção depende de configuração externa e não foi concluída. Por isso o requisito está explicitamente classificado como parcial.”

### “Qual foi sua maior dificuldade?”

“Transformar duração e jornada em disponibilidade real. Percebi que verificar apenas se o horário inicial está vazio é insuficiente; o sistema precisa verificar todo o intervalo do serviço.”

## 12. Críticas possíveis e postura recomendada

Se apontarem a ausência de testes de integração, reconheça e apresente o plano: ativar Docker, subir banco isolado, executar cenários reais de concorrência e registrar o resultado. Se questionarem ausência de usuários, explique que o foco desta etapa foi validação técnica do núcleo e que a avaliação de experiência é trabalho futuro. Se questionarem o recorte para uma única barbearia, explique que ele foi intencional e evita generalizações não verificadas.

Não responda defensivamente. Uma boa estrutura é: reconhecer o limite, explicar o motivo, indicar o impacto e mostrar o próximo passo.

## 13. Checklist para o dia da defesa

- Testar a apresentação e a demonstração em outro computador.
- Levar versão em PDF e cópia local do repositório.
- Preparar credenciais e dados demonstrativos, sem dados reais de clientes.
- Conferir conexão, resolução e navegador; ter capturas como plano alternativo.
- Ensaiar o exemplo de serviço de sessenta minutos em dois blocos de trinta.
- Ensaiar as respostas sobre escopo, testes, WhatsApp, Google e acessibilidade.
- Não prometer recursos que o sistema não implementa.
- Encerrar retomando objetivo, resultado e aprendizado de refinamento do escopo.

## 14. Fechamento sugerido

“O trabalho demonstrou que é possível organizar os agendamentos de uma barbearia por meio de um fluxo que considera jornada, duração e conflitos. Mais do que adicionar telas, o principal desafio foi transformar essas regras em comportamento verificável. A experiência também reforçou que delimitar bem o problema é essencial para entregar uma solução consistente e evolutiva.”

## 15. Roteiro de demonstração ao vivo

### Antes de abrir o sistema

Explique em uma frase o cenário preparado: há dois profissionais ativos, serviços com durações diferentes, jornada configurada e pelo menos uma reserva demonstrativa. Não comece clicando sem contexto; diga o que a banca verá e qual regra será demonstrada.

### Demonstração principal

1. Abra a página inicial e mostre o acesso ao agendamento.
2. Selecione um profissional e explique que essa decisão determina qual jornada será consultada.
3. Selecione um serviço de sessenta minutos e explique o exemplo dos dois blocos consecutivos.
4. Escolha a data e mostre que os horários aparecem apenas depois dela.
5. Mostre um período indisponível ou ausente e explique que não basta o início estar vazio.
6. Escolha um horário válido, avance para a revisão e leia os dados essenciais.
7. Mostre que a reserva somente é criada após aceite e autenticação.
8. Abra a área do cliente, localize a reserva e mostre a possibilidade de cancelar ou remarcar.
9. Abra o painel administrativo, a jornada e a agenda para demonstrar a outra perspectiva do processo.

Caso algo falhe ao vivo, não improvise uma explicação técnica incerta. Use as capturas preparadas, explique que a demonstração visual não altera a evidência registrada no artigo e prossiga para a regra de negócio correspondente.

## 16. Leitura orientada das figuras do artigo

**Figura 1 — problema, objetivo, sistema e resultado.** Use-a para abrir a apresentação. Ela mostra o recorte e evita que a banca imagine uma plataforma genérica ou um sistema de pagamentos.

**Figura 2 — arquitetura.** Explique o caminho da solicitação: interface, API, regras, persistência. A frase-chave é: “A validação não depende somente da tela.”

**Figuras 3 a 5 — páginas inicial, profissional e serviço.** Mostram o começo da experiência do cliente e como escolhas simples alimentam o cálculo posterior.

**Figura 6 — fluxo.** Mostre a revisão e a nova conferência antes de salvar. Esta é a melhor figura para responder questões sobre concorrência entre clientes.

**Figuras 7 e 8 — jornada, data e horários.** Associe-as ao exemplo de trinta e sessenta minutos. A jornada é configurada pelo administrador; o calendário usa essa informação para limitar opções.

**Figuras 9 e 10 — revisão e área do cliente.** Explique que revisão impede a criação automática e que o histórico permite acompanhar mudanças sem expor reservas de terceiros.

**Figuras 11 e 12 — administração e agenda.** Mostram que a agenda pública depende de cadastros e configurações internas, não de uma lista fixa de horários.

**Figura 13 — DER.** Leia na ordem Usuário, Profissional, Serviço, Jornada, Agendamento, Histórico e Notificação. Não tente explicar todos os atributos; explique por que os relacionamentos existem.

## 17. Glossário para respostas objetivas

| Termo | Explicação curta |
| --- | --- |
| API | Meio pelo qual a interface solicita operações ao servidor. |
| Autenticação | Verificação de quem é o usuário. |
| Autorização | Verificação do que aquele usuário pode fazer. |
| JWT | Token usado para identificar uma sessão autenticada. |
| ORM | Camada que ajuda a aplicação a trabalhar com os dados do banco. |
| Banco relacional | Banco que organiza dados ligados entre si por relações. |
| Migração | Registro versionado de alteração na estrutura do banco. |
| Teste unitário | Teste de um comportamento específico de uma unidade do sistema. |
| Teste de integração | Teste que verifica partes trabalhando juntas, como servidor e banco. |
| Cobertura | Indicador de quanto do código é exercitado pelos testes; não garante sozinho qualidade. |
| Responsividade | Adaptação visual da interface a tamanhos de tela diferentes. |
| Acessibilidade | Condições para que mais pessoas possam perceber e operar a interface. |

## 18. Perguntas rápidas adicionais

**“Por que os horários são blocos de trinta minutos?”** É uma unidade de organização simples que permite representar serviços de durações diferentes por blocos consecutivos.

**“O valor do serviço pode mudar?”** O serviço possui valor cadastrado. O agendamento registra as informações necessárias do atendimento, permitindo preservar o contexto da reserva.

**“O cliente consegue ver a agenda inteira?”** Não. O cliente consulta opções compatíveis e seus próprios agendamentos; a agenda completa é administrativa.

**“O administrador pode alterar o status?”** Sim, a administração acompanha e altera estados dentro das operações próprias da agenda.

**“O que ocorre ao cancelar?”** O agendamento deixa de ser ativo para a consulta de disponibilidade e permanece rastreável por seu estado e histórico.

**“Existe notificação?”** Há estrutura de notificações e integração parcial com WhatsApp, mas validação completa depende de configuração externa.

**“Por que não usar uma planilha?”** Uma planilha pode registrar horários, mas o sistema automatiza a relação entre jornada, duração, conflito, permissões e histórico dentro do fluxo de reserva.

**“Qual requisito foi mais crítico?”** A disponibilidade por duração. Ela exige analisar todo o intervalo do serviço, não somente o momento inicial.

**“O banco impede qualquer sobreposição sozinho?”** A prevenção completa depende da regra da aplicação, que compara intervalos. O banco adiciona proteção contra reservas ativas com mesmo profissional, data e horário inicial.

**“O sistema está pronto para produção?”** O núcleo está implementado e testado no recorte apresentado, mas produção exige completar validações de integração, acessibilidade, ambiente e integrações externas.

## 19. Exercício de domínio antes da banca

Explique em voz alta, sem consultar o artigo, cada uma das perguntas abaixo: qual problema foi resolvido; por que o escopo diminuiu; como um serviço de sessenta minutos é validado; qual a diferença entre autenticação e autorização; o que faz o banco; o que fazem os testes; quais limitações permanecem.

Se uma explicação ultrapassar dois minutos, simplifique-a. A banca não precisa ouvir todo o código; precisa perceber que você entende a decisão, a regra, a evidência e a limitação correspondente.

## 20. Sequência final de preparação

1. Substituir as figuras pendentes por capturas sem dados pessoais.
2. Ler o artigo uma vez em voz alta e ajustar somente clareza e ortografia.
3. Conferir citações e referências contra a auditoria de fontes.
4. Preencher os DOCX apenas depois de aprovar o Markdown.
5. Ensaiar a apresentação cronometrada três vezes.
6. Pedir a alguém que faça as perguntas do capítulo 11.
7. Preparar PDF e capturas como contingência para a demonstração.

Depois dessa etapa, evite criar novas funcionalidades para “melhorar” a apresentação. A defesa deve valorizar o núcleo já concluído, suas evidências e a clareza com que você explica as escolhas feitas.
