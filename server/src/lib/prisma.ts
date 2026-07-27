import dotenv from 'dotenv'
import path from 'path'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') })

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }
const connectionString = process.env.DATABASE_URL

if (!connectionString) throw new Error('DATABASE_URL não foi configurada.')

const adapter = new PrismaPg({ connectionString })
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
