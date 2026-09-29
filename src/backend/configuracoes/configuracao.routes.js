import { Router } from "express";
import { ConfiguracaoController } from "./configuracao.controller.js";
import { ConfiguracaoService } from "./configuracao.service.js";
import { ConfiguracaoRepository } from "./configuracao.repository.js";
const router = Router();
const configuracaoRepository = new ConfiguracaoRepository();
const configuracaoService = new ConfiguracaoService(configuracaoRepository);
const configuracaoController = new ConfiguracaoController(configuracaoService);
// authenticate e requireAdmin continuam aplicados em app.js.
router.get("/", configuracaoController.buscar);
router.put("/", configuracaoController.salvarContato);
router.get("/regras", configuracaoController.buscarRegras);
router.put("/regras", configuracaoController.salvarRegras);
export default router;
