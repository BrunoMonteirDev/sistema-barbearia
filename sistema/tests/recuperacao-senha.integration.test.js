/** Usa exclusivamente TEST_DATABASE_URL. Nunca usa o banco normal do .env. */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import { test } from "node:test";
import express from "express";
import { RecuperacaoSenhaService, hashToken } from "../src/backend/auth/recuperacao-senha.service.js";
import { RecuperacaoSenhaController } from "../src/backend/auth/recuperacao-senha.controller.js";
import { compararSenha, gerarHash } from "../src/backend/auth/senha.service.js";

test("fluxo de recuperação com PostgreSQL e HTTP", { skip: !process.env.TEST_DATABASE_URL }, async (t) => {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
  process.env.JWT_SECRET = "segredo-exclusivo-dos-testes-de-recuperacao";
  const { prisma } = await import("../src/backend/lib/prisma.js");
  const { RecuperacaoSenhaRepository } = await import("../src/backend/auth/recuperacao-senha.repository.js");
  const { authenticate, signToken } = await import("../src/backend/middlewares/auth.js");
  const { usuarioService } = await import("../src/backend/usuarios/usuario.service.js");
  const { AuthService } = await import("../src/backend/auth/auth.service.js");
  const { AuthController } = await import("../src/backend/auth/auth.controller.js");
  const { limitarSolicitacoesPorEmail, limitarRedefinicoes } = await import("../src/backend/auth/recuperacao-senha.limiter.js");
  const criados = [];
  const mensagens = [];
  const repository = new RecuperacaoSenhaRepository();
  const service = new RecuperacaoSenhaService(repository, {
    validarConfiguracao() {},
    async enviarRecuperacao(email, token) { mensagens.push({ email, token }); },
  });
  const controller = new RecuperacaoSenhaController(service);
  const app = express();
  app.use(express.json());
  app.post("/solicitar", limitarSolicitacoesPorEmail, controller.solicitar);
  app.post("/redefinir", limitarRedefinicoes, controller.redefinir);
  app.post("/login", new AuthController(new AuthService(usuarioService)).login);
  app.get("/privado", authenticate, (_req, res) => res.json({ ok: true }));
  const servidor = app.listen(0, "127.0.0.1");
  await once(servidor, "listening");
  const base = `http://127.0.0.1:${servidor.address().port}`;
  const post = (path, dados) => fetch(`${base}${path}`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(dados),
  });
  const senhaNova = "SenhaNova!82";
  const criarConta = async (extra = {}) => {
    const usuario = await prisma.usuario.create({ data: {
      nome: "Teste recuperação", email: `recuperacao-${randomUUID()}@example.com`,
      senhaHash: await gerarHash("SenhaAntiga!82"), ...extra,
    } });
    criados.push(usuario.id);
    return usuario;
  };
  const solicitar = async (usuario) => {
    await service.solicitar(usuario.email);
    return mensagens.at(-1).token;
  };
  const redefinir = (token) => service.redefinir({ token, senha: senhaNova, confirmacaoSenha: senhaNova });
  t.after(async () => {
    servidor.closeAllConnections();
    await new Promise((resolve) => servidor.close(resolve));
    await prisma.usuario.deleteMany({ where: { id: { in: criados } } });
    await prisma.$disconnect();
  });

  await t.test("resposta é igual para conta ativa, inexistente, desativada e apenas Google", async () => {
    const contas = [await criarConta(), await criarConta({ ativo: false }), await criarConta({ senhaHash: null, provedorAuth: "GOOGLE" })];
    const respostas = [];
    const antes = mensagens.length;
    for (const email of [...contas.map((c) => c.email), `ausente-${randomUUID()}@example.com`]) {
      const resposta = await post("/solicitar", { email });
      assert.equal(resposta.status, 200);
      respostas.push(await resposta.json());
    }
    respostas.forEach((resposta) => assert.deepEqual(resposta, respostas[0]));
    assert.equal(mensagens.length - antes, 1);
  });

  await t.test("consome o link uma vez, altera o login e invalida a sessão anterior", async () => {
    const usuario = await criarConta();
    const sessaoAntiga = signToken(usuario);
    assert.equal((await fetch(`${base}/privado`, { headers: { Authorization: `Bearer ${sessaoAntiga}` } })).status, 200);
    const token = await solicitar(usuario);
    const registro = await prisma.usuario.findUnique({ where: { id: usuario.id } });
    assert.equal(registro.recuperacaoTokenHash, hashToken(token));
    assert.notEqual(registro.recuperacaoTokenHash, token);
    assert.ok(registro.recuperacaoExpiraEm > new Date());
    const resultado = await post("/redefinir", { token, senha: senhaNova, confirmacaoSenha: senhaNova });
    assert.equal(resultado.status, 200);
    assert.equal((await fetch(`${base}/privado`, { headers: { Authorization: `Bearer ${sessaoAntiga}` } })).status, 401);
    assert.equal((await post("/login", { email: usuario.email, password: "SenhaAntiga!82" })).status, 401);
    const login = await post("/login", { email: usuario.email, password: senhaNova });
    assert.equal(login.status, 200);
    const { token: novaSessao } = await login.json();
    assert.equal((await fetch(`${base}/privado`, { headers: { Authorization: `Bearer ${novaSessao}` } })).status, 200);
    await assert.rejects(redefinir(token), /inválido ou expirado/);
  });

  await t.test("link expirado não modifica a senha", async () => {
    const usuario = await criarConta();
    const token = await solicitar(usuario);
    await prisma.usuario.update({ where: { id: usuario.id }, data: { recuperacaoExpiraEm: new Date(Date.now() - 1000) } });
    await assert.rejects(redefinir(token), /inválido ou expirado/);
    assert.equal((await prisma.usuario.findUnique({ where: { id: usuario.id } })).senhaHash, usuario.senhaHash);
  });

  await t.test("segundo link invalida o primeiro e não pode redefinir outra conta", async () => {
    const usuario = await criarConta();
    const outra = await criarConta();
    const primeiro = await solicitar(usuario);
    const segundo = await solicitar(usuario);
    await assert.rejects(redefinir(primeiro), /inválido ou expirado/);
    await redefinir(segundo);
    assert.equal((await prisma.usuario.findUnique({ where: { id: outra.id } })).senhaHash, outra.senhaHash);
  });

  await t.test("requisições simultâneas só consomem o token uma vez", async () => {
    const token = await solicitar(await criarConta());
    const resultados = await Promise.allSettled([redefinir(token), redefinir(token)]);
    assert.equal(resultados.filter((r) => r.status === "fulfilled").length, 1);
    assert.equal(resultados.filter((r) => r.status === "rejected").length, 1);
  });

  await t.test("troca administrativa invalida o link pendente", async () => {
    const usuario = await criarConta();
    const token = await solicitar(usuario);
    await usuarioService.atualizar(usuario.id, { senha: senhaNova });
    await assert.rejects(redefinir(token), /inválido ou expirado/);
    const atualizado = await prisma.usuario.findUnique({ where: { id: usuario.id } });
    assert.equal(atualizado.versaoSessao, 1);
    assert.ok(await compararSenha(senhaNova, atualizado.senhaHash));
  });

  await t.test("conta desativada depois da solicitação não pode usar o link", async () => {
    const usuario = await criarConta();
    const token = await solicitar(usuario);
    await prisma.usuario.update({ where: { id: usuario.id }, data: { ativo: false } });
    await assert.rejects(redefinir(token), /inválido ou expirado/);
  });

  await t.test("aceita variação de maiúsculas sem escolher entre contas ambíguas", async () => {
    const usuario = await criarConta();
    const antes = mensagens.length;
    await service.solicitar(` ${usuario.email.toUpperCase()} `);
    assert.equal(mensagens.length, antes + 1);
    await criarConta({ email: usuario.email.toUpperCase() });
    await service.solicitar(usuario.email);
    assert.equal(mensagens.length, antes + 1);
  });

  await t.test("limita solicitações por e-mail mesmo para conta inexistente", async () => {
    const email = `limite-${randomUUID()}@example.com`;
    for (let i = 0; i < 3; i++) assert.equal((await post("/solicitar", { email })).status, 200);
    const resposta = await post("/solicitar", { email });
    assert.equal(resposta.status, 429);
    assert.ok(resposta.headers.has("retry-after"));
  });
});
