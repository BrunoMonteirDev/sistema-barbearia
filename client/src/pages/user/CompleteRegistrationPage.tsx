import { useState, type FormEvent } from "react";
import { useLocation } from "wouter";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { formatarTelefoneBrasileiro } from "@/utils/telefone";

export default function CompleteRegistrationPage() {
  const { user, atualizarUsuario } = useAuth();
  const [, go] = useLocation();
  const [nome, setNome] = useState(user?.nome ?? "");
  const [telefone, setTelefone] = useState(user?.telefone ?? "");

  const salvar = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const usuarioAtualizado = await api.usuarios.concluirCadastro({ nome, telefone });
      atualizarUsuario(usuarioAtualizado);
      toast.success("Cadastro concluído.");
      const retorno = new URLSearchParams(window.location.search).get("retorno");
      go(retorno?.startsWith("/") && !retorno.startsWith("//") ? retorno : "/minha-conta");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível concluir o cadastro.");
    }
  };

  if (!user) { go("/login"); return null; }
  if (user.cadastroConcluido) { go("/minha-conta"); return null; }
  return <main className="min-h-screen grid place-items-center bg-slate-100 p-4"><form onSubmit={salvar} className="w-full max-w-md space-y-5 rounded-xl bg-white p-7 shadow"><div><p className="text-sm font-semibold text-primary-700">Última etapa</p><h1 className="mt-1 text-2xl font-bold text-slate-950">Conclua seu cadastro</h1><p className="mt-2 text-sm text-slate-600">Precisamos destes dados para permitir seus agendamentos.</p></div><label className="block text-sm font-semibold text-slate-800">Nome completo<input required minLength={2} className="input-field mt-1" value={nome} onChange={(event) => setNome(event.target.value)} /></label><label className="block text-sm font-semibold text-slate-800">Telefone<input required inputMode="tel" minLength={14} maxLength={15} className="input-field mt-1" placeholder="(00) 00000-0000" value={telefone} onChange={(event) => setTelefone(formatarTelefoneBrasileiro(event.target.value))} /></label><button className="btn-primary w-full">Concluir cadastro</button></form></main>;
}
