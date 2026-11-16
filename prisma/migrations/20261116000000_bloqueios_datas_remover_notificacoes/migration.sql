CREATE TABLE "bloqueios_datas" (
    "id" TEXT NOT NULL,
    "data" VARCHAR(10) NOT NULL,
    "motivo" VARCHAR(180) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bloqueios_datas_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "bloqueios_datas_data_key" ON "bloqueios_datas"("data");

DROP TABLE IF EXISTS "notificacoes_agendamentos" CASCADE;

ALTER TABLE "config"
    DROP COLUMN IF EXISTS "evolution_nome_exibicao",
    DROP COLUMN IF EXISTS "mensagem_whatsapp_criacao",
    DROP COLUMN IF EXISTS "mensagem_whatsapp_remarcacao",
    DROP COLUMN IF EXISTS "mensagem_whatsapp_cancelamento",
    DROP COLUMN IF EXISTS "mensagem_whatsapp_atualizacao",
    DROP COLUMN IF EXISTS "mensagem_whatsapp_lembrete",
    DROP COLUMN IF EXISTS "mensagens_whatsapp_status",
    DROP COLUMN IF EXISTS "envio_automatico_whatsapp",
    DROP COLUMN IF EXISTS "regras_envio_automatico",
    DROP COLUMN IF EXISTS "antecedencia_remarcacao_horas";
