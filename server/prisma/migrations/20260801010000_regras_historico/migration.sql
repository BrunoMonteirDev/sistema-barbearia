ALTER TABLE "config"
  ADD COLUMN IF NOT EXISTS "antecedencia_cancelamento_horas" INTEGER NOT NULL DEFAULT 24,
  ADD COLUMN IF NOT EXISTS "antecedencia_remarcacao_horas" INTEGER NOT NULL DEFAULT 24,
  ADD COLUMN IF NOT EXISTS "tolerancia_atraso_minutos" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "historicos_agendamentos" (
  "id" TEXT NOT NULL,
  "agendamento_id" TEXT NOT NULL,
  "autor_id" TEXT NOT NULL,
  "tipo" TEXT NOT NULL,
  "dados_anteriores" JSONB,
  "dados_novos" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "historicos_agendamentos_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "historicos_agendamentos_agendamento_id_idx" ON "historicos_agendamentos"("agendamento_id");
ALTER TABLE "historicos_agendamentos" ADD CONSTRAINT "historicos_agendamentos_agendamento_id_fkey" FOREIGN KEY ("agendamento_id") REFERENCES "agendamentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
