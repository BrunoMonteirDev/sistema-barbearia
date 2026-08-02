import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { LoaderCircle, RefreshCw, Smartphone, Wifi, WifiOff } from 'lucide-react'
import { api, type EvolutionStatus } from '@/lib/api'

export default function EvolutionPage() {
  const [status, setStatus] = useState<EvolutionStatus | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)
  const atualizar = async () => { try { setStatus(await api.evolution.status()) } catch (error) { toast.error(error instanceof Error ? error.message : 'Não foi possível verificar a Evolution.') } }
  useEffect(() => { void atualizar() }, [])
  const executar = async (acao: 'criarInstancia' | 'conectar' | 'reconectar', sucesso: string) => {
    setCarregando(true)
    try {
      const resposta = await api.evolution[acao]()
      if ('base64' in resposta && resposta.base64) setQrCode(resposta.base64)
      toast.success(sucesso)
      await atualizar()
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Não foi possível concluir a ação.') } finally { setCarregando(false) }
  }
  const conectado = Boolean(status?.conectada)
  return <section className="mx-auto max-w-3xl">
    <p className="text-sm font-semibold text-primary-700">Integrações</p>
    <h1 className="mt-1 text-2xl font-bold text-slate-950">WhatsApp de notificações</h1>
    <p className="mt-2 text-slate-600">Conecte o número usado apenas para avisos de agendamento. Se a integração estiver indisponível, os agendamentos continuam funcionando normalmente.</p>
    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-3"><span className={`rounded-full p-3 ${conectado ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{conectado ? <Wifi aria-hidden="true" /> : <WifiOff aria-hidden="true" />}</span><div><h2 className="font-bold text-slate-900">Evolution API</h2><p className="text-sm text-slate-600">{!status ? 'Verificando…' : conectado ? `Conectada: ${status.instancia}` : status.disponivel ? 'Aguardando conexão do WhatsApp' : status.mensagem ?? 'Indisponível'}</p></div></div><button type="button" onClick={() => void atualizar()} className="btn-secondary inline-flex items-center gap-2"><RefreshCw className="h-4 w-4" aria-hidden="true" />Atualizar status</button></div>
      {!status?.configurada && <p className="mt-5 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">A integração não está configurada no servidor. Defina EVOLUTION_API_URL e EVOLUTION_API_KEY no ambiente do backend.</p>}
      {status?.configurada && <div className="mt-6 flex flex-wrap gap-3"><button type="button" disabled={carregando} onClick={() => void executar('criarInstancia', 'Instância criada. Escaneie o QR Code para conectar.')} className="btn-secondary">Criar instância</button><button type="button" disabled={carregando || conectado || !status.disponivel} onClick={() => void executar('conectar', 'QR Code gerado.')} className="btn-primary inline-flex items-center gap-2">{carregando ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Smartphone className="h-4 w-4" />}Conectar WhatsApp</button><button type="button" disabled={carregando || !status.disponivel} onClick={() => void executar('reconectar', 'Reconexão iniciada.')} className="btn-secondary">Reconectar</button></div>}
      {qrCode && <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-5 text-center"><h3 className="font-bold text-slate-900">Escaneie o QR Code</h3><p className="mt-1 text-sm text-slate-600">No WhatsApp: Aparelhos conectados → Conectar aparelho.</p><img className="mx-auto mt-4 h-64 w-64 rounded bg-white p-2" src={qrCode} alt="QR Code para conectar o WhatsApp" /></div>}
    </div>
    <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950"><strong>Uso previsto:</strong> confirmação, remarcação e cancelamento. Regras de frequência, lembretes e mensagens manuais serão definidas antes de qualquer disparo adicional.</div>
  </section>
}
