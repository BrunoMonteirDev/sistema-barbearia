import {
  DadosProfissionalInvalidosError,
  ProfissionalNaoEncontradoError,
} from "./profissional.service.js";
export class ProfissionalController {
  profissionalService;
  constructor(profissionalService) {
    this.profissionalService = profissionalService;
  }
  listar = async (_req, res) => {
    try {
      const profissionais = await this.profissionalService.listar();
      return res.json(profissionais);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao listar profissionais." });
    }
  };
  listarAdmin = async (_req, res) => {
    try {
      const profissionais = await this.profissionalService.listarAdmin();
      return res.json(profissionais);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao listar profissionais." });
    }
  };
  listarDisponibilidade = async (req, res) => {
    try {
      const disponibilidade =
        await this.profissionalService.listarDisponibilidade(
          String(req.params.id),
        );
      return res.json(disponibilidade);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: "Erro ao listar horários do funcionário." });
    }
  };
  salvarDisponibilidade = async (req, res) => {
    try {
      await this.profissionalService.salvarDisponibilidade(
        String(req.params.id),
        req.body.disponibilidade,
      );
      return res.json({ ok: true });
    } catch (error) {
      if (error instanceof DadosProfissionalInvalidosError) {
        return res.status(400).json({ error: error.message });
      }
      if (error instanceof ProfissionalNaoEncontradoError) {
        return res.status(404).json({ error: error.message });
      }
      console.error(error);
      return res
        .status(500)
        .json({ error: "Erro ao salvar horários do funcionário." });
    }
  };
  criar = async (req, res) => {
    try {
      const profissional = await this.profissionalService.criar(req.body);
      return res.status(201).json(profissional);
    } catch (error) {
      if (error instanceof DadosProfissionalInvalidosError) {
        return res.status(400).json({ error: error.message });
      }
      console.error(error);
      return res
        .status(500)
        .json({ error: "Não foi possível cadastrar o funcionário." });
    }
  };
  atualizar = async (req, res) => {
    try {
      const profissional = await this.profissionalService.atualizar(
        String(req.params.id),
        req.body,
      );
      return res.json(profissional);
    } catch (error) {
      if (error instanceof DadosProfissionalInvalidosError) {
        return res.status(400).json({ error: error.message });
      }
      console.error(error);
      return res
        .status(500)
        .json({ error: "Não foi possível atualizar o funcionário." });
    }
  };
  desativar = async (req, res) => {
    try {
      const profissional = await this.profissionalService.desativar(
        String(req.params.id),
      );
      return res.json(profissional);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: "Não foi possível excluir o funcionário." });
    }
  };
}
