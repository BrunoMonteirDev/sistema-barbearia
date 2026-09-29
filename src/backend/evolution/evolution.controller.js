import { evolutionService } from "./evolution.service.js";
function responderErro(res, error) {
  const mensagem =
    error instanceof Error
      ? error.message
      : "Não foi possível comunicar com a Evolution.";
  return res.status(502).json({ error: mensagem });
}
export class EvolutionController {
  status = async (_req, res) => res.json(await evolutionService.status());
  criarInstancia = async (_req, res) => {
    try {
      return res.status(201).json(await evolutionService.criarInstancia());
    } catch (error) {
      return responderErro(res, error);
    }
  };
  conectar = async (_req, res) => {
    try {
      return res.json(await evolutionService.conectar());
    } catch (error) {
      return responderErro(res, error);
    }
  };
  reconectar = async (_req, res) => {
    try {
      return res.json(await evolutionService.reconectar());
    } catch (error) {
      return responderErro(res, error);
    }
  };
  desconectar = async (_req, res) => {
    try {
      return res.json(await evolutionService.desconectar());
    } catch (error) {
      return responderErro(res, error);
    }
  };
  excluirInstancia = async (_req, res) => {
    try {
      return res.json(await evolutionService.excluirInstancia());
    } catch (error) {
      return responderErro(res, error);
    }
  };
  atualizarNomeExibicao = async (req, res) => {
    try {
      return res.json(
        await evolutionService.atualizarNomeExibicao(req.body.nome),
      );
    } catch (error) {
      return res
        .status(400)
        .json({
          error: error instanceof Error ? error.message : "Nome inválido.",
        });
    }
  };
  obterModelosMensagens = async (_req, res) =>
    res.json(await evolutionService.obterModelosMensagens());
  atualizarModelosMensagens = async (req, res) => {
    try {
      return res.json(
        await evolutionService.atualizarModelosMensagens(req.body),
      );
    } catch (error) {
      return res
        .status(400)
        .json({
          error: error instanceof Error ? error.message : "Modelos invalidos.",
        });
    }
  };
  envioAutomatico = async (_req, res) =>
    res.json({ ativo: await evolutionService.envioAutomaticoAtivo() });
  atualizarEnvioAutomatico = async (req, res) => {
    try {
      const config = await evolutionService.atualizarEnvioAutomatico(
        req.body.ativo,
      );
      return res.json({ ativo: config.envioAutomaticoWhatsapp });
    } catch (error) {
      return res
        .status(400)
        .json({
          error: error instanceof Error ? error.message : "Valor invalido.",
        });
    }
  };
  regrasEnvioAutomatico = async (_req, res) =>
    res.json(await evolutionService.regrasEnvioAutomatico());
  atualizarRegrasEnvioAutomatico = async (req, res) => {
    try {
      return res.json(
        await evolutionService.atualizarRegrasEnvioAutomatico(req.body),
      );
    } catch (error) {
      return res
        .status(400)
        .json({
          error: error instanceof Error ? error.message : "Regras invalidas.",
        });
    }
  };
}
