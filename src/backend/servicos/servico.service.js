export class DadosServicoInvalidosError extends Error {}
function validarDadosServico(body, parcial = false) {
  const dados = {};
  if (!parcial || body.nome !== undefined) {
    if (typeof body.nome !== "string" || body.nome.trim().length < 2) {
      throw new DadosServicoInvalidosError(
        "Informe um nome válido para o serviço.",
      );
    }
    dados.nome = body.nome.trim();
  }
  if (body.descricao !== undefined) {
    if (body.descricao !== null && typeof body.descricao !== "string") {
      throw new DadosServicoInvalidosError("Informe uma descrição válida.");
    }
    dados.descricao =
      typeof body.descricao === "string" && body.descricao.trim()
        ? body.descricao.trim()
        : null;
  }
  if (!parcial || body.preco !== undefined) {
    const preco =
      typeof body.preco === "number" ? body.preco : Number(body.preco);
    if (!Number.isFinite(preco) || preco < 0) {
      throw new DadosServicoInvalidosError("Informe um preço válido.");
    }
    dados.preco = preco;
  }
  if (!parcial || body.duracao !== undefined) {
    const duracao =
      typeof body.duracao === "number" ? body.duracao : Number(body.duracao);
    if (!Number.isInteger(duracao) || duracao <= 0) {
      throw new DadosServicoInvalidosError(
        "Informe uma duração inteira maior que zero.",
      );
    }
    dados.duracao = duracao;
  }
  if (body.ativo !== undefined) {
    if (typeof body.ativo !== "boolean") {
      throw new DadosServicoInvalidosError(
        "Informe um status válido para o serviço.",
      );
    }
    dados.ativo = body.ativo;
  }
  if (parcial && Object.keys(dados).length === 0) {
    throw new DadosServicoInvalidosError(
      "Informe ao menos um dado para atualizar.",
    );
  }
  return dados;
}
export class ServicoService {
  servicoRepository;
  constructor(servicoRepository) {
    this.servicoRepository = servicoRepository;
  }
  listar() {
    return this.servicoRepository.listarAtivos();
  }
  criar(body) {
    const dados = validarDadosServico(body);
    return this.servicoRepository.criar(dados);
  }
  atualizar(id, body) {
    const dados = validarDadosServico(body, true);
    return this.servicoRepository.atualizar(id, dados);
  }
  desativar(id) {
    return this.servicoRepository.desativar(id);
  }
}
