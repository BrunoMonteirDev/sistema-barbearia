# Checklist da refatoração

Este arquivo deve ser atualizado a cada etapa. Marcar um item somente após validação. Itens de mudança funcional descobertos devem virar pendência separada, não ser corrigidos silenciosamente durante a refatoração.

## Preparação e baseline

- [x] mapear estrutura atual
- [x] mapear endpoints atuais
- [x] mapear acesso ao Prisma
- [x] inventariar Tailwind
- [x] registrar arquivos grandes e responsabilidades misturadas
- [x] registrar possíveis arquivos sem uso
- [ ] separar mudanças preexistentes do worktree
- [ ] definir ambiente reproduzível de validação
- [ ] restaurar/definir estratégia de testes automatizados
- [ ] registrar exemplos de contratos HTTP
- [ ] executar smoke test completo antes da primeira refatoração
- [ ] confirmar porta backend/proxy em ambiente limpo

## Autenticação

- [x] mapear login local
- [x] mapear cadastro
- [x] mapear login Google
- [x] mapear JWT e middlewares
- [ ] criar `AuthController`
- [ ] separar regras em `AuthService`
- [ ] criar/usar `UsuarioRepository`
- [ ] retirar bcrypt/Google dos callbacks de route
- [ ] manter validade e payload do JWT
- [ ] alinhar tipagem dos níveis sem mudar autorização
- [ ] validar login local válido/inválido
- [ ] validar cadastro e e-mail duplicado
- [ ] validar Google novo/existente/inativo
- [ ] validar JWT expirado/inválido
- [ ] validar respostas 401/403
- [ ] remover Tailwind de `LoginPage.tsx`
- [ ] criar `LoginPage.css`
- [ ] atualizar documentação

## Usuários e clientes

- [x] mapear perfil e CRUD administrativo
- [x] identificar desativação lógica
- [ ] criar `UsuarioController`
- [ ] separar `UsuarioService`
- [ ] criar `UsuarioRepository`
- [ ] centralizar mapeamento seguro da resposta
- [ ] validar `/usuarios/me`
- [ ] validar atualização de perfil
- [ ] validar conclusão de cadastro Google
- [ ] validar exclusão/desativação da própria conta
- [ ] validar CRUD administrativo
- [ ] validar histórico preservado após desativação
- [ ] dividir `ClientesPage.tsx` se necessário
- [ ] migrar `ClientesPage.tsx` para CSS
- [ ] migrar área de perfil para CSS
- [ ] atualizar documentação

## Serviços

- [x] mapear CRUD atual
- [x] confirmar que route acessa Prisma diretamente
- [ ] criar `ServicoController`
- [ ] criar `ServicoService`
- [ ] criar `ServicoRepository`
- [ ] mover validação da route
- [ ] preservar listagem somente de ativos
- [ ] preservar desativação no DELETE
- [ ] validar preço/duração/nome/descrição
- [ ] validar autorização administrativa
- [ ] validar serialização de preço
- [ ] migrar `ServicosAdminPage.tsx` para CSS
- [ ] criar `ServicosAdminPage.css`
- [ ] atualizar documentação

## Profissionais

- [x] mapear CRUD público/administrativo
- [x] registrar diferença profissional/funcionário/usuário
- [ ] criar `ProfissionalController`
- [ ] criar `ProfissionalService`
- [ ] criar `ProfissionalRepository`
- [ ] mover normalização e validação da route
- [ ] preservar listagem pública de ativos
- [ ] preservar listagem admin com inativos
- [ ] preservar desativação lógica
- [ ] validar e-mail duplicado
- [ ] validar cadastro/edição/desativação
- [ ] dividir `FuncionariosPage.tsx` por responsabilidade
- [ ] decidir destino dos arquivos antigos em `pages/painel/funcionarios/`
- [ ] migrar tela para CSS
- [ ] atualizar documentação

## Disponibilidade

- [x] mapear leitura e substituição semanal
- [x] mapear blocos de 30 minutos
- [x] mapear cálculo por duração
- [ ] criar `DisponibilidadeController`
- [ ] criar `DisponibilidadeService`
- [ ] criar `DisponibilidadeRepository`
- [ ] retirar transação Prisma da route
- [ ] separar cálculo puro de consulta quando útil
- [ ] preservar dias `0..6`
- [ ] preservar deduplicação
- [ ] validar semana vazia/parcial/completa
- [ ] validar serviço de 30/45/60+ minutos
- [ ] validar sobreposição e cancelados
- [ ] validar cópia de dia e semana na interface
- [ ] migrar grade de horários para CSS
- [ ] atualizar documentação

## Agendamentos — consulta e criação

- [x] mapear listagem
- [x] mapear consulta de disponibilidade
- [x] mapear criação pública e administrativa
- [x] mapear profissional sem preferência
- [x] mapear confirmação de repetição
- [x] mapear advisory lock
- [ ] criar `AgendamentoController`
- [ ] criar `AgendamentoRepository`
- [ ] retirar Prisma da route
- [ ] retirar Prisma de services onde for persistência pura
- [ ] criar erros de domínio estáveis
- [ ] preservar mensagens/status/payloads
- [ ] validar cliente versus admin na listagem
- [ ] validar cadastro incompleto
- [ ] validar horário passado
- [ ] validar intervalos por duração
- [ ] validar duas criações concorrentes
- [ ] validar sem preferência
- [ ] validar repetição ausente/válida/inválida/expirada
- [ ] validar código P2002 e conflito de agenda
- [ ] validar notificação automática sem bloquear resposta
- [ ] atualizar documentação

## Agendamentos — manutenção

- [x] mapear atualização administrativa
- [x] mapear status
- [x] mapear cancelamento
- [x] mapear remarcação
- [x] mapear histórico
- [x] mapear exclusão física administrativa
- [ ] mover autorização por recurso para service/controller adequado
- [ ] mover atualização/histórico restante da route
- [ ] preservar antecedência diferente para admin/cliente
- [ ] preservar lock em remarcação/edição
- [ ] validar cancelamento
- [ ] validar remarcação
- [ ] validar edição administrativa
- [ ] validar status e histórico
- [ ] validar exclusão física/cascata
- [ ] investigar fluxo `ignorarAgendamentoId` sem corrigir junto da extração
- [ ] decidir fonte da verdade de `ATRASADO` em tarefa funcional separada
- [ ] atualizar documentação

## Painel administrativo

- [x] mapear subrotas
- [x] mapear dashboard
- [x] identificar tamanho de `AgendamentosPage.tsx`
- [x] identificar dois caminhos de criação administrativa
- [ ] dividir `AgendamentosPage.tsx`
- [ ] extrair agenda diária
- [ ] extrair agenda semanal
- [ ] extrair formulários/modais com responsabilidade real
- [ ] consolidar fluxo de criação administrativa sem alterar comportamento
- [ ] mover chamadas HTTP para services frontend
- [ ] centralizar apresentação de status
- [ ] validar filtros e visualizações
- [ ] validar todas as ações administrativas
- [ ] validar teclado e foco
- [ ] migrar Dashboard para CSS
- [ ] migrar Agenda para CSS por partes
- [ ] atualizar documentação

## Área do cliente

- [x] mapear conta
- [x] mapear resumo e lista de agendamentos
- [x] mapear histórico/cancelamento/remarcação
- [ ] separar componentes visuais quando necessário
- [ ] mover HTTP para services frontend
- [ ] reduzir duplicação de formatação/status
- [ ] validar retorno login → revisão
- [ ] validar retorno cadastro Google → revisão
- [ ] validar perfil/exclusão
- [ ] validar lista/histórico/cancelamento/remarcação
- [ ] migrar páginas para CSS
- [ ] atualizar documentação

## Notificações

- [x] mapear envio manual
- [x] mapear envio automático
- [x] mapear registro de resultado
- [x] mapear lembretes
- [ ] criar `NotificacaoRepository`
- [ ] retirar Prisma do service
- [ ] separar endpoint manual do controller de agenda se simplificar
- [ ] preservar estados da notificação
- [ ] preservar comportamento fire-and-forget
- [ ] validar sem telefone
- [ ] validar sem configuração Evolution
- [ ] validar sucesso/falha
- [ ] validar templates por tipo
- [ ] validar lembrete e não repetição
- [ ] avaliar múltiplas instâncias em tarefa própria
- [ ] atualizar documentação

## Evolution/WhatsApp

- [x] mapear endpoints
- [x] mapear variáveis de ambiente
- [x] mapear modelos e regras persistidos
- [ ] criar `EvolutionController`
- [ ] separar `EvolutionClient`
- [ ] usar `ConfiguracaoRepository`
- [ ] retirar Prisma e detalhes HTTP do mesmo service
- [ ] validar status sem configuração
- [ ] validar serviço indisponível
- [ ] validar ciclo da instância
- [ ] validar QR/pairing code
- [ ] validar nome de exibição
- [ ] validar modelos de mensagens
- [ ] validar envio automático e regras
- [ ] migrar `EvolutionPage.tsx` para CSS
- [ ] atualizar documentação

## Configurações

- [x] mapear contatos públicos
- [x] mapear regras administrativas
- [x] localizar acessos dispersos a `prisma.configuracao`
- [ ] criar `ConfiguracaoController`
- [ ] criar `ConfiguracaoService`
- [ ] criar `ConfiguracaoRepository`
- [ ] mover rota pública de `app.ts` para controller/route sem mudar URL
- [ ] consolidar obter-ou-criar
- [ ] preservar projeção pública
- [ ] preservar defaults
- [ ] validar banco com/sem configuração
- [ ] validar contatos na Home
- [ ] validar regras na agenda
- [ ] migrar páginas para CSS
- [ ] atualizar documentação

## API e models do frontend

- [x] mapear `client/src/lib/api.ts`
- [ ] criar função HTTP base em `services/http.ts`
- [ ] extrair `auth.service.ts`
- [ ] extrair `usuarios.service.ts`
- [ ] extrair `servicos.service.ts`
- [ ] extrair `profissionais.service.ts`
- [ ] extrair `agendamentos.service.ts`
- [ ] extrair `configuracoes.service.ts`
- [ ] extrair `evolution.service.ts`
- [ ] mover tipos para `models/` por domínio
- [ ] preservar `ApiError` e códigos de repetição
- [ ] preservar token `barbearia.token`
- [ ] remover `lib/api.ts` somente quando não houver consumidores
- [ ] atualizar documentação

## Tailwind para CSS

- [x] inventariar ocorrências e hotspots
- [x] documentar responsividade/estados/condicionais
- [ ] criar baseline visual
- [ ] converter componente piloto
- [ ] converter página piloto
- [ ] converter componentes compartilhados
- [ ] converter área pública
- [ ] converter área do cliente
- [ ] converter painel CRUD
- [ ] converter agenda administrativa por partes
- [ ] substituir `@apply` por CSS comum
- [ ] atualizar alto contraste para classes semânticas
- [ ] verificar `@tailwind`/`@apply` restantes
- [ ] verificar utilitários restantes no TSX
- [ ] validar mobile/desktop/acessibilidade
- [ ] remover Tailwind somente no final
- [ ] revisar PostCSS/Autoprefixer separadamente
- [ ] atualizar documentação

## Acessibilidade

- [x] mapear recursos globais
- [ ] criar baseline de teclado/foco
- [ ] validar skip link
- [ ] validar navegação por setas
- [ ] validar leitura em voz alta
- [ ] validar fonte grande
- [ ] validar redução de animações
- [ ] validar alto contraste durante cada migração CSS
- [ ] validar VLibras
- [ ] garantir que status não dependa só de cor
- [ ] atualizar documentação

## Possível código morto

- [x] registrar candidatos sem importador
- [ ] validar `client/src/components/Header.tsx`
- [ ] validar `client/src/components/Footer.tsx`
- [ ] validar `client/src/pages/NotFoundPage.tsx`
- [ ] validar `FuncionariosTable.tsx`
- [ ] validar `HorariosModal.tsx`
- [ ] validar `utilitariosFuncionarios.ts`
- [ ] confirmar carregamentos indiretos
- [ ] remover somente com tarefa/autorização específica
- [ ] validar build e navegação após qualquer remoção

## Limpeza final

- [ ] nenhuma route importa Prisma
- [ ] nenhum controller importa Prisma
- [ ] services não dependem de Express
- [ ] repositories não dependem de HTTP
- [ ] não há bridges temporárias sem uso
- [ ] não há dependência removida sem comprovação
- [ ] build frontend passa
- [ ] build backend passa
- [ ] testes automatizados passam
- [ ] smoke test completo passa
- [ ] documentação reflete o código final
- [ ] `10-STATUS-DO-PROJETO.md` atualizado
