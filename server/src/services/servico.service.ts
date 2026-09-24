import {
  ServicoRepository,
  type DadosAtualizacaoServico,
  type DadosCriacaoServico
} from '../repositories/servico.repository'

export class ServicoService {
  constructor(private readonly servicoRepository: ServicoRepository) {}

  listar() {
    return this.servicoRepository.listarAtivos()
  }

  criar(dados: DadosCriacaoServico) {
    return this.servicoRepository.criar(dados)
  }

  atualizar(id: string, dados: DadosAtualizacaoServico) {
    return this.servicoRepository.atualizar(id, dados)
  }

  desativar(id: string) {
    return this.servicoRepository.desativar(id)
  }
}
