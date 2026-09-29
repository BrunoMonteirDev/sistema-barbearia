import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'wouter'
import toast from 'react-hot-toast'
import { ApiError, api, type AgendamentoRelacionado, type Profissional, type Servico } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

export const SEM_PREFERENCIA = 'sem-preferencia'
export const hoje = new Date().toLocaleDateString('en-CA')
export const nomesDosMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
export const diasDaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
export const anoAtual = new Date().getFullYear()
export const mesAtual = new Date().getMonth()
export const anosDisponiveis = Array.from({ length: 6 }, (_, indice) => anoAtual + indice)

function obterDadosDaRevisao() {
  const parametros = new URLSearchParams(window.location.search)
  const profissionalId = parametros.get('profissionalId')
  const servicoId = parametros.get('servicoId')
  const data = parametros.get('data')
  const hora = parametros.get('hora')
  return parametros.get('revisao') === '1' && profissionalId && servicoId && data && hora
    ? { profissionalId, servicoId, data, hora }
    : null
}

function formatarDataLocal(data: Date) {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`
}

export function useAgendamentoPublico() {
  const { user } = useAuth()
  const [, go] = useLocation()
  const voltarParaAgendamentos = new URLSearchParams(window.location.search).get('origem') === 'meus-agendamentos'
  const dadosDaRevisao = useMemo(obterDadosDaRevisao, [])
  const preservarHorarioInicial = useRef(Boolean(dadosDaRevisao))
  const [etapa, setEtapa] = useState(dadosDaRevisao ? 4 : 1)
  const [servicos, setServicos] = useState<Servico[]>([])
  const [profissionais, setProfissionais] = useState<Profissional[]>([])
  const [horarios, setHorarios] = useState<string[]>([])
  const [horariosComAvisoAntecedencia, setHorariosComAvisoAntecedencia] = useState<string[]>([])
  const [confirmacaoHorarioProximo, setConfirmacaoHorarioProximo] = useState(false)
  const [carregandoHorarios, setCarregandoHorarios] = useState(false)
  const [revisaoAceita, setRevisaoAceita] = useState(false)
  const [confirmacaoRepeticao, setConfirmacaoRepeticao] = useState<{ token: string; relacionados: AgendamentoRelacionado[]; snapshot: { profissionalId: string; servicoId: string; data: string; hora: string } } | null>(null)
  const [mesExibido, setMesExibido] = useState(() => {
    const dataInicial = dadosDaRevisao?.data ? new Date(`${dadosDaRevisao.data}T12:00:00`) : new Date()
    return new Date(dataInicial.getFullYear(), dataInicial.getMonth(), 1)
  })
  const [form, setForm] = useState(dadosDaRevisao ?? { profissionalId: '', servicoId: '', data: '', hora: '' })

  useEffect(() => {
    void Promise.all([api.servicos.list(), api.profissionais.list()])
      .then(([servicosCarregados, profissionaisCarregados]) => {
        setServicos(servicosCarregados)
        setProfissionais(profissionaisCarregados)
      })
      .catch(error => toast.error(error instanceof Error ? error.message : 'Não foi possível carregar dados do agendamento.'))
  }, [])

  const servicoSelecionado = useMemo(() => servicos.find(servico => servico.id === form.servicoId), [servicos, form.servicoId])
  const diasDoCalendario = useMemo(() => {
    const primeiroDia = new Date(mesExibido.getFullYear(), mesExibido.getMonth(), 1)
    const quantidadeDeDias = new Date(mesExibido.getFullYear(), mesExibido.getMonth() + 1, 0).getDate()
    return Array.from({ length: primeiroDia.getDay() + quantidadeDeDias }, (_, indice) => {
      const dia = indice - primeiroDia.getDay() + 1
      return dia > 0 ? new Date(mesExibido.getFullYear(), mesExibido.getMonth(), dia) : null
    })
  }, [mesExibido])
  const mesesDisponiveis = nomesDosMeses.map((nome, indice) => ({ nome, indice })).filter(({ indice }) => mesExibido.getFullYear() !== anoAtual || indice >= mesAtual)
  const mesAnteriorBloqueado = mesExibido.getFullYear() === anoAtual && mesExibido.getMonth() === mesAtual

  useEffect(() => {
    if (preservarHorarioInicial.current) preservarHorarioInicial.current = false
    else setForm(atual => ({ ...atual, hora: '' }))
    setConfirmacaoHorarioProximo(false)
    setHorarios([])
    setHorariosComAvisoAntecedencia([])
    if (!form.profissionalId || !form.servicoId || !form.data) return
    setCarregandoHorarios(true)
    api.agendamentos.disponibilidade(form.profissionalId, form.servicoId, form.data)
      .then(resultado => {
        setHorarios(resultado.horarios)
        setHorariosComAvisoAntecedencia(resultado.horariosComAvisoAntecedencia ?? [])
      })
      .catch(error => toast.error(error instanceof Error ? error.message : 'Não foi possível carregar horários.'))
      .finally(() => setCarregandoHorarios(false))
  }, [form.profissionalId, form.servicoId, form.data])

  const selecionarProfissional = (profissionalId: string) => setForm(atual => ({ ...atual, profissionalId, servicoId: '', hora: '' }))
  const selecionarServico = (servicoId: string) => setForm(atual => ({ ...atual, servicoId, hora: '' }))
  const selecionarData = (data: string) => setForm(atual => ({ ...atual, data, hora: '' }))
  const selecionarHorario = (hora: string) => {
    setForm(atual => ({ ...atual, hora }))
    setConfirmacaoHorarioProximo(false)
  }

  const avancarEtapa = () => {
    if (etapa === 1 && !form.profissionalId) return toast.error('Escolha um profissional para continuar.')
    if (etapa === 2 && !form.servicoId) return toast.error('Escolha um serviço para continuar.')
    if (etapa === 3 && !form.hora) return toast.error('Selecione um horário disponível para continuar.')
    if (etapa === 3 && form.data === hoje && horariosComAvisoAntecedencia.includes(form.hora) && !confirmacaoHorarioProximo) return toast.error('Confirme que consegue comparecer ao atendimento em cima da hora.')
    setEtapa(atual => atual + 1)
  }

  const criarAgendamento = async () => {
    if (etapa !== 4 || !revisaoAceita) return toast.error('Revise os dados do agendamento antes de confirmar.')
    const retorno = `/agendamento?${new URLSearchParams({ revisao: '1', ...form }).toString()}`
    if (!user) return go(`/login?retorno=${encodeURIComponent(retorno)}`)
    if (user.cadastroConcluido === false) {
      toast.error('Conclua seu cadastro antes de confirmar um agendamento.')
      return go(`/concluir-cadastro?retorno=${encodeURIComponent(retorno)}`)
    }
    if (!horarios.includes(form.hora)) return toast.error('Selecione um horário disponível.')
    try {
      await api.agendamentos.create(form)
      toast.success('Agendamento criado.')
      go('/minha-conta')
    } catch (error) {
      if (error instanceof ApiError && error.codigo === 'CONFIRMACAO_REPETICAO_NECESSARIA' && error.tokenConfirmacaoRepeticao) {
        setConfirmacaoRepeticao({ token: error.tokenConfirmacaoRepeticao, relacionados: error.agendamentosRelacionados ?? [], snapshot: { ...form } })
        return
      }
      toast.error(error instanceof Error ? error.message : 'Não foi possível agendar.')
    }
  }

  const confirmarRepeticao = async () => {
    if (!confirmacaoRepeticao) return
    try {
      await api.agendamentos.create({ ...confirmacaoRepeticao.snapshot, tokenConfirmacaoRepeticao: confirmacaoRepeticao.token })
      toast.success('Agendamento criado.')
      setConfirmacaoRepeticao(null)
      go('/minha-conta')
    } catch (error) {
      if (error instanceof ApiError && ['CONFIRMACAO_REPETICAO_EXPIRADA', 'CONFIRMACAO_REPETICAO_INVALIDA'].includes(error.codigo ?? '')) setConfirmacaoRepeticao(null)
      toast.error(error instanceof Error ? error.message : 'Não foi possível agendar.')
    }
  }

  const voltar = () => go(voltarParaAgendamentos ? '/minha-conta/agendamentos' : '/')

  return { user, etapa, setEtapa, servicos, profissionais, horarios, horariosComAvisoAntecedencia, confirmacaoHorarioProximo, setConfirmacaoHorarioProximo, carregandoHorarios, revisaoAceita, setRevisaoAceita, confirmacaoRepeticao, setConfirmacaoRepeticao, mesExibido, setMesExibido, form, servicoSelecionado, diasDoCalendario, mesesDisponiveis, mesAnteriorBloqueado, selecionarProfissional, selecionarServico, selecionarData, selecionarHorario, avancarEtapa, criarAgendamento, confirmarRepeticao, voltar }
}

export { formatarDataLocal }
