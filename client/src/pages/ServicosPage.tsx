import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Scissors, Clock } from "lucide-react";
import { api } from "@/lib/api";

interface Servico {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  duracao_minutos: number;
  imagem: string | null;
}

export default function ServicosPage() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServicos();
  }, []);

  async function fetchServicos() {
    try {
      const data = await api.servicos.list();
      setServicos(data as Servico[]);
    } catch (error) {
      console.error(error);
      setServicos([]);
    }

    setLoading(false);
  }

  return (
    <div className="py-20 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">

        {/* TÍTULO */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-secondary-500 mb-4">
            Nossos Serviços
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Oferecemos uma variedade de serviços para cuidar do seu visual.
          </p>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {servicos.map((s) => (
              <div key={s.id} className="card group overflow-hidden p-0">

                {/* ✅ IMAGEM DO SERVIÇO (IGUAL À HOME) */}
                <div className="h-80 bg-gray-200 overflow-hidden rounded-t-xl relative">
                  {s.imagem ? (
                    <img
                      src={s.imagem}
                      alt={s.nome}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-secondary-500 to-secondary-700 flex items-center justify-center">
                      <Scissors className="h-16 w-16 text-white/50" />
                    </div>
                  )}

                  {s.duracao_minutos && (
                    <div className="absolute top-4 right-4 bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {s.duracao_minutos} min
                    </div>
                  )}
                </div>

                {/* CONTEÚDO */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-secondary-500 mb-2">
                    {s.nome}
                  </h3>

                  {s.descricao && (
                    <p className="text-gray-600 mb-3">
                      {s.descricao}
                    </p>
                  )}

                  <p className="text-2xl font-bold text-primary-500 mb-4">
                    R$ {s.preco.toFixed(2).replace(".", ",")}
                  </p>

                  <Link
                    href={`/agendamento?servico=${s.id}`}
                    className="btn-primary w-full text-center block"
                  >
                    Agendar
                  </Link>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
