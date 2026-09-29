import type { JwtPayload } from 'jsonwebtoken'

declare global {
  namespace Express {
    interface Request {
      auth?: JwtPayload & { sub: string; nivel: 'Administrador' | 'Cliente' }
    }
  }
}

export {}
