/** Papel do módulo: Adapta as ações de consulta, criação e remoção de datas bloqueadas para o protocolo HTTP. */
import {
  bloqueioDataService,
  BloqueioDataError,
} from "./bloqueio-data.service.js";

export class BloqueioDataController {
  listar = async (_req, res) => {
    return res.json(await bloqueioDataService.listar());
  };

  criar = async (req, res) => {
    try {
      return res.status(201).json(await bloqueioDataService.criar(req.body));
    } catch (error) {
      if (error instanceof BloqueioDataError) {
        return res.status(error.status).json({ error: error.message });
      }
      throw error;
    }
  };

  remover = async (req, res) => {
    try {
      await bloqueioDataService.remover(String(req.params.id));
      return res.status(204).send();
    } catch (error) {
      if (error instanceof BloqueioDataError) {
        return res.status(error.status).json({ error: error.message });
      }
      throw error;
    }
  };
}
