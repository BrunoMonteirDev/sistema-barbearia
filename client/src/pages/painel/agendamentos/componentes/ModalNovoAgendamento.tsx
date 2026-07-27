import { useState } from "react"
import { ModalAgendamentoBase } from "./ModalAgendamentoBase"

import { EtapaCliente } from "./etapas/EtapaCliente"
import { EtapaFuncionario } from "./etapas/EtapaFuncionario"
import { EtapaData } from "./etapas/EtapaData"
import { EtapaHorario } from "./etapas/EtapaHorario"

interface Cliente {
    id: string
    nome: string
}

interface Funcionario {
    id: string
    usuario: { nome: string }
}

interface Props {
    aberto: boolean
    onClose: () => void
    onSuccess: () => void
    clientes: any[]
    funcionarios: any[]
}


export function ModalNovoAgendamento({
    aberto,
    onClose,
    clientes,
    funcionarios,
}: Props) {
    // ðŸ”’ hooks SEMPRE no topo
    const [step, setStep] = useState(1)

    const [clienteId, setClienteId] = useState("")
    const [funcionarioId, setFuncionarioId] = useState("")
    const [data, setData] = useState("")
    const [hora, setHora] = useState("")

    // retorno condicional sÃ³ depois dos hooks
    if (!aberto) return null

    return (
        <ModalAgendamentoBase
            step={step}
            totalSteps={4}
            title="Novo agendamento"
            onClose={onClose}
        >
            {/* =======================
          ETAPA 1 â€” CLIENTE
      ======================= */}
            {step === 1 && (
                <EtapaCliente
                    clientes={clientes}
                    value={clienteId}
                    onSelect={(id: string) => {
                        setClienteId(id)
                        setStep(2)
                    }}
                />
            )}

            {/* =======================
          ETAPA 2 â€” FUNCIONÃRIO
      ======================= */}
            {step === 2 && (
                <EtapaFuncionario
                    funcionarios={funcionarios}
                    value={funcionarioId}
                    onSelect={(id: string) => {
                        setFuncionarioId(id)
                        setStep(3)
                    }}
                />
            )}

            {/* =======================
          ETAPA 3 â€” DATA
      ======================= */}
            {step === 3 && (
                <EtapaData
                    funcionarioId={funcionarioId}
                    value={data}
                    onSelect={(d: string) => {
                        setData(d)
                        setStep(4)
                    }}
                />
            )}

            {/* =======================
          ETAPA 4 â€” HORÃRIO
      ======================= */}
            {step === 4 && (
                <EtapaHorario
                    funcionarioId={funcionarioId}
                    data={data}
                    value={hora}
                    onSelect={(h: string) => {
                        setHora(h)

                        // 👉 aqui depois entra o INSERT no backend PostgreSQL
                        // postgres.from("agendamentos").insert(...)

                        onClose()
                    }}
                />
            )}
        </ModalAgendamentoBase>
    )
}

