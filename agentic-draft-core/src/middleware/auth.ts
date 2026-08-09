import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

export async function requireUser(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.header("x-api-key");
  if (!apiKey) {
    return res.status(401).json({ error: "Missing API key" });
  }

  const user = await prisma.user.findUnique({ where: { apiKey } });
  if (!user) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  (req as any).userId = user.id;
  next();
}