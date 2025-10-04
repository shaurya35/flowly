import type { Request, Response } from "express";
import { prisma } from "store";

export const getAllNodeExecutions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as string | undefined;
    if (!userId) return res.status(401).json({ message: "unauthorized" });
    
    const { workflowExecutionId, nodeId } = req.query;
    const whereClause: any = {};
    
    if (workflowExecutionId) {
      whereClause.workflowExecutionId = workflowExecutionId as string;
      whereClause.workflowExecution = { workflow: { userId } };
    } else if (nodeId) {
      whereClause.nodeId = nodeId as string;
      whereClause.node = { userId };
    } else {
      whereClause.OR = [
        { workflowExecution: { workflow: { userId } } },
        { node: { userId } }
      ];
    }
    
    const executions = await prisma.nodeExecution.findMany({
      where: whereClause,
      include: { 
        node: { select: { id: true, name: true, type: true } },
        workflowExecution: { 
          select: { 
            id: true, 
            status: true,
            workflow: { select: { id: true, name: true } }
          } 
        }
      },
      orderBy: { startedAt: 'desc' }
    });
    return res.status(200).json(executions);
  } catch (error) {
    return res.status(500).json({ message: "internal server error" });
  }
};

export const getNodeExecutionById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as string | undefined;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ message: "unauthorized" });
    if (!id) return res.status(400).json({ message: "execution id is required" });
    
    const execution = await prisma.nodeExecution.findFirst({
      where: { 
        id,
        OR: [
          { workflowExecution: { workflow: { userId } } },
          { node: { userId } }
        ]
      },
      include: { 
        node: { select: { id: true, name: true, type: true } },
        workflowExecution: { 
          select: { 
            id: true, 
            status: true,
            workflow: { select: { id: true, name: true } }
          } 
        }
      }
    });
    if (!execution) return res.status(404).json({ message: "not found" });
    return res.status(200).json(execution);
  } catch (error) {
    return res.status(500).json({ message: "internal server error" });
  }
};

export const createNodeExecution = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as string | undefined;
    if (!userId) return res.status(401).json({ message: "unauthorized" });
    
    const { workflowExecutionId, nodeId, status = "pending", input } = req.body ?? {};
    if (!workflowExecutionId || !nodeId) {
      return res.status(400).json({ message: "workflowExecutionId and nodeId are required" });
    }
    
    const workflowExecution = await prisma.workflowExecution.findFirst({
      where: { 
        id: workflowExecutionId,
        workflow: { userId }
      }
    });
    if (!workflowExecution) return res.status(404).json({ message: "workflow execution not found" });
    
    const node = await prisma.node.findFirst({
      where: { id: nodeId, userId }
    });
    if (!node) return res.status(404).json({ message: "node not found" });
    
    const execution = await prisma.nodeExecution.create({
      data: {
        workflowExecutionId,
        nodeId,
        status,
        input,
      },
      include: { 
        node: { select: { id: true, name: true, type: true } },
        workflowExecution: { 
          select: { 
            id: true, 
            status: true,
            workflow: { select: { id: true, name: true } }
          } 
        }
      }
    });
    
    return res.status(201).json(execution);
  } catch (error) {
    return res.status(500).json({ message: "internal server error" });
  }
};

export const updateNodeExecution = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as string | undefined;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ message: "unauthorized" });
    if (!id) return res.status(400).json({ message: "execution id is required" });
    
    const existing = await prisma.nodeExecution.findFirst({
      where: { 
        id,
        OR: [
          { workflowExecution: { workflow: { userId } } },
          { node: { userId } }
        ]
      }
    });
    if (!existing) return res.status(404).json({ message: "not found" });
    
    const { status, startedAt, completedAt, input, output, error } = req.body ?? {};
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (startedAt !== undefined) updateData.startedAt = startedAt;
    if (completedAt !== undefined) updateData.completedAt = completedAt;
    if (input !== undefined) updateData.input = input;
    if (output !== undefined) updateData.output = output;
    if (error !== undefined) updateData.error = error;
    
    const execution = await prisma.nodeExecution.update({
      where: { id },
      data: updateData,
      include: { 
        node: { select: { id: true, name: true, type: true } },
        workflowExecution: { 
          select: { 
            id: true, 
            status: true,
            workflow: { select: { id: true, name: true } }
          } 
        }
      }
    });
    
    return res.status(200).json(execution);
  } catch (error) {
    return res.status(500).json({ message: "internal server error" });
  }
};

export const deleteNodeExecution = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId as string | undefined;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ message: "unauthorized" });
    if (!id) return res.status(400).json({ message: "execution id is required" });
    
    const existing = await prisma.nodeExecution.findFirst({
      where: { 
        id,
        OR: [
          { workflowExecution: { workflow: { userId } } },
          { node: { userId } }
        ]
      }
    });
    if (!existing) return res.status(404).json({ message: "not found" });
    
    await prisma.nodeExecution.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "internal server error" });
  }
};
