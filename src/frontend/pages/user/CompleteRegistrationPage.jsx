import "./CompleteRegistrationPage.css";
import { useState } from "react";
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
  const salvar = async (event) => {
    event.preventDefault();
    try {
      const usuarioAtualizado = await api.usuarios.concluirCadastro({
        nome,
        telefone,
      });
      atualizarUsuario(usuarioAtualizado);
      toast.success("Cadastro concluído.");
      const retorno = new URLSearchParams(window.location.search).get(
        "retorno",
      );
      go(
        retorno?.startsWith("/") && !retorno.startsWith("//")
          ? retorno
          : "/minha-conta",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível concluir o cadastro.",
      );
    }
  };
  if (!user) {
    go("/login");
    return null;
  }
  if (user.cadastroConcluido) {
    go("/minha-conta");
    return null;
  }
  return (
    <main className="pagina-concluir-cadastro">
      <form onSubmit={salvar} className="formulario-concluir-cadastro">
        <div>
          <p className="etapa-concluir-cadastro">Última etapa</p>
          <h1 className="titulo-concluir-cadastro">Conclua seu cadastro</h1>
          <p className="descricao-concluir-cadastro">
            Precisamos destes dados para permitir seus agendamentos.
          </p>
        </div>
        <label className="rotulo-concluir-cadastro">
          Nome completo
          <input
            required
            minLength={2}
            className="campo-concluir-cadastro"
            value={nome}
            onChange={(event) => setNome(event.target.value)}
          />
        </label>
        <label className="rotulo-concluir-cadastro">
          Telefone
          <input
            required
            inputMode="tel"
            minLength={14}
            maxLength={15}
            className="campo-concluir-cadastro"
            placeholder="(00) 00000-0000"
            value={telefone}
            onChange={(event) =>
              setTelefone(formatarTelefoneBrasileiro(event.target.value))
            }
          />
        </label>
        <button className="botao-concluir-cadastro">Concluir cadastro</button>
      </form>
    </main>
  );
}
