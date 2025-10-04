import type { Request, Response, NextFunction } from "express";
import { decodeToken } from "../helpers/jwt";

export const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers["authorization"];
  const token =
    typeof header === "string" && header.startsWith("Bearer ")
      ? header.slice(7)
      : undefined;
  if (!token) {
    return res.status(401).json({ message: "unauthorized" });
  }
  const decoded = decodeToken(token);
  if (!decoded || typeof decoded !== "object" || !("userId" in decoded)) {
    return res.status(401).json({ message: "unauthorized" });
  }
  (req as any).user = decoded;
  return next();
};
