/** Papel do módulo: Expõe os endpoints públicos de login, cadastro e autenticação com Google. */
import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { usuarioService } from "../usuarios/usuario.service.js";
import { RecuperacaoSenhaRepository } from "./recuperacao-senha.repository.js";
import { RecuperacaoSenhaService } from "./recuperacao-senha.service.js";
import { RecuperacaoSenhaController } from "./recuperacao-senha.controller.js";
import { EmailService } from "./email.service.js";
import { limitarSolicitacoesPorIp, limitarSolicitacoesPorEmail, limitarRedefinicoes } from "./recuperacao-senha.limiter.js";
const router = Router();
const authService = new AuthService(usuarioService);
const authController = new AuthController(authService);
const recuperacaoController = new RecuperacaoSenhaController(
  new RecuperacaoSenhaService(new RecuperacaoSenhaRepository(), new EmailService()),
);
router.post("/esqueci-senha", limitarSolicitacoesPorIp, limitarSolicitacoesPorEmail, recuperacaoController.solicitar);
router.post("/redefinir-senha", limitarRedefinicoes, recuperacaoController.redefinir);
router.post("/login", authController.login);
router.post("/register", authController.cadastrar);
router.post("/google", authController.google);
export default router;
