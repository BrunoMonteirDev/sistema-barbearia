/** Envia o link pelo SMTP do Mailtrap; nenhuma credencial é enviada ao navegador. */
import nodemailer from "nodemailer";
import { RecuperacaoSenhaError } from "./recuperacao-senha.service.js";

export class EmailService {
  constructor(env = process.env, criarTransporte = nodemailer.createTransport) {
    this.env = env;
    this.criarTransporte = criarTransporte;
  }

  validarConfiguracao() {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM, APP_URL } = this.env;
    const porta = Number(SMTP_PORT);
    let url;
    try { url = new URL(APP_URL); } catch { /* Tratado como configuração ausente. */ }
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !EMAIL_FROM ||
        !Number.isInteger(porta) || porta < 1 || porta > 65535 || !url ||
        !["http:", "https:"].includes(url.protocol) || url.username || url.password ||
        (this.env.NODE_ENV === "production" && url.protocol !== "https:")) {
      throw new RecuperacaoSenhaError(
        "A recuperação por e-mail está temporariamente indisponível. Tente novamente mais tarde.", 503,
      );
    }
  }

  async enviarRecuperacao(destinatario, token, validadeMinutos) {
    this.validarConfiguracao();
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM, APP_URL } = this.env;
    const transporte = this.criarTransporte({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      requireTLS: true,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      disableFileAccess: true,
      disableUrlAccess: true,
    });
    // O endereço vem de configuração confiável, nunca do cabeçalho Host.
    // O fragmento (#) não é enviado ao servidor ao abrir a página nem no Referer.
    const link = new URL("/redefinir-senha", APP_URL);
    link.hash = new URLSearchParams({ token }).toString();
    await transporte.sendMail({
      from: EMAIL_FROM,
      to: destinatario,
      subject: "Redefinir sua senha — Barbearia",
      text: [
        "Recebemos uma solicitação para redefinir sua senha.",
        `Acesse o link abaixo em até ${validadeMinutos} minutos:`,
        link.toString(),
        "O link funciona uma única vez. Se você solicitou outro link, use o mais recente.",
        "Se você não fez esta solicitação, ignore este e-mail. Sua senha permanece igual.",
      ].join("\n\n"),
    });
  }
}
