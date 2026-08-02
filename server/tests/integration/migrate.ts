import { spawnSync } from "node:child_process";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

const testDatabaseUrl = process.env.DATABASE_URL_TEST;
const developmentDatabaseUrl = process.env.DATABASE_URL;

if (!testDatabaseUrl) {
  throw new Error("DATABASE_URL_TEST não foi configurada. Não foi possível preparar o banco de integração.");
}

if (testDatabaseUrl === developmentDatabaseUrl) {
  throw new Error("DATABASE_URL_TEST não pode ser igual à DATABASE_URL de desenvolvimento.");
}

const databaseName = new URL(testDatabaseUrl).pathname.replace(/^\//, "").toLowerCase();
if (!databaseName.includes("test")) {
  throw new Error("Por segurança, DATABASE_URL_TEST deve apontar para um banco com 'test' no nome.");
}

const migration = spawnSync(
  process.execPath,
  ["./node_modules/prisma/build/index.js", "migrate", "deploy"],
  {
    cwd: process.cwd(),
    env: { ...process.env, DATABASE_URL: testDatabaseUrl },
    stdio: "inherit",
  },
);

if (migration.status !== 0) {
  process.exit(migration.status ?? 1);
}
