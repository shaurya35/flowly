import type { Request, Response } from "express";
import { prisma } from "store";

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userPayload = (req as any).user as { userId?: string } | undefined;
    const userId = userPayload?.userId;
    if (!userId) {
      return res.status(401).json({ message: "unauthorized" });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "not found" });
    }
    return res
      .status(200)
      .json({ id: user.id, email: user.email, name: user.name });
  } catch (error) {
    return res.status(500).json({ message: "internal server error" });
  }
};
