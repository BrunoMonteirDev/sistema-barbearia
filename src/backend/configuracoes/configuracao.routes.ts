import { Router } from 'express'
import { ConfiguracaoController } from './configuracao.controller'
import { ConfiguracaoService } from './configuracao.service'
import { ConfiguracaoRepository } from './configuracao.repository'

const router = Router()
const configuracaoRepository = new ConfiguracaoRepository()
const configuracaoService = new ConfiguracaoService(configuracaoRepository)
const configuracaoController = new ConfiguracaoController(configuracaoService)

// authenticate e requireAdmin continuam aplicados em app.ts.
router.get('/', configuracaoController.buscar)
router.put('/', configuracaoController.salvarContato)
router.get('/regras', configuracaoController.buscarRegras)
router.put('/regras', configuracaoController.salvarRegras)

export default router
