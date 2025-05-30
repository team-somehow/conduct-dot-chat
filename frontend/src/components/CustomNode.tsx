import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { useWorkflowStore } from '../store/workflow';
import CostOverlay from './CostOverlay';

// Icon components for different node types
const BrainIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7.5V9C15 10.1 14.1 11 13 11S11 10.1 11 9V7.5L5 7V9C5 10.1 4.1 11 3 11S1 10.1 1 9V7C1 5.9 1.9 5 3 5H21C22.1 5 23 5.9 23 7V9C23 10.1 22.1 11 21 11S19 10.1 19 9Z"/>
  </svg>
);

const ImageIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z"/>
  </svg>
);

const OrchestratorIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21A7,7 0 0,1 14,26H10A7,7 0 0,1 3,19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2Z"/>
  </svg>
);

const CustomNode: React.FC<NodeProps> = ({ data, id }) => {
  const { activeNodeId, interactionStep } = useWorkflowStore();
  
  const isActive = activeNodeId === id;
  const isCompleted = data.status === 'completed';
  const isFuture = data.status === 'pending';
  
  // Get icon based on node type
  const getIcon = () => {
    if (id === 'orchestrator') return <OrchestratorIcon />;
    if (id === 'gpt4') return <BrainIcon />;
    if (id === 'stable-diffusion') return <ImageIcon />;
    return <BrainIcon />;
  };
  
  // Get accent color based on node data
  const accentColor = data.color || '#FEEF5D';
  
  // Get status text
  const getStatus = () => {
    if (isActive) return 'ACTIVE';
    if (isCompleted) return 'DONE';
    return 'IDLE';
  };
  
  // Get vendor/type text
  const getVendor = () => {
    if (id === 'orchestrator') return 'COORDINATOR';
    if (id === 'gpt4') return 'OPENAI';
    if (id === 'stable-diffusion') return 'STABILITY AI';
    return 'AI MODEL';
  };
  
  // Calculate cost fraction for overlay (0-1)
  const getCostFraction = () => {
    // Simple progression based on interaction step
    if (id === 'orchestrator') {
      return Math.min(interactionStep * 0.2, 1);
    } else if (id === 'gpt4') {
      return interactionStep >= 1 ? Math.min((interactionStep - 1) * 0.33, 1) : 0;
    } else if (id === 'stable-diffusion') {
      return interactionStep >= 3 ? Math.min((interactionStep - 3) * 0.5, 1) : 0;
    }
    return 0;
  };
  
  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-black border-2 border-white" />
      
      <div 
        className={`
          w-[200px] h-[120px] bg-white border-[4px] border-black shadow-[4px_4px_0_0_#000] p-3 relative
          ${isActive ? 'animate-pulse' : ''}
          ${isFuture ? 'filter grayscale(1) opacity-60' : ''}
        `}
      >
        {/* Accent top bar */}
        <div 
          className="absolute inset-x-0 top-0 h-6" 
          style={{ background: accentColor }}
        />
        
        {/* Cost overlay */}
        <CostOverlay costFraction={getCostFraction()} nodeId={id} />
        
        {/* Main content */}
        <div className="flex items-start gap-2 mt-2 relative z-10">
          <div className="text-black">
            {getIcon()}
          </div>
          <div className="flex-1">
            <h3 className="font-black text-sm text-black leading-tight">
              {data.label}
            </h3>
            <span className="text-xs uppercase text-black/70 font-bold">
              {getVendor()}
            </span>
          </div>
        </div>
        
        {/* Status pill */}
        <span className={`
          absolute bottom-2 right-2 text-[10px] font-black px-2 py-[1px] border-2 border-black
          ${isActive ? 'bg-[#FF5484] text-white' : 
            isCompleted ? 'bg-[#7C82FF] text-white' : 'bg-white text-black'}
        `}>
          {getStatus()}
        </span>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-black border-2 border-white" />
    </div>
  );
};

export default CustomNode; 