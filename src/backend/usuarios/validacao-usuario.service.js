import { randomUUID } from "node:crypto";
import { validarSenha } from "../auth/senha.service.js";
export class DadosUsuarioInvalidosError extends Error {}
export function prepararDadosUsuario(body) {
  const dataNascimento = body.dataNascimento
    ? new Date(body.dataNascimento)
    : body.data_nascimento
      ? new Date(body.data_nascimento)
      : null;
  const dados = {
    nome: String(body.nome ?? ""),
    email:
      typeof body.email === "string" && body.email.trim()
        ? body.email.trim().toLowerCase()
        : `cliente-${randomUUID()}@sem-email.local`,
    telefone: typeof body.telefone === "string" ? body.telefone : null,
    senha: typeof body.senha === "string" ? body.senha : undefined,
    nivel: typeof body.nivel === "string" ? body.nivel : "Cliente",
    ativo: typeof body.ativo === "boolean" ? body.ativo : true,
    dataNascimento,
  };
  const erroSenha = dados.senha ? validarSenha(dados.senha) : null;
  if (erroSenha) throw new DadosUsuarioInvalidosError(erroSenha);
  return dados;
}
export function prepararPerfil(body) {
  const nome = typeof body.nome === "string" ? body.nome.trim() : "";
  const telefoneInformado = body.telefone;
  const telefone =
    typeof telefoneInformado === "string"
      ? telefoneInformado.replace(/\D/g, "")
      : telefoneInformado;
  if (nome.length < 2)
    throw new DadosUsuarioInvalidosError("Informe um nome válido.");
  if (
    telefone !== null &&
    telefone !== undefined &&
    (typeof telefone !== "string" ||
      telefone.length < 10 ||
      telefone.length > 11)
  ) {
    throw new DadosUsuarioInvalidosError(
      "Informe um telefone brasileiro válido com DDD.",
    );
  }
  return {
    nome,
    telefone: telefone || null,
    ...(Object.prototype.hasOwnProperty.call(body, "dataNascimento")
      ? { dataNascimento: body.dataNascimento }
      : {}),
  };
}
export function prepararConclusaoCadastro(body) {
  const nome = typeof body.nome === "string" ? body.nome.trim() : "";
  const telefone =
    typeof body.telefone === "string" ? body.telefone.replace(/\D/g, "") : "";
  if (nome.length < 2 || telefone.length < 10) {
    throw new DadosUsuarioInvalidosError(
      "Informe nome e telefone válidos para concluir o cadastro.",
    );
  }
  return { nome, telefone };
}
export function validarConfirmacaoExclusao(body) {
  const confirmacao =
    typeof body.confirmacao === "string"
      ? body.confirmacao.trim().toUpperCase()
      : "";
  if (confirmacao !== "EXCLUIR MINHA CONTA") {
    throw new DadosUsuarioInvalidosError(
      "Digite EXCLUIR MINHA CONTA para confirmar a exclusão.",
    );
  }
}
