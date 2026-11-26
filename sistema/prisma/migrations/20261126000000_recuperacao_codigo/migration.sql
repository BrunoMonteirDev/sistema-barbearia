ALTER TABLE "usuarios"
  ADD COLUMN "recuperacao_solicitada_em" TIMESTAMP(3),
  ADD COLUMN "recuperacao_tentativas" INTEGER NOT NULL DEFAULT 0;

-- Links emitidos pelo fluxo antigo não são códigos e deixam de ser aceitos.
UPDATE "usuarios" SET "recuperacao_token_hash" = NULL, "recuperacao_expira_em" = NULL
WHERE "recuperacao_token_hash" IS NOT NULL;
