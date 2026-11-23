import assert from "node:assert/strict";
import { test } from "node:test";
import { EmailService } from "../src/backend/auth/email.service.js";
import { RecuperacaoSenhaService, hashToken } from "../src/backend/auth/recuperacao-senha.service.js";

const configuracao = {
  SMTP_HOST: "sandbox.smtp.mailtrap.io", SMTP_PORT: "2525",
  SMTP_USER: "teste", SMTP_PASS: "teste", EMAIL_FROM: "Barbearia <teste@example.com>",
  APP_URL: "https://barbearia.example.com",
};

test("monta e-mail com link no domínio configurado, token no fragmento e SMTP com TLS", async () => {
  let mensagem;
  let transporte;
  const service = new EmailService(configuracao, (opcoes) => {
    transporte = opcoes;
    return { sendMail: async (dados) => { mensagem = dados; } };
  });
  const token = "a".repeat(64);
  await service.enviarRecuperacao("cliente@example.com", token, 30);
  assert.equal(transporte.requireTLS, true);
  assert.equal(transporte.secure, false);
  assert.equal(mensagem.to, "cliente@example.com");
  assert.ok(mensagem.text.includes(`https://barbearia.example.com/redefinir-senha#token=${token}`));
  assert.ok(mensagem.text.includes("30 minutos"));
  assert.ok(!mensagem.text.includes(configuracao.SMTP_PASS + "@"));
});

test("configuração incompleta e HTTP em produção são recusados sem consultar contas", async () => {
  const repository = { buscarConta: () => assert.fail("Não deveria consultar a conta") };
  for (const env of [{}, { ...configuracao, NODE_ENV: "production", APP_URL: "http://example.com" }]) {
    const service = new RecuperacaoSenhaService(repository, new EmailService(env));
    await assert.rejects(service.solicitar("cliente@example.com"), { status: 503 });
  }
});

test("falha SMTP descarta somente o token enviado e mantém resposta neutra", async (t) => {
  t.mock.method(console, "error", () => {});
  let salvo;
  let descartado;
  const service = new RecuperacaoSenhaService({
    buscarConta: async () => ({ id: "teste", email: "cliente@example.com" }),
    salvarToken: async (_usuario, hash) => { salvo = hash; return true; },
    descartarToken: async (hash) => { descartado = hash; },
  }, {
    validarConfiguracao() {},
    async enviarRecuperacao(_email, token) {
      assert.equal(hashToken(token), salvo);
      throw new Error("Falha simulada");
    },
  });
  assert.equal(await service.solicitar("cliente@example.com"), undefined);
  assert.equal(descartado, salvo);
});

test("entrada inválida, senha fraca e confirmação diferente não chegam à persistência", async () => {
  const service = new RecuperacaoSenhaService({
    redefinir: () => assert.fail("Não deveria persistir"),
  }, {});
  await assert.rejects(service.solicitar("email-invalido"), { status: 400 });
  await assert.rejects(service.redefinir({ token: "invalido" }), { status: 400 });
  await assert.rejects(service.redefinir({ token: "a".repeat(64), senha: "curta" }), /10 caracteres/);
  await assert.rejects(service.redefinir({ token: "a".repeat(64), senha: "NovaSenha!82", confirmacaoSenha: "outra" }), /não coincidem/);
  await assert.rejects(service.redefinir({ token: "a".repeat(64), senha: "Á".repeat(40) }), /72 bytes/);
});
