import { Router } from 'express'
import { evolutionService } from '../services/evolution.service'

const router = Router()

function responderErro(res: any, error: unknown) {
  const mensagem = error instanceof Error ? error.message : 'Não foi possível comunicar com a Evolution.'
  return res.status(502).json({ error: mensagem })
}

router.get('/status', async (_req, res) => res.json(await evolutionService.status()))

router.post('/instancia', async (_req, res) => {
  try { return res.status(201).json(await evolutionService.criarInstancia()) } catch (error) { return responderErro(res, error) }
})

router.post('/conectar', async (_req, res) => {
  try { return res.json(await evolutionService.conectar()) } catch (error) { return responderErro(res, error) }
})

router.post('/reconectar', async (_req, res) => {
  try { return res.json(await evolutionService.reconectar()) } catch (error) { return responderErro(res, error) }
})

export default router
