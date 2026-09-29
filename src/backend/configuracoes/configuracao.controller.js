import { DadosConfiguracaoInvalidosError } from "./configuracao.service.js";
export class ConfiguracaoController {
  configuracaoService;
  constructor(configuracaoService) {
    this.configuracaoService = configuracaoService;
  }
  buscar = async (_req, res) => {
    try {
      const configuracao = await this.configuracaoService.buscar();
      return res.json(configuracao);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar configuração." });
    }
  };
  salvarContato = async (req, res) => {
    try {
      const configuracao = await this.configuracaoService.salvarContato(
        req.body,
      );
      return res.status(201).json(configuracao);
    } catch (error) {
      if (error instanceof DadosConfiguracaoInvalidosError) {
        return res.status(400).json({ error: error.message });
      }
      console.error(error);
      return res.status(500).json({ error: "Erro ao salvar configuração." });
    }
  };
  buscarRegras = async (_req, res) => {
    const regras = await this.configuracaoService.buscarRegras();
    return res.json(regras);
  };
  salvarRegras = async (req, res) => {
    try {
      const regras = await this.configuracaoService.salvarRegras(req.body);
      return res.json(regras);
    } catch (error) {
      if (error instanceof DadosConfiguracaoInvalidosError) {
        return res.status(400).json({ error: error.message });
      }
      // Erros inesperados continuam sendo encaminhados ao Express.
      throw error;
    }
  };
}
