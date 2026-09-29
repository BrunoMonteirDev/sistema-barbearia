import { Router } from 'express'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { usuarioService } from '../usuarios/usuario.service'

const router = Router()
const authService = new AuthService(usuarioService)
const authController = new AuthController(authService)

router.post('/login', authController.login)
router.post('/register', authController.cadastrar)
router.post('/google', authController.google)

export default router
