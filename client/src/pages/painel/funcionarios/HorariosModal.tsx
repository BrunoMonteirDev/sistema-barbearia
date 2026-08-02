import { Clock, Copy, Loader2 } from 'lucide-react'
import { Funcionario, HorariosPorDia, WeekdayKey } from './funcionarios.types'

interface Props {
    modalAberto: boolean
    selectedFuncionario: Funcionario | null
    horariosEdicao: HorariosPorDia | null
    diaAtivo: WeekdayKey
    setDiaAtivo: (v: WeekdayKey) => void
    copiarDeId: string
    setCopiarDeId: (v: string) => void
    funcionarios: Funcionario[]
    marcarTodosDoDia: () => void
    limparDia: () => void
    copiarDeOutroFuncionario: () => void
    toggleHorario: (slot: string) => void
    salvarHorarios: () => void
    salvando: boolean
    fecharModal: () => void
}

const diasSemana: { key: WeekdayKey; label: string }[] = [
    { key: 'segunda', label: 'Segunda' },
    { key: 'terca', label: 'Terça' },
    { key: 'quarta', label: 'Quarta' },
    { key: 'quinta', label: 'Quinta' },
    { key: 'sexta', label: 'Sexta' },
    { key: 'sabado', label: 'Sábado' },
    { key: 'domingo', label: 'Domingo' },
]

// ✅ TODOS OS HORÁRIOS DE 00:00 ATÉ 23:30
const ALL_SLOTS: string[] = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2)
    const minute = i % 2 === 0 ? 0 : 30
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
})

export function HorariosModal({
    modalAberto,
    selectedFuncionario,
    horariosEdicao,
    diaAtivo,
    setDiaAtivo,
    copiarDeId,
    setCopiarDeId,
    funcionarios,
    marcarTodosDoDia,
    limparDia,
    copiarDeOutroFuncionario,
    toggleHorario,
    salvarHorarios,
    salvando,
    fecharModal,
}: Props) {
    if (!modalAberto || !selectedFuncionario || !horariosEdicao) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                {/* Cabeçalho */}
                <div className="px-6 py-4 border-b flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Horários de {selectedFuncionario.usuario.nome}
                        </h3>
                    </div>
                    <button onClick={fecharModal} className="text-sm text-gray-500">
                        Fechar
                    </button>
                </div>

                {/* Conteúdo */}
                <div className="px-6 py-4 flex-1 flex flex-col gap-4 overflow-hidden">
                    {/* Abas */}
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {diasSemana.map((dia) => (
                            <button
                                key={dia.key}
                                onClick={() => setDiaAtivo(dia.key)}
                                className={`px-3 py-1.5 rounded-full text-sm border ${diaAtivo === dia.key
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-gray-50'
                                    }`}
                            >
                                {dia.label}
                            </button>
                        ))}
                    </div>

                    {/* Ações rápidas */}
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={marcarTodosDoDia}
                            className="px-3 py-1.5 text-xs rounded-lg bg-secondary-500 text-white"
                        >
                            Marcar todos do dia
                        </button>

                        <button
                            onClick={limparDia}
                            className="px-3 py-1.5 text-xs rounded-lg bg-gray-200"
                        >
                            Limpar dia
                        </button>

                        <div className="flex items-center gap-2 ml-auto">
                            <select
                                value={copiarDeId}
                                onChange={(e) => setCopiarDeId(e.target.value)}
                                className="border rounded-lg text-xs px-2 py-1"
                            >
                                <option value="">Copiar horários de...</option>
                                {funcionarios
                                    .filter((f) => f.id !== selectedFuncionario.id)
                                    .map((f) => (
                                        <option key={f.id} value={f.id}>
                                            {f.usuario.nome}
                                        </option>
                                    ))}
                            </select>

                            <button
                                onClick={copiarDeOutroFuncionario}
                                disabled={!copiarDeId}
                                className="px-3 py-1.5 text-xs rounded-lg bg-primary-100 text-primary-700 disabled:opacity-50 flex items-center gap-1"
                            >
                                <Copy className="h-3 w-3" />
                                Copiar
                            </button>
                        </div>
                    </div>

                    {/* Grade de horários */}
                    <div className="border rounded-xl p-3 flex-1 overflow-y-auto">
                        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                            {ALL_SLOTS.map((slot) => {
                                const ativo = horariosEdicao[diaAtivo]?.includes(slot)

                                return (
                                    <button
                                        key={slot}
                                        onClick={() => toggleHorario(slot)}
                                        className={`text-xs py-2 px-2 rounded-lg border ${ativo
                                                ? 'bg-primary-500 text-white'
                                                : 'bg-white text-gray-700'
                                            }`}
                                    >
                                        {slot}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Rodapé */}
                <div className="px-6 py-4 border-t flex items-center justify-end gap-3">
                    <button
                        onClick={fecharModal}
                        className="px-4 py-2 text-sm rounded-lg border"
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={salvarHorarios}
                        disabled={salvando}
                        className="px-4 py-2 text-sm rounded-lg bg-primary-500 text-white flex items-center gap-2 disabled:opacity-50"
                    >
                        {salvando && <Loader2 className="h-4 w-4 animate-spin" />}
                        Salvar horários
                    </button>
                </div>
            </div>
        </div>
    )
}
