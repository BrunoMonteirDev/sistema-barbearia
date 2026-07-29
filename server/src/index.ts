import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth'
import servicosRoutes from './routes/servicos'
import profissionaisRoutes from './routes/profissionais'
import agendamentosRoutes from './routes/agendamentos'
import configuracoesRoutes from './routes/configuracoes'
import usuariosRoutes from './routes/usuarios'
import { authenticate, requireAdmin } from './middlewares/auth'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRoutes)
app.use('/api/servicos', servicosRoutes)
app.use('/api/profissionais', profissionaisRoutes)
app.use('/api/agendamentos', authenticate, agendamentosRoutes)
app.use('/api/configuracoes', authenticate, requireAdmin, configuracoesRoutes)
app.use('/api/usuarios', authenticate, usuariosRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
