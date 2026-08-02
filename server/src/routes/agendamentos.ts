import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAdmin, requireStaff } from "../middlewares/auth";
import {
  escolherPrimeiroProfissionalDisponivel,
  isValidBlock,
  listarHorariosDisponiveis,
  obterBlocos,
  validarDisponibilidade,
} from "../services/horarios.service";
import { atualizarAtrasados, regrasAgendamento, respeitaAntecedencia } from "../services/regras-agendamento.service";
import { notificacaoService } from '../services/notificacao.service';

const router = Router();
const appointmentStatuses = [
  "PENDENTE",
  "CONFIRMADO",
  "CONCLUIDO",
  "CANCELADO",
  "ATRASADO",
];

function isValidDate(value: unknown) {
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

function isValidTime(value: unknown) {
  return isValidBlock(value);
}

function isValidStatus(value: unknown) {
  return typeof value === "string" && appointmentStatuses.includes(value);
}

async function hasAvailableProfessionalAndService(
  profissionalId: string,
  servicoId: string,
) {
  const [profissional, servico] = await Promise.all([
    prisma.profissional.findFirst({
      where: { id: profissionalId, ativo: true },
    }),
    prisma.servico.findFirst({ where: { id: servicoId, ativo: true } }),
  ]);

  return Boolean(profissional && servico);
}

router.get("/", async (req, res) => {
  try {
    await atualizarAtrasados();
    const agendamentos = await prisma.agendamento.findMany({
      where:
        req.auth!.nivel === "Administrador"
          ? undefined
          : { usuarioId: req.auth!.sub },
      include: { usuario: true, profissional: true, servico: true },
      orderBy: { createdAt: "desc" },
    });
    return res.json(agendamentos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao listar agendamentos." });
  }
});

router.post("/", async (req, res) => {
  try {
    const { servicoId, data, hora, observacao } = req.body;
    let { profissionalId } = req.body;
    if (
      (profissionalId !== "sem-preferencia" &&
        typeof profissionalId !== "string") ||
      typeof servicoId !== "string" ||
      !isValidDate(data) ||
      !isValidTime(hora)
    ) {
      return res
        .status(400)
        .json({
          error:
            "Profissional, serviço, data e hora em blocos de 30 minutos são obrigatórios.",
        });
    }

    if (profissionalId === "sem-preferencia") {
      profissionalId = await escolherPrimeiroProfissionalDisponivel(
        servicoId,
        data,
        hora,
      );
      if (!profissionalId)
        return res
          .status(409)
          .json({ error: "Nenhum funcionário disponível para este horário." });
    }

    const usuarioId =
      req.auth!.nivel === "Administrador" &&
      typeof req.body.usuarioId === "string"
        ? req.body.usuarioId
        : req.auth!.sub;
    const [disponivel, usuario] = await Promise.all([
      hasAvailableProfessionalAndService(profissionalId, servicoId),
      prisma.usuario.findFirst({ where: { id: usuarioId, ativo: true } }),
    ]);
    if (!disponivel || !usuario)
      return res
        .status(400)
        .json({ error: "Cliente, profissional ou serviço indisponível." });

    if (usuario.cadastroConcluido === false)
      return res.status(403).json({
        error: "Conclua seu cadastro antes de realizar um agendamento.",
      });

    const horarioDisponivel = await validarDisponibilidade(
      profissionalId,
      servicoId,
      data,
      hora,
    );
    if (!horarioDisponivel)
      return res
        .status(409)
        .json({
          error: "Este horário não está disponível para a duração do serviço.",
        });

    const agendamento = await prisma.agendamento.create({
      data: { usuarioId, profissionalId, servicoId, data, hora, observacao },
    });
    void notificacaoService.enviarSeAutomatico(agendamento.id, 'CRIACAO');
    return res.status(201).json(agendamento);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao criar agendamento." });
  }
});

router.get("/disponibilidade", async (req, res) => {
  const { profissionalId, servicoId, data, ignorarAgendamentoId } = req.query;
  if (
    typeof profissionalId !== "string" ||
    typeof servicoId !== "string" ||
    !isValidDate(data)
  )
    return res
      .status(400)
      .json({
        error: "Profissional, serviço e data válidos são obrigatórios.",
      });
  const dataAgendamento = data as string;
  if (profissionalId === "sem-preferencia") {
    const horarios: string[] = [];
    for (const hora of obterBlocos()) {
      if (
        await escolherPrimeiroProfissionalDisponivel(
          servicoId,
          dataAgendamento,
          hora,
        )
      )
        horarios.push(hora);
    }
    return res.json({ horarios });
  }
  let agendamentoIgnorado: string | undefined;
  if (typeof ignorarAgendamentoId === "string") {
    const agendamento = await prisma.agendamento.findUnique({ where: { id: ignorarAgendamentoId } });
    if (!agendamento || (req.auth!.nivel !== "Administrador" && agendamento.usuarioId !== req.auth!.sub))
      return res.status(403).json({ error: "Sem permissão para remarcar este agendamento." });
    agendamentoIgnorado = agendamento.id;
  }
  const horarios = await listarHorariosDisponiveis(
    profissionalId,
    servicoId,
    dataAgendamento,
    agendamentoIgnorado,
  );
  return res.json({ horarios });
});

router.patch("/:id/cancelar", async (req, res) => {
  const agendamento = await prisma.agendamento.findUnique({
    where: { id: String(req.params.id) },
  });
  if (!agendamento)
    return res.status(404).json({ error: "Agendamento não encontrado." });
  if (
    req.auth!.nivel !== "Administrador" &&
    agendamento.usuarioId !== req.auth!.sub
  )
    return res
      .status(403)
      .json({ error: "Sem permissão para cancelar este agendamento." });
  if (req.auth!.nivel !== "Administrador") {
    const regras = await regrasAgendamento();
    if (!respeitaAntecedencia(agendamento.data, agendamento.hora, regras.antecedenciaCancelamentoHoras)) return res.status(400).json({ error: `Cancelamento permitido com pelo menos ${regras.antecedenciaCancelamentoHoras} horas de antecedência.` });
  }
  const atualizado = await prisma.agendamento.update({ where: { id: agendamento.id }, data: { status: "CANCELADO" } });
  await prisma.historicoAgendamento.create({ data: { agendamentoId: agendamento.id, autorId: req.auth!.sub, tipo: "CANCELAMENTO", dadosAnteriores: { status: agendamento.status }, dadosNovos: { status: "CANCELADO" } } });
  void notificacaoService.enviarSeAutomatico(agendamento.id, 'CANCELAMENTO');
  return res.json(atualizado);
});

router.get("/:id/historico", async (req, res) => {
  const agendamento = await prisma.agendamento.findUnique({ where: { id: String(req.params.id) } });
  if (!agendamento) return res.status(404).json({ error: "Agendamento não encontrado." });
  if (req.auth!.nivel !== "Administrador" && agendamento.usuarioId !== req.auth!.sub) return res.status(403).json({ error: "Sem permissão." });
  return res.json(await prisma.historicoAgendamento.findMany({ where: { agendamentoId: agendamento.id }, orderBy: { createdAt: "desc" } }));
});

router.patch("/:id/remarcar", async (req, res) => {
  const agendamento = await prisma.agendamento.findUnique({ where: { id: String(req.params.id) } });
  if (!agendamento) return res.status(404).json({ error: "Agendamento não encontrado." });
  const admin = req.auth!.nivel === "Administrador";
  if (!admin && agendamento.usuarioId !== req.auth!.sub) return res.status(403).json({ error: "Sem permissão." });
  if (!admin) { const regras = await regrasAgendamento(); if (!respeitaAntecedencia(agendamento.data, agendamento.hora, regras.antecedenciaRemarcacaoHoras)) return res.status(400).json({ error: `Remarcação permitida com pelo menos ${regras.antecedenciaRemarcacaoHoras} horas de antecedência.` }); }
  const { data, hora } = req.body;
  const profissionalId = typeof req.body.profissionalId === "string" ? req.body.profissionalId : agendamento.profissionalId;
  const servicoId = typeof req.body.servicoId === "string" ? req.body.servicoId : agendamento.servicoId;
  if (!isValidDate(data) || !isValidTime(hora) || !(await hasAvailableProfessionalAndService(profissionalId, servicoId))) return res.status(400).json({ error: "Dados da remarcação inválidos." });
  if (!(await validarDisponibilidade(profissionalId, servicoId, data, hora, agendamento.id))) return res.status(409).json({ error: "Este horário não está disponível." });
  const atualizado = await prisma.agendamento.update({ where: { id: agendamento.id }, data: { data, hora, profissionalId, servicoId } });
  await prisma.historicoAgendamento.create({ data: { agendamentoId: agendamento.id, autorId: req.auth!.sub, tipo: "REMARCACAO", dadosAnteriores: { data: agendamento.data, hora: agendamento.hora, profissionalId: agendamento.profissionalId, servicoId: agendamento.servicoId }, dadosNovos: { data, hora, profissionalId, servicoId } } });
  void notificacaoService.enviarSeAutomatico(agendamento.id, 'REMARCACAO');
  return res.json(atualizado);
});

router.patch("/:id/status", requireAdmin, async (req, res) => {
  if (!isValidStatus(req.body.status))
    return res.status(400).json({ error: "Status inválido." });
  const agendamento = await prisma.agendamento.findUnique({ where: { id: String(req.params.id) } });
  if (!agendamento) return res.status(404).json({ error: "Agendamento não encontrado." });
  const atualizado = await prisma.agendamento.update({ where: { id: agendamento.id }, data: { status: req.body.status } });
  await prisma.historicoAgendamento.create({ data: { agendamentoId: agendamento.id, autorId: req.auth!.sub, tipo: "ATUALIZACAO_STATUS", dadosAnteriores: { status: agendamento.status }, dadosNovos: { status: req.body.status } } });
  void notificacaoService.enviarSeAutomatico(agendamento.id, req.body.status);
  return res.json(atualizado);
});

router.post('/:id/notificar', requireStaff, async (req, res) => {
  const tipo = req.body.tipo
  if (!['CRIACAO', 'REMARCACAO', 'CANCELAMENTO', 'ATUALIZACAO', 'PENDENTE', 'CONFIRMADO', 'CONCLUIDO', 'ATRASADO'].includes(tipo)) return res.status(400).json({ error: 'Tipo de notificação inválido.' })
  try {
    await notificacaoService.podeEnviar(String(req.params.id))
    const resultado = await notificacaoService.enviar(String(req.params.id), tipo)
    if (!resultado || resultado.status !== 'ENVIADA') {
      return res.status(502).json({ error: resultado?.erro || 'A mensagem nÃ£o foi entregue Ã  Evolution.' })
    }
    return res.status(201).json({ ok: true })
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : 'Não foi possível enviar a notificação.' })
  }
})

router.put("/:id", requireAdmin, async (req, res) => {
  const agendamento = await prisma.agendamento.findUnique({
    where: { id: String(req.params.id) },
  });
  if (!agendamento)
    return res.status(404).json({ error: "Agendamento não encontrado." });
  if (
    (req.body.data !== undefined && !isValidDate(req.body.data)) ||
    (req.body.hora !== undefined && !isValidTime(req.body.hora)) ||
    (req.body.status !== undefined && !isValidStatus(req.body.status))
  ) {
    return res.status(400).json({ error: "Dados de agendamento inválidos." });
  }

  const data = req.body.data ?? agendamento.data;
  const hora = req.body.hora ?? agendamento.hora;
  const profissionalId = req.body.profissionalId ?? agendamento.profissionalId;
  const servicoId = req.body.servicoId ?? agendamento.servicoId;
  if (
    typeof profissionalId !== "string" ||
    typeof servicoId !== "string" ||
    !(await hasAvailableProfessionalAndService(profissionalId, servicoId))
  ) {
    return res
      .status(400)
      .json({ error: "Profissional ou serviço indisponível." });
  }

  const horarioDisponivel = await validarDisponibilidade(
    profissionalId,
    servicoId,
    data,
    hora,
    agendamento.id,
  );
  if (!horarioDisponivel)
    return res
      .status(409)
      .json({
        error: "Este horário não está disponível para a duração do serviço.",
      });

  const dadosNovos = {
    profissionalId,
    servicoId,
    data,
    hora,
    status: req.body.status ?? agendamento.status,
    observacao: req.body.observacao ?? agendamento.observacao,
  };
  const atualizado = await prisma.agendamento.update({ where: { id: agendamento.id }, data: dadosNovos });
  await prisma.historicoAgendamento.create({ data: { agendamentoId: agendamento.id, autorId: req.auth!.sub, tipo: "ATUALIZACAO_ADMINISTRATIVA", dadosAnteriores: { profissionalId: agendamento.profissionalId, servicoId: agendamento.servicoId, data: agendamento.data, hora: agendamento.hora, status: agendamento.status, observacao: agendamento.observacao }, dadosNovos } });
  return res.json(atualizado);
});

router.delete("/:id", requireAdmin, async (req, res) => {
  const agendamento = await prisma.agendamento.findUnique({
    where: { id: String(req.params.id) },
  });
  if (!agendamento)
    return res.status(404).json({ error: "Agendamento não encontrado." });
  await prisma.agendamento.delete({ where: { id: agendamento.id } });
  return res.status(204).send();
});

export default router;
