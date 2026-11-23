/** Traduz o resultado da recuperação em respostas HTTP, sem expor dados da conta. */
import { MENSAGEM_RECUPERACAO, RecuperacaoSenhaError } from "./recuperacao-senha.service.js";

export class RecuperacaoSenhaController {
  constructor(service) {
    this.service = service;
  }

  responderErro(res, error) {
    if (error instanceof RecuperacaoSenhaError) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error("Falha interna no fluxo de recuperação de senha.");
    return res.status(500).json({ error: "Não foi possível concluir a solicitação. Tente novamente mais tarde." });
  }

  solicitar = async (req, res) => {
    res.set("Cache-Control", "no-store");
    try {
      await this.service.solicitar(req.body?.email);
      return res.json({ message: MENSAGEM_RECUPERACAO });
    } catch (error) {
      return this.responderErro(res, error);
    }
  };

  redefinir = async (req, res) => {
    res.set("Cache-Control", "no-store");
    try {
      await this.service.redefinir(req.body ?? {});
      return res.json({ message: "Senha redefinida. Entre com sua nova senha." });
    } catch (error) {
      return this.responderErro(res, error);
    }
  };
}
