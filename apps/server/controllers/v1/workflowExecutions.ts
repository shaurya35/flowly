import type { Request, Response } from "express";
import { prisma } from "store";

export const getAllWorkflowExecutions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as string | undefined;
    if (!userId) return res.status(401).json({ message: "unauthorized" });
    
    const { workflowId } = req.query;
    const whereClause = workflowId 
      ? { workflowId: workflowId as string, workflow: { userId } }
      : { workflow: { userId } };
    
    const executions = await prisma.workflowExecution.findMany({
      where: whereClause,
      include: { 
        workflow: { select: { id: true, name: true } },
        nodeExecutions: { include: { node: { select: { id: true, name: true, type: true } } } }
      },
      orderBy: { startedAt: 'desc' }
    });
    return res.status(200).json(executions);
  } catch (error) {
    return res.status(500).json({ message: "internal server error" });
  }
};

export const getWorkflowExecutionById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as string | undefined;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ message: "unauthorized" });
    if (!id) return res.status(400).json({ message: "execution id is required" });
    
    const execution = await prisma.workflowExecution.findFirst({
      where: { 
        id, 
        workflow: { userId } 
      },
      include: { 
        workflow: { select: { id: true, name: true } },
        nodeExecutions: { include: { node: { select: { id: true, name: true, type: true } } } }
      }
    });
    if (!execution) return res.status(404).json({ message: "not found" });
    return res.status(200).json(execution);
  } catch (error) {
    return res.status(500).json({ message: "internal server error" });
  }
};

export const createWorkflowExecution = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as string | undefined;
    if (!userId) return res.status(401).json({ message: "unauthorized" });
    
    const { workflowId, status = "running" } = req.body ?? {};
    if (!workflowId) return res.status(400).json({ message: "workflowId is required" });
    
    const workflow = await prisma.workflow.findFirst({
      where: { id: workflowId, userId }
    });
    if (!workflow) return res.status(404).json({ message: "workflow not found" });
    
    const execution = await prisma.workflowExecution.create({
      data: {
        workflowId,
        status,
      },
      include: { 
        workflow: { select: { id: true, name: true } }
      }
    });
    
    await prisma.workflow.update({
      where: { id: workflowId },
      data: {
        totalRuns: { increment: 1 },
        lastRun: new Date(),
      },
    });
    
    return res.status(201).json(execution);
  } catch (error) {
    return res.status(500).json({ message: "internal server error" });
  }
};

export const updateWorkflowExecution = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as string | undefined;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ message: "unauthorized" });
    if (!id) return res.status(400).json({ message: "execution id is required" });
    
    const existing = await prisma.workflowExecution.findFirst({
      where: { 
        id, 
        workflow: { userId } 
      }
    });
    if (!existing) return res.status(404).json({ message: "not found" });
    
    const { status, completedAt, error } = req.body ?? {};
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (completedAt !== undefined) updateData.completedAt = completedAt;
    if (error !== undefined) updateData.error = error;
    
    const execution = await prisma.workflowExecution.update({
      where: { id },
      data: updateData,
      include: { 
        workflow: { select: { id: true, name: true } },
        nodeExecutions: { include: { node: { select: { id: true, name: true, type: true } } } }
      }
    });
    
    if (status === "completed" || status === "failed") {
      const workflow = await prisma.workflow.findUnique({ where: { id: existing.workflowId } });
      if (workflow) {
        const updateFields: any = {};
        if (status === "completed") {
          updateFields.successfulRuns = { increment: 1 };
        } else if (status === "failed") {
          updateFields.failedRuns = { increment: 1 };
        }
        await prisma.workflow.update({
          where: { id: existing.workflowId },
          data: updateFields
        });
      }
    }
    
    return res.status(200).json(execution);
  } catch (error) {
    return res.status(500).json({ message: "internal server error" });
  }
};

export const deleteWorkflowExecution = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as string | undefined;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ message: "unauthorized" });
    if (!id) return res.status(400).json({ message: "execution id is required" });
    
    const existing = await prisma.workflowExecution.findFirst({
      where: { 
        id, 
        workflow: { userId } 
      }
    });
    if (!existing) return res.status(404).json({ message: "not found" });
    
    await prisma.workflowExecution.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "internal server error" });
  }
};
