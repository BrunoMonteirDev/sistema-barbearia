import type { Request, Response } from 'express'
import { DadosServicoInvalidosError, ServicoService } from './servico.service'

export class ServicoController {
  constructor(private readonly servicoService: ServicoService) {}

  listar = async (_req: Request, res: Response) => {
    try {
      const servicos = await this.servicoService.listar()
      return res.json(servicos)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao listar serviços.' })
    }
  }

  criar = async (req: Request, res: Response) => {
    try {
      const servico = await this.servicoService.criar(req.body as Record<string, unknown>)
      return res.status(201).json(servico)
    } catch (error) {
      if (error instanceof DadosServicoInvalidosError) {
        return res.status(400).json({ error: error.message })
      }
      console.error(error)
      return res.status(500).json({ error: 'Erro ao criar serviço.' })
    }
  }

  atualizar = async (req: Request, res: Response) => {
    try {
      const servico = await this.servicoService.atualizar(
        String(req.params.id),
        req.body as Record<string, unknown>
      )
      return res.json(servico)
    } catch (error) {
      if (error instanceof DadosServicoInvalidosError) {
        return res.status(400).json({ error: error.message })
      }
      console.error(error)
      return res.status(500).json({ error: 'Erro ao atualizar serviço.' })
    }
  }

  desativar = async (req: Request, res: Response) => {
    const servico = await this.servicoService.desativar(String(req.params.id))
    return res.json(servico)
  }
}
