import type { Request, Response } from "express";
import { prisma } from "store";

export const getAllNodes = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as string | undefined;
    if (!userId) return res.status(401).json({ message: "unauthorized" });
    const nodes = await prisma.node.findMany({ where: { userId } });
    return res.status(200).json(nodes);
  } catch (error) {
    return res.status(500).json({ message: "internal server error" });
  }
};

export const getNodeById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as string | undefined;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ message: "unauthorized" });
    const node = await prisma.node.findFirst({ where: { id, userId } });
    if (!node) return res.status(404).json({ message: "not found" });
    return res.status(200).json(node);
  } catch (error) {
    return res.status(500).json({ message: "internal server error" });
  }
};

export const createNode = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as string | undefined;
    if (!userId) return res.status(401).json({ message: "unauthorized" });
    const {
      label,
      name,
      description,
      type,
      config,
      positionX,
      positionY,
      connections,
      status,
      workflowId,
    } = req.body ?? {};
    if (!type || !workflowId)
      return res
        .status(400)
        .json({ message: "type and workflowId are required" });
    const node = await prisma.node.create({
      data: {
        label,
        name,
        description,
        type,
        config,
        positionX,
        positionY,
        connections,
        status,
        workflowId,
        userId,
      },
    });
    return res.status(201).json(node);
  } catch (error) {
    return res.status(500).json({ message: "internal server error" });
  }
};

export const updateNode = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as string | undefined;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ message: "unauthorized" });
    const existing = await prisma.node.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ message: "not found" });
    const {
      label,
      name,
      description,
      type,
      config,
      positionX,
      positionY,
      connections,
      status,
    } = req.body ?? {};
    const node = await prisma.node.update({
      where: { id },
      data: {
        label,
        name,
        description,
        type,
        config,
        positionX,
        positionY,
        connections,
        status,
      },
    });
    return res.status(200).json(node);
  } catch (error) {
    return res.status(500).json({ message: "internal server error" });
  }
};

export const deleteNode = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as string | undefined;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ message: "unauthorized" });
    const existing = await prisma.node.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ message: "not found" });
    await prisma.node.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "internal server error" });
  }
};
