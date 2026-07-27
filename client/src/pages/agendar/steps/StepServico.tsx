import { useState, useEffect } from "react";
import { postgres } from "@/lib/postgres";

interface Props {
    formData: any;
    handleChange: (e: any) => void;
    nextStep: () => void;
    prevStep: () => void;
}

export default function StepServico({
    formData,
    handleChange,
    nextStep,
    prevStep,
}: Props) {
    const [servicos, setServicos] = useState<any[]>([]);

    useEffect(() => {
        postgres.from("servicos").select("*").eq("ativo", true).then(({ data }) => {
            setServicos(data ?? []);
        });
    }, []);

    return (
        <div className="card">
            <h3 className="text-xl font-semibold mb-6">Escolha o serviÃ§o</h3>

            <div className="grid grid-cols-2 gap-4">
                {servicos.map((s: any) => (
                    <label
                        key={s.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer ${formData.servico === s.id
                                ? "border-primary-500 bg-primary-50"
                                : "border-gray-200"
                            }`}
                    >
                        <input
                            type="radio"
                            name="servico"
                            value={s.id}
                            checked={formData.servico === s.id}
                            onChange={handleChange}
                            className="sr-only"
                        />

                        <div className="font-medium">{s.nome}</div>
                        <div className="font-bold text-primary-500">
                            R$ {s.preco.toFixed(2)}
                        </div>
                    </label>
                ))}
            </div>

            <div className="flex justify-between mt-6">
                <button type="button" onClick={prevStep} className="btn-secondary">
                    Voltar
                </button>
                <button
                    type="button"
                    disabled={!formData.servico}
                    onClick={nextStep}
                    className="btn-primary"
                >
                    PrÃ³ximo
                </button>
            </div>
        </div>
    );
}

