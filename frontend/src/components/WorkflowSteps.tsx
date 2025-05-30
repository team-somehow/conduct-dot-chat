// WorkflowSteps component with Neo-Brutalist styling
// Features: Displays workflow execution steps in vertical numbered format

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Zap, Brain, Image, CheckCircle } from 'lucide-react';

interface WorkflowStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  model?: string;
}

interface WorkflowStepsProps {
  className?: string;
}

const WorkflowSteps: React.FC<WorkflowStepsProps> = ({ className = '' }) => {
  const steps: WorkflowStep[] = [
    {
      id: 1,
      title: 'Input Processing',
      description: 'Analyze and understand the user prompt to determine execution strategy',
      icon: <Brain className="h-6 w-6" />,
      color: '#FEEF5D',
    },
    {
      id: 2,
      title: 'Language Processing',
      description: 'Generate comprehensive text response using advanced language model',
      icon: <Zap className="h-6 w-6" />,
      color: '#FF5484',
      model: 'GPT-4',
    },
    {
      id: 3,
      title: 'Visual Generation',
      description: 'Create high-quality images based on text descriptions and context',
      icon: <Image className="h-6 w-6" />,
      color: '#7C82FF',
      model: 'Stable Diffusion',
    },
    {
      id: 4,
      title: 'Result Compilation',
      description: 'Combine outputs from all models into final comprehensive result',
      icon: <CheckCircle className="h-6 w-6" />,
      color: '#00D4AA',
    },
  ];

  return (
    <div className={`max-w-3xl mx-auto ${className}`}>
      <div className="space-y-6">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2, duration: 0.5 }}
            className="relative"
          >
            {/* Step Container */}
            <div className="bg-white border-4 border-black shadow-neo-lg p-6 relative">
              {/* Step Number */}
              <div 
                className="absolute -left-4 -top-4 w-12 h-12 border-4 border-black shadow-neo flex items-center justify-center font-black text-xl text-black"
                style={{ backgroundColor: step.color }}
              >
                {step.id}
              </div>

              {/* Step Content */}
              <div className="ml-8">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="p-2 border-3 border-black shadow-neo"
                      style={{ backgroundColor: step.color }}
                    >
                      {step.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-black uppercase tracking-tight text-black">
                        {step.title}
                      </h3>
                      {step.model && (
                        <span className="text-sm font-bold text-gray-600 uppercase">
                          Using {step.model}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <p className="text-base font-medium text-black/70 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>

            {/* Arrow Connector */}
            {index < steps.length - 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (index * 0.2) + 0.3, duration: 0.3 }}
                className="flex justify-center my-4"
              >
                <div className="bg-black p-2 rounded-full">
                  <ArrowDown className="h-4 w-4 text-white" />
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Execution Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: steps.length * 0.2 + 0.5, duration: 0.5 }}
        className="mt-8 bg-[#FF5484] border-4 border-black shadow-neo-lg p-6 text-center"
      >
        <h3 className="text-xl font-black uppercase tracking-tight text-black mb-2">
          Workflow Ready for Execution
        </h3>
        <p className="text-sm font-bold text-black/80 uppercase">
          {steps.length} Steps • 2 AI Models • Estimated Time: 3-5 seconds
        </p>
      </motion.div>
    </div>
  );
};

export default WorkflowSteps; 