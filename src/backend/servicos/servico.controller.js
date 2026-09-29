import { DadosServicoInvalidosError } from "./servico.service.js";
export class ServicoController {
  servicoService;
  constructor(servicoService) {
    this.servicoService = servicoService;
  }
  listar = async (_req, res) => {
    try {
      const servicos = await this.servicoService.listar();
      return res.json(servicos);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao listar serviços." });
    }
  };
  criar = async (req, res) => {
    try {
      const servico = await this.servicoService.criar(req.body);
      return res.status(201).json(servico);
    } catch (error) {
      if (error instanceof DadosServicoInvalidosError) {
        return res.status(400).json({ error: error.message });
      }
      console.error(error);
      return res.status(500).json({ error: "Erro ao criar serviço." });
    }
  };
  atualizar = async (req, res) => {
    try {
      const servico = await this.servicoService.atualizar(
        String(req.params.id),
        req.body,
      );
      return res.json(servico);
    } catch (error) {
      if (error instanceof DadosServicoInvalidosError) {
        return res.status(400).json({ error: error.message });
      }
      console.error(error);
      return res.status(500).json({ error: "Erro ao atualizar serviço." });
    }
  };
  desativar = async (req, res) => {
    const servico = await this.servicoService.desativar(String(req.params.id));
    return res.json(servico);
  };
}
