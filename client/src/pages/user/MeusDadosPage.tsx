import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
    Home,
    Calendar,
    User,
    CreditCard,
    FileText,
    Clock,
    Menu,
    X,
    LogOut,
    Camera,
    Key,
} from "lucide-react";
import { postgres } from "@/lib/postgres";
import toast from "react-hot-toast";

export default function MeusDadosPage() {
    const [location, setLocation] = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const [form, setForm] = useState({
        nome: "",
        telefone: "",
        endereco: "",
        novaSenha: "",
        confirmarSenha: "",
    });

    const [foto, setFoto] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const menuItems = [
        { href: "/minha-conta", icon: Home, label: "VisÃ£o Geral" },
        { href: "/minha-conta/agendamentos", icon: Calendar, label: "Agendamentos" },
        { href: "/minha-conta/dados", icon: User, label: "Meus Dados" },
        { href: "/minha-conta/pagamentos", icon: CreditCard, label: "Pagamentos" },
        { href: "/minha-conta/assinaturas", icon: FileText, label: "Assinaturas" },
        { href: "/minha-conta/historico", icon: Clock, label: "HistÃ³rico" },
    ];

    useEffect(() => {
        carregarUsuario();
    }, []);

    async function carregarUsuario() {
        const user = (await postgres.auth.getUser()).data.user;
        if (!user) return;

        const { data } = await postgres
            .from("usuarios")
            .select("*")
            .eq("id", user.id)
            .single();

        setFoto(data?.foto || null);

        setForm({
            nome: data?.nome || "",
            telefone: data?.telefone || "",
            endereco: data?.endereco || "",
            novaSenha: "",
            confirmarSenha: "",
        });
    }

    // âœ… UPLOAD COM EXCLUSÃƒO AUTOMÃTICA DA FOTO ANTIGA
    async function uploadFotoAuto(file: File) {
        const user = (await postgres.auth.getUser()).data.user;
        if (!user) return;

        try {
            toast.loading("Enviando imagem...", { id: "upload" });

            // âœ… BUSCA FOTO ANTIGA NO BANCO
            const { data: oldUser } = await postgres
                .from("usuarios")
                .select("foto")
                .eq("id", user.id)
                .single();

            // âœ… SE TIVER FOTO ANTIGA â†’ APAGA DO STORAGE
            if (oldUser?.foto) {
                const oldPath = oldUser.foto.split("/").pop()?.split("?")[0];
                if (oldPath) {
                    await postgres.storage.from("avatars").remove([oldPath]);
                }
            }

            // âœ… NOVO ARQUIVO COM NOME ÃšNICO
            const ext = file.name.split(".").pop();
            const fileName = `${user.id}-${Date.now()}.${ext}`;

            const { error: uploadError } = await postgres.storage
                .from("avatars")
                .upload(fileName, file);

            if (uploadError) {
                toast.error("Erro ao enviar imagem", { id: "upload" });
                return;
            }

            const publicUrl = postgres.storage
                .from("avatars")
                .getPublicUrl(fileName).data.publicUrl;

            const { error: updateError } = await postgres
                .from("usuarios")
                .update({ foto: publicUrl })
                .eq("id", user.id);

            if (updateError) {
                toast.error("Erro ao salvar no banco", { id: "upload" });
                return;
            }

            setFoto(publicUrl);
            toast.success("Foto atualizada!", { id: "upload" });

        } catch {
            toast.error("Erro ao atualizar foto", { id: "upload" });
        }
    }

    async function salvarDados() {
        try {
            setLoading(true);

            const user = (await postgres.auth.getUser()).data.user;
            if (!user) return;

            await postgres
                .from("usuarios")
                .update({
                    nome: form.nome,
                    telefone: form.telefone,
                    endereco: form.endereco,
                })
                .eq("id", user.id);

            toast.success("Dados atualizados!");
        } catch {
            toast.error("Erro ao salvar");
        } finally {
            setLoading(false);
        }
    }

    async function alterarSenha() {
        if (form.novaSenha.length < 6)
            return toast.error("Senha muito curta");

        if (form.novaSenha !== form.confirmarSenha)
            return toast.error("Senhas nÃ£o coincidem");

        const { error } = await postgres.auth.updateUser({
            password: form.novaSenha,
        });

        if (error) return toast.error("Erro ao alterar senha");

        toast.success("Senha alterada com sucesso!");

        setForm({
            ...form,
            novaSenha: "",
            confirmarSenha: "",
        });
    }

    async function handleLogout() {
        await postgres.auth.signOut();
        setLocation("/login");
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* SIDEBAR */}
            <aside className={`fixed inset-y-0 left-0 z-50 bg-secondary-500 text-white transition-all duration-300 ${sidebarOpen ? "w-64" : "w-20"}`}>
                <div className="flex items-center justify-between h-16 px-4 border-b border-secondary-400">
                    {sidebarOpen && (
                        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                            <Home className="h-6 w-6" />
                            <span>Barbearia</span>
                        </Link>
                    )}

                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-secondary-400 rounded-lg">
                        {sidebarOpen ? <X /> : <Menu />}
                    </button>
                </div>

                <nav className="p-4 space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${location.startsWith(item.href)
                                ? "bg-primary-500"
                                : "hover:bg-secondary-400"
                                }`}
                        >
                            <item.icon className="h-5 w-5" />
                            {sidebarOpen && item.label}
                        </Link>
                    ))}
                </nav>

                <div className="absolute bottom-0 p-4 w-full border-t">
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-secondary-400 rounded-lg">
                        <LogOut className="h-5 w-5" />
                        {sidebarOpen && "Sair"}
                    </button>
                </div>
            </aside>

            {/* CONTEÃšDO */}
            <div className={`flex-1 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
                <header className="bg-white h-16 shadow-sm flex items-center px-6">
                    <h1 className="text-xl font-semibold text-secondary-500">Meus Dados</h1>
                </header>

                <main className="p-8 flex justify-center">
                    <div className="bg-white rounded-xl shadow-sm p-8 w-full max-w-xl space-y-6">

                        {/* AVATAR */}
                        <div className="flex flex-col items-center">
                            <div className="relative">
                                <img
                                    src={foto || "/avatar-placeholder.png"}
                                    className="w-28 h-28 rounded-full object-cover bg-gray-200"
                                />

                                <label className="absolute bottom-0 right-0 bg-red-500 p-2 rounded-full cursor-pointer">
                                    <Camera className="h-5 w-5 text-white" />
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            uploadFotoAuto(file); // âœ… upload + apaga antiga
                                        }}
                                    />
                                </label>
                            </div>


                        </div>

                        {/* FORM */}
                        <div className="space-y-4">
                            <input className="w-full border rounded-lg px-4 py-2" placeholder="Nome"
                                value={form.nome}
                                onChange={(e) => setForm({ ...form, nome: e.target.value })} />

                            <input className="w-full border rounded-lg px-4 py-2" placeholder="Telefone"
                                value={form.telefone}
                                onChange={(e) => setForm({ ...form, telefone: e.target.value })} />

                            <input className="w-full border rounded-lg px-4 py-2" placeholder="EndereÃ§o"
                                value={form.endereco}
                                onChange={(e) => setForm({ ...form, endereco: e.target.value })} />
                        </div>

                        {/* TROCAR SENHA */}
                        <div className="pt-4 border-t space-y-3">
                            <h3 className="flex items-center gap-2 font-semibold">
                                <Key className="h-4 w-4" /> Alterar Senha
                            </h3>

                            <input type="password" className="w-full border px-4 py-2 rounded-lg"
                                placeholder="Nova senha"
                                value={form.novaSenha}
                                onChange={(e) => setForm({ ...form, novaSenha: e.target.value })} />

                            <input type="password" className="w-full border px-4 py-2 rounded-lg"
                                placeholder="Confirmar nova senha"
                                value={form.confirmarSenha}
                                onChange={(e) => setForm({ ...form, confirmarSenha: e.target.value })} />

                            <button onClick={alterarSenha} className="w-full bg-red-500 text-white py-2 rounded-lg">
                                Alterar Senha
                            </button>
                        </div>

                        <button
                            onClick={salvarDados}
                            disabled={loading}
                            className="w-full bg-primary-500 text-white py-3 rounded-lg"
                        >
                            {loading ? "Salvando..." : "Salvar AlteraÃ§Ãµes"}
                        </button>

                    </div>
                </main>
            </div>
        </div>
    );
}

