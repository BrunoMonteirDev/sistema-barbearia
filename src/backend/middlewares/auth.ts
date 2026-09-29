import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

const secret = () => {
  const value = process.env.JWT_SECRET
  if (!value) throw new Error('JWT_SECRET não foi configurado.')
  return value
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.header('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return res.status(401).json({ error: 'Autenticação obrigatória.' })

  try {
    req.auth = jwt.verify(token, secret()) as Request['auth']
    return next()
  } catch {
    return res.status(401).json({ error: 'Sessão inválida ou expirada.' })
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.auth?.nivel !== 'Administrador') return res.status(403).json({ error: 'Acesso restrito ao administrador.' })
  return next()
}

export function requireStaff(req: Request, res: Response, next: NextFunction) {
  if (!['Administrador', 'Funcionario', 'Funcionário'].includes(req.auth?.nivel ?? '')) return res.status(403).json({ error: 'Acesso restrito à equipe.' })
  return next()
}

export function signToken(user: { id: string; nivel: string }) {
  return jwt.sign({ sub: user.id, nivel: user.nivel }, secret(), { expiresIn: '8h' })
}
