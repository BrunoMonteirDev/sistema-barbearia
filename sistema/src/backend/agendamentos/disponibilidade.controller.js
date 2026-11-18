import { ParametrosDisponibilidadeInvalidosError } from "./disponibilidade.service.js";

export class DisponibilidadeController {
  disponibilidadeService;
  constructor(disponibilidadeService) { this.disponibilidadeService = disponibilidadeService; }
  consultar = async (req, res) => {
    const { profissionalId, servicoId, data } = req.query;
    try {
      return res.json(await this.disponibilidadeService.consultar(profissionalId, servicoId, data));
    } catch (error) {
      if (error instanceof ParametrosDisponibilidadeInvalidosError) return res.status(400).json({ error: error.message });
      throw error;
    }
  };
}
