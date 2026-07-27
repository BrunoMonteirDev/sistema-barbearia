import { postgres } from "@/lib/postgres";
import { useEffect, useState } from "react";
import UserSidebar from "./UserSidebar";

export default function UserHomePage() {
    const [userData, setUserData] = useState<any>(null);

    useEffect(() => {
        async function load() {
            const user = (await postgres.auth.getUser()).data.user;
            if (!user) return;

            const { data } = await postgres
                .from("usuarios")
                .select("nome, email, foto")
                .eq("id", user.id)
                .single();

            setUserData(data);
        }
        load();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 flex">

            {/* SIDEBAR */}
            <UserSidebar />

            {/* CONTEÃšDO PRINCIPAL */}
            <div className="flex-1 p-8">

                {/* TÃTULO */}
                <h1 className="text-2xl font-bold text-gray-800 mb-6">
                    Minha Conta
                </h1>

                {/* GRID DE CARDS (MESMO PADRÃƒO DO ADMIN) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                    <div className="bg-white rounded-lg shadow p-5">
                        <p className="text-sm text-gray-500">Agendamentos</p>
                        <p className="text-2xl font-bold text-gray-800">-</p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-5">
                        <p className="text-sm text-gray-500">PrÃ³ximo horÃ¡rio</p>
                        <p className="text-2xl font-bold text-gray-800">-</p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-5">
                        <p className="text-sm text-gray-500">Ãšltimo corte</p>
                        <p className="text-2xl font-bold text-gray-800">-</p>
                    </div>

                </div>

                {/* CARD DE DADOS DO USUÃRIO */}
                <div className="bg-white rounded-lg shadow p-6">

                    <h2 className="text-xl font-semibold mb-4 text-gray-800">
                        Dados da Conta
                    </h2>

                    {userData && (
                        <div className="flex items-center gap-6">
                            {userData.foto && (
                                <img
                                    src={userData.foto}
                                    className="w-24 h-24 rounded-full border object-cover"
                                />
                            )}

                            <div className="space-y-2">
                                <p className="text-gray-700">
                                    <strong>Nome:</strong> {userData.nome}
                                </p>
                                <p className="text-gray-700">
                                    <strong>Email:</strong> {userData.email}
                                </p>
                            </div>
                        </div>
                    )}

                    {!userData && <p>Carregando...</p>}

                </div>

            </div>
        </div>
    );
}

