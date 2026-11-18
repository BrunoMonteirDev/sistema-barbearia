import { UsuarioRepository } from "./usuario.repository.js";
import { gerarHash } from "../auth/senha.service.js";
export class UsuarioService {
  usuarioRepository;
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }
  async listar() {
    return this.usuarioRepository.listarAtivos();
  }
  async buscarPorEmail(email) {
    return this.usuarioRepository.buscarPorEmail(email);
  }
  async buscarPorGoogleSubject(googleSubject) {
    return this.usuarioRepository.buscarPorGoogleSubject(googleSubject);
  }
  async buscarPorId(id) {
    return this.usuarioRepository.buscarPorId(id);
  }
  async criar(dados) {
    const senhaHash = dados.senha ? await gerarHash(dados.senha) : null;
    return this.usuarioRepository.criar({
      nome: dados.nome,
      email: dados.email,
      telefone: dados.telefone ?? null,
      senhaHash,
      provedorAuth: dados.provedorAuth ?? "LOCAL",
      googleSubject: dados.googleSubject,
      cadastroConcluido: dados.cadastroConcluido ?? true,
      fotoUrl: dados.fotoUrl ?? null,
      nivel: dados.nivel ?? "Cliente",
      ativo: dados.ativo ?? true,
      dataNascimento: dados.dataNascimento ?? null,
    });
  }
  async atualizar(id, dados) {
    const { senha, ...dadosUsuario } = dados;
    const senhaHash =
      typeof senha === "string" && senha ? await gerarHash(senha) : undefined;
    return this.usuarioRepository.atualizar(id, {
      ...dadosUsuario,
      ...(senhaHash ? { senhaHash } : {}),
    });
  }
  async atualizarPerfil(id, dados) {
    const dataNascimento = Object.prototype.hasOwnProperty.call(
      dados,
      "dataNascimento",
    )
      ? dados.dataNascimento
        ? new Date(dados.dataNascimento)
        : null
      : undefined;
    return this.usuarioRepository.atualizar(id, {
      nome: dados.nome,
      telefone: dados.telefone,
      dataNascimento,
    });
  }
  async concluirCadastro(id, dados) {
    return this.usuarioRepository.atualizar(id, {
      nome: dados.nome,
      telefone: dados.telefone,
      cadastroConcluido: true,
    });
  }
  async remover(id) {
    return this.usuarioRepository.desativar(id);
  }
  async excluirPropriaConta(id) {
    return this.usuarioRepository.desativar(id);
  }
}
export const usuarioService = new UsuarioService(new UsuarioRepository());
