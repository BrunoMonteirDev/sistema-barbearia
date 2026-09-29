import { Router } from 'express'
import { requireAdmin, requireStaff } from '../middlewares/auth'
import { AgendamentoController } from './agendamento.controller'
import { DisponibilidadeController } from './disponibilidade.controller'
import { DisponibilidadeRepository } from './disponibilidade.repository'
import { DisponibilidadeService } from './disponibilidade.service'

const router = Router()
const agendamentoController = new AgendamentoController()
const disponibilidadeRepository = new DisponibilidadeRepository()
const disponibilidadeService = new DisponibilidadeService(disponibilidadeRepository)
const disponibilidadeController = new DisponibilidadeController(disponibilidadeService)

router.get('/', agendamentoController.listar)
router.post('/', agendamentoController.criar)
router.get('/disponibilidade', disponibilidadeController.consultar)
router.patch('/:id/cancelar', agendamentoController.cancelar)
router.get('/:id/historico', agendamentoController.historico)
router.patch('/:id/remarcar', agendamentoController.remarcar)
router.patch('/:id/status', requireAdmin, agendamentoController.alterarStatus)
router.post('/:id/notificar', requireStaff, agendamentoController.notificar)
router.put('/:id', requireAdmin, agendamentoController.atualizar)
router.delete('/:id', requireAdmin, agendamentoController.excluir)

export default router
