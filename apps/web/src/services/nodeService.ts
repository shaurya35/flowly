import api from '@/utils/api';

export interface Node {
  id: string;
  label: string | null;
  name: string | null;
  description: string | null;
  type: 'email' | 'discord' | 'gemini' | 'openai' | 'openrouter' | 'trigger' | 'condition' | 'delay';
  config: any;
  positionX: number;
  positionY: number;
  connections: any;
  status: 'idle' | 'running' | 'completed' | 'skipped';
  workflowId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNodeData {
  label?: string;
  name?: string;
  description?: string;
  type: 'email' | 'discord' | 'gemini' | 'openai' | 'openrouter' | 'trigger' | 'condition' | 'delay';
  config?: any;
  positionX?: number;
  positionY?: number;
  connections?: any;
  status?: 'idle' | 'running' | 'completed' | 'skipped';
  workflowId: string;
}

export interface UpdateNodeData extends CreateNodeData {
  id: string;
}

export const nodeService = {
  getAllNodes: async (): Promise<Node[]> => {
    const response = await api.get('/api/v1/nodes');
    return response.data;
  },

  getNodesByWorkflow: async (workflowId: string): Promise<Node[]> => {
    const response = await api.get('/api/v1/nodes');
    return response.data.filter((node: Node) => node.workflowId === workflowId);
  },

  getNodeById: async (id: string): Promise<Node> => {
    const response = await api.get(`/api/v1/nodes/${id}`);
    return response.data;
  },

  createNode: async (data: CreateNodeData): Promise<Node> => {
    const response = await api.post('/api/v1/nodes', data);
    return response.data;
  },

  updateNode: async (data: UpdateNodeData): Promise<Node> => {
    const { id, ...updateData } = data;
    const response = await api.put(`/api/v1/nodes/${id}`, updateData);
    return response.data;
  },

  deleteNode: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/nodes/${id}`);
  },

  updateNodePosition: async (id: string, positionX: number, positionY: number): Promise<Node> => {
    const response = await api.put(`/api/v1/nodes/${id}`, {
      positionX,
      positionY,
    });
    return response.data;
  },

  updateNodeConnections: async (id: string, connections: any): Promise<Node> => {
    const response = await api.put(`/api/v1/nodes/${id}`, {
      connections,
    });
    return response.data;
  },
};
