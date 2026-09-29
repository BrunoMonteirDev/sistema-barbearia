# Roteiro para orientação de TCC

## 1. Abertura (30 segundos)

"Professor, a versão atual do meu TCC descreve o desenvolvimento de um sistema web de agendamento para uma única barbearia. O foco do trabalho foi garantir que o cliente veja apenas horários compatíveis com a duração do serviço, a jornada do profissional e os agendamentos já registrados. Hoje vou apresentar o que foi concluído, as limitações que permanecem e o planejamento para finalizar a validação e a documentação."

## 2. Versão atual entregue

- Artigo atualizado em `artigo/artigo-tcc.md`, com introdução, fundamentação, método, desenvolvimento, resultados, considerações finais e referências.
- Sistema em execução local, com interface React/Vite, API Express, banco PostgreSQL e Prisma.
- Modelo de dados, decisões de arquitetura, regras de negócio e guia do código documentados na pasta `docs/`.

## 3. Partes concluídas

### Sistema

- Cadastro e autenticação de usuários, com perfis de cliente e administrador.
- Cadastro e gerenciamento de profissionais, serviços e suas disponibilidades semanais.
- Agendamento em etapas: profissional, serviço, data, horário, revisão e confirmação.
- Cálculo de disponibilidade considerando duração do serviço, jornada do profissional e conflitos de agenda.
- Cancelamento, remarcação, status e histórico de alterações.
- Painel administrativo e agenda diária/semanal.
- Regras de autorização: clientes acessam apenas seus dados; ações administrativas exigem perfil autorizado.
- Recursos iniciais de acessibilidade: navegação por teclado, foco visível, atalho ao conteúdo, contraste, tamanho de texto, redução de animações e modal acessível.
- Estrutura de notificações por WhatsApp desacoplada do agendamento, sem impedir a reserva caso o serviço externo falhe.

### TCC e qualidade

- Problema, objetivo e escopo delimitados: uma única barbearia e o núcleo de agendamento.
- Arquitetura, modelo relacional e fluxo de agendamento representados por diagramas.
- Testes automatizados de interface e servidor para autenticação, permissões, disponibilidade, conflitos, cancelamento, remarcação, histórico, serviços, profissionais e regras administrativas.
- Último relatório registrado: 129 testes unitários aprovados (55 no cliente e 74 no servidor).

## 4. Demonstração sugerida (3 a 5 minutos)

1. Abrir a página inicial e explicar o problema: evitar agendamentos por mensagens e conflitos de horários.
2. Entrar no painel como administrador e mostrar profissionais, serviços e disponibilidade semanal.
3. Demonstrar a criação de um agendamento: escolher serviço, data e horário; destacar a revisão antes da confirmação.
4. Mostrar a agenda administrativa e uma ação de alteração, cancelamento ou remarcação.
5. Explicar que a regra central é validada no servidor, não apenas na tela: o sistema impede horários fora da jornada, incompatíveis com a duração ou já ocupados.

## 5. O que ainda precisa ser desenvolvido ou concluído

- Produzir e inserir no artigo as capturas de tela sem dados pessoais: página inicial, seleção de profissional e serviço, jornada, calendário/horários, revisão, área do cliente, painel e agenda administrativa.
- Executar e registrar a validação manual em navegador e dispositivos: fluxo de agendamento, agenda administrativa, responsividade, teclado, leitor de tela e Lighthouse.
- Executar os testes de integração com banco PostgreSQL exclusivo de testes; essa etapa depende de ambiente Docker disponível.
- Ampliar a cobertura automatizada, que ainda está abaixo da meta de 80% definida para o projeto.
- Validar em ambiente controlado o login Google e a integração Evolution/WhatsApp, sem expor credenciais, QR Code ou dados pessoais.
- Completar os dados editoriais do artigo: autoria, filiação, ORCID, dados do orientador, agradecimentos, financiamento, conflito de interesses e contribuições.
- Revisar referências metodológicas e, quando aplicável, textos de privacidade/LGPD com orientação adequada.

## 6. Dificuldades e como estou tratando

- **Integrações externas:** Google e WhatsApp dependem de credenciais e ambiente controlado; por isso foram implementadas de forma desacoplada e ainda precisam de validação real.
- **Testes de integração:** exigem um banco isolado em Docker para não afetar os dados de desenvolvimento; a estrutura está preparada, mas falta executar o ambiente completo.
- **Validação de acessibilidade:** testes automatizados não substituem avaliação humana. O sistema recebeu recursos de apoio, mas a comprovação final requer navegação manual e registros.
- **Escopo:** o projeto inicial era maior. A decisão foi limitar pagamentos, produtos, assinaturas e relatórios avançados para entregar e explicar com qualidade o núcleo de agendamento.

## 7. Planejamento das próximas etapas

| Etapa | Entrega | Evidência |
| --- | --- | --- |
| 1 | Validação manual dos fluxos principais e coleta de capturas | Checklist preenchido e figuras inseridas no artigo |
| 2 | Execução dos testes de integração em banco isolado | Resultado do comando e atualização do relatório de testes |
| 3 | Ampliação dos testes dos fluxos mais críticos | Nova medição de cobertura e testes de regressão |
| 4 | Validação controlada de Google e WhatsApp | Registro sem dados sensíveis e atualização das limitações |
| 5 | Revisão final do artigo | Dados editoriais completos, referências revisadas e figuras numeradas |

## 8. Perguntas objetivas para o orientador

1. A delimitação do escopo para o núcleo de agendamento está adequada ao TCC?
2. O nível de detalhamento de arquitetura, testes e limitações está suficiente para a versão final?
3. Quais validações devem ter prioridade: testes de integração, acessibilidade ou avaliação com usuários?
4. Há alguma exigência específica de formato para as figuras, referências e elementos editoriais antes da submissão?

## 9. Encerramento (20 segundos)

"O núcleo funcional do sistema e a estrutura principal do artigo estão concluídos. Minha prioridade agora é transformar as funcionalidades já implementadas em evidências de avaliação: validações manuais, testes de integração, capturas e revisão editorial. Gostaria de confirmar com o senhor a prioridade dessas etapas para orientar a versão final."
