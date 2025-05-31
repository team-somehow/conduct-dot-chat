import React, { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import WorkflowGraph from './WorkflowGraph';
import NodeCard from './NodeCard';
import TimelineRail from './TimelineRail';
import { useSyncHighlight } from './useSyncHighlight';
import { useWorkflowStore } from '../store/workflow';
import '../styles/workflow-generated.css';

interface Step {
  id: string;
  order: number;
  name: string;
  modelType: string;
  description: string;
  status: 'IDLE' | 'READY' | 'RUNNING' | 'COMPLETE' | 'ERROR';
  icon?: string;
}

interface GeneratedStageProps {
  onApprove: () => void;
}

const GeneratedStage: React.FC<GeneratedStageProps> = ({ onApprove }) => {
  const { workflow, nodes } = useWorkflowStore();
  const { activeId, setActive } = useSyncHighlight();

  // Transform workflow data to steps format
  const transformToSteps = useCallback((): Step[] => {
    if (!workflow?.steps || workflow.steps.length === 0) {
      // Fallback to demo data if no workflow
      return [
        {
          id: 'orchestrator',
          order: 1,
          name: 'AI Orchestrator',
          modelType: 'COORDINATOR',
          description: 'Analyzes your request and coordinates the workflow execution',
          status: 'IDLE',
          icon: '🤖'
        },
        {
          id: 'dalle-3',
          order: 2,
          name: 'DALL-E 3 Image Generator',
          modelType: 'AI MODEL',
          description: 'Generates high-quality images based on text descriptions',
          status: 'IDLE',
          icon: '🎨'
        },
        {
          id: 'nft-deployer',
          order: 3,
          name: 'NFT Deployer Agent',
          modelType: 'AI MODEL',
          description: 'Deploys NFTs to the blockchain with smart contract integration',
          status: 'IDLE',
          icon: '💎'
        }
      ];
    }

    return workflow.steps.map((step: any, index: number) => ({
      id: step.stepId,
      order: index + 1,
      name: step.agentName,
      modelType: 'AI MODEL',
      description: step.description,
      status: 'IDLE' as const,
      icon: getIconForAgent(step.agentName)
    }));
  }, [workflow]);

  const getIconForAgent = (agentName: string): string => {
    const name = agentName.toLowerCase();
    if (name.includes('orchestrator') || name.includes('coordinator')) return '🤖';
    if (name.includes('image') || name.includes('dall')) return '🎨';
    if (name.includes('nft') || name.includes('deploy')) return '💎';
    if (name.includes('hello') || name.includes('greet')) return '👋';
    if (name.includes('balance') || name.includes('1inch')) return '💰';
    return '⚡';
  };

  const steps = transformToSteps();

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeId) return;

      const currentIndex = steps.findIndex(step => step.id === activeId);
      
      if (e.key === 'ArrowDown' && currentIndex < steps.length - 1) {
        e.preventDefault();
        setActive(steps[currentIndex + 1].id);
      } else if (e.key === 'ArrowUp' && currentIndex > 0) {
        e.preventDefault();
        setActive(steps[currentIndex - 1].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeId, steps, setActive]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">
          Generated Workflow
        </h2>
        <p className="text-gray-600 font-medium">
          Review the AI-generated workflow below
        </p>
      </motion.div>

      {/* Top Section - Graph */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <WorkflowGraph steps={steps} />
      </motion.div>

      {/* Bottom Section - Timeline List */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-8"
      >
        <h3 className="text-xl font-black mb-6 uppercase tracking-tight">
          Workflow Steps
        </h3>
        
        <div className="grid grid-cols-[40px_1fr] gap-4">
          {steps.map((step, index) => {
            const isActive = activeId === step.id;
            const isExpanded = isActive;

            return (
              <React.Fragment key={step.id}>
                {/* Left column - Timeline Rail */}
                <div className="flex justify-center">
                  <TimelineRail 
                    order={step.order} 
                    active={isActive}
                  />
                </div>

                {/* Right column - Node Card */}
                <div className="pb-6">
                  <NodeCard 
                    step={step} 
                    expanded={isExpanded}
                  />
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </motion.div>

      {/* Approve Button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="flex justify-center gap-4 pt-8"
      >
        <button
          onClick={onApprove}
          className="px-8 py-3 bg-[#FF5484] text-white font-black border-4 border-black shadow-neo hover-wiggle uppercase tracking-wide transition-all duration-150"
        >
          APPROVE WORKFLOW
        </button>
      </motion.div>
    </div>
  );
};

export default GeneratedStage; 