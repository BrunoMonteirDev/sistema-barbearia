import { prisma } from '../lib/prisma'

export type DadosCriacaoServico = {
  nome: string
  descricao?: string | null
  preco: number
  duracao: number
  ativo?: boolean
}

export type DadosAtualizacaoServico = Partial<DadosCriacaoServico>

export class ServicoRepository {
  listarAtivos() {
    return prisma.servico.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' }
    })
  }

  criar(dados: DadosCriacaoServico) {
    return prisma.servico.create({ data: dados })
  }

  atualizar(id: string, dados: DadosAtualizacaoServico) {
    return prisma.servico.update({ where: { id }, data: dados })
  }

  desativar(id: string) {
    return prisma.servico.update({ where: { id }, data: { ativo: false } })
  }
}
