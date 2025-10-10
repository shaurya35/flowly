"use client";
import { useState, useEffect } from 'react';
import { 
  FolderOpen, 
  FileText, 
  Plug, 
  Zap, 
  Settings, 
  Plus, 
  Eye,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  Clock,
  Edit,
  Trash2,
  X
} from 'lucide-react';
import { workflowService, CreateWorkflowData, Workflow } from '@/services/workflowService';
import { useWorkflow } from '@/contexts/WorkflowContext';

export default function Sidebar() {
  const [activeSection, setActiveSection] = useState('projects');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<any>(null);

  // Form state
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [workflowStatus, setWorkflowStatus] = useState<'draft' | 'active' | 'paused' | 'archived'>('draft');
  const [workflowTriggerType, setWorkflowTriggerType] = useState<'manual' | 'webhook' | 'schedule' | 'event'>('manual');
  const [retryCount, setRetryCount] = useState(3);
  const [timeoutMs, setTimeoutMs] = useState(60000);
  const [parallelExecution, setParallelExecution] = useState(false);

  // Use workflow context
  const { 
    workflows, 
    selectedWorkflow, 
    loading, 
    error, 
    selectWorkflow, 
    refreshWorkflows 
  } = useWorkflow();


  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const workflowData: CreateWorkflowData = {
        name: workflowName,
        description: workflowDescription,
        status: workflowStatus,
        triggerType: workflowTriggerType,
        retryCount,
        timeoutMs,
        parallelExecution,
      };
      
      await workflowService.createWorkflow(workflowData);
      await refreshWorkflows(); // Refresh the list
      resetForm();
      setShowCreateForm(false);
    } catch (err) {
      console.error('Error creating workflow:', err);
    }
  };

  const handleUpdateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorkflow) return;
    
    try {
      const workflowData = {
        id: editingWorkflow.id,
        name: workflowName,
        description: workflowDescription,
        status: workflowStatus,
        triggerType: workflowTriggerType,
      };
      
      await workflowService.updateWorkflow(workflowData);
      await refreshWorkflows(); // Refresh the list
      resetForm();
      setEditingWorkflow(null);
    } catch (err) {
      console.error('Error updating workflow:', err);
    }
  };

  const handleDeleteWorkflow = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;
    
    try {
      await workflowService.deleteWorkflow(id);
      await refreshWorkflows(); // Refresh the list
    } catch (err) {
      console.error('Error deleting workflow:', err);
    }
  };

  const resetForm = () => {
    setWorkflowName('');
    setWorkflowDescription('');
    setWorkflowStatus('draft');
    setWorkflowTriggerType('manual');
    setRetryCount(3);
    setTimeoutMs(60000);
    setParallelExecution(false);
  };

  const startEdit = (workflow: Workflow) => {
    setEditingWorkflow(workflow);
    setWorkflowName(workflow.name || '');
    setWorkflowDescription(workflow.description || '');
    setWorkflowStatus(workflow.status);
    setWorkflowTriggerType(workflow.triggerType);
    setRetryCount(workflow.retryCount);
    setTimeoutMs(workflow.timeoutMs);
    setParallelExecution(workflow.parallelExecution);
  };

  const cancelEdit = () => {
    setEditingWorkflow(null);
    resetForm();
  };

  const menuItems = [
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    // { id: 'templates', label: 'Templates', icon: FileText },
    // { id: 'integrations', label: 'Integrations', icon: Plug },
    // { id: 'executions', label: 'Executions', icon: Zap },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const templates = [
    { id: 1, name: 'Slack to Email', category: 'Communication' },
    { id: 2, name: 'Database Backup', category: 'Data' },
    { id: 3, name: 'API to CSV', category: 'Integration' },
  ];

  return (
    <div className="w-56 bg-gray-50 border-r border-violet-200 h-full flex flex-col">
      {/* Sidebar Header */}
      <div className="p-3 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900">Workflow Builder</h2>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto">
        <nav className="p-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-2 px-2 py-1.5 rounded text-left transition-colors ${
                  activeSection === item.id
                    ? 'bg-violet-100 text-violet-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Content based on active section */}
        <div className="px-3 py-2">
          {activeSection === 'projects' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-medium text-gray-900">Workflows</h3>
                <button 
                  onClick={() => setShowCreateForm(true)}
                  className="text-orange-600 hover:text-orange-700 text-xs font-medium flex items-center space-x-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>New</span>
                </button>
              </div>

              {/* Error message */}
              {error && (
                <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                  {error}
                </div>
              )}

              {/* Loading state */}
              {loading && !showCreateForm && !editingWorkflow && (
                <div className="text-xs text-gray-500 text-center py-2">Loading workflows...</div>
              )}

              {/* Workflows list */}
              <div className="space-y-1">
                {workflows.map((workflow) => (
                  <div
                    key={workflow.id}
                    onClick={() => selectWorkflow(workflow)}
                    className={`p-2 rounded border transition-colors cursor-pointer ${
                      selectedWorkflow?.id === workflow.id
                        ? 'bg-violet-50 border-violet-200'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-medium text-gray-900 truncate">
                          {workflow.name || 'Unnamed Workflow'}
                        </h4>
                        {workflow.description && (
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {workflow.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        {workflow.status === 'active' && <Play className="w-3 h-3 text-green-600" />}
                        {workflow.status === 'draft' && <Clock className="w-3 h-3 text-yellow-600" />}
                        {workflow.status === 'paused' && <Pause className="w-3 h-3 text-gray-600" />}
                        {workflow.status === 'archived' && <AlertCircle className="w-3 h-3 text-gray-400" />}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">
                        {workflow.totalRuns} runs
                      </span>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEdit(workflow);
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Edit workflow"
                        >
                          <Edit className="w-3 h-3 text-gray-400" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteWorkflow(workflow.id);
                          }}
                          className="p-1 hover:bg-red-100 rounded"
                          title="Delete workflow"
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Create/Edit Form */}
              {(showCreateForm || editingWorkflow) && (
                <div className="mt-3 p-3 bg-white border border-gray-200 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-medium text-gray-900">
                      {editingWorkflow ? 'Edit Workflow' : 'Create New Workflow'}
                    </h4>
                    <button
                      onClick={editingWorkflow ? cancelEdit : () => setShowCreateForm(false)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                  
                  <form onSubmit={editingWorkflow ? handleUpdateWorkflow : handleCreateWorkflow} className="space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={workflowName}
                        onChange={(e) => setWorkflowName(e.target.value)}
                        required
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-500"
                        placeholder="Workflow name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={workflowDescription}
                        onChange={(e) => setWorkflowDescription(e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-500"
                        placeholder="Workflow description"
                        rows={2}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          value={workflowStatus}
                          onChange={(e) => setWorkflowStatus(e.target.value as any)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-500"
                        >
                          <option value="draft">Draft</option>
                          <option value="active">Active</option>
                          <option value="paused">Paused</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Trigger
                        </label>
                        <select
                          value={workflowTriggerType}
                          onChange={(e) => setWorkflowTriggerType(e.target.value as any)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-500"
                        >
                          <option value="manual">Manual</option>
                          <option value="webhook">Webhook</option>
                          <option value="schedule">Schedule</option>
                          <option value="event">Event</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Retry Count
                        </label>
                        <input
                          type="number"
                          value={retryCount}
                          onChange={(e) => setRetryCount(parseInt(e.target.value) || 3)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-500"
                          min="0"
                          max="10"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Timeout (ms)
                        </label>
                        <input
                          type="number"
                          value={timeoutMs}
                          onChange={(e) => setTimeoutMs(parseInt(e.target.value) || 60000)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-500"
                          min="1000"
                          step="1000"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center space-x-2 text-xs font-medium text-gray-700">
                        <input
                          type="checkbox"
                          checked={parallelExecution}
                          onChange={(e) => setParallelExecution(e.target.checked)}
                          className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                        />
                        <span>Parallel Execution</span>
                      </label>
                    </div>
                    
                    <div className="flex space-x-2 pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-violet-600 text-white text-xs font-medium py-1.5 px-3 rounded hover:bg-violet-700 disabled:opacity-50"
                      >
                        {loading ? 'Saving...' : (editingWorkflow ? 'Update' : 'Create')}
                      </button>
                      <button
                        type="button"
                        onClick={editingWorkflow ? cancelEdit : () => setShowCreateForm(false)}
                        className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {activeSection === 'templates' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-medium text-gray-900">Templates</h3>
                <button className="text-orange-600 hover:text-orange-700 text-xs font-medium flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>Browse</span>
                </button>
              </div>
              <div className="space-y-1">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="p-2 bg-white rounded border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors"
                  >
                    <h4 className="text-xs font-medium text-gray-900">{template.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{template.category}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'integrations' && (
            <div>
              <h3 className="text-xs font-medium text-gray-900 mb-2">Integrations</h3>
              <div className="space-y-1">
                {['Slack', 'Gmail', 'Google Sheets', 'Webhook', 'Database'].map((integration) => (
                  <div
                    key={integration}
                    className="p-2 bg-white rounded border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-xs font-medium">{integration[0]}</span>
                      </div>
                      <span className="text-xs font-medium text-gray-900">{integration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'executions' && (
            <div>
              <h3 className="text-xs font-medium text-gray-900 mb-2">Executions</h3>
              <div className="space-y-1">
                {[
                  { name: 'Workflow #1', status: 'success' },
                  { name: 'Workflow #2', status: 'failed' },
                  { name: 'Workflow #3', status: 'running' }
                ].map((execution, index) => (
                  <div
                    key={index}
                    className="p-2 bg-white rounded border border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        {execution.status === 'success' && <CheckCircle className="w-3 h-3 text-green-600" />}
                        {execution.status === 'failed' && <AlertCircle className="w-3 h-3 text-red-600" />}
                        {execution.status === 'running' && <Play className="w-3 h-3 text-blue-600" />}
                        <span className="text-xs text-gray-900">{execution.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">2m</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'settings' && (
            <div>
              <h3 className="text-xs font-medium text-gray-900 mb-2">Settings</h3>
              <div className="space-y-1">
                {['General', 'Notifications', 'API Keys', 'Team', 'Billing'].map((setting) => (
                  <div
                    key={setting}
                    className="p-2 bg-white rounded border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors"
                  >
                    <span className="text-xs font-medium text-gray-900">{setting}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

