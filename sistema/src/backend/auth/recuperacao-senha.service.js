/** Regras do fluxo: solicitar um link temporário e usá-lo para definir uma senha. */
import { createHash, randomBytes } from "node:crypto";
import { gerarHash, validarSenha } from "./senha.service.js";

export const VALIDADE_RECUPERACAO_MINUTOS = 30;
export const MENSAGEM_RECUPERACAO =
  "Se houver uma conta ativa com senha para este e-mail, você receberá um link para redefini-la. Confira também a pasta de spam.";

export class RecuperacaoSenhaError extends Error {
  constructor(mensagem, status = 400) {
    super(mensagem);
    this.status = status;
  }
}

export function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

export class RecuperacaoSenhaService {
  constructor(repository, emailService) {
    this.repository = repository;
    this.emailService = emailService;
  }

  async solicitar(email) {
    if (typeof email !== "string" || email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      throw new RecuperacaoSenhaError("Informe um e-mail válido.");
    }
    // Valida a configuração antes da consulta: a indisponibilidade deve ser
    // igual para qualquer endereço, sem revelar se ele está cadastrado.
    this.emailService.validarConfiguracao();
    const usuario = await this.repository.buscarConta(email.trim().toLowerCase());
    if (!usuario) return;

    const token = randomBytes(32).toString("hex");
    const tokenHash = hashToken(token);
    const expiraEm = new Date(Date.now() + VALIDADE_RECUPERACAO_MINUTOS * 60000);
    if (!await this.repository.salvarToken(usuario, tokenHash, expiraEm)) return;
    try {
      await this.emailService.enviarRecuperacao(usuario.email, token, VALIDADE_RECUPERACAO_MINUTOS);
    } catch {
      await this.repository.descartarToken(tokenHash);
      // Não registra credenciais, e-mail, URL de recuperação nem token nos logs.
      console.error("Falha no envio do e-mail de recuperação. Verifique o serviço SMTP.");
      // Mantém a mesma resposta pública para não revelar contas existentes.
    }
  }

  async redefinir({ token, senha, confirmacaoSenha } = {}) {
    if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) {
      throw new RecuperacaoSenhaError("Link inválido ou expirado. Solicite um novo link.");
    }
    // bcrypt considera até 72 bytes; rejeitar senhas maiores evita truncamento.
    if (typeof senha !== "string" || Buffer.byteLength(senha, "utf8") > 72) {
      throw new RecuperacaoSenhaError("Informe uma senha de até 72 bytes.");
    }
    const erroSenha = validarSenha(senha);
    if (erroSenha) throw new RecuperacaoSenhaError(erroSenha);
    if (senha !== confirmacaoSenha) {
      throw new RecuperacaoSenhaError("As senhas não coincidem.");
    }
    const senhaHash = await gerarHash(senha);
    if (!await this.repository.redefinir(hashToken(token), senhaHash, new Date())) {
      throw new RecuperacaoSenhaError("Link inválido ou expirado. Solicite um novo link.");
    }
  }
}
