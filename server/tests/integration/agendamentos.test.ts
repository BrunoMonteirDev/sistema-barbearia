import request from 'supertest'
import bcrypt from 'bcryptjs'
import { beforeEach, describe, expect, it } from 'vitest'
import { app } from '../../src/app'
import { prisma } from '../../src/lib/prisma'
import { signToken } from '../../src/middlewares/auth'

const dataTeste = '2030-08-05' // segunda-feira

describe('API - conflito real de agendamento', () => {
  beforeEach(async () => {
    await prisma.notificacaoAgendamento.deleteMany()
    await prisma.historicoAgendamento.deleteMany()
    await prisma.agendamento.deleteMany()
    await prisma.disponibilidadeProfissional.deleteMany()
    await prisma.profissional.deleteMany()
    await prisma.servico.deleteMany()
    await prisma.usuario.deleteMany()
    await prisma.configuracao.deleteMany()
  })

  it('recusa um segundo atendimento que ocupa o mesmo intervalo do profissional', async () => {
    const cliente = await prisma.usuario.create({ data: { nome: 'Cliente de teste', email: 'cliente.integracao@teste.local', senhaHash: 'hash' } })
    const profissional = await prisma.profissional.create({ data: { nome: 'Profissional de teste' } })
    const servico = await prisma.servico.create({ data: { nome: 'Servico de 60 minutos', duracao: 60, preco: 50 } })
    await prisma.disponibilidadeProfissional.createMany({ data: [
      { profissionalId: profissional.id, diaSemana: 1, hora: '10:00' },
      { profissionalId: profissional.id, diaSemana: 1, hora: '10:30' },
      { profissionalId: profissional.id, diaSemana: 1, hora: '11:00' },
    ] })
    const authorization = `Bearer ${signToken({ id: cliente.id, nivel: 'Cliente' })}`
    const dados = { profissionalId: profissional.id, servicoId: servico.id, data: dataTeste, hora: '10:00' }

    await request(app).post('/api/agendamentos').set('authorization', authorization).send(dados).expect(201)
    const resposta = await request(app).post('/api/agendamentos').set('authorization', authorization).send(dados).expect(409)

    expect(resposta.body.error).toMatch(/n.o est.*dispon.vel/i)
    expect(await prisma.agendamento.count()).toBe(1)
  })

  it('permite que o administrador cancele fora da antecedencia e registra o historico', async () => {
    const cliente = await prisma.usuario.create({ data: { nome: 'Cliente de teste', email: 'cliente.cancelamento@teste.local', senhaHash: 'hash' } })
    const administrador = await prisma.usuario.create({ data: { nome: 'Admin de teste', email: 'admin.cancelamento@teste.local', senhaHash: 'hash', nivel: 'Administrador' } })
    const profissional = await prisma.profissional.create({ data: { nome: 'Profissional de teste' } })
    const servico = await prisma.servico.create({ data: { nome: 'Servico de teste', duracao: 30, preco: 30 } })
    const agendamento = await prisma.agendamento.create({ data: { usuarioId: cliente.id, profissionalId: profissional.id, servicoId: servico.id, data: '2020-01-01', hora: '10:00', status: 'CONFIRMADO' } })
    const authorization = `Bearer ${signToken({ id: administrador.id, nivel: 'Administrador' })}`

    await request(app).patch(`/api/agendamentos/${agendamento.id}/cancelar`).set('authorization', authorization).expect(200)

    expect((await prisma.agendamento.findUnique({ where: { id: agendamento.id } }))?.status).toBe('CANCELADO')
    expect(await prisma.historicoAgendamento.findFirst({ where: { agendamentoId: agendamento.id, autorId: administrador.id, tipo: 'CANCELAMENTO' } })).toBeTruthy()
  })

  it('impede que um cliente cancele o agendamento de outra pessoa', async () => {
    const dono = await prisma.usuario.create({ data: { nome: 'Dono do horario', email: 'dono.permissao@teste.local', senhaHash: 'hash' } })
    const outroCliente = await prisma.usuario.create({ data: { nome: 'Outro cliente', email: 'outro.permissao@teste.local', senhaHash: 'hash' } })
    const profissional = await prisma.profissional.create({ data: { nome: 'Profissional de teste' } })
    const servico = await prisma.servico.create({ data: { nome: 'Servico de teste', duracao: 30, preco: 30 } })
    const agendamento = await prisma.agendamento.create({ data: { usuarioId: dono.id, profissionalId: profissional.id, servicoId: servico.id, data: '2030-08-05', hora: '10:00', status: 'CONFIRMADO' } })
    const authorization = `Bearer ${signToken({ id: outroCliente.id, nivel: 'Cliente' })}`

    await request(app).patch(`/api/agendamentos/${agendamento.id}/cancelar`).set('authorization', authorization).expect(403)

    expect((await prisma.agendamento.findUnique({ where: { id: agendamento.id } }))?.status).toBe('CONFIRMADO')
    expect(await prisma.historicoAgendamento.count()).toBe(0)
  })

  it('permite que o cliente remarque o proprio horario disponivel e registra o historico', async () => {
    const cliente = await prisma.usuario.create({ data: { nome: 'Cliente de remarcacao', email: 'cliente.remarcacao@teste.local', senhaHash: 'hash' } })
    const profissional = await prisma.profissional.create({ data: { nome: 'Profissional de teste' } })
    const servico = await prisma.servico.create({ data: { nome: 'Servico de teste', duracao: 30, preco: 30 } })
    await prisma.disponibilidadeProfissional.createMany({ data: [
      { profissionalId: profissional.id, diaSemana: 1, hora: '10:00' },
      { profissionalId: profissional.id, diaSemana: 1, hora: '10:30' },
      { profissionalId: profissional.id, diaSemana: 1, hora: '11:00' },
    ] })
    const agendamento = await prisma.agendamento.create({ data: { usuarioId: cliente.id, profissionalId: profissional.id, servicoId: servico.id, data: dataTeste, hora: '10:00', status: 'CONFIRMADO' } })
    const authorization = `Bearer ${signToken({ id: cliente.id, nivel: 'Cliente' })}`

    await request(app).patch(`/api/agendamentos/${agendamento.id}/remarcar`).set('authorization', authorization).send({ data: dataTeste, hora: '11:00' }).expect(200)

    expect((await prisma.agendamento.findUnique({ where: { id: agendamento.id } }))?.hora).toBe('11:00')
    expect(await prisma.historicoAgendamento.findFirst({ where: { agendamentoId: agendamento.id, autorId: cliente.id, tipo: 'REMARCACAO' } })).toBeTruthy()
  })

  it('aplica senha forte no cadastro e gera sessao somente para conta ativa', async () => {
    await request(app).post('/api/auth/register').send({ nome: 'Senha fraca', email: 'senha.fraca@teste.local', password: '123' }).expect(400)
    expect(await prisma.usuario.findUnique({ where: { email: 'senha.fraca@teste.local' } })).toBeNull()

    const cadastro = await request(app).post('/api/auth/register').send({ nome: 'Conta ativa', email: 'conta.ativa@teste.local', password: 'SenhaForte!9', telefone: '44999999999' }).expect(201)
    expect(cadastro.body.token).toEqual(expect.any(String))
    const usuario = await prisma.usuario.findUnique({ where: { email: 'conta.ativa@teste.local' } })
    expect(usuario?.senhaHash).not.toBe('SenhaForte!9')
    expect(await bcrypt.compare('SenhaForte!9', usuario!.senhaHash!)).toBe(true)

    await request(app).post('/api/auth/login').send({ email: 'conta.ativa@teste.local', password: 'SenhaForte!9' }).expect(200)
    await prisma.usuario.update({ where: { id: usuario!.id }, data: { ativo: false } })
    await request(app).post('/api/auth/login').send({ email: 'conta.ativa@teste.local', password: 'SenhaForte!9' }).expect(401)
  })

  it('conclui o cadastro pendente e libera os dados da conta Google', async () => {
    const usuarioPendente = await prisma.usuario.create({
      data: {
        nome: 'Pessoa Google',
        email: 'google.pendente@teste.local',
        senhaHash: null,
        provedorAuth: 'GOOGLE',
        googleSubject: 'google-subject-de-teste',
        cadastroConcluido: false
      }
    })
    const authorization = `Bearer ${signToken({ id: usuarioPendente.id, nivel: 'Cliente' })}`

    const resposta = await request(app)
      .put('/api/usuarios/me/concluir-cadastro')
      .set('authorization', authorization)
      .send({ nome: 'Pessoa Google Completa', telefone: '(44) 99999-9999' })
      .expect(200)

    expect(resposta.body).toMatchObject({
      id: usuarioPendente.id,
      nome: 'Pessoa Google Completa',
      telefone: '44999999999',
      cadastroConcluido: true
    })
    expect(await prisma.usuario.findUnique({ where: { id: usuarioPendente.id } })).toMatchObject({
      cadastroConcluido: true,
      telefone: '44999999999'
    })
  })

  it('impede a criacao de agendamento enquanto o cadastro Google estiver pendente', async () => {
    const cliente = await prisma.usuario.create({
      data: {
        nome: 'Cliente pendente',
        email: 'cliente.google.pendente@teste.local',
        senhaHash: null,
        provedorAuth: 'GOOGLE',
        googleSubject: 'google-pendente-agendamento',
        cadastroConcluido: false
      }
    })
    const profissional = await prisma.profissional.create({ data: { nome: 'Profissional de teste' } })
    const servico = await prisma.servico.create({ data: { nome: 'Servico de teste', duracao: 30, preco: 30 } })
    await prisma.disponibilidadeProfissional.create({ data: { profissionalId: profissional.id, diaSemana: 1, hora: '10:00' } })
    const authorization = `Bearer ${signToken({ id: cliente.id, nivel: 'Cliente' })}`

    const resposta = await request(app)
      .post('/api/agendamentos')
      .set('authorization', authorization)
      .send({ profissionalId: profissional.id, servicoId: servico.id, data: dataTeste, hora: '10:00' })
      .expect(403)

    expect(resposta.body.error).toMatch(/conclua seu cadastro/i)
    expect(await prisma.agendamento.count()).toBe(0)
  })

  it('marca atendimento passado como atrasado conforme a tolerancia configurada', async () => {
    const cliente = await prisma.usuario.create({ data: { nome: 'Cliente atraso', email: 'cliente.atraso@teste.local', senhaHash: 'hash' } })
    const profissional = await prisma.profissional.create({ data: { nome: 'Profissional de teste' } })
    const servico = await prisma.servico.create({ data: { nome: 'Servico de teste', duracao: 30, preco: 30 } })
    const agendamento = await prisma.agendamento.create({ data: { usuarioId: cliente.id, profissionalId: profissional.id, servicoId: servico.id, data: '2020-01-01', hora: '10:00', status: 'CONFIRMADO' } })
    await prisma.configuracao.create({ data: { toleranciaAtrasoMinutos: 0 } })
    const authorization = `Bearer ${signToken({ id: cliente.id, nivel: 'Cliente' })}`

    const resposta = await request(app).get('/api/agendamentos').set('authorization', authorization).expect(200)

    expect(resposta.body[0]).toMatchObject({ id: agendamento.id, status: 'ATRASADO' })
    expect((await prisma.agendamento.findUnique({ where: { id: agendamento.id } }))?.status).toBe('ATRASADO')
  })

  it('bloqueia remarcacao do cliente fora da antecedencia configurada', async () => {
    const cliente = await prisma.usuario.create({ data: { nome: 'Cliente prazo', email: 'cliente.prazo@teste.local', senhaHash: 'hash' } })
    const profissional = await prisma.profissional.create({ data: { nome: 'Profissional de teste' } })
    const servico = await prisma.servico.create({ data: { nome: 'Servico de teste', duracao: 30, preco: 30 } })
    const agendamento = await prisma.agendamento.create({ data: { usuarioId: cliente.id, profissionalId: profissional.id, servicoId: servico.id, data: '2020-01-01', hora: '10:00', status: 'CONFIRMADO' } })
    await prisma.configuracao.create({ data: { antecedenciaRemarcacaoHoras: 24 } })
    const authorization = `Bearer ${signToken({ id: cliente.id, nivel: 'Cliente' })}`

    await request(app).patch(`/api/agendamentos/${agendamento.id}/remarcar`).set('authorization', authorization).send({ data: '2030-08-05', hora: '11:00' }).expect(400)

    expect((await prisma.agendamento.findUnique({ where: { id: agendamento.id } }))?.data).toBe('2020-01-01')
    expect(await prisma.historicoAgendamento.count()).toBe(0)
  })

  it('bloqueia cancelamento do cliente fora da antecedencia configurada', async () => {
    const cliente = await prisma.usuario.create({ data: { nome: 'Cliente cancelamento', email: 'cliente.cancelamento.prazo@teste.local', senhaHash: 'hash' } })
    const profissional = await prisma.profissional.create({ data: { nome: 'Profissional de teste' } })
    const servico = await prisma.servico.create({ data: { nome: 'Servico de teste', duracao: 30, preco: 30 } })
    const agendamento = await prisma.agendamento.create({ data: { usuarioId: cliente.id, profissionalId: profissional.id, servicoId: servico.id, data: '2020-01-01', hora: '10:00', status: 'CONFIRMADO' } })
    await prisma.configuracao.create({ data: { antecedenciaCancelamentoHoras: 24 } })
    const authorization = `Bearer ${signToken({ id: cliente.id, nivel: 'Cliente' })}`

    await request(app).patch(`/api/agendamentos/${agendamento.id}/cancelar`).set('authorization', authorization).expect(400)

    expect((await prisma.agendamento.findUnique({ where: { id: agendamento.id } }))?.status).toBe('CONFIRMADO')
    expect(await prisma.historicoAgendamento.count()).toBe(0)
  })

  it('permite ao administrador atualizar status e registra historico auditavel', async () => {
    const cliente = await prisma.usuario.create({ data: { nome: 'Cliente status', email: 'cliente.status@teste.local', senhaHash: 'hash' } })
    const administrador = await prisma.usuario.create({ data: { nome: 'Admin status', email: 'admin.status@teste.local', senhaHash: 'hash', nivel: 'Administrador' } })
    const profissional = await prisma.profissional.create({ data: { nome: 'Profissional de teste' } })
    const servico = await prisma.servico.create({ data: { nome: 'Servico de teste', duracao: 30, preco: 30 } })
    const agendamento = await prisma.agendamento.create({ data: { usuarioId: cliente.id, profissionalId: profissional.id, servicoId: servico.id, data: dataTeste, hora: '10:00', status: 'PENDENTE' } })
    const authorization = `Bearer ${signToken({ id: administrador.id, nivel: 'Administrador' })}`

    await request(app).patch(`/api/agendamentos/${agendamento.id}/status`).set('authorization', authorization).send({ status: 'CONFIRMADO' }).expect(200)

    expect((await prisma.agendamento.findUnique({ where: { id: agendamento.id } }))?.status).toBe('CONFIRMADO')
    expect(await prisma.historicoAgendamento.findFirst({ where: { agendamentoId: agendamento.id, autorId: administrador.id, tipo: 'ATUALIZACAO_STATUS' } })).toBeTruthy()
  })

  it('impede cliente de atualizar status diretamente', async () => {
    const cliente = await prisma.usuario.create({ data: { nome: 'Cliente sem permissao', email: 'cliente.sem.permissao@teste.local', senhaHash: 'hash' } })
    const profissional = await prisma.profissional.create({ data: { nome: 'Profissional de teste' } })
    const servico = await prisma.servico.create({ data: { nome: 'Servico de teste', duracao: 30, preco: 30 } })
    const agendamento = await prisma.agendamento.create({ data: { usuarioId: cliente.id, profissionalId: profissional.id, servicoId: servico.id, data: dataTeste, hora: '10:00', status: 'PENDENTE' } })
    const authorization = `Bearer ${signToken({ id: cliente.id, nivel: 'Cliente' })}`

    await request(app).patch(`/api/agendamentos/${agendamento.id}/status`).set('authorization', authorization).send({ status: 'CONFIRMADO' }).expect(403)

    expect((await prisma.agendamento.findUnique({ where: { id: agendamento.id } }))?.status).toBe('PENDENTE')
  })
})
