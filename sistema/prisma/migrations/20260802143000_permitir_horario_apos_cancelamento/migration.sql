-- Um horário cancelado volta a ficar disponível para uma nova reserva.
DROP INDEX IF EXISTS "agendamentos_profissional_id_data_hora_key";
CREATE UNIQUE INDEX "agendamentos_profissional_data_hora_ativos_key"
  ON "agendamentos" ("profissional_id", "data", "hora")
  WHERE "status" <> 'CANCELADO';
