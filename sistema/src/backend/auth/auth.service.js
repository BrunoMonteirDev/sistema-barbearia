/** Papel do módulo: Implementa autenticação local e Google, associação de contas e criação dos dados da sessão. */
import { OAuth2Client } from "google-auth-library";
import { compararSenha, validarSenha } from "./senha.service.js";
import { signToken } from "../middlewares/auth.js";
function mapearUsuarioAutenticado(usuario) {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    nivel: usuario.nivel,
    cadastroConcluido: usuario.cadastroConcluido ?? true,
  };
}
export class AuthService {
  usuarioService;
  constructor(usuarioService) {
    this.usuarioService = usuarioService;
  }
  async autenticarUsuario(email, senha) {
    const usuario = await this.usuarioService.buscarPorEmail(email);
    if (!usuario || usuario.ativo === false || !usuario.senhaHash) return null;
    const senhaValida = await compararSenha(senha, usuario.senhaHash);
    return senhaValida ? usuario : null;
  }
  async cadastrarUsuario(dados) {
    const telefone =
      typeof dados.telefone === "string"
        ? dados.telefone.replace(/\D/g, "")
        : "";
    if (telefone.length < 10 || telefone.length > 11)
      return { erro: "Informe um telefone válido com DDD." };

    const erroSenha = validarSenha(dados.senha);
    if (erroSenha) return { erro: erroSenha };
    const existente = await this.usuarioService.buscarPorEmail(dados.email);
    if (existente)
      return { erro: "Este email já está cadastrado.", conflito: true };
    const usuario = await this.usuarioService.criar({
      nome: dados.nome,
      email: dados.email,
      telefone,
      senha: dados.senha,
      nivel: "Cliente",
    });
    return { usuario };
  }
  async autenticarComGoogle(idToken) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId)
      return {
        erro: "Login com Google ainda não foi configurado.",
        motivo: "googleNaoConfigurado",
      };
    const ticket = await new OAuth2Client(clientId).verifyIdToken({
      idToken,
      audience: clientId,
    });
    const perfil = ticket.getPayload();
    if (!perfil?.sub || !perfil.email || !perfil.email_verified) {
      return {
        erro: "A conta Google precisa ter e-mail verificado.",
        motivo: "emailNaoVerificado",
      };
    }
    let usuario = await this.usuarioService.buscarPorGoogleSubject(perfil.sub);
    if (usuario?.ativo === false) {
      usuario = await this.usuarioService.atualizar(usuario.id, {
        ativo: true,
        provedorAuth: "GOOGLE",
        fotoUrl: perfil.picture ?? null,
        cadastroConcluido: false,
      });
    } else if (!usuario) {
      const existente = await this.usuarioService.buscarPorEmail(
        perfil.email.toLowerCase(),
      );
      if (existente) {
        usuario = await this.usuarioService.atualizar(existente.id, {
          ativo: true,
          provedorAuth: "GOOGLE",
          googleSubject: perfil.sub,
          fotoUrl: perfil.picture ?? null,
          cadastroConcluido:
            existente.ativo === false
              ? false
              : (existente.cadastroConcluido ?? true),
        });
      } else {
        usuario = await this.usuarioService.criar({
          nome: perfil.name?.trim() || perfil.email.split("@")[0],
          email: perfil.email.toLowerCase(),
          nivel: "Cliente",
          provedorAuth: "GOOGLE",
          googleSubject: perfil.sub,
          fotoUrl: perfil.picture ?? null,
          cadastroConcluido: false,
        });
      }
    }
    return { usuario };
  }
  criarSessao(usuario) {
    return {
      token: signToken(usuario),
      user: mapearUsuarioAutenticado(usuario),
    };
  }
}
