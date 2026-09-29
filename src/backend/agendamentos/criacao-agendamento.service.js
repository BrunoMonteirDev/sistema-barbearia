import { AgendamentoRepository } from "./agendamento.repository.js";
import {
  escolherPrimeiroProfissionalDisponivel,
  validarDisponibilidade,
} from "./horarios.service.js";
import {
  criarTokenConfirmacaoRepeticao,
  detectarPossivelRepeticaoAgendamento,
  validarTokenConfirmacaoRepeticao,
} from "./repeticao-agendamento.service.js";
import {
  executarComLockAgenda,
  HorarioIndisponivelError,
} from "./bloqueio-agenda.service.js";
const repository = new AgendamentoRepository();
async function verificarRecursosDaCriacao(
  usuarioId,
  profissionalId,
  servicoId,
) {
  const [profissional, servico, usuario] = await Promise.all([
    repository.buscarProfissionalAtivo(profissionalId),
    repository.buscarServicoAtivo(servicoId),
    repository.buscarUsuarioAtivo(usuarioId),
  ]);
  return {
    recursosDisponiveis: Boolean(profissional && servico && usuario),
    usuario,
  };
}
export async function criarAgendamento(dados) {
  let profissionalId = dados.profissionalId;
  if (profissionalId === "sem-preferencia") {
    const profissionalEscolhido = await escolherPrimeiroProfissionalDisponivel(
      dados.servicoId,
      dados.data,
      dados.hora,
    );
    if (!profissionalEscolhido)
      throw new Error("Nenhum funcionário disponível para este horário.");
    profissionalId = profissionalEscolhido;
  }
  const usuarioId =
    dados.nivelUsuario === "Administrador" && dados.usuarioId
      ? dados.usuarioId
      : dados.usuarioAutenticadoId;
  const recursos = await verificarRecursosDaCriacao(
    usuarioId,
    profissionalId,
    dados.servicoId,
  );
  if (!recursos.recursosDisponiveis || !recursos.usuario) {
    throw new Error("Cliente, profissional ou serviço indisponível.");
  }
  if (recursos.usuario.cadastroConcluido === false) {
    throw new Error("Conclua seu cadastro antes de realizar um agendamento.");
  }
  const tentativa = {
    usuarioId,
    servicoId: dados.servicoId,
    profissionalId,
    data: dados.data,
    hora: dados.hora,
  };
  const repeticao = await detectarPossivelRepeticaoAgendamento(tentativa);
  if (repeticao.possuiPossivelRepeticao) {
    const confirmacao = validarTokenConfirmacaoRepeticao(
      dados.tokenConfirmacaoRepeticao,
      tentativa,
    );
    if (confirmacao === "EXPIRADO")
      throw new Error("CONFIRMACAO_REPETICAO_EXPIRADA");
    if (confirmacao === "INVALIDO")
      throw new Error("CONFIRMACAO_REPETICAO_INVALIDA");
    if (confirmacao !== "VALIDO") {
      const erro = new Error("CONFIRMACAO_REPETICAO_NECESSARIA");
      erro.agendamentosRelacionados = repeticao.agendamentosRelacionados;
      erro.tokenConfirmacaoRepeticao =
        criarTokenConfirmacaoRepeticao(tentativa);
      throw erro;
    }
  }
  const horarioDisponivel = await validarDisponibilidade(
    profissionalId,
    dados.servicoId,
    dados.data,
    dados.hora,
  );
  if (!horarioDisponivel) throw new HorarioIndisponivelError();
  return executarComLockAgenda(
    profissionalId,
    dados.data,
    async (transacao) => {
      const continuaDisponivel = await validarDisponibilidade(
        profissionalId,
        dados.servicoId,
        dados.data,
        dados.hora,
        undefined,
        transacao,
      );
      if (!continuaDisponivel) throw new HorarioIndisponivelError();
      return new AgendamentoRepository(transacao).criar({
        usuarioId,
        profissionalId,
        servicoId: dados.servicoId,
        data: dados.data,
        hora: dados.hora,
        observacao: dados.observacao,
      });
    },
  );
}
