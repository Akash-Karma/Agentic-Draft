import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt";

export async function requireUser(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: "Invalid or expired session" });
  }

  (req as any).userId = payload.userId;
  next();
}