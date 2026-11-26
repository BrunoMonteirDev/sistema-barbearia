/** Envia o código pelo SMTP do Mailtrap; nenhuma credencial é enviada ao navegador. */
import nodemailer from "nodemailer";
import { RecuperacaoSenhaError } from "./recuperacao-senha.service.js";

export class EmailService {
  constructor(env = process.env, criarTransporte = nodemailer.createTransport) {
    this.env = env;
    this.criarTransporte = criarTransporte;
  }

  validarConfiguracao() {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } = this.env;
    const porta = Number(SMTP_PORT);
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !EMAIL_FROM ||
        !Number.isInteger(porta) || porta < 1 || porta > 65535) {
      throw new RecuperacaoSenhaError(
        "A recuperação por e-mail está temporariamente indisponível. Tente novamente mais tarde.", 503,
      );
    }
  }

  async enviarRecuperacao(destinatario, codigo, validadeMinutos) {
    this.validarConfiguracao();
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } = this.env;
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
    await transporte.sendMail({
      from: EMAIL_FROM,
      to: destinatario,
      subject: "Redefinir sua senha — Barbearia",
      text: [
        "Recebemos uma solicitação para redefinir sua senha.",
        `Seu código de recuperação é: ${codigo}`,
        `Digite este código na tela de recuperação em até ${validadeMinutos} minutos.`,
        "O código funciona uma única vez. Se você solicitou outro código, os anteriores ficam inválidos. Use o mais recente.",
        "Se você não fez esta solicitação, ignore este e-mail. Sua senha permanece igual.",
      ].join("\n\n"),
    });
  }
}
