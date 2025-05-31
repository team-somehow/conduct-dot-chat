import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import '../styles/execution.css';

interface BrutalNodeData {
  label: string;
  color: string;
  status?: 'idle' | 'running' | 'completed' | 'error';
  description?: string;
  type?: string;
  isActive?: boolean;
}

interface BrutalNodeProps extends NodeProps {
  data: BrutalNodeData;
}

const BrutalNode: React.FC<BrutalNodeProps> = ({ data, id }) => {
  const { label, color, status = 'idle', description, type, isActive } = data;
  
  // Determine if this is the orchestrator node
  const isOrchestrator = id === 'orchestrator' || label.toLowerCase().includes('orchestrator');
  
  // Get status styling
  const getStatusClass = () => {
    switch (status) {
      case 'running':
        return 'status-running';
      case 'completed':
        return 'status-done';
      case 'error':
        return 'status-error';
      default:
        return 'status-idle';
    }
  };

  // Get node styling based on state
  const getNodeClasses = () => {
    let classes = `bg-white ${isOrchestrator ? 'border-6' : 'border-4'} border-black shadow-neo-lg relative transition-all duration-500`;
    
    if (isActive) {
      classes += ' animate-pulse scale-110 shadow-neo-lg ring-8 ring-yellow-400 ring-opacity-90 z-50';
    }
    
    if (status === 'error') {
      classes += ' shake';
    }
    
    return classes;
  };

  return (
    <div className={getNodeClasses()} style={{ width: 220, height: 120 }}>
      {/* Active indicator glow - much more prominent */}
      {isActive && (
        <>
          <div className="absolute -inset-4 bg-yellow-400 opacity-30 rounded-lg animate-pulse blur-sm" />
          <div className="absolute -inset-2 bg-yellow-300 opacity-40 rounded-lg animate-pulse" />
          <div className="absolute -inset-1 bg-yellow-200 opacity-50 rounded-lg animate-pulse" />
        </>
      )}
      
      {/* Color accent bar */}
      <div 
        className={`h-4 w-full border-b-4 border-black ${isActive ? 'animate-pulse bg-gradient-to-r from-yellow-400 to-yellow-300' : ''}`}
        style={{ backgroundColor: isActive ? undefined : color }}
      />
      
      {/* Node content */}
      <div className="p-3 h-full flex flex-col justify-between relative z-10">
        <div>
          <h3 className={`font-bold text-sm leading-tight mb-1 transition-colors duration-300 ${isActive ? 'text-yellow-900 font-extrabold' : ''}`}>
            {label}
            {isActive && <span className="ml-2 text-yellow-600 animate-pulse text-lg">●</span>}
          </h3>
          {type && (
            <span className={`text-xs uppercase font-bold transition-colors duration-300 ${isActive ? 'text-yellow-700' : 'text-gray-600'}`}>
              {type}
            </span>
          )}
          {description && (
            <p className={`text-xs mt-1 line-clamp-2 transition-colors duration-300 ${isActive ? 'text-yellow-800' : 'text-gray-700'}`}>
              {description}
            </p>
          )}
        </div>
        
        {/* Status pill - much more prominent when active */}
        <div className="flex justify-end">
          <span className={`status-pill transition-all duration-300 ${isActive ? 'status-running animate-pulse scale-110 font-extrabold' : getStatusClass()}`}>
            {isActive ? 'RUNNING' : status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-black border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-black border-2 border-white"
      />
    </div>
  );
};

export default BrutalNode; 