import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import NodeIcon from './NodeIcon';
import StatusPill from './StatusPill';
import { useSyncHighlight } from './useSyncHighlight';

interface Step {
  id: string;
  order: number;
  name: string;
  modelType: string;
  description: string;
  status: 'IDLE' | 'READY' | 'RUNNING' | 'COMPLETE' | 'ERROR';
  icon?: string;
}

interface NodeCardProps {
  step: Step;
  expanded: boolean;
  className?: string;
}

const NodeCard: React.FC<NodeCardProps> = ({ step, expanded, className = '' }) => {
  const { setActive } = useSyncHighlight();
  const cardRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    setActive(step.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  // Scroll into view when expanded
  useEffect(() => {
    if (expanded && cardRef.current) {
      cardRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [expanded]);

  return (
    <motion.div
      ref={cardRef}
      layout
      transition={{ duration: 0.25 }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className={`
        node-card bg-white border-4 border-black cursor-pointer
        transition-all duration-200 hover-wiggle
        ${expanded ? 'shadow-neo-lg' : 'shadow-neo'}
        ${className}
      `}
      aria-expanded={expanded}
      role="button"
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center gap-4 mb-2">
          <div className="flex-shrink-0">
            <NodeIcon 
              modelType={step.modelType} 
              icon={step.icon}
              className="h-8 w-8"
            />
          </div>
          
          <div className="flex-1">
            <h3 className="font-black text-lg uppercase tracking-tight">
              {step.name}
            </h3>
          </div>
          
          <StatusPill status={step.status} />
          
          <div className="flex-shrink-0">
            {expanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-bold text-black/70 uppercase tracking-wide">
            {step.modelType}
          </span>
          <span className="text-black/50">•</span>
          <span className="text-sm font-bold text-black/70">
            Step #{step.order}
          </span>
        </div>
        
        <p className="text-gray-700 font-medium leading-relaxed">
          {step.description}
        </p>
      </div>

      {/* Expandable Content */}
      <motion.div
        initial={false}
        animate={{ height: expanded ? 'auto' : 0 }}
        transition={{ duration: 0.25 }}
        className="overflow-hidden"
      >
        <div className="px-4 pb-4 border-t-4 border-black bg-gray-50">
          <div className="pt-4">
            <h4 className="font-black text-sm uppercase tracking-wide mb-3">
              Configuration
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-bold">Input Mapping:</span>
                <span className="text-gray-600">Auto-configured</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">Output Mapping:</span>
                <span className="text-gray-600">Auto-configured</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">Parameters:</span>
                <span className="text-gray-600">Default settings</span>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-white border-3 border-black">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">
                Technical Details
              </p>
              <p className="text-sm text-gray-700">
                This step will be executed as part of the workflow sequence. 
                Input and output mappings are automatically configured based on the workflow context.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NodeCard; 