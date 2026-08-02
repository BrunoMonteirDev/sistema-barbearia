import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  listar: vi.fn(), buscarPorId: vi.fn(), criar: vi.fn(), atualizar: vi.fn(), atualizarPerfil: vi.fn(), remover: vi.fn(),
}));
vi.mock("../services/usuario.service", () => ({ usuarioService: mocks }));

import usuariosRoutes from "./usuarios";

const app = express();
app.use(express.json());
app.use((req, _res, next) => { req.auth = { sub: "usuario-logado", nivel: req.header("x-role") === "admin" ? "Administrador" : "Cliente" }; next(); });
app.use("/usuarios", usuariosRoutes);

describe("rotas de usuários", () => {
  beforeEach(() => vi.clearAllMocks());

  it("permite ao cliente consultar seu próprio perfil", async () => {
    mocks.buscarPorId.mockResolvedValue({ id: "usuario-logado", nome: "Cliente", email: "cliente@teste.com", dataNascimento: null });
    const response = await request(app).get("/usuarios/me");
    expect(response.status).toBe(200);
    expect(response.body.nome).toBe("Cliente");
  });

  it("bloqueia listagem administrativa para cliente", async () => {
    await request(app).get("/usuarios").expect(403);
    expect(mocks.listar).not.toHaveBeenCalled();
  });

  it("cria cliente administrativo sem e-mail informado", async () => {
    mocks.criar.mockImplementation(async (dados) => ({ id: "novo", ...dados }));
    const response = await request(app).post("/usuarios").set("x-role", "admin").send({ nome: "Novo cliente", telefone: "44999999999", nivel: "Cliente" });
    expect(response.status).toBe(201);
    expect(mocks.criar).toHaveBeenCalledWith(expect.objectContaining({ email: expect.stringMatching(/^cliente-.+@sem-email\.local$/), nivel: "Cliente" }));
  });

  it("rejeita senha que não atende às regras", async () => {
    const response = await request(app).post("/usuarios").set("x-role", "admin").send({ nome: "Novo", senha: "123" });
    expect(response.status).toBe(400);
    expect(mocks.criar).not.toHaveBeenCalled();
  });

  it("desativa em vez de excluir fisicamente o usuário", async () => {
    mocks.remover.mockResolvedValue({ id: "u-2", ativo: false });
    await request(app).delete("/usuarios/u-2").set("x-role", "admin").expect(200, { success: true });
    expect(mocks.remover).toHaveBeenCalledWith("u-2");
  });
});
