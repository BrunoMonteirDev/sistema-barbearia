/** Limita tentativas sem bloquear a conta nem impedir o login normal. */
import { createHash } from "node:crypto";
import { rateLimit } from "express-rate-limit";

const opcoes = {
  windowMs: 15 * 60 * 1000,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Muitas tentativas. Aguarde 15 minutos e tente novamente." },
};

// Os limites são por processo. Várias instâncias devem compartilhar um store.
export const limitarSolicitacoesPorIp = rateLimit({ ...opcoes, limit: 30 });
export const limitarRedefinicoes = rateLimit({ ...opcoes, limit: 20 });
export const limitarSolicitacoesPorEmail = rateLimit({
  ...opcoes,
  windowMs: 60 * 1000,
  limit: 1,
  handler: (req, res) => {
    const reenvioEmSegundos = Math.max(1, Math.ceil((req.rateLimit.resetTime.getTime() - Date.now()) / 1000));
    res.set("Cache-Control", "no-store");
    res.set("Retry-After", String(reenvioEmSegundos));
    res.status(429).json({ error: `Aguarde ${reenvioEmSegundos} segundos para solicitar outro código.`, reenvioEmSegundos });
  },
  keyGenerator: (req) => {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    return createHash("sha256").update(email).digest("hex");
  },
});
