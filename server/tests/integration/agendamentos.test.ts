import request from 'supertest'
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
})
