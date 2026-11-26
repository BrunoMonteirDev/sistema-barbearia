import assert from "node:assert/strict";
import { test } from "node:test";
import { EmailService } from "../src/backend/auth/email.service.js";
import { RecuperacaoSenhaService, hashCodigo } from "../src/backend/auth/recuperacao-senha.service.js";

process.env.JWT_SECRET = "segredo-exclusivo-dos-testes";

const configuracao = {
  SMTP_HOST: "sandbox.smtp.mailtrap.io", SMTP_PORT: "2525",
  SMTP_USER: "teste", SMTP_PASS: "teste", EMAIL_FROM: "Barbearia <teste@example.com>",
  APP_URL: "https://barbearia.example.com",
};

test("monta e-mail com código de seis dígitos, prazo e SMTP com TLS, sem link", async () => {
  let mensagem;
  let transporte;
  const service = new EmailService(configuracao, (opcoes) => {
    transporte = opcoes;
    return { sendMail: async (dados) => { mensagem = dados; } };
  });
  const codigo = "012345";
  await service.enviarRecuperacao("cliente@example.com", codigo, 10);
  assert.equal(transporte.requireTLS, true);
  assert.equal(transporte.secure, false);
  assert.equal(mensagem.to, "cliente@example.com");
  assert.ok(mensagem.text.includes(codigo));
  assert.ok(!mensagem.text.includes("http"));
  assert.ok(mensagem.text.includes("10 minutos"));
  assert.ok(!mensagem.text.includes(configuracao.SMTP_PASS + "@"));
});

test("configuração SMTP incompleta é recusada sem consultar contas", async () => {
  const repository = { buscarConta: () => assert.fail("Não deveria consultar a conta") };
  for (const env of [{}, { ...configuracao, SMTP_PORT: "inválida" }]) {
    const service = new RecuperacaoSenhaService(repository, new EmailService(env));
    await assert.rejects(service.solicitar("cliente@example.com"), { status: 503 });
  }
});

test("falha SMTP descarta somente o código enviado e mantém resposta neutra", async (t) => {
  t.mock.method(console, "error", () => {});
  let salvo;
  let descartado;
  const service = new RecuperacaoSenhaService({
    buscarConta: async () => ({ id: "teste", email: "cliente@example.com" }),
    salvarCodigo: async (_usuario, hash) => { salvo = hash; return true; },
    descartarCodigo: async (_id, hash) => { descartado = hash; },
  }, {
    validarConfiguracao() {},
    async enviarRecuperacao(_email, codigo) {
      assert.equal(hashCodigo("teste", codigo), salvo);
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
  await assert.rejects(service.redefinir({ email: "cliente@example.com", codigo: "invalido" }), { status: 400 });
  await assert.rejects(service.redefinir({ email: "cliente@example.com", codigo: "012345", senha: "curta" }), /10 caracteres/);
  await assert.rejects(service.redefinir({ email: "cliente@example.com", codigo: "012345", senha: "NovaSenha!82", confirmacaoSenha: "outra" }), /não coincidem/);
  await assert.rejects(service.redefinir({ email: "cliente@example.com", codigo: "012345", senha: "Á".repeat(40) }), /72 bytes/);
});


test("código gerado tem seis dígitos e validade exata de dez minutos", async () => {
  let hashSalvo;
  const service = new RecuperacaoSenhaService({
    buscarConta: async () => ({ id: "cliente", email: "cliente@example.com" }),
    salvarCodigo: async (_usuario, hash, expiraEm, agora) => {
      hashSalvo = hash;
      assert.equal(expiraEm - agora, 600000);
      return true;
    },
  }, {
    validarConfiguracao() {},
    async enviarRecuperacao(_email, codigo, minutos) {
      assert.match(codigo, /^[0-9]{6}$/);
      assert.equal(minutos, 10);
      assert.equal(hashSalvo, hashCodigo("cliente", codigo));
      assert.notEqual(hashSalvo, hashCodigo("outra-conta", codigo));
    },
  });
  await service.solicitar("cliente@example.com");
});

test("pedido recusado pelo intervalo persistido não envia e-mail", async () => {
  const service = new RecuperacaoSenhaService({
    buscarConta: async () => ({ id: "cliente", email: "cliente@example.com" }),
    salvarCodigo: async () => false,
  }, {
    validarConfiguracao() {},
    enviarRecuperacao: () => assert.fail("Não deveria enviar"),
  });
  await service.solicitar("cliente@example.com");
});
