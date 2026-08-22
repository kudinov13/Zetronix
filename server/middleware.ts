import { Request, Response, NextFunction } from "express";
import { verifyToken } from "./auth.js";

export interface AuthedRequest extends Request {
  admin?: { id: number; username: string };
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "Требуется авторизация" });
    return;
  }
  const token = header.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Недействительный токен" });
    return;
  }
  req.admin = payload;
  next();
}
