import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { api, type Usuario } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { formatarTelefoneBrasileiro } from "@/utils/telefone";

export function useMinhaConta() {
  const [formulario, setFormulario] = useState<Usuario | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [confirmacaoExclusao, setConfirmacaoExclusao] = useState("");
  const [excluindo, setExcluindo] = useState(false);
  const { signOut } = useAuth();

  useEffect(() => {
    void api.usuarios.me().then(setFormulario).catch((error) => toast.error(error.message));
  }, []);

  const alterarNome = (nome: string) => setFormulario((atual) => atual ? { ...atual, nome } : atual);
  const alterarTelefone = (telefone: string) => setFormulario((atual) => atual ? { ...atual, telefone: formatarTelefoneBrasileiro(telefone) } : atual);
  const salvarPerfil = async (event: FormEvent) => {
    event.preventDefault();
    if (!formulario) return;
    try { setSalvando(true); await api.usuarios.updateMe({ nome: formulario.nome, telefone: formulario.telefone ?? null }); toast.success("Dados atualizados."); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Não foi possível atualizar seus dados."); }
    finally { setSalvando(false); }
  };
  const excluirConta = async (event: FormEvent, aposExcluir: () => void) => {
    event.preventDefault();
    try { setExcluindo(true); await api.usuarios.excluirMinhaConta(confirmacaoExclusao); signOut(); toast.success("Conta excluída com sucesso."); aposExcluir(); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Não foi possível excluir a conta."); }
    finally { setExcluindo(false); }
  };
  return { formulario, salvando, confirmacaoExclusao, excluindo, setConfirmacaoExclusao, alterarNome, alterarTelefone, salvarPerfil, excluirConta };
}
