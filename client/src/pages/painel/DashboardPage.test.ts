import { describe, expect, it } from 'vitest'
import { estadoWhatsApp, statusClass, statusLabel } from './DashboardPage'

describe('estadoWhatsApp', () => {
  it('identifica uma conexao pronta para notificacoes', () => {
    expect(estadoWhatsApp({ configurada: true, disponivel: true, instanciaCriada: true, conectada: true, instancia: 'teste', nomeExibicao: 'WhatsApp da barbearia', estado: 'open' })).toMatchObject({ titulo: 'WhatsApp conectado', conectado: true })
  })

  it('informa quando a instancia precisa ser criada ou reconectada', () => {
    expect(estadoWhatsApp({ configurada: true, disponivel: true, instanciaCriada: false, conectada: false, instancia: 'teste', nomeExibicao: null, estado: null }).titulo).toBe('Instancia nao criada')
    expect(estadoWhatsApp({ configurada: true, disponivel: true, instanciaCriada: true, conectada: false, instancia: 'teste', nomeExibicao: null, estado: 'close' }).titulo).toBe('WhatsApp desconectado')
  })

  it('identifica atendimento atrasado sem depender apenas da cor', () => {
    expect(statusLabel.ATRASADO).toBe('Atrasado')
    expect(statusClass.ATRASADO).toContain('red')
  })
})
