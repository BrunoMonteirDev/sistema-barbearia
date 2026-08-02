import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

const testDatabaseUrl = process.env.DATABASE_URL_TEST;
const developmentDatabaseUrl = process.env.DATABASE_URL;

if (!testDatabaseUrl) {
  throw new Error("DATABASE_URL_TEST não foi configurada. Testes de integração exigem um banco PostgreSQL exclusivo de testes.");
}

if (testDatabaseUrl === developmentDatabaseUrl) {
  throw new Error("DATABASE_URL_TEST não pode ser igual à DATABASE_URL de desenvolvimento.");
}

const databaseName = new URL(testDatabaseUrl).pathname.replace(/^\//, "").toLowerCase();
if (!databaseName.includes("test")) {
  throw new Error("Por segurança, DATABASE_URL_TEST deve apontar para um banco com 'test' no nome.");
}

process.env.DATABASE_URL = testDatabaseUrl;
process.env.NODE_ENV = "test";
