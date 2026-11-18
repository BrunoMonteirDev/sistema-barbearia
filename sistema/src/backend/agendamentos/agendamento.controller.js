import { HorarioIndisponivelError } from "./bloqueio-agenda.service.js";
import { criarAgendamento } from "./criacao-agendamento.service.js";
import {
  listarAgendamentos,
  buscarAgendamento,
  consultarHistoricoAgendamento,
} from "./consulta-agendamento.service.js";
import {
  cancelarAgendamento,
  atualizarStatusAgendamento,
  prepararCancelamento,
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
  return typeof error === "object" && error !== null && error.code === "P2002";
}

export class AgendamentoController {
  listar = async (req, res) => {
    try {
      return res.json(await listarAgendamentos(req.auth));
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao listar agendamentos." });
    }
  };

  criar = async (req, res) => {
    try {
      const { profissionalId, servicoId, data, hora, observacao, tokenConfirmacaoRepeticao } = req.body;
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
      return res.status(201).json(agendamento);
    } catch (error) {
      if (error instanceof ValidacaoAgendamentoError) return responderValidacao(res, error);
      if (error instanceof Error && error.message.startsWith("CONFIRMACAO_REPETICAO_")) {
        if (error.message === "CONFIRMACAO_REPETICAO_NECESSARIA") {
          return res.status(409).json({
            codigo: error.message,
            possuiPossivelRepeticao: true,
            agendamentosRelacionados: error.agendamentosRelacionados,
            tokenConfirmacaoRepeticao: error.tokenConfirmacaoRepeticao,
          });
        }
        const mensagens = {
          CONFIRMACAO_REPETICAO_EXPIRADA: "O tempo para confirmar este agendamento expirou. Faça uma nova tentativa.",
          CONFIRMACAO_REPETICAO_INVALIDA: "A confirmação não corresponde a este agendamento.",
        };
        return res.status(409).json({ codigo: error.message, error: mensagens[error.message] });
      }
      if (error instanceof Error && error.message.startsWith("Nenhum ")) return res.status(409).json({ error: error.message });
      if (error instanceof Error && error.message.startsWith("Cliente, ")) return res.status(400).json({ error: error.message });
      if (error instanceof Error && error.message.startsWith("Conclua ")) return res.status(403).json({ error: error.message });
      if (error instanceof HorarioIndisponivelError || conflitoDeAgenda(error)) {
        return res.status(409).json({ error: "O horário selecionado não está mais disponível." });
      }
      console.error(error);
      return res.status(500).json({ error: "Erro ao criar agendamento." });
    }
  };

  cancelar = async (req, res) => {
    try {
      const agendamento = await prepararCancelamento(String(req.params.id), req.auth);
      return res.json(await cancelarAgendamento(agendamento, req.auth.sub));
    } catch (error) {
      if (error instanceof ValidacaoAgendamentoError) return responderValidacao(res, error);
      throw error;
    }
  };

  historico = async (req, res) => {
    try {
      return res.json(await consultarHistoricoAgendamento(String(req.params.id), req.auth));
    } catch (error) {
      if (error instanceof ValidacaoAgendamentoError) return responderValidacao(res, error);
      throw error;
    }
  };

  alterarStatus = async (req, res) => {
    try {
      validarStatus(req.body.status);
      const agendamento = await buscarAgendamento(String(req.params.id));
      return res.json(await atualizarStatusAgendamento(agendamento, req.body.status, req.auth.sub));
    } catch (error) {
      if (error instanceof ValidacaoAgendamentoError) return responderValidacao(res, error);
      throw error;
    }
  };
}
