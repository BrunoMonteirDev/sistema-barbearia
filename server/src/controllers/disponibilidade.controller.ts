import type { Request, Response } from 'express'
import {
  AutenticacaoDisponibilidadeObrigatoriaError,
  ConsultaDisponibilidadeProibidaError,
  DisponibilidadeService,
  ParametrosDisponibilidadeInvalidosError,
} from '../services/disponibilidade.service'

export class DisponibilidadeController {
  constructor(private readonly disponibilidadeService: DisponibilidadeService) {}

  consultar = async (req: Request, res: Response) => {
    const { profissionalId, servicoId, data, ignorarAgendamentoId } = req.query
    try {
      const disponibilidade = await this.disponibilidadeService.consultar(
        profissionalId, servicoId, data, ignorarAgendamentoId, req.auth,
      )
      return res.json(disponibilidade)
    } catch (error) {
      if (error instanceof ParametrosDisponibilidadeInvalidosError) {
        return res.status(400).json({ error: error.message })
      }
      if (error instanceof AutenticacaoDisponibilidadeObrigatoriaError) {
        return res.status(401).json({ error: error.message })
      }
      if (error instanceof ConsultaDisponibilidadeProibidaError) {
        return res.status(403).json({ error: error.message })
      }
      // Preserva o encaminhamento dos erros inesperados ao Express.
      throw error
    }
  }
}
