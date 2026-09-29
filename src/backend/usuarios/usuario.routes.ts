import { Router } from 'express'
import { UsuarioController } from './usuario.controller'
import { requireAdmin } from '../middlewares/auth'
import { usuarioService } from './usuario.service'

const router = Router()
const usuarioController = new UsuarioController(usuarioService)

router.get('/me', usuarioController.perfil)
router.put('/me', usuarioController.atualizarPerfil)
router.put('/me/concluir-cadastro', usuarioController.concluirCadastro)
router.delete('/me', usuarioController.excluirPropriaConta)

router.use(requireAdmin)

router.get('/', usuarioController.listar)
router.post('/', usuarioController.criar)
router.put('/:id', usuarioController.atualizar)
router.delete('/:id', usuarioController.desativar)

export default router
