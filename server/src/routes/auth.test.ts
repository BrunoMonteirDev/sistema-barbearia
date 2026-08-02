import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  process.env.JWT_SECRET = "segredo-de-teste";
  return { buscarPorEmail: vi.fn(), buscarPorGoogleSubject: vi.fn(), criar: vi.fn(), compare: vi.fn(), verifyGoogle: vi.fn() };
});

vi.mock("../services/usuario.service", () => ({
  usuarioService: { buscarPorEmail: mocks.buscarPorEmail, buscarPorGoogleSubject: mocks.buscarPorGoogleSubject, criar: mocks.criar },
}));
vi.mock("bcryptjs", () => ({ default: { compare: mocks.compare } }));
vi.mock("google-auth-library", () => ({ OAuth2Client: class { verifyIdToken = mocks.verifyGoogle } }));

import authRoutes from "./auth";

const app = express();
app.use(express.json());
app.use("/auth", authRoutes);

describe("rotas de autenticação", () => {
  beforeEach(() => { vi.clearAllMocks(); delete process.env.GOOGLE_CLIENT_ID });

  it("rejeita login sem credenciais", async () => {
    const response = await request(app).post("/auth/login").send({ email: "cliente@teste.com" });
    expect(response.status).toBe(400);
  });

  it("rejeita login com senha incorreta", async () => {
    mocks.buscarPorEmail.mockResolvedValue({ id: "u1", senhaHash: "hash" });
    mocks.compare.mockResolvedValue(false);
    const response = await request(app).post("/auth/login").send({ email: "cliente@teste.com", password: "errada" });
    expect(response.status).toBe(401);
  });

  it("emite sessão para login válido", async () => {
    mocks.buscarPorEmail.mockResolvedValue({ id: "u1", nome: "Cliente", email: "cliente@teste.com", nivel: "Cliente", senhaHash: "hash" });
    mocks.compare.mockResolvedValue(true);
    const response = await request(app).post("/auth/login").send({ email: "cliente@teste.com", password: "Senha@123" });
    expect(response.status).toBe(200);
    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.user).toMatchObject({ id: "u1", nivel: "Cliente" });
  });

  it("impede cadastro com e-mail já utilizado", async () => {
    mocks.buscarPorEmail.mockResolvedValue({ id: "u1" });
    const response = await request(app).post("/auth/register").send({ nome: "Cliente", email: "cliente@teste.com", password: "Senha@123" });
    expect(response.status).toBe(409);
  });

  it("cria cliente e emite sessão no cadastro válido", async () => {
    mocks.buscarPorEmail.mockResolvedValue(null);
    mocks.criar.mockResolvedValue({ id: "u2", nome: "Novo", email: "novo@teste.com", nivel: "Cliente" });
    const response = await request(app).post("/auth/register").send({ nome: "Novo", email: "novo@teste.com", password: "Senha@123", telefone: "44999999999" });
    expect(response.status).toBe(201);
    expect(mocks.criar).toHaveBeenCalledWith(expect.objectContaining({ nivel: "Cliente", telefone: "44999999999" }));
    expect(response.body.token).toEqual(expect.any(String));
  });

  it("cria conta Google com cadastro pendente após validar o token", async () => {
    process.env.GOOGLE_CLIENT_ID = "cliente-google-teste";
    mocks.verifyGoogle.mockResolvedValue({ getPayload: () => ({ sub: "google-1", email: "google@teste.com", email_verified: true, name: "Google Cliente", picture: "https://foto.test/avatar" }) });
    mocks.buscarPorGoogleSubject.mockResolvedValue(null);
    mocks.buscarPorEmail.mockResolvedValue(null);
    mocks.criar.mockResolvedValue({ id: "u-google", nome: "Google Cliente", email: "google@teste.com", nivel: "Cliente", cadastroConcluido: false });

    const response = await request(app).post("/auth/google").send({ idToken: "token-google" });

    expect(response.status).toBe(201);
    expect(mocks.criar).toHaveBeenCalledWith(expect.objectContaining({ provedorAuth: "GOOGLE", googleSubject: "google-1", cadastroConcluido: false }));
    expect(response.body.user.cadastroConcluido).toBe(false);
  });
});
