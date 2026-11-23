/** Papel do módulo: Cria e compartilha a conexão do Prisma com PostgreSQL usando a URL do ambiente. */
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
dotenv.config();
const globalForPrisma = globalThis;
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL não foi configurada.");
const adapter = new PrismaPg({ connectionString });
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
