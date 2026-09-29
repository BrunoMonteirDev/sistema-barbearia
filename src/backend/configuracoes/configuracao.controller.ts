import type { Request, Response } from 'express'
import { ConfiguracaoService, DadosConfiguracaoInvalidosError } from './configuracao.service'

export class ConfiguracaoController {
  constructor(private readonly configuracaoService: ConfiguracaoService) {}

  buscar = async (_req: Request, res: Response) => {
    try {
      const configuracao = await this.configuracaoService.buscar()
      return res.json(configuracao)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao buscar configuração.' })
    }
  }

  salvarContato = async (req: Request, res: Response) => {
    try {
      const configuracao = await this.configuracaoService.salvarContato(req.body as Record<string, unknown>)
      return res.status(201).json(configuracao)
    } catch (error) {
      if (error instanceof DadosConfiguracaoInvalidosError) {
        return res.status(400).json({ error: error.message })
      }
      console.error(error)
      return res.status(500).json({ error: 'Erro ao salvar configuração.' })
    }
  }

  buscarRegras = async (_req: Request, res: Response) => {
    const regras = await this.configuracaoService.buscarRegras()
    return res.json(regras)
  }

  salvarRegras = async (req: Request, res: Response) => {
    try {
      const regras = await this.configuracaoService.salvarRegras(req.body as Record<string, unknown>)
      return res.json(regras)
    } catch (error) {
      if (error instanceof DadosConfiguracaoInvalidosError) {
        return res.status(400).json({ error: error.message })
      }
      // Erros inesperados continuam sendo encaminhados ao Express.
      throw error
    }
  }
}
