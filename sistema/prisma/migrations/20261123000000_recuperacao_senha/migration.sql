ALTER TABLE "usuarios"
  ADD COLUMN "recuperacao_token_hash" TEXT,
  ADD COLUMN "recuperacao_expira_em" TIMESTAMP(3),
  ADD COLUMN "versao_sessao" INTEGER NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX "usuarios_recuperacao_token_hash_key"
  ON "usuarios" ("recuperacao_token_hash");
