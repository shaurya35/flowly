"use client";
import { useState, useCallback, useEffect } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, Background, Controls, MiniMap, NodeTypes, Handle, Position, ConnectionLineType, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  Webhook, 
  Code, 
  Mail, 
  Database, 
  FileText, 
  Zap, 
  Filter,
  Send,
  Download,
  Upload,
  Settings,
  Plus,
  Edit,
  Trash2,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { useWorkflow } from '@/contexts/WorkflowContext';

// Custom node types for n8n-like workflow (compact)
const WorkflowNode = ({ data, selected }: { data: any; selected: boolean }) => {
  const { updateNode, deleteNode } = useWorkflow();
  const [showActions, setShowActions] = useState(false);

  const getIcon = () => {
    switch (data.type) {
      case 'trigger':
        return <Webhook className="w-3 h-3 text-green-600" />;
      case 'process':
        return <Code className="w-3 h-3 text-blue-600" />;
      case 'output':
        return <Mail className="w-3 h-3 text-orange-600" />;
      case 'database':
        return <Database className="w-3 h-3 text-purple-600" />;
      case 'file':
        return <FileText className="w-3 h-3 text-indigo-600" />;
      case 'filter':
        return <Filter className="w-3 h-3 text-pink-600" />;
      case 'send':
        return <Send className="w-3 h-3 text-red-600" />;
      case 'download':
        return <Download className="w-3 h-3 text-cyan-600" />;
      case 'upload':
        return <Upload className="w-3 h-3 text-teal-600" />;
      default:
        return <Settings className="w-3 h-3 text-gray-600" />;
    }
  };

  const getNodeColor = () => {
    switch (data.type) {
      case 'trigger':
        return 'border-green-200 bg-green-50';
      case 'process':
        return 'border-blue-200 bg-blue-50';
      case 'output':
        return 'border-orange-200 bg-orange-50';
      case 'database':
        return 'border-purple-200 bg-purple-50';
      case 'file':
        return 'border-indigo-200 bg-indigo-50';
      case 'filter':
        return 'border-pink-200 bg-pink-50';
      case 'send':
        return 'border-red-200 bg-red-50';
      case 'download':
        return 'border-cyan-200 bg-cyan-50';
      case 'upload':
        return 'border-teal-200 bg-teal-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    // This will be handled by the parent component
    if (data?.onEdit) {
      data.onEdit(data.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (confirm('Are you sure you want to delete this node?')) {
      deleteNode(data.id);
    }
  };

  return (
    <div
      className={`relative px-2 py-1.5 rounded-md bg-white border ${selected ? 'border-violet-400 shadow' : getNodeColor()} overflow-hidden`}
      title={`${data.label}${data.subtitle ? ' • ' + data.subtitle : ''}`}
      style={{ maxWidth: 160 }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-gray-500 !border-gray-600" />
      <div className="flex items-center gap-1.5 min-w-0">
        {getIcon()}
        <div className="min-w-0 w-full">
          <div className="font-medium text-[11px] leading-4 text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
            {data.label}
          </div>
          {data.subtitle && (
            <div className="text-[10px] leading-3 text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">
              {data.subtitle}
            </div>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-gray-500 !border-gray-600" />
      
      {/* Action buttons */}
      {showActions && (
        <div className="absolute -top-0.5 -right-0.5 flex gap-0.5 z-10">
          <button
            onClick={handleEdit}
            className="p-0.5 bg-white border border-gray-200 rounded shadow-sm hover:bg-gray-50 cursor-pointer"
            title="Edit node"
            style={{ pointerEvents: 'auto' }}
          >
            <Edit className="w-2.5 h-2.5 text-gray-600" />
          </button>
          <button
            onClick={handleDelete}
            className="p-0.5 bg-white border border-gray-200 rounded shadow-sm hover:bg-red-50 cursor-pointer"
            title="Delete node"
            style={{ pointerEvents: 'auto' }}
          >
            <Trash2 className="w-2.5 h-2.5 text-red-600" />
          </button>
        </div>
      )}
    </div>
  );
};


const nodeTypes: NodeTypes = {
  workflow: WorkflowNode,
};


export default function Canvas() {
  const { 
    selectedWorkflow, 
    nodes, 
    loading, 
    error, 
    addNode, 
    updateNode,
    updateNodePosition, 
    updateNodeConnections 
  } = useWorkflow();
  const [reactFlowNodes, setReactFlowNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [showAddNodeForm, setShowAddNodeForm] = useState(false);
  const [showEditNodeForm, setShowEditNodeForm] = useState(false);
  const [editingNode, setEditingNode] = useState<any>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showEditApiKey, setShowEditApiKey] = useState(false);
  const [newNodeData, setNewNodeData] = useState({
    label: '',
    name: '',
    description: '',
    type: 'gemini' as const,
    positionX: 100,
    positionY: 100,
    config: {
      apiKey: '',
      model: '',
      content: '',
    },
  });
  const [editNodeData, setEditNodeData] = useState({
    id: '',
    label: '',
    name: '',
    description: '',
    type: 'gemini' as const,
    config: {
      apiKey: '',
      model: '',
      content: '',
    },
  });

  // Convert backend nodes to ReactFlow nodes and edges
  useEffect(() => {
    const convertedNodes = nodes.map((node) => ({
      id: node.id,
      type: 'workflow',
      position: { x: node.positionX, y: node.positionY },
      data: {
        id: node.id,
        label: node.label || node.name || 'Unnamed Node',
        subtitle: node.description || node.type,
        type: node.type,
        onEdit: handleEditNode,
      },
    }));
    setReactFlowNodes(convertedNodes);

    // Convert node connections to edges
    const convertedEdges: Edge[] = [];
    nodes.forEach((node) => {
      if (node.connections && Array.isArray(node.connections)) {
        node.connections.forEach((connection: any, index: number) => {
          if (connection.targetId) {
            convertedEdges.push({
              id: `${node.id}-${connection.targetId}-${index}`,
              source: node.id,
              target: connection.targetId,
              type: 'smoothstep',
              animated: true,
              style: { stroke: '#8b5cf6', strokeWidth: 1.25 },
            });
          }
        });
      }
    });
    setEdges(convertedEdges);
  }, [nodes]);


  const defaultEdgeOptions = {
    animated: true,
    style: { stroke: '#8b5cf6', strokeWidth: 1.25 },
    type: 'smoothstep' as const,
  };

  const onNodesChange = useCallback(
    (changes: any) => {
      setReactFlowNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot));
    },
    [],
  );

  // Handle node drag stop - update position only when dragging ends
  const onNodeDragStop = useCallback(
    (event: any, node: any) => {
      updateNodePosition(node.id, node.position.x, node.position.y);
    },
    [updateNodePosition],
  );

  // Helper function to convert edges to node connections format
  const convertEdgesToConnections = (edges: Edge[]) => {
    const nodeConnections: { [nodeId: string]: any[] } = {};
    
    edges.forEach((edge) => {
      if (!nodeConnections[edge.source]) {
        nodeConnections[edge.source] = [];
      }
      nodeConnections[edge.source].push({
        targetId: edge.target,
        edgeId: edge.id,
      });
    });
    
    return nodeConnections;
  };

  const onConnect = useCallback(
    async (params: any) => {
      const newEdges = addEdge(params, edges);
      setEdges(newEdges);
      
      // Update connections in backend
      const nodeConnections = convertEdgesToConnections(newEdges);
      
      // Update source node connections
      if (nodeConnections[params.source]) {
        await updateNodeConnections(params.source, nodeConnections[params.source]);
      }
    },
    [edges, updateNodeConnections],
  );

  const onEdgesChange = useCallback(
    async (changes: any) => {
      const newEdges = applyEdgeChanges(changes, edges);
      setEdges(newEdges);
      
      // Handle edge removal
      changes.forEach((change: any) => {
        if (change.type === 'remove') {
          // Find which node had this connection and update it
          const edge = edges.find(e => e.id === change.id);
          if (edge) {
            const remainingConnections = newEdges
              .filter(e => e.source === edge.source)
              .map(e => ({ targetId: e.target, edgeId: e.id }));
            
            updateNodeConnections(edge.source, remainingConnections);
          }
        }
      });
    },
    [edges, updateNodeConnections],
  );

  const handleAddNode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addNode(newNodeData);
      setNewNodeData({
        label: '',
        name: '',
        description: '',
        type: 'gemini',
        positionX: 100,
        positionY: 100,
        config: {
          apiKey: '',
          model: '',
          content: '',
        },
      });
      setShowApiKey(false);
      setShowAddNodeForm(false);
    } catch (err) {
      console.error('Error adding node:', err);
    }
  };

  const handleEditNode = (nodeId: string) => {
    console.log('Edit node clicked:', nodeId);
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setEditingNode(node);
      setEditNodeData({
        id: node.id,
        label: node.label || '',
        name: node.name || '',
        description: node.description || '',
        type: node.type as any,
        config: node.config || { apiKey: '', model: '', content: '' },
      });
      setShowEditNodeForm(true);
    }
  };

  const handleUpdateNode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateNode(editNodeData);
      setShowEditNodeForm(false);
      setEditingNode(null);
      setEditNodeData({
        id: '',
        label: '',
        name: '',
        description: '',
        type: 'gemini',
        config: {
          apiKey: '',
          model: '',
          content: '',
        },
      });
      setShowEditApiKey(false);
    } catch (err) {
      console.error('Error updating node:', err);
    }
  };

  const handleCanvasClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      setShowAddNodeForm(false);
      setShowEditNodeForm(false);
      setShowApiKey(false);
      setShowEditApiKey(false);
    }
  };


  // Empty state when no workflows
  if (!selectedWorkflow) {
    return (
      <div className="w-full h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Workflow Selected</h3>
          <p className="text-gray-500 mb-4">Create a workflow in the sidebar to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-full h-full bg-gray-50 relative" 
      onClick={handleCanvasClick}
    >
      {/* Add Node Button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setShowAddNodeForm(true)}
          className="bg-violet-600 text-white px-2 py-1.5 rounded text-xs font-medium hover:bg-violet-700 flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-3 h-3" />
          Add Node
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="absolute top-4 left-4 z-10 bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="absolute top-4 left-4 z-10 bg-white border border-gray-200 text-gray-600 px-3 py-2 rounded">
          Loading...
        </div>
      )}

      <ReactFlow
        nodes={reactFlowNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-50"
        defaultEdgeOptions={defaultEdgeOptions}
        connectionLineStyle={{ stroke: '#8b5cf6', strokeWidth: 1.25 }}
        connectionLineType={ConnectionLineType.SmoothStep}
      >
        <Background color="#e5e7eb" gap={20} size={1} />
        <Controls 
          style={{
            bottom: 20,
            left: 20,
          }}
        />
        <MiniMap 
          nodeColor={(node) => {
            switch (node.data?.type) {
              case 'trigger':
                return '#10b981';
              case 'process':
                return '#3b82f6';
              case 'filter':
                return '#ec4899';
              case 'database':
                return '#8b5cf6';
              case 'file':
                return '#6366f1';
              case 'output':
                return '#f97316';
              case 'send':
                return '#ef4444';
              case 'download':
                return '#06b6d4';
              case 'upload':
                return '#14b8a6';
              default:
                return '#6b7280';
            }
          }}
          nodeStrokeWidth={2}
          zoomable
          pannable
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
          }}
        />
      </ReactFlow>

      {/* Add Node Form Modal */}
      {showAddNodeForm && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add New Node</h3>
              <button
                onClick={() => setShowAddNodeForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddNode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Label *
                </label>
                <input
                  type="text"
                  value={newNodeData.label}
                  onChange={(e) => setNewNodeData({ ...newNodeData, label: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                  placeholder="Node label"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newNodeData.name}
                  onChange={(e) => setNewNodeData({ ...newNodeData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                  placeholder="Node name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newNodeData.description}
                  onChange={(e) => setNewNodeData({ ...newNodeData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                  placeholder="Node description"
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  AI Provider *
                </label>
                <select
                  value={newNodeData.type}
                  onChange={(e) => setNewNodeData({ ...newNodeData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                >
                  <option value="gemini">Gemini (Google)</option>
                  <option value="openai">OpenAI</option>
                  <option value="openrouter">OpenRouter</option>
                  <option value="email">Email</option>
                  <option value="discord">Discord</option>
                  <option value="trigger">Trigger</option>
                  <option value="condition">Condition</option>
                  <option value="delay">Delay</option>
                </select>
              </div>

              {/* AI Configuration Fields */}
              {(newNodeData.type === 'gemini' || newNodeData.type === 'openai' || newNodeData.type === 'openrouter') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API Key *
                    </label>
                    <div className="relative">
                      <input
                        type={showApiKey ? "text" : "password"}
                        value={newNodeData.config.apiKey}
                        onChange={(e) => setNewNodeData({ 
                          ...newNodeData, 
                          config: { ...newNodeData.config, apiKey: e.target.value }
                        })}
                        required
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                        placeholder="Enter your API key"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        title={showApiKey ? "Hide API key" : "Show API key"}
                      >
                        {showApiKey ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Model *
                    </label>
                    <input
                      type="text"
                      value={newNodeData.config.model}
                      onChange={(e) => setNewNodeData({ 
                        ...newNodeData, 
                        config: { ...newNodeData.config, model: e.target.value }
                      })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                      placeholder={newNodeData.type === 'gemini' ? 'gemini-2.5-flash' : 'gpt-4'}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      System Prompt *
                    </label>
                    <textarea
                      value={newNodeData.config.content}
                      onChange={(e) => setNewNodeData({ 
                        ...newNodeData, 
                        config: { ...newNodeData.config, content: e.target.value }
                      })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                      placeholder="Enter the system prompt for your AI agent..."
                      rows={6}
                    />
                  </div>
                </>
              )}
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-violet-600 text-white py-2 px-4 rounded-md hover:bg-violet-700"
                >
                  Add Node
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddNodeForm(false);
                    setShowApiKey(false);
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Node Form Modal */}
      {showEditNodeForm && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit Node</h3>
              <button
                onClick={() => {
                  setShowEditNodeForm(false);
                  setEditingNode(null);
                  setShowEditApiKey(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateNode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Label *
                </label>
                <input
                  type="text"
                  value={editNodeData.label}
                  onChange={(e) => setEditNodeData({ ...editNodeData, label: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                  placeholder="Node label"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editNodeData.name}
                  onChange={(e) => setEditNodeData({ ...editNodeData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                  placeholder="Node name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editNodeData.description}
                  onChange={(e) => setEditNodeData({ ...editNodeData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                  placeholder="Node description"
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  AI Provider *
                </label>
                <select
                  value={editNodeData.type}
                  onChange={(e) => setEditNodeData({ ...editNodeData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                >
                  <option value="gemini">Gemini (Google)</option>
                  <option value="openai">OpenAI</option>
                  <option value="openrouter">OpenRouter</option>
                  <option value="email">Email</option>
                  <option value="discord">Discord</option>
                  <option value="trigger">Trigger</option>
                  <option value="condition">Condition</option>
                  <option value="delay">Delay</option>
                </select>
              </div>

              {/* AI Configuration Fields */}
              {(editNodeData.type === 'gemini' || editNodeData.type === 'openai' || editNodeData.type === 'openrouter') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API Key *
                    </label>
                    <div className="relative">
                      <input
                        type={showEditApiKey ? "text" : "password"}
                        value={editNodeData.config.apiKey}
                        onChange={(e) => setEditNodeData({ 
                          ...editNodeData, 
                          config: { ...editNodeData.config, apiKey: e.target.value }
                        })}
                        required
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                        placeholder="Enter your API key"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEditApiKey(!showEditApiKey)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        title={showEditApiKey ? "Hide API key" : "Show API key"}
                      >
                        {showEditApiKey ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Model *
                    </label>
                    <input
                      type="text"
                      value={editNodeData.config.model}
                      onChange={(e) => setEditNodeData({ 
                        ...editNodeData, 
                        config: { ...editNodeData.config, model: e.target.value }
                      })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                      placeholder={editNodeData.type === 'gemini' ? 'gemini-2.5-flash' : 'gpt-4'}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      System Prompt *
                    </label>
                    <textarea
                      value={editNodeData.config.content}
                      onChange={(e) => setEditNodeData({ 
                        ...editNodeData, 
                        config: { ...editNodeData.config, content: e.target.value }
                      })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                      placeholder="Enter the system prompt for your AI agent..."
                      rows={6}
                    />
                  </div>
                </>
              )}
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-violet-600 text-white py-2 px-4 rounded-md hover:bg-violet-700"
                >
                  Update Node
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditNodeForm(false);
                    setEditingNode(null);
                    setShowEditApiKey(false);
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
