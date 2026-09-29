CREATE TABLE "notificacoes_agendamentos" (
  "id" TEXT NOT NULL,
  "agendamento_id" TEXT NOT NULL,
  "tipo" TEXT NOT NULL,
  "destino" TEXT,
  "status" TEXT NOT NULL,
  "erro" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notificacoes_agendamentos_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "notificacoes_agendamentos"
  ADD CONSTRAINT "notificacoes_agendamentos_agendamento_id_fkey"
  FOREIGN KEY ("agendamento_id") REFERENCES "agendamentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
