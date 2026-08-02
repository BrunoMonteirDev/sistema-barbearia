import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../src/app";

describe("API - integração com banco de testes", () => {
  it("responde ao health check", async () => {
    const response = await request(app).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  it("consulta configuração pública no banco exclusivo de testes", async () => {
    const response = await request(app).get("/api/configuracoes-publicas");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("telefoneWhatsApp");
  });
});
