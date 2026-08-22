import { Router, Request, Response } from "express";
import db from "../db.js";
import { hasAdmin, createAdmin, verifyAdmin, signToken } from "../auth.js";
import { requireAuth, AuthedRequest } from "../middleware.js";

const router = Router();

/** GET /api/auth/status — нужен ли логин / есть ли админ */
router.get("/status", (_req: Request, res: Response) => {
  res.json({ hasAdmin: hasAdmin() });
});

/** POST /api/auth/setup — первичное создание админа (только если ещё нет) */
router.post("/setup", (req: Request, res: Response) => {
  if (hasAdmin()) {
    res.status(409).json({ error: "Администратор уже существует" });
    return;
  }
  const { username, password } = req.body as { username?: string; password?: string };
  if (!username || !password || password.length < 6) {
    res.status(400).json({ error: "Логин и пароль (минимум 6 символов) обязательны" });
    return;
  }
  createAdmin(username, password);
  res.json({ ok: true });
});

/** POST /api/auth/login — вход */
router.post("/login", (req: Request, res: Response) => {
  const { username, password } = req.body as { username?: string; password?: string };
  if (!username || !password) {
    res.status(400).json({ error: "Введите логин и пароль" });
    return;
  }
  const admin = verifyAdmin(username, password);
  if (!admin) {
    res.status(401).json({ error: "Неверный логин или пароль" });
    return;
  }
  res.json({ token: signToken(admin), username: admin.username });
});

/** GET /api/auth/me — проверка токена */
router.get("/me", requireAuth, (req: AuthedRequest, res: Response) => {
  res.json({ id: req.admin!.id, username: req.admin!.username });
});

export default router;
