import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { LoaderCircle, RefreshCw, Smartphone, Trash2, Unplug, Wifi, WifiOff } from 'lucide-react'
import { api, type EvolutionStatus } from '@/lib/api'

const QR_EXPIRACAO_SEGUNDOS = 30

export default function EvolutionPage() {
  const [status, setStatus] = useState<EvolutionStatus | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [segundosQr, setSegundosQr] = useState(0)
  const [nomeExibicao, setNomeExibicao] = useState('')
  const [carregando, setCarregando] = useState(false)
  const atualizar = async () => { try { const atual = await api.evolution.status(); setStatus(atual); setNomeExibicao(atual.nomeExibicao ?? '') } catch (error) { toast.error(error instanceof Error ? error.message : 'Não foi possível verificar a Evolution.') } }
  useEffect(() => { void atualizar() }, [])
  useEffect(() => {
    if (!qrCode || segundosQr <= 0) return
    const timer = window.setTimeout(() => setSegundosQr(atual => atual - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [qrCode, segundosQr])
  useEffect(() => { if (qrCode && segundosQr === 0) { setQrCode(null); toast('QR Code expirado. Gere um novo para conectar.') } }, [qrCode, segundosQr])
  const executar = async (acao: 'criarInstancia' | 'conectar' | 'reconectar', sucesso: string) => {
    setCarregando(true)
    try {
      const resposta = await api.evolution[acao]()
      if (resposta.base64) { setQrCode(resposta.base64); setSegundosQr(QR_EXPIRACAO_SEGUNDOS) }
      toast.success(sucesso)
      await atualizar()
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Não foi possível concluir a ação.') } finally { setCarregando(false) }
  }
  const desconectar = async () => { setCarregando(true); try { await api.evolution.desconectar(); setQrCode(null); toast.success('WhatsApp desconectado.'); await atualizar() } catch (error) { toast.error(error instanceof Error ? error.message : 'Não foi possível desconectar.') } finally { setCarregando(false) } }
  const excluirInstancia = async () => { if (!window.confirm('Excluir esta instância? A sessão do WhatsApp será removida.')) return; setCarregando(true); try { await api.evolution.excluirInstancia(); setQrCode(null); toast.success('Instância excluída.'); await atualizar() } catch (error) { toast.error(error instanceof Error ? error.message : 'Não foi possível excluir a instância.') } finally { setCarregando(false) } }
  const salvarNome = async () => { try { await api.evolution.atualizarNomeExibicao(nomeExibicao); toast.success('Nome exibido no sistema atualizado.'); await atualizar() } catch (error) { toast.error(error instanceof Error ? error.message : 'Não foi possível atualizar o nome.') } }
  const criarInstancia = async () => {
    if (nomeExibicao.trim().length < 2) return toast.error('Informe o nome da instância antes de criá-la.')
    setCarregando(true)
    try {
      await api.evolution.atualizarNomeExibicao(nomeExibicao)
      await api.evolution.criarInstancia()
      toast.success('Instância criada.')
      await atualizar()
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Não foi possível criar a instância.') } finally { setCarregando(false) }
  }
  const conectado = Boolean(status?.conectada)
  const criada = Boolean(status?.instanciaCriada)
  return <section className="mx-auto max-w-3xl">
    <p className="text-sm font-semibold text-primary-700">Integrações</p><h1 className="mt-1 text-2xl font-bold text-slate-950">WhatsApp de notificações</h1>
    <p className="mt-2 text-slate-600">Conecte o número usado apenas para avisos de agendamento. Se a integração estiver indisponível, os agendamentos continuam funcionando normalmente.</p>
    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <label className="mb-5 block text-sm font-semibold text-slate-800">Nome da instância no sistema<div className="mt-1 flex gap-2"><input className="input-field" value={nomeExibicao} onChange={event => setNomeExibicao(event.target.value)} placeholder="WhatsApp da barbearia" /><button type="button" onClick={() => void salvarNome()} className="btn-secondary shrink-0">Salvar nome</button></div><span className="mt-1 block text-xs font-normal text-slate-500">Informe este nome antes de criar a instância. Ele aparece somente no sistema e não altera o identificador técnico da Evolution.</span></label>
      <div className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-3"><span className={`rounded-full p-3 ${conectado ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{conectado ? <Wifi aria-hidden="true" /> : <WifiOff aria-hidden="true" />}</span><div><h2 className="font-bold text-slate-900">{nomeExibicao || 'WhatsApp da barbearia'}</h2><p className="text-sm text-slate-600">{!status ? 'Verificando…' : conectado ? 'Conectada' : criada ? 'Instância desconectada' : status.disponivel ? 'Nenhuma instância criada' : status.mensagem ?? 'Indisponível'}</p></div></div><button type="button" onClick={() => void atualizar()} className="btn-secondary inline-flex items-center gap-2"><RefreshCw className="h-4 w-4" aria-hidden="true" />Atualizar status</button></div>
      {!status?.configurada && <p className="mt-5 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">A integração não está configurada no servidor. Defina EVOLUTION_API_URL e EVOLUTION_API_KEY no ambiente do backend.</p>}
      {status?.configurada && <div className="mt-6 flex flex-wrap gap-3">
        {!criada && <button type="button" disabled={carregando || !status.disponivel || nomeExibicao.trim().length < 2} onClick={() => void criarInstancia()} className="btn-primary">Criar instância</button>}
        {criada && !conectado && status?.estado !== 'close' && <button type="button" disabled={carregando || !status.disponivel} onClick={() => void executar('conectar', 'QR Code gerado.')} className="btn-primary inline-flex items-center gap-2">{carregando ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Smartphone className="h-4 w-4" />}Conectar WhatsApp</button>}
        {criada && !conectado && status?.estado === 'close' && <button type="button" disabled={carregando || !status.disponivel} onClick={() => void executar('reconectar', 'Reconexão iniciada.')} className="btn-primary">Reconectar WhatsApp</button>}
        {conectado && <button type="button" disabled={carregando} onClick={() => void desconectar()} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"><Unplug className="h-4 w-4" />Desconectar</button>}
        {criada && !conectado && <button type="button" disabled={carregando} onClick={() => void excluirInstancia()} className="inline-flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 font-semibold text-red-700 hover:bg-red-50"><Trash2 className="h-4 w-4" />Excluir instância</button>}
      </div>}
      {qrCode && <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-5 text-center"><h3 className="font-bold text-slate-900">Escaneie o QR Code</h3><p className="mt-1 text-sm text-slate-600">No WhatsApp: Aparelhos conectados → Conectar aparelho.</p><img className="mx-auto mt-4 h-64 w-64 rounded bg-white p-2" src={qrCode} alt="QR Code para conectar o WhatsApp" /><p className="mt-3 text-sm font-semibold text-amber-800">Expira em {segundosQr}s</p></div>}
    </div>
  </section>
}
