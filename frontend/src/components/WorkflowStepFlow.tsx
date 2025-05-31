// WorkflowStepFlow component with Neo-Brutalist vertical step-by-step styling
// Features: Vertical workflow visualization with arrows between steps

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Bot, Zap, Image, Coins } from 'lucide-react';

interface WorkflowStep {
  id: string;
  name: string;
  type: string;
  description: string;
  status: 'idle' | 'active' | 'completed' | 'pending';
  icon?: React.ReactNode;
  color: string;
}

interface WorkflowStepFlowProps {
  steps: WorkflowStep[];
  isAnimating?: boolean;
  activeStepId?: string;
}

const WorkflowStepFlow: React.FC<WorkflowStepFlowProps> = ({ 
  steps, 
  isAnimating = false, 
  activeStepId 
}) => {
  const getStepIcon = (step: WorkflowStep) => {
    if (step.icon) return step.icon;
    
    // Default icons based on step type or name
    if (step.name.toLowerCase().includes('orchestrator') || step.name.toLowerCase().includes('coordinator')) {
      return <Bot className="h-8 w-8" />;
    }
    if (step.name.toLowerCase().includes('image') || step.name.toLowerCase().includes('dall')) {
      return <Image className="h-8 w-8" />;
    }
    if (step.name.toLowerCase().includes('nft') || step.name.toLowerCase().includes('deploy')) {
      return <Coins className="h-8 w-8" />;
    }
    return <Zap className="h-8 w-8" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-[#13C27B] text-white';
      case 'active':
        return 'bg-[#FF5484] text-white';
      case 'pending':
        return 'bg-gray-300 text-black';
      default:
        return 'bg-[#FEEF5D] text-black';
    }
  };

  const getStepAnimation = (index: number) => ({
    initial: { y: 50, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { delay: index * 0.2, duration: 0.5 }
  });

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={step.id} className="relative">
            {/* Step Card */}
            <motion.div
              {...getStepAnimation(index)}
              className={`relative bg-white border-4 border-black shadow-neo p-6 transition-all duration-300 ${
                step.id === activeStepId ? 'scale-105 shadow-neo-lg' : ''
              }`}
            >
              {/* Step Number Badge */}
              <div className="absolute -left-4 -top-4 w-12 h-12 bg-black text-white border-4 border-white shadow-neo flex items-center justify-center font-black text-lg z-10">
                {index + 1}
              </div>

              <div className="flex items-center gap-6">
                {/* Icon Section */}
                <div 
                  className={`flex-shrink-0 w-20 h-20 border-4 border-black shadow-neo flex items-center justify-center ${step.color}`}
                >
                  {getStepIcon(step)}
                </div>

                {/* Content Section */}
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-2xl font-black uppercase tracking-wide">
                      {step.name}
                    </h3>
                    <div className={`px-3 py-1 border-2 border-black font-black text-xs uppercase ${getStatusColor(step.status)}`}>
                      {step.status === 'completed' && '✓ Completed'}
                      {step.status === 'active' && '⚡ Running'}
                      {step.status === 'pending' && '⏳ Pending'}
                      {step.status === 'idle' && '💤 Idle'}
                    </div>
                  </div>
                  
                  <p className="text-sm font-bold text-black/70 uppercase tracking-wide mb-2">
                    {step.type}
                  </p>
                  
                  <p className="text-gray-700 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Status Indicator */}
                <div className="flex-shrink-0">
                  {step.status === 'active' && (
                    <div className="w-4 h-4 bg-[#FF5484] border-2 border-black animate-pulse"></div>
                  )}
                  {step.status === 'completed' && (
                    <div className="w-4 h-4 bg-[#13C27B] border-2 border-black"></div>
                  )}
                  {step.status === 'pending' && (
                    <div className="w-4 h-4 bg-gray-300 border-2 border-black"></div>
                  )}
                  {step.status === 'idle' && (
                    <div className="w-4 h-4 bg-[#FEEF5D] border-2 border-black"></div>
                  )}
                </div>
              </div>

              {/* Progress Bar for Active Step */}
              {step.status === 'active' && (
                <div className="mt-4 w-full bg-gray-200 border-2 border-black h-3">
                  <motion.div
                    className="h-full bg-[#FF5484]"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </div>
              )}
            </motion.div>

            {/* Arrow Connector */}
            {index < steps.length - 1 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (index + 1) * 0.2, duration: 0.3 }}
                className="flex justify-center py-4"
              >
                <div className="bg-black text-white p-3 border-4 border-black shadow-neo">
                  <ChevronDown className="h-6 w-6" />
                </div>
              </motion.div>
            )}
          </div>
        ))}
      </div>

      {/* Completion Message */}
      {steps.every(step => step.status === 'completed') && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8 text-center"
        >
          <div className="bg-[#13C27B] text-white border-4 border-black shadow-neo-lg p-6 inline-block">
            <h3 className="text-2xl font-black uppercase tracking-wide mb-2">
              🎉 Workflow Complete!
            </h3>
            <p className="font-bold">All steps executed successfully</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default WorkflowStepFlow; 