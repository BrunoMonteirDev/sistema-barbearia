import { isValidBlock } from "../agendamentos/horarios.service.js";
export class DadosProfissionalInvalidosError extends Error {}
export class ProfissionalNaoEncontradoError extends Error {}
function validarDadosProfissional(body) {
  const dados = {
    nome: typeof body.nome === "string" ? body.nome.trim() : "",
    telefone:
      typeof body.telefone === "string"
        ? body.telefone.replace(/\D/g, "")
        : null,
    email:
      typeof body.email === "string" ? body.email.trim().toLowerCase() : null,
    ativo: typeof body.ativo === "boolean" ? body.ativo : true,
  };
  const dadosValidos = Boolean(
    dados.nome.length >= 2 &&
      dados.telefone &&
      dados.telefone.length >= 10 &&
      dados.telefone.length <= 11 &&
      dados.email &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email),
  );
  if (!dadosValidos) {
    throw new DadosProfissionalInvalidosError(
      "Informe nome, telefone e e-mail válidos.",
    );
  }
  return dados;
}
export class ProfissionalService {
  profissionalRepository;
  constructor(profissionalRepository) {
    this.profissionalRepository = profissionalRepository;
  }
  listar() {
    return this.profissionalRepository.listarAtivos();
  }
  listarAdmin() {
    return this.profissionalRepository.listarTodos();
  }
  criar(body) {
    const dados = validarDadosProfissional(body);
    return this.profissionalRepository.criar(dados);
  }
  atualizar(id, body) {
    const dados = validarDadosProfissional(body);
    return this.profissionalRepository.atualizar(id, dados);
  }
  desativar(id) {
    return this.profissionalRepository.desativar(id);
  }
  async listarDisponibilidade(profissionalId) {
    const horarios =
      await this.profissionalRepository.listarDisponibilidade(profissionalId);
    return horarios.reduce((disponibilidade, horario) => {
      disponibilidade[horario.diaSemana] = [
        ...(disponibilidade[horario.diaSemana] ?? []),
        horario.hora,
      ];
      return disponibilidade;
    }, {});
  }
  async salvarDisponibilidade(profissionalId, disponibilidade) {
    if (
      !disponibilidade ||
      typeof disponibilidade !== "object" ||
      Array.isArray(disponibilidade)
    ) {
      throw new DadosProfissionalInvalidosError("Disponibilidade inválida.");
    }
    const profissional =
      await this.profissionalRepository.buscarPorId(profissionalId);
    if (!profissional) {
      throw new ProfissionalNaoEncontradoError("Funcionário não encontrado.");
    }
    const blocos = [];
    for (const [dia, horas] of Object.entries(disponibilidade)) {
      const diaSemana = Number(dia);
      if (
        !Number.isInteger(diaSemana) ||
        diaSemana < 0 ||
        diaSemana > 6 ||
        !Array.isArray(horas) ||
        horas.some((hora) => !isValidBlock(hora))
      ) {
        throw new DadosProfissionalInvalidosError(
          "Disponibilidade contém dia ou horário inválido.",
        );
      }
      blocos.push(
        ...[...new Set(horas)].map((hora) => ({
          profissionalId,
          diaSemana,
          hora: hora,
        })),
      );
    }
    await this.profissionalRepository.substituirDisponibilidade(
      profissionalId,
      blocos,
    );
  }
}
