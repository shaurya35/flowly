import type { Request, Response } from "express";
import { prisma } from "store";

export const getAllWorkflows = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as string | undefined;
    if (!userId) return res.status(401).json({ message: "unauthorized" });
    const workflows = await prisma.workflow.findMany({
      where: { userId },
      include: { nodes: true },
    });
    return res.status(200).json(workflows);
  } catch (error) {
    return res.status(500).json({ message: "internal server error" });
  }
};

export const getWorkflowById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as string | undefined;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ message: "unauthorized" });
    const workflow = await prisma.workflow.findFirst({
      where: { id, userId },
      include: { nodes: true },
    });
    if (!workflow) return res.status(404).json({ message: "not found" });
    return res.status(200).json(workflow);
  } catch (error) {
    return res.status(500).json({ message: "internal server error" });
  }
};

export const createWorkflow = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as string | undefined;
    if (!userId) return res.status(401).json({ message: "unauthorized" });
    const {
      name,
      description,
      status,
      triggerType,
      triggerConfig,
      retryCount,
      timeoutMs,
      parallelExecution,
    } = req.body ?? {};
    const workflow = await prisma.workflow.create({
      data: {
        name,
        description,
        status,
        triggerType,
        triggerConfig,
        retryCount,
        timeoutMs,
        parallelExecution,
        userId,
      },
    });
    return res.status(201).json(workflow);
  } catch (error) {
    return res.status(500).json({ message: "internal server error" });
  }
};

export const updateWorkflow = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as string | undefined;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ message: "unauthorized" });
    const existing = await prisma.workflow.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ message: "not found" });
    const {
      name,
      description,
      status,
      triggerType,
      triggerConfig,
      retryCount,
      timeoutMs,
      parallelExecution,
    } = req.body ?? {};
    const workflow = await prisma.workflow.update({
      where: { id },
      data: {
        name,
        description,
        status,
        triggerType,
        triggerConfig,
        retryCount,
        timeoutMs,
        parallelExecution,
      },
    });
    return res.status(200).json(workflow);
  } catch (error) {
    return res.status(500).json({ message: "internal server error" });
  }
};

export const deleteWorkflow = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as string | undefined;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ message: "unauthorized" });
    const existing = await prisma.workflow.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ message: "not found" });
    await prisma.workflow.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "internal server error" });
  }
};

export const executeWorkflow = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as string | undefined;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ message: "unauthorized" });
    if (!id)
      return res.status(400).json({ message: "workflow id is required" });

    const workflow = await prisma.workflow.findFirst({
      where: { id, userId },
      include: { nodes: true },
    });
    if (!workflow) return res.status(404).json({ message: "not found" });

    const execution = await prisma.workflowExecution.create({
      data: {
        workflowId: id,
        status: "running",
      },
    });

    await prisma.workflow.update({
      where: { id },
      data: {
        totalRuns: { increment: 1 },
        lastRun: new Date(),
      },
    });

    return res
      .status(200)
      .json({ executionId: execution.id, status: "started" });
  } catch (error) {
    return res.status(500).json({ message: "internal server error" });
  }
};
