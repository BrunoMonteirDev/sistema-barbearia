/** Papel do módulo: Define os endpoints administrativos que controlam datas sem atendimento. */
import { Router } from "express";
import { BloqueioDataController } from "./bloqueio-data.controller.js";

const router = Router();
const controller = new BloqueioDataController();
router.get("/", controller.listar);
router.post("/", controller.criar);
router.delete("/:id", controller.remover);

export default router;
