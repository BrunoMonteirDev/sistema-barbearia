import { useEffect, useState } from "react";
import { postgres } from "@/lib/postgres";
import { UserPlus, ShieldCheck, Users as UsersIcon } from "lucide-react";
import toast from "react-hot-toast";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  nivel: string;
  created_at: string;
  isFuncionario: boolean;
}

type TipoUsuario = "Administrador" | "Funcionario" | "Cliente";

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedUsuarioId, setSelectedUsuarioId] = useState<string>("");
  const [selectedTipo, setSelectedTipo] = useState<TipoUsuario>("Funcionario");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  async function fetchUsuarios() {
    setLoading(true);

    // Busca todos os usuÃ¡rios da tabela public.usuarios
    const { data: usuariosData, error: usuariosError } = await postgres
      .from("usuarios")
      .select("id, nome, email, nivel, created_at")
      .order("created_at", { ascending: false });

    if (usuariosError) {
      console.error(usuariosError);
      toast.error("Erro ao carregar usuÃ¡rios");
      setLoading(false);
      return;
    }

    // Busca funcionÃ¡rios cadastrados na tabela funcionarios
    const { data: funcsData, error: funcsError } = await postgres
      .from("funcionarios")
      .select("id, usuario_id");

    if (funcsError) {
      console.error(funcsError);
      toast.error("Erro ao carregar funcionÃ¡rios");
      setLoading(false);
      return;
    }

    const funcionariosSet = new Set((funcsData ?? []).map((f) => f.usuario_id));

    const list: Usuario[] =
      (usuariosData ?? []).map((u: any) => ({
        id: u.id,
        nome: u.nome,
        email: u.email,
        nivel: u.nivel,
        created_at: u.created_at,
        isFuncionario: funcionariosSet.has(u.id),
      })) ?? [];

    setUsuarios(list);
    setLoading(false);
  }

  async function salvarPermissoes(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedUsuarioId) {
      toast.error("Selecione um usuÃ¡rio");
      return;
    }

    setSaving(true);

    try {
      // Atualiza nÃ­vel/role na tabela usuarios
      let nivel: TipoUsuario = selectedTipo;
      let role = selectedTipo === "Administrador" ? "admin" : "user";

      const { error: updateError } = await postgres
        .from("usuarios")
        .update({
          nivel,
          role,
        })
        .eq("id", selectedUsuarioId);

      if (updateError) {
        console.error(updateError);
        toast.error("Erro ao atualizar usuÃ¡rio");
        setSaving(false);
        return;
      }

      // Sincroniza com tabela funcionarios
      if (selectedTipo === "Funcionario") {
        // Verifica se jÃ¡ existe na tabela funcionarios
        const { data: funcExists, error: funcCheckError } = await postgres
          .from("funcionarios")
          .select("id")
          .eq("usuario_id", selectedUsuarioId)
          .maybeSingle();

        if (funcCheckError) {
          console.error(funcCheckError);
          toast.error("Erro ao verificar funcionÃ¡rio");
          setSaving(false);
          return;
        }

        if (!funcExists) {
          const { error: insertFuncError } = await postgres
            .from("funcionarios")
            .insert({
              usuario_id: selectedUsuarioId,
            });

          if (insertFuncError) {
            console.error(insertFuncError);
            toast.error("Erro ao criar funcionÃ¡rio");
            setSaving(false);
            return;
          }
        }
      } else {
        // Se deixou de ser funcionÃ¡rio, remove da tabela funcionarios
        const { error: deleteFuncError } = await postgres
          .from("funcionarios")
          .delete()
          .eq("usuario_id", selectedUsuarioId);

        if (deleteFuncError) {
          console.error(deleteFuncError);
          // NÃ£o bloqueia, sÃ³ avisa
          toast.error("UsuÃ¡rio atualizado, mas houve erro ao remover de funcionÃ¡rios");
        }
      }

      toast.success("PermissÃµes atualizadas com sucesso!");
      await fetchUsuarios();
    } catch (err) {
      console.error(err);
      toast.error("Erro inesperado ao salvar");
    }

    setSaving(false);
  }

  const usuarioSelecionado = usuarios.find((u) => u.id === selectedUsuarioId) || null;

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* TOPO: INFO / EXPLICAÃ‡ÃƒO */}
      <div className="bg-white shadow p-6 rounded-xl flex flex-col gap-2">
        <h2 className="text-2xl font-semibold flex items-center gap-2 text-secondary-500">
          <UsersIcon className="h-6 w-6 text-primary-500" />
          Gerenciar UsuÃ¡rios e FuncionÃ¡rios
        </h2>
        <p className="text-sm text-gray-600">
          Os usuÃ¡rios sÃ£o criados pela tela de login/cadastro. Aqui vocÃª define quem Ã©{" "}
          <span className="font-semibold">Administrador</span> e quem Ã©{" "}
          <span className="font-semibold">FuncionÃ¡rio</span> (aparece na agenda para agendamento).
        </p>
      </div>

      {/* FORM: DEFINIR TIPO / FUNÃ‡ÃƒO */}
      <form
        onSubmit={salvarPermissoes}
        className="bg-white shadow p-6 rounded-xl space-y-6"
      >
        <h3 className="text-xl font-semibold flex items-center gap-2 text-secondary-500">
          <UserPlus className="h-5 w-5 text-primary-500" />
          Definir tipo de usuÃ¡rio
        </h3>

        {/* Selecionar usuÃ¡rio */}
        <div className="space-y-2">
          <label className="label">Selecione o usuÃ¡rio</label>
          <select
            className="input-field"
            value={selectedUsuarioId}
            onChange={(e) => setSelectedUsuarioId(e.target.value)}
            required
          >
            <option value="">Selecione...</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome || "Sem nome"} â€” {u.email}
              </option>
            ))}
          </select>
        </div>

        {/* Cards de tipo: opÃ§Ã£o 2 (Admin x FuncionÃ¡rio) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card Administrador */}
          <button
            type="button"
            onClick={() => setSelectedTipo("Administrador")}
            className={`border rounded-xl p-4 text-left flex flex-col gap-2 transition-all ${
              selectedTipo === "Administrador"
                ? "border-primary-500 bg-primary-50 shadow-sm"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck
                className={`h-5 w-5 ${
                  selectedTipo === "Administrador" ? "text-primary-500" : "text-gray-500"
                }`}
              />
              <span className="font-semibold text-secondary-500">Administrador</span>
            </div>
            <p className="text-sm text-gray-600">
              Acesso completo ao painel, pode gerenciar configuraÃ§Ãµes, serviÃ§os e usuÃ¡rios.
            </p>
          </button>

          {/* Card FuncionÃ¡rio */}
          <button
            type="button"
            onClick={() => setSelectedTipo("Funcionario")}
            className={`border rounded-xl p-4 text-left flex flex-col gap-2 transition-all ${
              selectedTipo === "Funcionario"
                ? "border-primary-500 bg-primary-50 shadow-sm"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <UserPlus
                className={`h-5 w-5 ${
                  selectedTipo === "Funcionario" ? "text-primary-500" : "text-gray-500"
                }`}
              />
              <span className="font-semibold text-secondary-500">FuncionÃ¡rio</span>
            </div>
            <p className="text-sm text-gray-600">
              Aparece como profissional na tela de agendamento e pode usar o painel conforme
              permissÃµes configuradas.
            </p>
          </button>
        </div>

        {/* Resumo do usuÃ¡rio selecionado */}
        {usuarioSelecionado && (
          <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-lg text-sm text-gray-700">
            <p>
              <span className="font-semibold">UsuÃ¡rio: </span>
              {usuarioSelecionado.nome || "Sem nome"} ({usuarioSelecionado.email})
            </p>
            <p>
              <span className="font-semibold">NÃ­vel atual: </span>
              {usuarioSelecionado.nivel}
            </p>
            <p>
              <span className="font-semibold">FuncionÃ¡rio: </span>
              {usuarioSelecionado.isFuncionario ? "Sim" : "NÃ£o"}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={saving || !selectedUsuarioId}
          className="btn-primary w-full"
        >
          {saving ? "Salvando..." : "Salvar permissÃµes"}
        </button>
      </form>

      {/* LISTA DE USUÃRIOS */}
      <div className="bg-white shadow p-6 rounded-xl">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-secondary-500">
          <ShieldCheck className="h-5 w-5 text-primary-500" />
          UsuÃ¡rios cadastrados
        </h3>

        {loading ? (
          <p>Carregando...</p>
        ) : usuarios.length === 0 ? (
          <p>Nenhum usuÃ¡rio encontrado.</p>
        ) : (
          <div className="space-y-3">
            {usuarios.map((usuario) => (
              <div
                key={usuario.id}
                className="flex items-center justify-between border p-3 rounded-lg"
              >
                <div>
                  <p className="font-medium">{usuario.nome || "Sem nome"}</p>
                  <p className="text-sm text-gray-600">{usuario.email}</p>
                  <p className="text-xs text-gray-500">
                    NÃ­vel:{" "}
                    <span className="font-semibold">
                      {usuario.nivel}
                      {usuario.isFuncionario ? " (FuncionÃ¡rio)" : ""}
                    </span>
                    {" â€¢ "}
                    Criado em{" "}
                    {new Date(usuario.created_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

