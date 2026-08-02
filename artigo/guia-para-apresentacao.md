# Guia para apresentação do TCC

## Síntese em um minuto

O problema tratado é a organização da agenda de uma única barbearia quando horários, serviços e profissionais precisam ser conciliados. A solução é uma aplicação web que calcula horários disponíveis antes de permitir a confirmação, e valida a disponibilidade novamente no servidor para evitar conflitos.

## Pontos para estudar

1. **Arquitetura:** React/Vite no cliente; Express na API; Prisma/PostgreSQL no banco; JWT para sessão.
2. **Banco:** `Agendamento` liga usuário, profissional e serviço; disponibilidade guarda blocos semanais; histórico registra alterações.
3. **Regra principal:** serviços ocupam blocos de 30 minutos; todos os blocos consecutivos devem estar livres na jornada; reservas ativas não podem se sobrepor.
4. **Conflito simultâneo:** a interface consulta horários, a API recalcula antes de gravar e o banco protege a reserva ativa; conflito retorna 409.
5. **Segurança:** JWT identifica usuário; middleware limita painel administrativo; senha é armazenada como hash.
6. **Testes:** 129 testes unitários aprovados na última execução; cobertura e integração permanecem limitações registradas.

## Perguntas prováveis

**Por que separar cliente e servidor?** Para manter interface, HTTP, regras e persistência em responsabilidades compreensíveis e testáveis.

**Como evita dois agendamentos no mesmo horário?** Calcula disponibilidade por duração e jornada, revalida na API e usa restrição no banco para horários não cancelados.

**Por que PostgreSQL e Prisma?** O problema tem relações claras entre entidades; PostgreSQL mantém integridade e Prisma fornece modelo tipado e migrations versionadas.

**O WhatsApp está pronto?** O código de integração e configuração existe, mas a comunicação real não foi validada no ambiente final; portanto é parcial.

**Quais limitações existem?** Cobertura abaixo da meta de 80%, integração PostgreSQL não executada na última rodada devido ao Docker local e ausência de avaliação formal com usuários/acessibilidade.
