/** Usa exclusivamente TEST_DATABASE_URL. Nunca usa o banco normal do .env. */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import { test } from "node:test";
import express from "express";
import { RecuperacaoSenhaService, hashCodigo } from "../src/backend/auth/recuperacao-senha.service.js";
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
    async enviarRecuperacao(email, codigo) { mensagens.push({ email, codigo }); },
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
    return mensagens.at(-1).codigo;
  };
  const redefinir = (usuario, codigo) => service.redefinir({ email: usuario.email, codigo, senha: senhaNova, confirmacaoSenha: senhaNova });
  const liberarReenvio = (usuario) => prisma.usuario.update({
    where: { id: usuario.id }, data: { recuperacaoSolicitadaEm: new Date(Date.now() - 60000) },
  });
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

  await t.test("consome o código uma vez, altera o login e invalida a sessão anterior", async () => {
    const usuario = await criarConta();
    const sessaoAntiga = signToken(usuario);
    assert.equal((await fetch(`${base}/privado`, { headers: { Authorization: `Bearer ${sessaoAntiga}` } })).status, 200);
    const token = await solicitar(usuario);
    const registro = await prisma.usuario.findUnique({ where: { id: usuario.id } });
    assert.equal(registro.recuperacaoTokenHash, hashCodigo(usuario.id, token));
    assert.notEqual(registro.recuperacaoTokenHash, token);
    assert.equal(registro.recuperacaoExpiraEm - registro.recuperacaoSolicitadaEm, 600000);
    const resultado = await post("/redefinir", { email: usuario.email, codigo: token, senha: senhaNova, confirmacaoSenha: senhaNova });
    assert.equal(resultado.status, 200);
    assert.equal((await fetch(`${base}/privado`, { headers: { Authorization: `Bearer ${sessaoAntiga}` } })).status, 401);
    assert.equal((await post("/login", { email: usuario.email, password: "SenhaAntiga!82" })).status, 401);
    const login = await post("/login", { email: usuario.email, password: senhaNova });
    assert.equal(login.status, 200);
    const { token: novaSessao } = await login.json();
    assert.equal((await fetch(`${base}/privado`, { headers: { Authorization: `Bearer ${novaSessao}` } })).status, 200);
    await assert.rejects(redefinir(usuario, token), /Código inválido/);
  });

  await t.test("código expirado não modifica a senha", async () => {
    const usuario = await criarConta();
    const token = await solicitar(usuario);
    await prisma.usuario.update({ where: { id: usuario.id }, data: { recuperacaoExpiraEm: new Date(Date.now() - 1000) } });
    await assert.rejects(redefinir(usuario, token), /Código inválido/);
    assert.equal((await prisma.usuario.findUnique({ where: { id: usuario.id } })).senhaHash, usuario.senhaHash);
  });

  await t.test("segundo código invalida o primeiro e não pode redefinir outra conta", async () => {
    const usuario = await criarConta();
    const outra = await criarConta();
    const primeiro = await solicitar(usuario);
    await liberarReenvio(usuario);
    const segundo = await solicitar(usuario);
    assert.notEqual(primeiro, segundo);
    await assert.rejects(redefinir(outra, segundo), /Código inválido/);
    await assert.rejects(redefinir(usuario, primeiro), /Código inválido/);
    await redefinir(usuario, segundo);
    assert.equal((await prisma.usuario.findUnique({ where: { id: outra.id } })).senhaHash, outra.senhaHash);
  });

  await t.test("requisições simultâneas só consomem o código uma vez", async () => {
    const usuario = await criarConta();
    const token = await solicitar(usuario);
    const resultados = await Promise.allSettled([redefinir(usuario, token), redefinir(usuario, token)]);
    assert.equal(resultados.filter((r) => r.status === "fulfilled").length, 1);
    assert.equal(resultados.filter((r) => r.status === "rejected").length, 1);
  });

  await t.test("troca administrativa invalida o código pendente", async () => {
    const usuario = await criarConta();
    const token = await solicitar(usuario);
    await usuarioService.atualizar(usuario.id, { senha: senhaNova });
    await assert.rejects(redefinir(usuario, token), /Código inválido/);
    const atualizado = await prisma.usuario.findUnique({ where: { id: usuario.id } });
    assert.equal(atualizado.versaoSessao, 1);
    assert.ok(await compararSenha(senhaNova, atualizado.senhaHash));
  });

  await t.test("conta desativada depois da solicitação não pode usar o código", async () => {
    const usuario = await criarConta();
    const token = await solicitar(usuario);
    await prisma.usuario.update({ where: { id: usuario.id }, data: { ativo: false } });
    await assert.rejects(redefinir(usuario, token), /Código inválido/);
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
    assert.equal((await post("/solicitar", { email })).status, 200);
    const resposta = await post("/solicitar", { email });
    assert.equal(resposta.status, 429);
    assert.ok(resposta.headers.has("retry-after"));
  });

  await t.test("intervalo de um minuto persiste no banco e serializa solicitações simultâneas", async () => {
    const usuario = await criarConta();
    const antes = mensagens.length;
    await Promise.all([service.solicitar(usuario.email), service.solicitar(usuario.email)]);
    assert.equal(mensagens.length, antes + 1);
    const primeiro = mensagens.at(-1).codigo;
    const registro = await prisma.usuario.findUnique({ where: { id: usuario.id } });
    await service.solicitar(usuario.email.toUpperCase());
    assert.equal(mensagens.length, antes + 1);
    // Verifica o limite exato sem esperar um minuto na suíte.
    const conta = await repository.buscarConta(usuario.email);
    const substituto = primeiro === "000000" ? "000001" : "000000";
    const instante = registro.recuperacaoSolicitadaEm.getTime();
    assert.equal(await repository.salvarCodigo(conta, hashCodigo(usuario.id, substituto), new Date(instante + 660000), new Date(instante + 59999)), false);
    assert.equal(await repository.salvarCodigo(conta, hashCodigo(usuario.id, substituto), new Date(instante + 660000), new Date(instante + 60000)), true);
    assert.notEqual((await prisma.usuario.findUnique({ where: { id: usuario.id } })).recuperacaoTokenHash, hashCodigo(usuario.id, primeiro));
  });

  await t.test("cinco erros esgotam o código mesmo sob concorrência; novo envio restaura tentativas", async () => {
    const usuario = await criarConta();
    const codigo = await solicitar(usuario);
    const errado = codigo === "000000" ? "000001" : "000000";
    const resultados = await Promise.allSettled(Array.from({ length: 7 }, () => redefinir(usuario, errado)));
    assert.equal(resultados.filter((r) => r.status === "rejected").length, 7);
    assert.equal((await prisma.usuario.findUnique({ where: { id: usuario.id } })).recuperacaoTentativas, 5);
    await assert.rejects(redefinir(usuario, codigo), /Código inválido/);
    await liberarReenvio(usuario);
    const novo = await solicitar(usuario);
    assert.equal((await prisma.usuario.findUnique({ where: { id: usuario.id } })).recuperacaoTentativas, 0);
    await redefinir(usuario, novo);
  });

  await t.test("aceita código correto na quinta tentativa", async () => {
    const usuario = await criarConta();
    const codigo = await solicitar(usuario);
    const errado = codigo === "000000" ? "000001" : "000000";
    for (let i = 0; i < 4; i++) await assert.rejects(redefinir(usuario, errado), /Código inválido/);
    await redefinir(usuario, codigo);
  });

  await t.test("expira exatamente no décimo minuto e preserva zeros à esquerda", async () => {
    const usuario = await criarConta();
    const agora = new Date();
    const codigo = "012345";
    await repository.salvarCodigo(usuario, hashCodigo(usuario.id, codigo), agora, new Date(agora.getTime() - 600000));
    assert.equal(await repository.redefinir(usuario, hashCodigo(usuario.id, codigo), usuario.senhaHash, agora), false);
    await liberarReenvio(usuario);
    await repository.salvarCodigo(usuario, hashCodigo(usuario.id, codigo), new Date(Date.now() + 600000), new Date());
    await redefinir(usuario, codigo);
  });

  await t.test("falha SMTP mantém intervalo e não apaga código mais recente", async () => {
    const usuario = await criarConta();
    const primeiro = await solicitar(usuario);
    await liberarReenvio(usuario);
    const segundo = await solicitar(usuario);
    await repository.descartarCodigo(usuario.id, hashCodigo(usuario.id, primeiro));
    const registro = await prisma.usuario.findUnique({ where: { id: usuario.id } });
    assert.equal(registro.recuperacaoTokenHash, hashCodigo(usuario.id, segundo));
    await repository.descartarCodigo(usuario.id, hashCodigo(usuario.id, segundo));
    const antes = mensagens.length;
    await service.solicitar(usuario.email);
    assert.equal(mensagens.length, antes);
  });

});
