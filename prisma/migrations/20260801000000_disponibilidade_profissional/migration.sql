CREATE TABLE "profissionais_disponibilidades" (
  "id" TEXT NOT NULL,
  "profissional_id" TEXT NOT NULL,
  "dia_semana" INTEGER NOT NULL,
  "hora" TEXT NOT NULL,

  CONSTRAINT "profissionais_disponibilidades_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "profissionais_disponibilidades_profissional_id_dia_semana_hora_key"
  ON "profissionais_disponibilidades"("profissional_id", "dia_semana", "hora");

ALTER TABLE "profissionais_disponibilidades"
  ADD CONSTRAINT "profissionais_disponibilidades_profissional_id_fkey"
  FOREIGN KEY ("profissional_id") REFERENCES "profissionais"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
