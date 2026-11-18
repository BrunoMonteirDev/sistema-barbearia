ALTER TABLE "usuarios"
  ADD COLUMN "provedor_auth" TEXT NOT NULL DEFAULT 'LOCAL',
  ADD COLUMN "google_subject" TEXT,
  ADD COLUMN "cadastro_concluido" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "foto_url" TEXT;

CREATE UNIQUE INDEX "usuarios_google_subject_key" ON "usuarios"("google_subject");
