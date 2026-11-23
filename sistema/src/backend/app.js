/** Papel do módulo: Monta a aplicação Express, configura middlewares e conecta cada grupo de rotas da API. */
import express from "express";
import cors from "cors";
import authRoutes from "./auth/auth.routes.js";
import servicosRoutes from "./servicos/servico.routes.js";
import profissionaisRoutes from "./profissionais/profissional.routes.js";
import agendamentosRoutes from "./agendamentos/agendamento.routes.js";
import configuracoesRoutes from "./configuracoes/configuracao.routes.js";
import usuariosRoutes from "./usuarios/usuario.routes.js";
import bloqueioDataRoutes from "./agendamentos/bloqueio-data.routes.js";
import { authenticate, requireAdmin } from "./middlewares/auth.js";
import { prisma } from "./lib/prisma.js";
export const app = express();
app.use(cors());
app.use(express.json());
app.get("/api/health", (_req, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString() }),
);
app.get("/api/configuracoes-publicas", async (_req, res) => {
  const configuracao = await prisma.configuracao.findFirst({
    select: { telefoneWhatsApp: true, email: true, instagram: true },
  });
  res.json({
    telefoneWhatsApp: configuracao?.telefoneWhatsApp ?? null,
    email: configuracao?.email ?? null,
    instagram: configuracao?.instagram ?? null,
  });
});
app.use("/api/auth", authRoutes);
app.use("/api/servicos", servicosRoutes);
app.use("/api/profissionais", profissionaisRoutes);
app.use(
  "/api/agendamentos",
  (req, res, next) => {
    if (req.method === "GET" && req.path === "/disponibilidade") return next();
    return authenticate(req, res, next);
  },
  agendamentosRoutes,
);
app.use("/api/configuracoes", authenticate, requireAdmin, configuracoesRoutes);
app.use("/api/bloqueios-data", authenticate, requireAdmin, bloqueioDataRoutes);
app.use("/api/usuarios", authenticate, usuariosRoutes);
