import api from '@/utils/api';

export interface Workflow {
  id: string;
  name: string | null;
  description: string | null;
  status: 'draft' | 'active' | 'paused' | 'archived';
  triggerType: 'manual' | 'webhook' | 'schedule' | 'event';
  triggerConfig: any;
  retryCount: number;
  timeoutMs: number;
  parallelExecution: boolean;
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  lastRun: string | null;
  createdAt: string;
  updatedAt: string;
  nodes: any[];
}

export interface CreateWorkflowData {
  name: string;
  description?: string;
  status?: 'draft' | 'active' | 'paused' | 'archived';
  triggerType?: 'manual' | 'webhook' | 'schedule' | 'event';
  triggerConfig?: any;
  retryCount?: number;
  timeoutMs?: number;
  parallelExecution?: boolean;
}

export interface UpdateWorkflowData extends CreateWorkflowData {
  id: string;
}

export const workflowService = {
  // Get all workflows
  getAllWorkflows: async (): Promise<Workflow[]> => {
    const response = await api.get('/api/v1/workflows');
    return response.data;
  },

  // Get workflow by ID
  getWorkflowById: async (id: string): Promise<Workflow> => {
    const response = await api.get(`/api/v1/workflows/${id}`);
    return response.data;
  },

  // Create new workflow
  createWorkflow: async (data: CreateWorkflowData): Promise<Workflow> => {
    const response = await api.post('/api/v1/workflows', data);
    return response.data;
  },

  // Update workflow
  updateWorkflow: async (data: UpdateWorkflowData): Promise<Workflow> => {
    const { id, ...updateData } = data;
    const response = await api.put(`/api/v1/workflows/${id}`, updateData);
    return response.data;
  },

  // Delete workflow
  deleteWorkflow: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/workflows/${id}`);
  },

  // Execute workflow
  executeWorkflow: async (id: string): Promise<{ executionId: string; status: string }> => {
    const response = await api.post(`/api/v1/workflows/${id}/execute`);
    return response.data;
  },
};
