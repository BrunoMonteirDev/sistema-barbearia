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

router.get('/mensagens', async (_req, res) => res.json(await evolutionService.obterModelosMensagens()))
router.put('/mensagens', async (req, res) => {
  try { return res.json(await evolutionService.atualizarModelosMensagens(req.body)) } catch (error) { return res.status(400).json({ error: error instanceof Error ? error.message : 'Modelos invalidos.' }) }
})
router.get('/envio-automatico', async (_req, res) => res.json({ ativo: await evolutionService.envioAutomaticoAtivo() }))
router.put('/envio-automatico', async (req, res) => {
  try { const config = await evolutionService.atualizarEnvioAutomatico(req.body.ativo); return res.json({ ativo: config.envioAutomaticoWhatsapp }) } catch (error) { return res.status(400).json({ error: error instanceof Error ? error.message : 'Valor invalido.' }) }
})

export default router
