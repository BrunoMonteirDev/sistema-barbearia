import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'wouter'
import { UserCog } from 'lucide-react'
import toast from 'react-hot-toast'
import { postgres } from '@/lib/postgres'
import { useAuth } from '@/contexts/AuthContext'

import { Funcionario, WeekdayKey } from './funcionarios/funcionarios.types'
import {
    criarHorariosVazio,
    normalizarHorarios,
} from './funcionarios/funcionarios.utils'

import { FuncionariosTable } from './funcionarios/FuncionariosTable'
import { HorariosModal } from './funcionarios/HorariosModal'
import EditarFuncionarioModal from './funcionarios/EditarFuncionarioModal'


export default function FuncionariosPage() {
    const [, setLocation] = useLocation()
    const { user, loading: authLoading } = useAuth()

    const [loading, setLoading] = useState(true)
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
    const [selectedFuncionario, setSelectedFuncionario] =
        useState<Funcionario | null>(null)
    const [funcionarioEditando, setFuncionarioEditando] =
        useState<Funcionario | null>(null)

    const [horariosEdicao, setHorariosEdicao] = useState<any>(null)
    const [diaAtivo, setDiaAtivo] = useState<WeekdayKey>('segunda')
    const [modalAberto, setModalAberto] = useState(false)
    const [copiarDeId, setCopiarDeId] = useState('')
    const [salvando, setSalvando] = useState(false)

    // ðŸ” Auth
    useEffect(() => {
        if (!authLoading && !user) setLocation('/login')
    }, [user, authLoading, setLocation])

    useEffect(() => {
        if (!authLoading && user) carregarFuncionarios()
    }, [authLoading, user])

    // âœ… BUSCAR FUNCIONÃRIOS
    async function carregarFuncionarios() {
        setLoading(true)

        const { data, error } = await postgres
            .from('funcionarios')
            .select(
                `
        id,
        usuario_id,
        horarios,
        usuario:usuarios!funcionarios_usuario_id_fkey (
          nome,
          email,
          foto
        )
      `,
            )

        if (error) {
            toast.error('Erro ao buscar funcionÃ¡rios')
            setLoading(false)
            return
        }

        const mapped: Funcionario[] = (data || []).map((f: any) => {
            const u = Array.isArray(f.usuario) ? f.usuario[0] : f.usuario
            return {
                id: f.id,
                usuario_id: f.usuario_id,
                usuario: {
                    nome: u?.nome ?? '',
                    email: u?.email ?? '',
                    foto: u?.foto ?? null,
                },
                horarios: normalizarHorarios(f.horarios),
            }
        })

        setFuncionarios(mapped)
        setLoading(false)
    }

    // âœ… ABRIR MODAL HORÃRIOS
    function abrirModalHorarios(func: Funcionario) {
        setSelectedFuncionario(func)
        setHorariosEdicao(func.horarios || criarHorariosVazio())
        setDiaAtivo('segunda')
        setCopiarDeId('')
        setModalAberto(true)
    }

    // âœ… ABRIR MODAL EDIÃ‡ÃƒO
    function abrirModalEdicao(func: Funcionario) {
        setFuncionarioEditando(func)
    }

    // âœ… TOGGLE HORÃRIO
    function toggleHorario(slot: string) {
        if (!horariosEdicao) return

        setHorariosEdicao((prev: any) => {
            const listaAtual = prev[diaAtivo] || []
            const existe = listaAtual.includes(slot)

            const novaLista = existe
                ? listaAtual.filter((h: string) => h !== slot)
                : [...listaAtual, slot].sort()

            return {
                ...prev,
                [diaAtivo]: novaLista,
            }
        })
    }

    // âœ… MARCAR TODOS
    function marcarTodosDoDia() {
        if (!horariosEdicao) return

        const ALL_SLOTS: string[] = Array.from({ length: 48 }, (_, i) => {
            const hour = Math.floor(i / 2)
            const minute = i % 2 === 0 ? 0 : 30
            return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
        })

        setHorariosEdicao((prev: any) => ({
            ...prev,
            [diaAtivo]: [...ALL_SLOTS],
        }))
    }

    // âœ… LIMPAR DIA
    function limparDia() {
        if (!horariosEdicao) return

        setHorariosEdicao((prev: any) => ({
            ...prev,
            [diaAtivo]: [],
        }))
    }

    // âœ… COPIAR DE OUTRO FUNCIONÃRIO
    function copiarDeOutroFuncionario() {
        if (!horariosEdicao || !copiarDeId) return

        const origem = funcionarios.find((f) => f.id === copiarDeId)

        if (!origem) {
            toast.error('FuncionÃ¡rio de origem nÃ£o encontrado')
            return
        }

        setHorariosEdicao(normalizarHorarios(origem.horarios))
    }

    // âœ… SALVAR HORÃRIOS
    async function salvarHorarios() {
        if (!selectedFuncionario || !horariosEdicao) return

        setSalvando(true)

        await postgres
            .from('funcionarios')
            .update({ horarios: horariosEdicao })
            .eq('id', selectedFuncionario.id)

        setFuncionarios((prev) =>
            prev.map((f) =>
                f.id === selectedFuncionario.id
                    ? { ...f, horarios: horariosEdicao }
                    : f,
            ),
        )

        setSalvando(false)
        setModalAberto(false)
    }

    const funcionariosComHorarios = useMemo(
        () => funcionarios.filter((f) => f.usuario?.nome),
        [funcionarios],
    )

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
                <UserCog />
                FuncionÃ¡rios & HorÃ¡rios
            </h2>

            <FuncionariosTable
                funcionarios={funcionariosComHorarios}
                abrirModalHorarios={abrirModalHorarios}
                abrirModalEdicao={abrirModalEdicao}
                loading={loading}
            />

            <HorariosModal
                modalAberto={modalAberto}
                selectedFuncionario={selectedFuncionario}
                horariosEdicao={horariosEdicao}
                diaAtivo={diaAtivo}
                setDiaAtivo={setDiaAtivo}
                copiarDeId={copiarDeId}
                setCopiarDeId={setCopiarDeId}
                funcionarios={funcionarios}
                marcarTodosDoDia={marcarTodosDoDia}
                limparDia={limparDia}
                copiarDeOutroFuncionario={copiarDeOutroFuncionario}
                toggleHorario={toggleHorario}
                salvarHorarios={salvarHorarios}
                salvando={salvando}
                fecharModal={() => setModalAberto(false)}
            />

            {funcionarioEditando && (
                <EditarFuncionarioModal
                    abrir={true}
                    funcionario={funcionarioEditando}
                    fechar={() => setFuncionarioEditando(null)}
                    atualizarLista={carregarFuncionarios}
                />
            )}
        </div>
    )
}

