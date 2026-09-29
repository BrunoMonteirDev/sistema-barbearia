import { Router } from 'express'
import { EvolutionController } from './evolution.controller'

const router = Router()
const evolutionController = new EvolutionController()

// authenticate e requireAdmin continuam aplicados em app.ts.
router.get('/status', evolutionController.status)
router.post('/instancia', evolutionController.criarInstancia)
router.post('/conectar', evolutionController.conectar)
router.post('/reconectar', evolutionController.reconectar)
router.post('/desconectar', evolutionController.desconectar)
router.delete('/instancia', evolutionController.excluirInstancia)
router.put('/nome-exibicao', evolutionController.atualizarNomeExibicao)
router.get('/mensagens', evolutionController.obterModelosMensagens)
router.put('/mensagens', evolutionController.atualizarModelosMensagens)
router.get('/envio-automatico', evolutionController.envioAutomatico)
router.put('/envio-automatico', evolutionController.atualizarEnvioAutomatico)
router.get('/regras-envio-automatico', evolutionController.regrasEnvioAutomatico)
router.put('/regras-envio-automatico', evolutionController.atualizarRegrasEnvioAutomatico)

export default router
