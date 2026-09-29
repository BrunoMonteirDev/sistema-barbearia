import type { Configuracao } from '@prisma/client'
import { ConfiguracaoRepository } from './configuracao.repository'

export class DadosConfiguracaoInvalidosError extends Error {}

const camposRegras = ['antecedenciaCancelamentoHoras', 'antecedenciaRemarcacaoHoras', 'antecedenciaAgendamentoMinutos', 'toleranciaAtrasoMinutos'] as const

function dadosContatoValidos(body: Record<string, unknown>) {
  const telefoneWhatsApp = typeof body.telefoneWhatsApp === 'string' ? body.telefoneWhatsApp.replace(/\D/g, '') : ''
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const instagram = typeof body.instagram === 'string' ? body.instagram.trim() : ''
  if (telefoneWhatsApp.length < 10 || telefoneWhatsApp.length > 11) return { erro: 'Informe um WhatsApp brasileiro válido com DDD.' } as const
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { erro: 'Informe um e-mail de contato válido.' } as const
  if (instagram) {
    try {
      const url = new URL(instagram)
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Protocolo inválido')
    } catch {
      return { erro: 'Informe o link completo do Instagram ou deixe o campo vazio.' } as const
    }
  }
  return { dados: { telefoneWhatsApp, email, instagram: instagram || null } } as const
}

function selecionarRegras(config: Configuracao) {
  return Object.fromEntries(camposRegras.map(campo => [campo, config[campo]]))
}

export class ConfiguracaoService {
  constructor(private readonly configuracaoRepository: ConfiguracaoRepository) {}

  buscar() {
    // A leitura de contatos não cria um registro: pode retornar null.
    return this.configuracaoRepository.buscar()
  }

  async salvarContato(body: Record<string, unknown>) {
    const resultado = dadosContatoValidos(body)
    if ('erro' in resultado) throw new DadosConfiguracaoInvalidosError(resultado.erro)
    const atual = await this.configuracaoRepository.buscar()
    return atual
      ? this.configuracaoRepository.atualizar(atual.id, resultado.dados)
      : this.configuracaoRepository.criar(resultado.dados)
  }

  private async obterOuCriar() {
    return (await this.configuracaoRepository.buscar()) ?? this.configuracaoRepository.criar({})
  }

  async buscarRegras() {
    const config = await this.obterOuCriar()
    return selecionarRegras(config)
  }

  async salvarRegras(body: Record<string, unknown>) {
    const dados = Object.fromEntries(camposRegras.map(campo => [campo, body[campo]])) as Record<string, unknown>
    const camposComLimite = ['antecedenciaCancelamentoHoras', 'antecedenciaRemarcacaoHoras', 'toleranciaAtrasoMinutos'] as const
    if (
      camposComLimite.some(campo => !Number.isInteger(dados[campo]) || Number(dados[campo]) < 0 || Number(dados[campo]) > 720) ||
      !Number.isInteger(dados.antecedenciaAgendamentoMinutos) || Number(dados.antecedenciaAgendamentoMinutos) < 0
    ) {
      throw new DadosConfiguracaoInvalidosError('As regras devem ser números inteiros não negativos; cancelamento, remarcação e atraso aceitam no máximo 720.')
    }
    const config = await this.obterOuCriar()
    const atualizado = await this.configuracaoRepository.atualizar(config.id, dados)
    return selecionarRegras(atualizado)
  }
}
