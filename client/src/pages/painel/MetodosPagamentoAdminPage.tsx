import { useEffect, useState } from "react";
import { postgres } from "@/lib/postgres";
import toast from "react-hot-toast";

interface MetodoPagamento {
    id: string;
    tipo: string;
    apelido: string | null;
    bandeira: string | null;
    ultimos_digitos: string | null;
    ativo: boolean;
}

const METODOS_PREDEFINIDOS = [
    "Pix",
    "CartÃ£o de CrÃ©dito",
    "CartÃ£o de DÃ©bito",
    "Dinheiro",
    "Boleto",
    "TransferÃªncia",
];

export default function MetodosPagamentoAdminPage() {
    const [metodos, setMetodos] = useState<MetodoPagamento[]>([]);
    const [loading, setLoading] = useState(false);
    const [mostrarLista, setMostrarLista] = useState(false);

    const [novo, setNovo] = useState({
        tipo: "",
        apelido: "",
        bandeira: "",
        ultimos_digitos: "",
    });

    useEffect(() => {
        carregar();
    }, []);

    async function carregar() {
        const { data } = await postgres
            .from("metodos_pagamento")
            .select("*")
            .order("created_at", { ascending: false });

        setMetodos(data || []);
    }

    async function criar() {
        if (!novo.tipo) return toast.error("Selecione um mÃ©todo");

        const existe = metodos.find((m) => m.tipo === novo.tipo);
        if (existe) return toast.error("Esse mÃ©todo jÃ¡ foi cadastrado");

        setLoading(true);

        const { error } = await postgres.from("metodos_pagamento").insert({
            tipo: novo.tipo,
            apelido: novo.apelido || null,
            bandeira: novo.bandeira || null,
            ultimos_digitos: novo.ultimos_digitos || null,
            ativo: true,
        });

        setLoading(false);

        if (error) return toast.error("Erro ao cadastrar");

        toast.success("MÃ©todo cadastrado!");

        setNovo({
            tipo: "",
            apelido: "",
            bandeira: "",
            ultimos_digitos: "",
        });

        carregar();
    }

    async function toggleAtivo(id: string, ativo: boolean) {
        await postgres
            .from("metodos_pagamento")
            .update({ ativo: !ativo })
            .eq("id", id);

        carregar();
    }

    async function remover(id: string) {
        if (!confirm("Deseja remover este mÃ©todo?")) return;

        await postgres.from("metodos_pagamento").delete().eq("id", id);
        toast.success("Removido");
        carregar();
    }

    const isCartao =
        novo.tipo === "CartÃ£o de CrÃ©dito" || novo.tipo === "CartÃ£o de DÃ©bito";

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-xl">

                <h2 className="text-2xl font-semibold text-center mb-8">
                    Gerenciar MÃ©todos de Pagamento
                </h2>

                {/* BOTÃ•ES PRINCIPAIS */}
                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => setMostrarLista(false)}
                        className={`w-full py-3 rounded-lg font-medium transition 
              ${!mostrarLista ? "bg-primary-500 text-white" : "bg-gray-100 hover:bg-gray-200"}
            `}
                    >
                        Cadastrar
                    </button>

                    <button
                        onClick={() => setMostrarLista(true)}
                        className={`w-full py-3 rounded-lg font-medium transition 
              ${mostrarLista ? "bg-primary-500 text-white" : "bg-gray-100 hover:bg-gray-200"}
            `}
                    >
                        Gerenciar
                    </button>
                </div>

                {/* ================= CADASTRO ================= */}
                {!mostrarLista && (
                    <div className="space-y-5">

                        {/* DROPDOWN */}
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">
                                Tipo de pagamento
                            </label>
                            <select
                                className="w-full border rounded-lg px-4 py-2"
                                value={novo.tipo}
                                onChange={(e) =>
                                    setNovo({
                                        tipo: e.target.value,
                                        apelido: "",
                                        bandeira: "",
                                        ultimos_digitos: "",
                                    })
                                }
                            >
                                <option value="">Selecione um mÃ©todo</option>
                                {METODOS_PREDEFINIDOS.map((tipo) => (
                                    <option key={tipo} value={tipo}>
                                        {tipo}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* CAMPOS EXTRAS PARA CARTÃƒO */}
                        {isCartao && (
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    className="border p-2 rounded"
                                    placeholder="Apelido (Ex: Nubank)"
                                    value={novo.apelido}
                                    onChange={(e) =>
                                        setNovo({ ...novo, apelido: e.target.value })
                                    }
                                />

                                <input
                                    className="border p-2 rounded"
                                    placeholder="Bandeira"
                                    value={novo.bandeira}
                                    onChange={(e) =>
                                        setNovo({ ...novo, bandeira: e.target.value })
                                    }
                                />

                                <input
                                    className="border p-2 rounded col-span-2"
                                    placeholder="Ãšltimos 4 dÃ­gitos"
                                    value={novo.ultimos_digitos}
                                    onChange={(e) =>
                                        setNovo({ ...novo, ultimos_digitos: e.target.value })
                                    }
                                />
                            </div>
                        )}

                        <button
                            onClick={criar}
                            disabled={loading}
                            className="w-full py-3 rounded-lg bg-primary-500 text-white disabled:opacity-50"
                        >
                            {loading ? "Salvando..." : "Adicionar MÃ©todo"}
                        </button>
                    </div>
                )}

                {/* ================= LISTA ================= */}
                {mostrarLista && (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                        {metodos.map((m) => (
                            <div
                                key={m.id}
                                className="flex justify-between items-center border p-3 rounded-lg"
                            >
                                <div>
                                    <p className="font-semibold">{m.tipo}</p>

                                    {(m.apelido || m.bandeira || m.ultimos_digitos) && (
                                        <p className="text-sm text-gray-500">
                                            {m.apelido} {m.bandeira} {m.ultimos_digitos}
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => toggleAtivo(m.id, m.ativo)}
                                        className={`px-3 py-1 rounded text-white ${m.ativo ? "bg-green-500" : "bg-gray-400"
                                            }`}
                                    >
                                        {m.ativo ? "Ativo" : "Inativo"}
                                    </button>

                                    <button
                                        onClick={() => remover(m.id)}
                                        className="px-3 py-1 bg-red-500 text-white rounded"
                                    >
                                        Excluir
                                    </button>
                                </div>
                            </div>
                        ))}

                        {metodos.length === 0 && (
                            <p className="text-gray-500 text-center">
                                Nenhum mÃ©todo cadastrado ainda.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

