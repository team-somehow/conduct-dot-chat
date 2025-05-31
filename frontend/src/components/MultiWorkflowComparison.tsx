import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WorkflowGraph from './WorkflowGraph';
import { useWorkflowStore } from '../store/workflow';
import orchestratorAPI from '../api/orchestrator';
import { Check, DollarSign, Clock, Zap, ChevronDown, ChevronUp } from 'lucide-react';

interface WorkflowOption {
  id: string;
  workflow: any;
  nodes: any[];
  edges: any[];
  estimatedCost: number;
  estimatedDuration: number;
  complexity: 'Simple' | 'Moderate' | 'Complex';
  steps: any[];
}

interface MultiWorkflowComparisonProps {
  prompt: string;
  onConfirmWorkflow: (workflowId: string) => void;
  preGeneratedWorkflows?: WorkflowOption[];
}

const MultiWorkflowComparison: React.FC<MultiWorkflowComparisonProps> = ({
  prompt,
  onConfirmWorkflow,
  preGeneratedWorkflows,
}) => {
  const [workflows, setWorkflows] = useState<WorkflowOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const { createWorkflow, addLog } = useWorkflowStore();

  // Generate multiple workflows
  useEffect(() => {
    // If pre-generated workflows are provided, use them
    if (preGeneratedWorkflows && preGeneratedWorkflows.length > 0) {
      setWorkflows(preGeneratedWorkflows);
      setIsLoading(false);
      addLog(`Using ${preGeneratedWorkflows.length} pre-generated workflows`, 'success');
      return;
    }

    // Otherwise, generate workflows as before
    const generateWorkflows = async () => {
      setIsLoading(true);
      addLog('Generating multiple workflow options via orchestrator...', 'info');
      
      try {
        // Generate workflows sequentially to avoid API conflicts
        addLog('Creating standard workflow...', 'info');
        const standardWorkflow = await generateSingleWorkflow(prompt, 'standard');
        
        addLog('Creating optimized workflow...', 'info');
        const optimizedWorkflow = await generateSingleWorkflow(prompt, 'optimized');

        const successfulWorkflows = [standardWorkflow, optimizedWorkflow].filter(Boolean);
        
        setWorkflows(successfulWorkflows);
        addLog(`Generated ${successfulWorkflows.length} workflow options successfully`, 'success');
        
        // Log whether workflows were created via API or fallback
        const apiWorkflows = successfulWorkflows.filter(w => w.workflow.workflowId && !w.workflow.workflowId.includes('workflow-'));
        const mockWorkflows = successfulWorkflows.length - apiWorkflows.length;
        
        if (apiWorkflows.length > 0) {
          addLog(`${apiWorkflows.length} workflows created via orchestrator API`, 'success');
        }
        if (mockWorkflows > 0) {
          addLog(`${mockWorkflows} workflows created via fallback (API unavailable)`, 'info');
        }
        
      } catch (error) {
        console.error('Error generating workflows:', error);
        addLog('Failed to generate workflow options', 'error');
        
        // Generate fallback workflows if everything fails
        try {
          const fallbackWorkflows = [
            generateMockWorkflow(prompt, 'standard'),
            generateMockWorkflow(prompt, 'optimized')
          ];
          setWorkflows(fallbackWorkflows);
          addLog('Using fallback workflows due to API errors', 'info');
        } catch (fallbackError) {
          console.error('Even fallback failed:', fallbackError);
          addLog('Failed to generate any workflows', 'error');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (prompt) {
      generateWorkflows();
    }
  }, [prompt, preGeneratedWorkflows]);

  const generateSingleWorkflow = async (
    workflowPrompt: string, 
    variant: 'standard' | 'optimized'
  ): Promise<WorkflowOption> => {
    try {
      // Create a modified prompt for the optimized variant
      const finalPrompt = variant === 'optimized' 
        ? `${workflowPrompt} (optimize for speed and cost-effectiveness)`
        : workflowPrompt;
      
      // Call the orchestrator API directly to avoid store conflicts
      const { workflow } = await orchestratorAPI.createWorkflow(finalPrompt);
      
      if (!workflow) {
        throw new Error('Failed to create workflow');
      }

      // Convert workflow steps to nodes and edges manually
      const nodes = workflow.steps.map((step: any, index: number) => ({
        id: `${variant}-${step.stepId}`,
        type: 'brutal',
        position: { x: index * 250, y: 50 },
        data: {
          id: `${variant}-${step.stepId}`,
          name: step.agentName,
          description: step.description,
          status: 'IDLE',
          modelType: 'AI MODEL',
          cost: getCostForAgent(step.agentName),
          icon: getIconForAgent(step.agentName)
        }
      }));

      const edges = workflow.steps.slice(1).map((step: any, index: number) => ({
        id: `edge-${variant}-${workflow.steps[index].stepId}-${step.stepId}`,
        source: `${variant}-${workflow.steps[index].stepId}`,
        target: `${variant}-${step.stepId}`,
        type: 'brutal'
      }));

      // Convert to steps format for the WorkflowGraph component
      const steps = workflow.steps.map((step: any, index: number) => ({
        id: `${variant}-${step.stepId}`,
        order: index + 1,
        name: step.agentName,
        modelType: 'AI MODEL',
        description: step.description,
        status: 'IDLE' as const,
        icon: getIconForAgent(step.agentName),
        cost: getCostForAgent(step.agentName)
      }));

      // Calculate total cost from the actual workflow steps
      const totalCost = workflow.steps.reduce((sum: number, step: any) => {
        return sum + getCostForAgent(step.agentName);
      }, 0);

      const estimatedDuration = workflow.steps.length * 30; // 30 seconds per step

      return {
        id: workflow.workflowId,
        workflow: workflow,
        nodes,
        edges,
        estimatedCost: totalCost,
        estimatedDuration,
        complexity: workflow.steps.length <= 2 ? 'Simple' : 
                    workflow.steps.length <= 3 ? 'Moderate' : 'Complex',
        steps
      };
    } catch (error) {
      console.error(`Failed to generate ${variant} workflow via API:`, error);
      addLog(`Failed to generate ${variant} workflow via orchestrator, using fallback`, 'error');
      
      // Fallback to mock workflow if API fails
      return generateMockWorkflow(workflowPrompt, variant);
    }
  };

  // Helper function to get cost for agent (moved from inline)
  const getCostForAgent = (agentName: string): number => {
    const costMap: Record<string, number> = {
      "Hello World Agent": 0.02,
      "DALL-E 3 Image Generator": 0.15,
      "NFT Deployer Agent": 0.08,
      "GPT-4": 0.12,
      "Stable Diffusion": 0.10,
      "Claude": 0.09,
    };
    return costMap[agentName] || 0.05 + Math.random() * 0.1;
  };

  // Fallback mock workflow generator
  const generateMockWorkflow = (workflowPrompt: string, variant: 'standard' | 'optimized'): WorkflowOption => {
    const mockWorkflow = {
      workflowId: `workflow-${variant}-${Date.now()}`,
      name: `${variant.charAt(0).toUpperCase() + variant.slice(1)} Workflow`,
      description: workflowPrompt,
      steps: variant === 'standard' ? [
        {
          stepId: 'step-1',
          agentName: 'Hello World Agent',
          description: 'Generate a personalized greeting message',
        },
        {
          stepId: 'step-2',
          agentName: 'DALL-E 3 Image Generator',
          description: 'Create an image for the NFT',
        },
        {
          stepId: 'step-3',
          agentName: 'NFT Deployer Agent',
          description: 'Deploy and mint the NFT',
        }
      ] : [
        {
          stepId: 'step-1',
          agentName: 'GPT-4',
          description: 'Generate greeting and image prompt',
        },
        {
          stepId: 'step-2',
          agentName: 'NFT Deployer Agent',
          description: 'Deploy NFT with generated content',
        }
      ]
    };

    // Convert to nodes and edges
    const nodes = mockWorkflow.steps.map((step, index) => ({
      id: `${variant}-${step.stepId}`,
      type: 'brutal',
      position: { x: index * 250, y: 50 },
      data: {
        id: `${variant}-${step.stepId}`,
        name: step.agentName,
        description: step.description,
        status: 'IDLE',
        modelType: 'AI MODEL',
        cost: getCostForAgent(step.agentName),
        icon: getIconForAgent(step.agentName)
      }
    }));

    const edges = mockWorkflow.steps.slice(1).map((step, index) => ({
      id: `edge-${variant}-${mockWorkflow.steps[index].stepId}-${step.stepId}`,
      source: `${variant}-${mockWorkflow.steps[index].stepId}`,
      target: `${variant}-${step.stepId}`,
      type: 'brutal'
    }));

    const steps = mockWorkflow.steps.map((step, index) => ({
      id: `${variant}-${step.stepId}`,
      order: index + 1,
      name: step.agentName,
      modelType: 'AI MODEL',
      description: step.description,
      status: 'IDLE' as const,
      icon: getIconForAgent(step.agentName),
      cost: getCostForAgent(step.agentName)
    }));

    const totalCost = mockWorkflow.steps.reduce((sum, step) => sum + getCostForAgent(step.agentName), 0);
    const estimatedDuration = mockWorkflow.steps.length * 30;

    return {
      id: mockWorkflow.workflowId,
      workflow: mockWorkflow,
      nodes,
      edges,
      estimatedCost: totalCost,
      estimatedDuration,
      complexity: mockWorkflow.steps.length <= 2 ? 'Simple' : 
                  mockWorkflow.steps.length <= 3 ? 'Moderate' : 'Complex',
      steps
    };
  };

  const getIconForAgent = (agentName: string): string => {
    const name = agentName.toLowerCase();
    if (name.includes('hello') || name.includes('greet')) return '👋';
    if (name.includes('image') || name.includes('dall')) return '🎨';
    if (name.includes('nft') || name.includes('deploy')) return '💎';
    if (name.includes('gpt') || name.includes('claude')) return '🧠';
    return '⚡';
  };

  const handleConfirmWorkflow = (workflowId: string) => {
    setSelectedWorkflow(workflowId);
    onConfirmWorkflow(workflowId);
  };

  const toggleStepsExpansion = (workflowId: string) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(workflowId)) {
        newSet.delete(workflowId);
      } else {
        newSet.add(workflowId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin w-12 h-12 border-4 border-black border-t-transparent"></div>
        <p className="text-lg font-bold">Generating workflow options...</p>
        <p className="text-sm text-gray-600">Creating multiple approaches for your request</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center"
      >
        <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">
          Choose Your Workflow
        </h2>
        <p className="text-gray-600 font-medium">
          We've generated {workflows.length} different approaches for your request
        </p>
      </motion.div>

      {/* Workflow Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {workflows.map((option, index) => (
          <motion.div
            key={option.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.2 }}
            className={`bg-white border-4 border-black shadow-neo p-6 space-y-4 min-h-[600px] flex flex-col ${
              selectedWorkflow === option.id ? 'ring-4 ring-[#7C82FF]' : ''
            }`}
          >
            {/* Workflow Header */}
            <div className="flex justify-between items-start flex-shrink-0">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-2">
                  Option {index + 1}: {option.workflow.name}
                </h3>
                <div className="flex items-center gap-4 text-sm">
                  <span className={`px-2 py-1 border-2 border-black font-bold ${
                    option.complexity === 'Simple' ? 'bg-green-200' :
                    option.complexity === 'Moderate' ? 'bg-yellow-200' :
                    'bg-red-200'
                  }`}>
                    {option.complexity}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    ~{Math.round(option.estimatedDuration / 60)}min
                  </span>
                </div>
              </div>
              
              {/* Cost Display */}
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1 text-2xl font-black">
                  <DollarSign size={20} />
                  {option.estimatedCost.toFixed(2)}
                </div>
                <p className="text-xs text-gray-600">Total Cost</p>
              </div>
            </div>

            {/* Workflow Graph */}
            <div className="h-[250px] border-2 border-gray-300 bg-gray-50 flex-shrink-0 overflow-hidden">
              <WorkflowGraph 
                steps={option.steps} 
              />
            </div>

            {/* Step Breakdown with Costs */}
            <div className="space-y-3 flex-grow mt-4">
              <button
                onClick={() => toggleStepsExpansion(option.id)}
                className="w-full flex justify-between items-center p-3 bg-gray-100 border-2 border-gray-300 hover:bg-gray-200 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <h4 className="font-black text-sm uppercase tracking-tight">
                    Steps & Costs ({option.steps.length} steps)
                  </h4>
                  <span className="text-xs text-gray-600">
                    ${option.estimatedCost.toFixed(2)} total
                  </span>
                </div>
                {expandedSteps.has(option.id) ? (
                  <ChevronUp size={16} className="text-gray-600" />
                ) : (
                  <ChevronDown size={16} className="text-gray-600" />
                )}
              </button>
              
              <AnimatePresence>
                {expandedSteps.has(option.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden space-y-2"
                  >
                    {option.steps.map((step, stepIndex) => (
                      <motion.div
                        key={step.id}
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: stepIndex * 0.1 }}
                        className="flex justify-between items-center p-3 bg-gray-50 border-2 border-gray-300"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{step.icon}</span>
                          <div>
                            <p className="font-bold text-sm">{step.name}</p>
                            <p className="text-xs text-gray-600">{step.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-sm">${(step as any).cost?.toFixed(2) || '0.00'}</p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Compact Summary when collapsed */}
              {!expandedSteps.has(option.id) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 border-2 border-gray-300 mt-2"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    {option.steps.slice(0, 3).map((step, index) => (
                      <span key={step.id} className="text-sm flex items-center gap-1">
                        <span>{step.icon}</span>
                        <span className="truncate max-w-[120px]">{step.name}</span>
                        {index < Math.min(option.steps.length - 1, 2) && <span>→</span>}
                      </span>
                    ))}
                    {option.steps.length > 3 && (
                      <span className="text-xs text-gray-500">+{option.steps.length - 3} more</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-600 font-medium whitespace-nowrap ml-2">
                    Click to expand
                  </span>
                </motion.div>
              )}
            </div>

            {/* Confirm Button */}
            <button
              onClick={() => handleConfirmWorkflow(option.id)}
              disabled={selectedWorkflow !== null}
              className={`w-full px-6 py-4 font-black text-lg uppercase tracking-tight border-4 border-black transition-all duration-200 flex items-center justify-center gap-2 flex-shrink-0 ${
                selectedWorkflow === option.id
                  ? 'bg-green-500 text-white'
                  : selectedWorkflow !== null
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#FF5484] text-white hover:bg-[#FFE37B] hover:text-black shadow-neo hover:shadow-neo-hover'
              }`}
            >
              {selectedWorkflow === option.id ? (
                <>
                  <Check size={20} />
                  Selected
                </>
              ) : (
                <>
                  <Zap size={20} />
                  Confirm This Workflow
                </>
              )}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Comparison Summary */}
      {workflows.length > 1 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-[#FFE37B] border-4 border-black p-6"
        >
          <h4 className="font-black text-lg uppercase tracking-tight mb-4">
            Quick Comparison
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="font-black text-2xl">${Math.min(...workflows.map(w => w.estimatedCost)).toFixed(2)}</p>
              <p className="text-sm">Lowest Cost</p>
            </div>
            <div className="text-center">
              <p className="font-black text-2xl">{Math.min(...workflows.map(w => Math.round(w.estimatedDuration / 60)))}min</p>
              <p className="text-sm">Fastest Option</p>
            </div>
            <div className="text-center">
              <p className="font-black text-2xl">{Math.min(...workflows.map(w => w.steps.length))}</p>
              <p className="text-sm">Fewest Steps</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MultiWorkflowComparison; 