/** Papel do módulo: Verifica tokens JWT, confirma no banco se a conta está ativa e aplica a autorização administrativa. */
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
const secret = () => {
  const value = process.env.JWT_SECRET;
  if (!value) throw new Error("JWT_SECRET não foi configurado.");
  return value;
};
export async function authenticate(req, res, next) {
  const token = req.header("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token)
    return res.status(401).json({ error: "Autenticação obrigatória." });

  let payload;
  try {
    payload = jwt.verify(token, secret());
  } catch {
    return res.status(401).json({ error: "Sessão inválida ou expirada." });
  }

  if (typeof payload !== "object" || typeof payload.sub !== "string") {
    return res.status(401).json({ error: "Sessão inválida ou expirada." });
  }

  try {
    // O nível é relido no banco para que mudanças de permissão valham mesmo com um JWT já emitido.
    const usuario = await prisma.usuario.findUnique({
      where: { id: payload.sub },
      select: { id: true, nivel: true, ativo: true },
    });
    if (!usuario?.ativo) {
      return res
        .status(401)
        .json({ error: "Sessão inválida ou conta desativada." });
    }
    req.auth = { ...payload, sub: usuario.id, nivel: usuario.nivel };
    return next();
  } catch (error) {
    console.error("Erro ao validar a sessão no banco de dados.", error);
    return res.status(500).json({ error: "Erro interno ao validar a sessão." });
  }
}
export function requireAdmin(req, res, next) {
  if (req.auth?.nivel !== "Administrador")
    return res.status(403).json({ error: "Acesso restrito ao administrador." });
  return next();
}
export function signToken(user) {
  return jwt.sign({ sub: user.id, nivel: user.nivel }, secret(), {
    expiresIn: "8h",
  });
}
