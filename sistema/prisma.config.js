import "dotenv/config";
import { defineConfig, env } from "prisma/config";
// Mantém o schema e a conexão do Prisma configurados na raiz do projeto.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: { url: env("DATABASE_URL") },
});
