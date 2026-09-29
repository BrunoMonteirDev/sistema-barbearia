import { Router } from 'express'
import { ProfissionalController } from './profissional.controller'
import { authenticate, requireAdmin } from '../middlewares/auth'
import { ProfissionalRepository } from './profissional.repository'
import { ProfissionalService } from './profissional.service'

const router = Router()
const profissionalRepository = new ProfissionalRepository()
const profissionalService = new ProfissionalService(profissionalRepository)
const profissionalController = new ProfissionalController(profissionalService)

router.get('/', profissionalController.listar)
router.get('/admin', authenticate, requireAdmin, profissionalController.listarAdmin)
router.get('/:id/disponibilidade', authenticate, requireAdmin, profissionalController.listarDisponibilidade)
router.put('/:id/disponibilidade', authenticate, requireAdmin, profissionalController.salvarDisponibilidade)
router.post('/', authenticate, requireAdmin, profissionalController.criar)
router.put('/:id', authenticate, requireAdmin, profissionalController.atualizar)
router.delete('/:id', authenticate, requireAdmin, profissionalController.desativar)

export default router
