import express from 'express'
import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ status: vi.fn(), criarInstancia: vi.fn(), conectar: vi.fn(), reconectar: vi.fn() }))
vi.mock('../services/evolution.service', () => ({ evolutionService: mocks }))
import evolutionRoutes from './evolution'

const app = express()
app.use(express.json())
app.use('/evolution', evolutionRoutes)

describe('rotas administrativas da Evolution', () => {
  beforeEach(() => vi.clearAllMocks())
  it('expõe status degradado sem causar erro na aplicação', async () => {
    mocks.status.mockResolvedValue({ configurada: true, disponivel: false, conectada: false, instancia: 'barbearia-teste', estado: null })
    const response = await request(app).get('/evolution/status')
    expect(response.status).toBe(200)
    expect(response.body.disponivel).toBe(false)
  })
  it('retorna QR Code ao conectar', async () => {
    mocks.conectar.mockResolvedValue({ base64: 'data:image/png;base64,teste' })
    const response = await request(app).post('/evolution/conectar')
    expect(response.status).toBe(200)
    expect(response.body.base64).toContain('base64')
  })
  it('converte falha externa em resposta controlada', async () => {
    mocks.reconectar.mockRejectedValue(new Error('Evolution indisponível.'))
    const response = await request(app).post('/evolution/reconectar')
    expect(response.status).toBe(502)
    expect(response.body.error).toBe('Evolution indisponível.')
  })
})
