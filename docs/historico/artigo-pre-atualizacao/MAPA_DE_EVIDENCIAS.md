# Mapa de Evidências

| Afirmação técnica | Evidência | Arquivo/função | Seção prevista |
| --- | --- | --- | --- |
| A aplicação usa cliente e API separados | configuração e pontos de entrada | `client/src/main.tsx`, `server/src/app.ts` | 2.3 |
| A sessão usa JWT | geração e middleware | `server/src/middlewares/auth.ts` | 2.3.8 |
| O cliente revisa antes de criar reserva | condição da etapa 4 e aceite | `AgendarPage.tsx` | 2.3.3 e 2.3.6 |
| A disponibilidade considera duração | cálculo de blocos consecutivos | `horarios.service.ts` | 2.3.5 |
| O sistema detecta sobreposição | comparação de intervalos | `temConflito` | 2.3.5 |
| Cancelamento libera horário | filtro de status e migration parcial | `listarHorariosDisponiveis`; migration `20260802143000` | 2.3.5, 2.3.6 e 2.4.2 |
| Disputa simultânea devolve conflito | tratamento `P2002` | `routes/agendamentos.ts` | 2.3.3 e 2.3.5 |
| A área administrativa exige privilégio | middlewares e rotas | `auth.ts`, `app.ts` | 2.3.7 e 2.3.8 |
| Alterações têm auditoria | modelo e rotas | `HistoricoAgendamento`, `agendamentos.ts` | 2.3.6 e 2.3.9 |
| Há testes automatizados | suítes Vitest | `client/src/**/*.test.*`, `server/src/**/*.test.ts` | 2.2 e 2.4 |
| Lint/build/testes unitários passaram | execução em 02/08/2026 | `relatorio-de-testes.md` | 2.4 |
| Cobertura não alcançou meta | relatório V8 | execução em 02/08/2026 | 2.4 e 3 |
| Integração real permanece pendente | Docker Desktop indisponível | `docker-compose.test.yml`, execução | 2.4 e 3 |
| WhatsApp é integração parcial | serviço e validação manual pendente | `evolution.service.ts`, `VALIDACAO_MANUAL.txt` | 2.3.10 e 2.4.5 |
