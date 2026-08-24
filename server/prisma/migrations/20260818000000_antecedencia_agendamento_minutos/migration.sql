ALTER TABLE "config"
  ADD COLUMN IF NOT EXISTS "antecedencia_agendamento_minutos" INTEGER NOT NULL DEFAULT 30;
