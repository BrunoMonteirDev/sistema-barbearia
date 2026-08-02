import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth'
import servicosRoutes from './routes/servicos'
import profissionaisRoutes from './routes/profissionais'
import agendamentosRoutes from './routes/agendamentos'
import configuracoesRoutes from './routes/configuracoes'
import usuariosRoutes from './routes/usuarios'
import { authenticate, requireAdmin } from './middlewares/auth'
import { prisma } from './lib/prisma'

export const app = express()
app.use(cors())
app.use(express.json())
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))
app.get('/api/configuracoes-publicas', async (_req, res) => {
  const configuracao = await prisma.configuracao.findFirst({ select: { telefoneWhatsApp: true, email: true, instagram: true } })
  res.json({ telefoneWhatsApp: configuracao?.telefoneWhatsApp ?? null, email: configuracao?.email ?? null, instagram: configuracao?.instagram ?? null })
})
app.use('/api/auth', authRoutes)
app.use('/api/servicos', servicosRoutes)
app.use('/api/profissionais', profissionaisRoutes)
app.use('/api/agendamentos', authenticate, agendamentosRoutes)
app.use('/api/configuracoes', authenticate, requireAdmin, configuracoesRoutes)
app.use('/api/usuarios', authenticate, usuariosRoutes)
