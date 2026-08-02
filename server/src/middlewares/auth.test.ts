import express from "express";
import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { authenticate, requireAdmin, signToken } from "./auth";

const app = express();
app.get("/protegida", authenticate, (_req, res) => res.json({ ok: true }));
app.get("/admin", authenticate, requireAdmin, (_req, res) => res.json({ ok: true }));

describe("middlewares de autenticação", () => {
  beforeAll(() => { process.env.JWT_SECRET = "segredo-de-teste"; });

  it("rejeita uma rota protegida sem token", async () => {
    await request(app).get("/protegida").expect(401);
  });

  it("rejeita token inválido", async () => {
    await request(app).get("/protegida").set("Authorization", "Bearer invalido").expect(401);
  });

  it("permite usuário autenticado em rota protegida", async () => {
    const token = signToken({ id: "cliente-1", nivel: "Cliente" });
    await request(app).get("/protegida").set("Authorization", `Bearer ${token}`).expect(200, { ok: true });
  });

  it("bloqueia cliente em rota administrativa", async () => {
    const token = signToken({ id: "cliente-1", nivel: "Cliente" });
    await request(app).get("/admin").set("Authorization", `Bearer ${token}`).expect(403);
  });

  it("permite administrador em rota administrativa", async () => {
    const token = signToken({ id: "admin-1", nivel: "Administrador" });
    await request(app).get("/admin").set("Authorization", `Bearer ${token}`).expect(200, { ok: true });
  });
});
