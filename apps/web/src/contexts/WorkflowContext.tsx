"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Workflow } from '@/services/workflowService';
import { Node } from '@/services/nodeService';
import { workflowService } from '@/services/workflowService';
import { nodeService } from '@/services/nodeService';

interface WorkflowContextType {
  workflows: Workflow[];
  selectedWorkflow: Workflow | null;
  nodes: Node[];
  loading: boolean;
  error: string | null;
  selectWorkflow: (workflow: Workflow | null) => void;
  refreshWorkflows: () => Promise<void>;
  refreshNodes: () => Promise<void>;
  addNode: (nodeData: any) => Promise<void>;
  updateNode: (nodeData: any) => Promise<void>;
  deleteNode: (nodeId: string) => Promise<void>;
  updateNodePosition: (nodeId: string, positionX: number, positionY: number) => Promise<void>;
  updateNodeConnections: (nodeId: string, connections: any) => Promise<void>;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (context === undefined) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
};

interface WorkflowProviderProps {
  children: ReactNode;
}

export const WorkflowProvider: React.FC<WorkflowProviderProps> = ({ children }) => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await workflowService.getAllWorkflows();
      setWorkflows(data);
    } catch (err) {
      setError('Failed to load workflows');
      console.error('Error loading workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadNodes = async (workflowId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await nodeService.getNodesByWorkflow(workflowId);
      setNodes(data);
    } catch (err) {
      setError('Failed to load nodes');
      console.error('Error loading nodes:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectWorkflow = (workflow: Workflow | null) => {
    setSelectedWorkflow(workflow);
    if (workflow) {
      loadNodes(workflow.id);
    } else {
      setNodes([]);
    }
  };

  const refreshWorkflows = async () => {
    await loadWorkflows();
  };

  const refreshNodes = async () => {
    if (selectedWorkflow) {
      await loadNodes(selectedWorkflow.id);
    }
  };

  const addNode = async (nodeData: any) => {
    if (!selectedWorkflow) return;
    
    try {
      setLoading(true);
      const newNode = await nodeService.createNode({
        ...nodeData,
        workflowId: selectedWorkflow.id,
      });
      setNodes(prev => [...prev, newNode]);
    } catch (err) {
      setError('Failed to create node');
      console.error('Error creating node:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateNode = async (nodeData: any) => {
    try {
      setLoading(true);
      const updatedNode = await nodeService.updateNode(nodeData);
      setNodes(prev => prev.map(node => node.id === updatedNode.id ? updatedNode : node));
    } catch (err) {
      setError('Failed to update node');
      console.error('Error updating node:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteNode = async (nodeId: string) => {
    try {
      setLoading(true);
      await nodeService.deleteNode(nodeId);
      setNodes(prev => prev.filter(node => node.id !== nodeId));
    } catch (err) {
      setError('Failed to delete node');
      console.error('Error deleting node:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateNodePosition = async (nodeId: string, positionX: number, positionY: number) => {
    try {
      const updatedNode = await nodeService.updateNodePosition(nodeId, positionX, positionY);
      setNodes(prev => prev.map(node => node.id === updatedNode.id ? updatedNode : node));
    } catch (err) {
      setError('Failed to update node position');
      console.error('Error updating node position:', err);
    }
  };

  const updateNodeConnections = async (nodeId: string, connections: any) => {
    try {
      const updatedNode = await nodeService.updateNodeConnections(nodeId, connections);
      setNodes(prev => prev.map(node => node.id === updatedNode.id ? updatedNode : node));
    } catch (err) {
      setError('Failed to update node connections');
      console.error('Error updating node connections:', err);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  useEffect(() => {
    if (selectedWorkflow) {
      loadNodes(selectedWorkflow.id);
    }
  }, [selectedWorkflow]);

  const value: WorkflowContextType = {
    workflows,
    selectedWorkflow,
    nodes,
    loading,
    error,
    selectWorkflow,
    refreshWorkflows,
    refreshNodes,
    addNode,
    updateNode,
    deleteNode,
    updateNodePosition,
    updateNodeConnections,
  };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
};
