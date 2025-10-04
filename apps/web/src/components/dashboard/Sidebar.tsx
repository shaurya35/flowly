"use client";
import { useState } from 'react';
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
  Clock
} from 'lucide-react';

export default function Sidebar() {
  const [activeSection, setActiveSection] = useState('projects');

  const menuItems = [
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'integrations', label: 'Integrations', icon: Plug },
    { id: 'executions', label: 'Executions', icon: Zap },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const projects = [
    { id: 1, name: 'E-commerce Workflow', status: 'active' },
    { id: 2, name: 'Email Automation', status: 'draft' },
    { id: 3, name: 'Data Sync', status: 'paused' },
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
                <h3 className="text-xs font-medium text-gray-900">Recent Projects</h3>
                <button className="text-orange-600 hover:text-orange-700 text-xs font-medium flex items-center space-x-1">
                  <Plus className="w-3 h-3" />
                  <span>New</span>
                </button>
              </div>
              <div className="space-y-1">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="p-2 bg-white rounded border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-medium text-gray-900 truncate">{project.name}</h4>
                      <div className="flex items-center space-x-1">
                        {project.status === 'active' && <Play className="w-3 h-3 text-green-600" />}
                        {project.status === 'draft' && <Clock className="w-3 h-3 text-yellow-600" />}
                        {project.status === 'paused' && <Pause className="w-3 h-3 text-gray-600" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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

