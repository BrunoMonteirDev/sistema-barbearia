import { notificacaoService } from "./notificacao.service.js";
import { HorarioIndisponivelError } from "./bloqueio-agenda.service.js";
import { criarAgendamento } from "./criacao-agendamento.service.js";
import {
  listarAgendamentos,
  buscarAgendamento,
  consultarHistoricoAgendamento,
} from "./consulta-agendamento.service.js";
import {
  cancelarAgendamento,
  remarcarAgendamento,
  atualizarStatusAgendamento,
  prepararCancelamento,
  prepararRemarcacao,
  prepararAtualizacaoAdministrativa,
  atualizarAgendamentoAdministrativamente,
  excluirAgendamento,
} from "./manutencao-agendamento.service.js";
import {
  validarDadosCriacao,
  validarStatus,
  ValidacaoAgendamentoError,
} from "./validacao-agendamento.service.js";
function responderValidacao(res, error) {
  const status = {
    dadosInvalidos: 400,
    naoEncontrado: 404,
    semPermissao: 403,
    horarioPassado: 409,
  };
  return res.status(status[error.motivo]).json({ error: error.message });
}
function conflitoDeAgenda(error) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}
function responderConflitoDeAgenda(res) {
  return res
    .status(409)
    .json({ error: "O horário selecionado não está mais disponível." });
}
export class AgendamentoController {
  listar = async (req, res) => {
    try {
      const agendamentos = await listarAgendamentos(req.auth);
      return res.json(agendamentos);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao listar agendamentos." });
    }
  };
  criar = async (req, res) => {
    try {
      const { servicoId, data, hora, observacao, tokenConfirmacaoRepeticao } =
        req.body;
      const { profissionalId } = req.body;
      validarDadosCriacao({ profissionalId, servicoId, data, hora });
      const agendamento = await criarAgendamento({
        usuarioAutenticadoId: req.auth.sub,
        nivelUsuario: req.auth.nivel,
        usuarioId: req.body.usuarioId,
        profissionalId,
        servicoId,
        data,
        hora,
        observacao,
        tokenConfirmacaoRepeticao,
      });
      void notificacaoService.enviarSeAutomatico(agendamento.id, "CRIACAO");
      return res.status(201).json(agendamento);
    } catch (error) {
      if (error instanceof ValidacaoAgendamentoError)
        return responderValidacao(res, error);
      if (
        error instanceof Error &&
        error.message === "CONFIRMACAO_REPETICAO_EXPIRADA"
      )
        return res
          .status(409)
          .json({
            codigo: "CONFIRMACAO_REPETICAO_EXPIRADA",
            error:
              "O tempo para confirmar este agendamento expirou. Faça uma nova tentativa.",
          });
      if (
        error instanceof Error &&
        error.message === "CONFIRMACAO_REPETICAO_INVALIDA"
      )
        return res
          .status(409)
          .json({
            codigo: "CONFIRMACAO_REPETICAO_INVALIDA",
            error: "A confirmação não corresponde a este agendamento.",
          });
      if (
        error instanceof Error &&
        error.message === "CONFIRMACAO_REPETICAO_NECESSARIA"
      )
        return res
          .status(409)
          .json({
            codigo: "CONFIRMACAO_REPETICAO_NECESSARIA",
            possuiPossivelRepeticao: true,
            agendamentosRelacionados: error.agendamentosRelacionados,
            tokenConfirmacaoRepeticao: error.tokenConfirmacaoRepeticao,
          });
      if (
        error instanceof Error &&
        error.message === "Nenhum funcionário disponível para este horário."
      )
        return res.status(409).json({ error: error.message });
      if (
        error instanceof Error &&
        error.message === "Cliente, profissional ou serviço indisponível."
      )
        return res.status(400).json({ error: error.message });
      if (
        error instanceof Error &&
        error.message ===
          "Conclua seu cadastro antes de realizar um agendamento."
      )
        return res.status(403).json({ error: error.message });
      if (error instanceof HorarioIndisponivelError) {
        return res.status(409).json({ error: error.message });
      }
      if (conflitoDeAgenda(error)) return responderConflitoDeAgenda(res);
      console.error(error);
      return res.status(500).json({ error: "Erro ao criar agendamento." });
    }
  };
  cancelar = async (req, res) => {
    try {
      const agendamento = await prepararCancelamento(
        String(req.params.id),
        req.auth,
      );
      // Cancelar só libera um horário; não reserva intervalo nem cria sobreposição.
      // Por isso não exige advisory lock: a próxima reserva já revalida a agenda sob lock.
      const atualizado = await cancelarAgendamento(agendamento, req.auth.sub);
      void notificacaoService.enviarSeAutomatico(
        agendamento.id,
        "CANCELAMENTO",
      );
      return res.json(atualizado);
    } catch (error) {
      if (error instanceof ValidacaoAgendamentoError)
        return responderValidacao(res, error);
      throw error;
    }
  };
  historico = async (req, res) => {
    try {
      return res.json(
        await consultarHistoricoAgendamento(String(req.params.id), req.auth),
      );
    } catch (error) {
      if (error instanceof ValidacaoAgendamentoError)
        return responderValidacao(res, error);
      throw error;
    }
  };
  remarcar = async (req, res) => {
    try {
      const { agendamento, dados } = await prepararRemarcacao(
        String(req.params.id),
        req.body,
        req.auth,
      );
      try {
        const atualizado = await remarcarAgendamento(
          agendamento,
          dados,
          req.auth.sub,
        );
        void notificacaoService.enviarSeAutomatico(
          agendamento.id,
          "REMARCACAO",
        );
        return res.json(atualizado);
      } catch (error) {
        if (error instanceof HorarioIndisponivelError)
          return res.status(409).json({ error: error.message });
        if (conflitoDeAgenda(error)) return responderConflitoDeAgenda(res);
        throw error;
      }
    } catch (error) {
      if (error instanceof ValidacaoAgendamentoError)
        return responderValidacao(res, error);
      throw error;
    }
  };
  alterarStatus = async (req, res) => {
    try {
      validarStatus(req.body.status);
      const agendamento = await buscarAgendamento(String(req.params.id));
      const atualizado = await atualizarStatusAgendamento(
        agendamento,
        req.body.status,
        req.auth.sub,
      );
      void notificacaoService.enviarSeAutomatico(
        agendamento.id,
        req.body.status,
      );
      return res.json(atualizado);
    } catch (error) {
      if (error instanceof ValidacaoAgendamentoError)
        return responderValidacao(res, error);
      throw error;
    }
  };
  notificar = async (req, res) => {
    const tipo = req.body.tipo;
    if (
      ![
        "CRIACAO",
        "REMARCACAO",
        "CANCELAMENTO",
        "ATUALIZACAO",
        "PENDENTE",
        "CONFIRMADO",
        "CONCLUIDO",
        "ATRASADO",
      ].includes(tipo)
    )
      return res.status(400).json({ error: "Tipo de notificação inválido." });
    try {
      await notificacaoService.podeEnviar(String(req.params.id));
      const resultado = await notificacaoService.enviar(
        String(req.params.id),
        tipo,
      );
      if (!resultado || resultado.status !== "ENVIADA") {
        return res
          .status(502)
          .json({
            error:
              resultado?.erro || "A mensagem nÃ£o foi entregue Ã  Evolution.",
          });
      }
      return res.status(201).json({ ok: true });
    } catch (error) {
      return res
        .status(400)
        .json({
          error:
            error instanceof Error
              ? error.message
              : "Não foi possível enviar a notificação.",
        });
    }
  };
  atualizar = async (req, res) => {
    try {
      const { agendamento, dadosNovos } =
        await prepararAtualizacaoAdministrativa(
          String(req.params.id),
          req.body,
        );
      try {
        const atualizado = await atualizarAgendamentoAdministrativamente(
          agendamento,
          dadosNovos,
          req.auth.sub,
        );
        return res.json(atualizado);
      } catch (error) {
        if (error instanceof HorarioIndisponivelError)
          return res.status(409).json({ error: error.message });
        if (conflitoDeAgenda(error)) return responderConflitoDeAgenda(res);
        throw error;
      }
    } catch (error) {
      if (error instanceof ValidacaoAgendamentoError)
        return responderValidacao(res, error);
      throw error;
    }
  };
  excluir = async (req, res) => {
    try {
      await excluirAgendamento(String(req.params.id));
      return res.status(204).send();
    } catch (error) {
      if (error instanceof ValidacaoAgendamentoError)
        return responderValidacao(res, error);
      throw error;
    }
  };
}
