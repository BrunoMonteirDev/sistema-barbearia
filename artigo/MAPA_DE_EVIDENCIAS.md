# Mapa de Evidências

| Afirmação técnica | Evidência | Arquivo/função | Seção prevista |
| --- | --- | --- | --- |
| A aplicação usa cliente e API separados | configuração e pontos de entrada | `client/src/main.tsx`, `server/src/app.ts` | 3.2 |
| A sessão usa JWT | geração e middleware | `server/src/middlewares/auth.ts` | 3.7 |
| O cliente revisa antes de criar reserva | condição da etapa 4 e aceite | `AgendarPage.tsx` | 3.4 |
| A disponibilidade considera duração | cálculo de blocos consecutivos | `horarios.service.ts` | 3.5 |
| O sistema detecta sobreposição | comparação de intervalos | `temConflito` | 3.5 |
| Cancelamento libera horário | filtro de status e migration parcial | `listarHorariosDisponiveis`; migration `20260802143000` | 3.5 e 4 |
| Disputa simultânea devolve conflito | tratamento `P2002` | `routes/agendamentos.ts` | 3.5 |
| A área administrativa exige privilégio | middlewares e rotas | `auth.ts`, `app.ts` | 3.6 e 3.7 |
| Alterações têm auditoria | modelo e rotas | `HistoricoAgendamento`, `agendamentos.ts` | 3.6 |
| Há testes automatizados | suítes Vitest | `client/src/**/*.test.*`, `server/src/**/*.test.ts` | 4 |
| Lint/build/testes unitários passaram | execução em 02/08/2026 | `relatorio-de-testes.md` | 4 |
| Cobertura não alcançou meta | relatório V8 | execução em 02/08/2026 | 4 e 5 |
| Integração real permanece pendente | Docker Desktop indisponível | `docker-compose.test.yml`, execução | 4 e 5 |
| WhatsApp é integração parcial | serviço e validação manual pendente | `evolution.service.ts`, `VALIDACAO_MANUAL.txt` | 3.9 e 5 |
