-- Baseline do schema existente antes das migrations incrementais.
-- Esta migration permite iniciar um banco vazio apenas com `prisma migrate deploy`.

CREATE TABLE "usuarios" (
  "id" TEXT NOT NULL,
  "nome" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "telefone" TEXT,
  "data_nascimento" TIMESTAMP(3),
  "senha_hash" TEXT,
  "nivel" TEXT NOT NULL DEFAULT 'Cliente',
  "ativo" BOOLEAN NOT NULL DEFAULT TRUE,
  "atendimento" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

CREATE TABLE "profissionais" (
  "id" TEXT NOT NULL,
  "nome" TEXT NOT NULL,
  "telefone" TEXT,
  "email" TEXT,
  "especialidade" TEXT,
  "ativo" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "profissionais_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "profissionais_email_key" ON "profissionais"("email");

CREATE TABLE "servicos" (
  "id" TEXT NOT NULL,
  "nome" TEXT NOT NULL,
  "descricao" TEXT,
  "duracao" INTEGER NOT NULL,
  "preco" DECIMAL(10,2) NOT NULL,
  "ativo" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "servicos_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "agendamentos" (
  "id" TEXT NOT NULL,
  "usuario_id" TEXT NOT NULL,
  "profissional_id" TEXT NOT NULL,
  "servico_id" TEXT NOT NULL,
  "data" TEXT NOT NULL,
  "hora" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDENTE',
  "observacao" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "agendamentos_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "agendamentos_profissional_id_data_hora_key" ON "agendamentos"("profissional_id", "data", "hora");
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_profissional_id_fkey" FOREIGN KEY ("profissional_id") REFERENCES "profissionais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_servico_id_fkey" FOREIGN KEY ("servico_id") REFERENCES "servicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "config" (
  "id" TEXT NOT NULL,
  "nome" TEXT NOT NULL DEFAULT 'Barbearia',
  "email" TEXT NOT NULL DEFAULT 'contato@barbearia.com',
  "telefone_whatsapp" TEXT,
  "telefone_fixo" TEXT,
  "endereco" TEXT,
  "logo" TEXT,
  "instagram" TEXT,
  "tipo_comissao" TEXT,
  "texto_rodape" TEXT,
  "img_banner" TEXT,
  "quantidade_cartoes" INTEGER,
  "texto_fidelidade" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "config_pkey" PRIMARY KEY ("id")
);
