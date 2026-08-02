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

router.post('/desconectar', async (_req, res) => {
  try { return res.json(await evolutionService.desconectar()) } catch (error) { return responderErro(res, error) }
})

router.delete('/instancia', async (_req, res) => {
  try { return res.json(await evolutionService.excluirInstancia()) } catch (error) { return responderErro(res, error) }
})

router.put('/nome-exibicao', async (req, res) => {
  try { return res.json(await evolutionService.atualizarNomeExibicao(req.body.nome)) } catch (error) { return res.status(400).json({ error: error instanceof Error ? error.message : 'Nome inválido.' }) }
})

export default router
