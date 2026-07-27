import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { User, Phone } from "lucide-react";
import { postgres } from "@/lib/postgres";
import toast from "react-hot-toast";

export default function CompletarCadastroPage() {
    const [, setLocation] = useLocation();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        nome: "",
        telefone: "",
    });

    // MÃ¡scara (44) 9 0000-0000
    function handleTelefoneChange(e: React.ChangeEvent<HTMLInputElement>) {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 11) value = value.slice(0, 11);

        if (value.length >= 2) {
            value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        }

        if (value.length >= 10) {
            value = value.replace(/(\d{1})(\d{4})(\d{4})$/, "$1 $2-$3");
        }

        setFormData((prev) => ({ ...prev, telefone: value }));
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    useEffect(() => {
        carregarDados();
    }, []);

    async function carregarDados() {
        const { data } = await postgres.auth.getUser();
        const user = data.user;
        if (!user) {
            toast.error("VocÃª precisa estar logado.");
            setLocation("/login");
            return;
        }

        const { data: perfil } = await postgres
            .from("usuarios")
            .select("nome, telefone")
            .eq("id", user.id)
            .maybeSingle();

        setFormData({
            nome:
                perfil?.nome ||
                (user.user_metadata?.nome as string) ||
                (user.user_metadata?.full_name as string) ||
                "UsuÃ¡rio",
            telefone: perfil?.telefone
                ? formatTelefone(perfil.telefone)
                : "",
        });

        setLoading(false);
    }

    // formata do banco (99999999999) para (44) 9 9999-9999
    function formatTelefone(raw: string) {
        let value = raw.replace(/\D/g, "").slice(0, 11);
        if (value.length < 2) return value;
        value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        if (value.length >= 10) {
            value = value.replace(/(\d{1})(\d{4})(\d{4})$/, "$1 $2-$3");
        }
        return value;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);

        const { data } = await postgres.auth.getUser();
        const user = data.user;
        if (!user) {
            toast.error("SessÃ£o expirada. FaÃ§a login novamente.");
            setLocation("/login");
            return;
        }

        try {
            const telefoneLimpo = formData.telefone.replace(/\D/g, "");

            const { error } = await postgres
                .from("usuarios")
                .update({
                    nome: formData.nome,
                    telefone: telefoneLimpo,
                })
                .eq("id", user.id);

            if (error) {
                console.error(error);
                toast.error("Erro ao salvar dados");
                setSaving(false);
                return;
            }

            toast.success("Cadastro atualizado com sucesso!");

            // buscar nÃ­vel para decidir para onde mandar
            const { data: perfil } = await postgres
                .from("usuarios")
                .select("nivel")
                .eq("id", user.id)
                .single();

            if (perfil?.nivel === "Administrador" || perfil?.nivel === "Funcionario") {
                setLocation("/painel");
            } else {
                setLocation("/");
            }
        } catch (err) {
            console.error(err);
            toast.error("Erro ao atualizar cadastro");
        }

        setSaving(false);
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-secondary-500">
                Carregando...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="card max-w-md w-full">
                <h1 className="text-2xl font-bold text-secondary-500 mb-4 text-center">
                    Completar Cadastro
                </h1>
                <p className="text-sm text-gray-600 mb-6 text-center">
                    Precisamos do seu nome e telefone para continuar.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* NOME */}
                    <div>
                        <label className="label">Nome Completo</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                name="nome"
                                value={formData.nome}
                                onChange={handleChange}
                                className="input-field pl-10"
                                placeholder="Seu nome"
                                required
                            />
                        </div>
                    </div>

                    {/* TELEFONE */}
                    <div>
                        <label className="label">Telefone</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                value={formData.telefone}
                                onChange={handleTelefoneChange}
                                className="input-field pl-10"
                                placeholder="(44) 9 0000-0000"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="btn-primary w-full disabled:opacity-50"
                    >
                        {saving ? "Salvando..." : "Salvar e continuar"}
                    </button>
                </form>
            </div>
        </div>
    );
}

