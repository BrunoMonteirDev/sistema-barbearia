import { Router } from 'express'
import { ServicoController } from './servico.controller'
import { authenticate, requireAdmin } from '../middlewares/auth'
import { ServicoRepository } from './servico.repository'
import { ServicoService } from './servico.service'

const router = Router()
const servicoRepository = new ServicoRepository()
const servicoService = new ServicoService(servicoRepository)
const servicoController = new ServicoController(servicoService)

router.get('/', servicoController.listar)
router.post('/', authenticate, requireAdmin, servicoController.criar)
router.put('/:id', authenticate, requireAdmin, servicoController.atualizar)
router.delete('/:id', authenticate, requireAdmin, servicoController.desativar)

export default router
