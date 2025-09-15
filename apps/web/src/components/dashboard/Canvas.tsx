"use client";
import { useState, useCallback } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, Background, Controls, MiniMap, NodeTypes, Handle, Position, ConnectionLineType } from '@xyflow/react';
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
  Settings
} from 'lucide-react';

// Custom node types for n8n-like workflow (compact)
const WorkflowNode = ({ data, selected }: { data: any; selected: boolean }) => {
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

  return (
    <div
      className={`relative px-2 py-1.5 rounded-md bg-white border ${selected ? 'border-violet-400 shadow' : getNodeColor()} overflow-hidden`}
      title={`${data.label}${data.subtitle ? ' • ' + data.subtitle : ''}`}
      style={{ maxWidth: 160 }}
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
    </div>
  );
};

const nodeTypes: NodeTypes = {
  workflow: WorkflowNode,
};

const initialNodes = [
  // Connected demo chain
  { id: 'n1', type: 'workflow', position: { x: 120, y: 160 }, data: { label: 'Webhook', subtitle: 'Trigger', type: 'trigger' } },
  { id: 'n2', type: 'workflow', position: { x: 300, y: 160 }, data: { label: 'Transform', subtitle: 'Map', type: 'process' } },
  { id: 'n3', type: 'workflow', position: { x: 480, y: 160 }, data: { label: 'Write DB', subtitle: 'MongoDB', type: 'database' } },
  { id: 'n4', type: 'workflow', position: { x: 660, y: 160 }, data: { label: 'Email', subtitle: 'SMTP', type: 'output' } },

  // Standalone nodes (showcase)
  { id: 's1', type: 'workflow', position: { x: 260, y: 280 }, data: { label: 'API Call', subtitle: 'REST', type: 'send' } },
  { id: 's2', type: 'workflow', position: { x: 520, y: 60 }, data: { label: 'Read File', subtitle: 'CSV', type: 'file' } },
];

const initialEdges = [
  { id: 'e1', source: 'n1', target: 'n2' },
  { id: 'e2', source: 'n2', target: 'n3' },
  { id: 'e3', source: 'n3', target: 'n4' },
];

export default function Canvas() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const defaultEdgeOptions = {
    animated: true,
    style: { stroke: '#8b5cf6', strokeWidth: 1.25 },
    type: 'smoothstep' as const,
  };

  const onNodesChange = useCallback(
    (changes: any) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: any) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onConnect = useCallback(
    (params: any) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  return (
    <div className="w-full h-full bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
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
    </div>
  );
}
