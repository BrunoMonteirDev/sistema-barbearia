import {
  escolherPrimeiroProfissionalDisponivel,
  listarBlocosConfiguradosParaData,
  listarHorariosDisponiveis,
} from "./horarios.service.js";
import {
  horarioAgendamentoJaPassou,
  regrasAgendamento,
  respeitaAntecedenciaMinimaAgendamento,
} from "./regras-agendamento.service.js";
export class ParametrosDisponibilidadeInvalidosError extends Error {}
export class AutenticacaoDisponibilidadeObrigatoriaError extends Error {}
export class ConsultaDisponibilidadeProibidaError extends Error {}
function dataValida(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}
export class DisponibilidadeService {
  disponibilidadeRepository;
  constructor(disponibilidadeRepository) {
    this.disponibilidadeRepository = disponibilidadeRepository;
  }
  async consultar(
    profissionalId,
    servicoId,
    data,
    ignorarAgendamentoId,
    usuario,
  ) {
    if (
      typeof profissionalId !== "string" ||
      typeof servicoId !== "string" ||
      !dataValida(data)
    ) {
      throw new ParametrosDisponibilidadeInvalidosError(
        "Profissional, serviço e data válidos são obrigatórios.",
      );
    }
    const regras = await regrasAgendamento();
    const horarioDisponivel = (hora) => !horarioAgendamentoJaPassou(data, hora);
    const horarioComAvisoAntecedencia = (hora) =>
      horarioDisponivel(hora) &&
      !respeitaAntecedenciaMinimaAgendamento(
        data,
        hora,
        regras.antecedenciaAgendamentoMinutos,
      );
    if (profissionalId === "sem-preferencia") {
      const horarios = [];
      for (const hora of await listarBlocosConfiguradosParaData(data)) {
        if (!horarioDisponivel(hora)) continue;
        if (
          await escolherPrimeiroProfissionalDisponivel(servicoId, data, hora)
        ) {
          horarios.push(hora);
        }
      }
      return {
        horarios,
        horariosComAvisoAntecedencia: horarios.filter(
          horarioComAvisoAntecedencia,
        ),
      };
    }
    let agendamentoIgnorado;
    if (typeof ignorarAgendamentoId === "string") {
      if (!usuario) {
        throw new AutenticacaoDisponibilidadeObrigatoriaError(
          "Autenticação obrigatória para remarcar um agendamento.",
        );
      }
      const agendamento =
        await this.disponibilidadeRepository.buscarAgendamentoPorId(
          ignorarAgendamentoId,
        );
      if (
        !agendamento ||
        (usuario.nivel !== "Administrador" &&
          agendamento.usuarioId !== usuario.sub)
      ) {
        throw new ConsultaDisponibilidadeProibidaError(
          "Sem permissão para remarcar este agendamento.",
        );
      }
      agendamentoIgnorado = agendamento.id;
    }
    const horarios = await listarHorariosDisponiveis(
      profissionalId,
      servicoId,
      data,
      agendamentoIgnorado,
    );
    const horariosDisponiveis = horarios.filter(horarioDisponivel);
    return {
      horarios: horariosDisponiveis,
      horariosComAvisoAntecedencia: horariosDisponiveis.filter(
        horarioComAvisoAntecedencia,
      ),
    };
  }
}
