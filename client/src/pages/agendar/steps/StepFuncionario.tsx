import { useState, useEffect } from "react";
import { postgres } from "@/lib/postgres";

interface Props {
  formData: any;
  handleChange: (e: any) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export default function StepFuncionario({
  formData,
  handleChange,
  nextStep,
  prevStep,
}: Props) {
  const [funcionarios, setFuncionarios] = useState<any[]>([]);

  useEffect(() => {
    postgres
      .from("funcionarios")
      .select(`id,horarios,usuario:usuarios!funcionarios_usuario_id_fkey (nome, foto)`)
      .eq("usuario.nivel", "Funcionario")
      .eq("usuario.ativo", true)
      .then(({ data }) => setFuncionarios(data ?? []));
  }, []);

  return (
    <div className="card">
      <h3 className="text-xl font-semibold mb-6">Escolha o profissional</h3>

      <div className="grid grid-cols-3 gap-4">
        {funcionarios.map((f: any) => (
          <label
            key={f.id}
            className={`p-4 border-2 rounded-lg cursor-pointer text-center ${formData.funcionario === f.id
              ? "border-primary-500 bg-primary-50"
              : "border-gray-200"
              }`}
          >
            <input
              type="radio"
              name="funcionario"
              value={f.id}
              checked={formData.funcionario === f.id}
              onChange={handleChange}
              className="sr-only"
            />

            <div className="font-medium">{f.usuario.nome}</div>
          </label>
        ))}
      </div>

      <div className="flex justify-between mt-6">
        <button type="button" onClick={prevStep} className="btn-secondary">
          Voltar
        </button>
        <button
          type="button"
          disabled={!formData.funcionario}
          onClick={nextStep}
          className="btn-primary"
        >
          PrÃ³ximo
        </button>
      </div>
    </div>
  );
}

