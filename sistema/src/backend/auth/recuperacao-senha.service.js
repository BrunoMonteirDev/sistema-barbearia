/** Solicita um código temporário e o consome para definir uma nova senha. */
import { createHmac, randomInt } from "node:crypto";
import { gerarHash, validarSenha } from "./senha.service.js";

export const VALIDADE_RECUPERACAO_MINUTOS = 10;
export const INTERVALO_RECUPERACAO_SEGUNDOS = 60;
export const MAX_TENTATIVAS_CODIGO = 5;
export const MENSAGEM_RECUPERACAO =
  "Se houver uma conta ativa com senha para este e-mail, você receberá um código para redefini-la. Confira também a pasta de spam.";
const CODIGO_INVALIDO = "Código inválido, expirado ou com tentativas esgotadas. Confira o e-mail e use o código mais recente ou solicite outro.";

export class RecuperacaoSenhaError extends Error {
  constructor(mensagem, status = 400) {
    super(mensagem);
    this.status = status;
  }
}

export function hashCodigo(usuarioId, codigo) {
  // A chave do servidor impede enumerar os seis dígitos a partir de uma cópia do banco.
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET não foi configurado.");
  return createHmac("sha256", process.env.JWT_SECRET)
    .update(JSON.stringify(["recuperacao-senha", usuarioId, codigo])).digest("hex");
}

function normalizarEmail(email) {
  if (typeof email !== "string" || email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    throw new RecuperacaoSenhaError("Informe um e-mail válido.");
  }
  return email.trim().toLowerCase();
}

export class RecuperacaoSenhaService {
  constructor(repository, emailService) {
    this.repository = repository;
    this.emailService = emailService;
  }

  async solicitar(email) {
    const emailNormalizado = normalizarEmail(email);
    // A indisponibilidade deve ser igual para qualquer endereço.
    this.emailService.validarConfiguracao();
    const usuario = await this.repository.buscarConta(emailNormalizado);
    if (!usuario) return;

    let codigo;
    let codigoHash;
    do {
      codigo = randomInt(0, 1000000).toString().padStart(6, "0");
      codigoHash = hashCodigo(usuario.id, codigo);
    } while (codigoHash === usuario.recuperacaoTokenHash);
    const agora = new Date();
    const expiraEm = new Date(agora.getTime() + VALIDADE_RECUPERACAO_MINUTOS * 60000);
    if (!await this.repository.salvarCodigo(usuario, codigoHash, expiraEm, agora)) return;
    try {
      await this.emailService.enviarRecuperacao(usuario.email, codigo, VALIDADE_RECUPERACAO_MINUTOS);
    } catch {
      await this.repository.descartarCodigo(usuario.id, codigoHash);
      console.error("Falha no envio do e-mail de recuperação. Verifique o serviço SMTP.");
      // Mantém a resposta pública neutra, sem registrar código, e-mail ou credenciais.
    }
  }

  async redefinir({ email, codigo, senha, confirmacaoSenha } = {}) {
    const emailNormalizado = normalizarEmail(email);
    if (typeof codigo !== "string" || !/^[0-9]{6}$/.test(codigo)) {
      throw new RecuperacaoSenhaError(CODIGO_INVALIDO);
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
    const usuario = await this.repository.buscarConta(emailNormalizado);
    if (!usuario || !await this.repository.redefinir(usuario, hashCodigo(usuario.id, codigo), senhaHash, new Date())) {
      throw new RecuperacaoSenhaError(CODIGO_INVALIDO);
    }
  }
}
