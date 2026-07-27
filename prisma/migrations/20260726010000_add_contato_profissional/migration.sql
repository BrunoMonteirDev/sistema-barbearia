ALTER TABLE "profissionais" ADD COLUMN "telefone" TEXT;
ALTER TABLE "profissionais" ADD COLUMN "email" TEXT;
CREATE UNIQUE INDEX "profissionais_email_key" ON "profissionais"("email");
