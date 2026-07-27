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
    Bell,
    ChevronDown,
    LogOut,
} from "lucide-react";
import { postgres } from "@/lib/postgres";
import toast from "react-hot-toast";

interface Agendamento {
    id: string;
    data: string;
    hora: string;
    status: string;
    servicos: {
        nome: string;
    }[] | null;
}

export default function MeusAgendamentosPage() {
    const [location, setLocation] = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);

    const menuItems = [
        { href: "/minha-conta", icon: Home, label: "VisÃ£o Geral", exact: true },
        { href: "/minha-conta/agendamentos", icon: Calendar, label: "Agendamentos" },
        { href: "/minha-conta/dados", icon: User, label: "Meus Dados" },
        { href: "/minha-conta/pagamentos", icon: CreditCard, label: "Pagamentos" },
        { href: "/minha-conta/assinaturas", icon: FileText, label: "Assinaturas" },
        { href: "/minha-conta/historico", icon: Clock, label: "HistÃ³rico" },
    ];

    useEffect(() => {
        carregarUsuario();
        carregarAgendamentos();
    }, []);

    async function carregarUsuario() {
        const user = (await postgres.auth.getUser()).data.user;
        if (!user) return;

        const { data } = await postgres
            .from("usuarios")
            .select("nome, email, foto")
            .eq("id", user.id)
            .single();

        setUserData(data);
    }

    // âœ… BUSCA AGENDAMENTOS COM JOIN CORRETO
    async function carregarAgendamentos() {
        const user = (await postgres.auth.getUser()).data.user;
        if (!user) return;

        const { data, error } = await postgres
            .from("agendamentos")
            .select(`
        id,
        data,
        hora,
        status,
        servicos:servico_id (
          nome
        )
      `)
            .eq("cliente_id", user.id)
            .order("data", { ascending: true });

        if (error) {
            toast.error("Erro ao buscar agendamentos");
            return;
        }

        setAgendamentos((data as Agendamento[]) || []);
    }

    function statusBadge(status: string) {
        switch (status) {
            case "Confirmado":
                return "bg-blue-100 text-blue-700";
            case "Concluido":
                return "bg-green-100 text-green-700";
            case "Cancelado":
                return "bg-red-100 text-red-700";
            case "Pendente":
                return "bg-yellow-100 text-yellow-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    }

    async function cancelar(id: string, dataStr: string, hora: string) {
        const ts = new Date(`${dataStr}T${hora}:00`).getTime();
        if (ts - Date.now() < 60 * 60 * 1000) {
            return toast.error("Cancelamento permitido apenas com 1 hora de antecedÃªncia.");
        }

        await postgres
            .from("agendamentos")
            .update({ status: "Cancelado" })
            .eq("id", id);

        toast.success("Agendamento cancelado!");
        carregarAgendamentos();
    }

    async function handleLogout() {
        await postgres.auth.signOut();
        setLocation("/login");
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* SIDEBAR */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 bg-secondary-500 text-white transition-all duration-300 
        ${sidebarOpen ? "w-64" : "w-20"}`}
            >
                <div className="flex items-center justify-between h-16 px-4 border-b border-secondary-400">
                    {sidebarOpen && (
                        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                            <Home className="h-6 w-6" />
                            <span>Barbearia</span>
                        </Link>
                    )}

                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 hover:bg-secondary-400 rounded-lg transition-colors"
                    >
                        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>

                <nav className="p-4 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = item.exact
                            ? location === item.href
                            : location.startsWith(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${isActive ? "bg-primary-500 text-white" : "hover:bg-secondary-400 text-gray-300"}`}
                            >
                                <item.icon className="h-5 w-5 flex-shrink-0" />
                                {sidebarOpen && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-secondary-400">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary-400 text-gray-300 w-full transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                        {sidebarOpen && <span>Sair</span>}
                    </button>
                </div>
            </aside>

            {/* ÃREA PRINCIPAL */}
            <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
                <header className="bg-white h-16 shadow-sm flex items-center justify-between px-6 sticky top-0 z-40">
                    <h1 className="text-xl font-semibold text-secondary-500">
                        Meus Agendamentos
                    </h1>
                </header>

                <main className="p-6">
                    <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
                        {agendamentos.map((a) => (
                            <div
                                key={a.id}
                                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 bg-gray-50 rounded-lg border"
                            >
                                <div>
                                    <p className="font-semibold text-secondary-500">
                                        {a.servicos?.[0]?.nome || "ServiÃ§o removido"}
                                    </p>

                                    <p className="text-sm text-gray-600">
                                        {a.data} â€” {a.hora}
                                    </p>

                                    <span
                                        className={`inline-block mt-1 px-3 py-1 text-xs font-medium rounded-full ${statusBadge(
                                            a.status
                                        )}`}
                                    >
                                        {a.status}
                                    </span>
                                </div>

                                {a.status !== "Cancelado" && a.status !== "Concluido" && (
                                    <button
                                        onClick={() => cancelar(a.id, a.data, a.hora)}
                                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                    >
                                        Cancelar
                                    </button>
                                )}
                            </div>
                        ))}

                        {agendamentos.length === 0 && (
                            <p className="text-gray-500">
                                VocÃª ainda nÃ£o possui agendamentos.
                            </p>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

