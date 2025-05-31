// Workflow visualization page with step-by-step animated demo
// Features: Auto-cycling through 5 stages with Neo-Brutalist styling

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { ReactFlowProvider } from 'reactflow';
import { useWorkflowStore } from "../../store/workflow";
import Navbar from "../../components/Navbar";
import StepLoader from "../../components/StepLoader";
import ExecutionCanvas from "../../components/ExecutionCanvas";
import LiveLogPanel from "../../components/LiveLogPanel";
import ResultPanel from "../../components/ResultPanel";
import GeneratedStage from "../../components/GeneratedStage";
import MultiWorkflowComparison from "../../components/MultiWorkflowComparison";
import "../../styles/execution.css";

const STEP_DURATION = 3000; // 3 seconds per step

export default function WorkflowPage() {
  const [searchParams] = useSearchParams();
  const initialPrompt = searchParams.get("prompt") || "";
  const [userPrompt, setUserPrompt] = useState(initialPrompt);
  const [promptInput, setPromptInput] = useState("");
  const [hasCreatedWorkflow, setHasCreatedWorkflow] = useState(false);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [generatedWorkflows, setGeneratedWorkflows] = useState<any[]>([]);

  const {
    currentStep,
    isLoading,
    error,
    nodes,
    edges,
    selectedModel,
    estimatedCost,
    isExecuting,
    executionResults,
    executionSummary,
    logs,
    availableAgents,
    workflowId,
    setCurrentStep,
    startDemo,
    nextStep,
    resetWorkflow,
    loadAvailableAgents,
    createWorkflow,
    executeWorkflow,
    workflow,
    executionId,
    addLog,
    activeNodeId,
    interactionStep,
    startExecutionSimulation,
  } = useWorkflowStore();

  // Load available agents when component mounts
  useEffect(() => {
    loadAvailableAgents();
  }, []); // Empty dependency array - only run once

  // Helper functions for workflow transformation
  const getIconForAgent = (agentName: string): string => {
    const name = agentName.toLowerCase();
    if (name.includes('hello') || name.includes('greet')) return '👋';
    if (name.includes('image') || name.includes('dall')) return '🎨';
    if (name.includes('nft') || name.includes('deploy')) return '💎';
    if (name.includes('gpt') || name.includes('claude')) return '🧠';
    return '⚡';
  };

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

  const handleCreateWorkflow = useCallback(async (prompt: string) => {
    if (!prompt.trim()) return;
    
    try {
      console.log("Creating workflow with prompt:", prompt);
      setCurrentStep("GENERATING_WORKFLOW");
      setUserPrompt(prompt);
      
      // Generate workflows during the loading step
      addLog(`Starting workflow creation for: "${prompt}"`, 'info');
      
      const workflows = [];
      
      // Generate standard workflow
      try {
        addLog("Generating standard workflow...", 'info');
        await createWorkflow(prompt);
        
        // Access the workflow data from the store after creation
        const currentState = useWorkflowStore.getState();
        if (currentState.workflow && currentState.nodes.length > 0) {
          // Transform workflow steps to match WorkflowGraph Step interface
          const transformedSteps = currentState.workflow.steps.map((step: any, index: number) => ({
            id: `standard-${step.stepId}`,
            order: index + 1,
            name: step.agentName,
            modelType: 'AI MODEL',
            description: step.description,
            status: 'IDLE' as const,
            icon: getIconForAgent(step.agentName),
            cost: getCostForAgent(step.agentName)
          }));

          workflows.push({
            id: `workflow-standard-${Date.now()}`,
            variant: 'standard',
            title: 'Standard Workflow',
            description: 'Optimized for reliability and accuracy',
            estimatedCost: currentState.estimatedCost || 0.25,
            estimatedDuration: '2-3 minutes',
            workflow: currentState.workflow,
            nodes: currentState.nodes,
            edges: currentState.edges,
            steps: transformedSteps
          });
          addLog("Standard workflow generated successfully", 'success');
        }
      } catch (error) {
        console.error("Failed to generate standard workflow:", error);
        addLog("Failed to generate standard workflow, using fallback", 'error');
      }
      
      // Generate optimized workflow
      try {
        addLog("Generating optimized workflow...", 'info');
        await createWorkflow(`${prompt} (optimized for speed)`);
        
        // Access the workflow data from the store after creation
        const currentState = useWorkflowStore.getState();
        if (currentState.workflow && currentState.nodes.length > 0) {
          // Transform workflow steps to match WorkflowGraph Step interface
          const transformedSteps = currentState.workflow.steps.map((step: any, index: number) => ({
            id: `optimized-${step.stepId}`,
            order: index + 1,
            name: step.agentName,
            modelType: 'AI MODEL',
            description: step.description,
            status: 'IDLE' as const,
            icon: getIconForAgent(step.agentName),
            cost: getCostForAgent(step.agentName)
          }));

          workflows.push({
            id: `workflow-optimized-${Date.now()}`,
            variant: 'optimized',
            title: 'Optimized Workflow',
            description: 'Optimized for speed and efficiency',
            estimatedCost: (currentState.estimatedCost || 0.25) * 0.8, // 20% cheaper
            estimatedDuration: '1-2 minutes',
            workflow: currentState.workflow,
            nodes: currentState.nodes,
            edges: currentState.edges,
            steps: transformedSteps
          });
          addLog("Optimized workflow generated successfully", 'success');
        }
      } catch (error) {
        console.error("Failed to generate optimized workflow:", error);
        addLog("Failed to generate optimized workflow, using fallback", 'error');
      }
      
      // Store generated workflows
      setGeneratedWorkflows(workflows);
      addLog(`Generated ${workflows.length} workflow options`, 'success');
      
      // Move to next step
      setCurrentStep("SHOW_WORKFLOW");
    } catch (error) {
      console.error("Failed to create workflow:", error);
      addLog("Failed to create workflows", 'error');
    }
  }, [setCurrentStep, addLog, createWorkflow]);

  // Handle workflow creation from URL prompt - only once
  useEffect(() => {
    if (initialPrompt && !hasCreatedWorkflow && !isLoading && !workflowId) {
      console.log("Creating workflow from URL prompt:", initialPrompt);
      setHasCreatedWorkflow(true);
      handleCreateWorkflow(initialPrompt);
    }
  }, [initialPrompt, hasCreatedWorkflow, isLoading, workflowId, handleCreateWorkflow]);

  // Auto-proceed from cost estimation to interaction if conditions are met
  useEffect(() => {
    if (
      currentStep === "COST_ESTIMATION" &&
      estimatedCost > 0 &&
      workflowId &&
      !isExecuting
    ) {
      // Remove auto-proceed - let user manually confirm
      // const timer = setTimeout(() => {
      //   setCurrentStep("SHOW_INTERACTION");
      //   setIsExecuting(true);
      //   startExecutionSimulation();
      // }, 3000);
      // return () => clearTimeout(timer);
    }
  }, [currentStep, estimatedCost, workflowId, isExecuting, setCurrentStep, startExecutionSimulation]);

  const handleExecuteWorkflow = useCallback(async () => {
    try {
      console.log("Executing workflow with ID:", selectedWorkflowId);
      setCurrentStep("SHOW_INTERACTION");
      if (selectedWorkflowId) {
        // Use the selected workflow ID for execution
        await executeWorkflow(selectedWorkflowId);
      } else {
        // Fallback to demo simulation if no workflow ID
        console.log("No workflow ID, starting demo simulation");
        startDemo();
      }
    } catch (error) {
      console.error("Failed to execute workflow:", error);
    }
  }, [selectedWorkflowId, executeWorkflow, startDemo, setCurrentStep]);

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (promptInput.trim()) {
      setHasCreatedWorkflow(true);
      handleCreateWorkflow(promptInput);
      setPromptInput("");
    }
  };

  const handleWorkflowConfirm = () => {
    setCurrentStep("SHOW_INTERACTION");
    startExecutionSimulation();
  };

  const handleNextStep = () => {
    console.log("Next step from:", currentStep);
    if (currentStep === "SHOW_WORKFLOW") {
      // Move directly to cost estimation (skip model selection)
      setCurrentStep("COST_ESTIMATION");
    } else if (currentStep === "COST_ESTIMATION") {
      // Execute the workflow
      handleExecuteWorkflow();
    } else {
      nextStep();
    }
  };

  const handleReset = () => {
    console.log("Resetting workflow");
    resetWorkflow();
    setPromptInput("");
    setHasCreatedWorkflow(false);
    setSelectedWorkflowId(null);
    setUserPrompt("");
  };

  // Transform nodes data to workflow steps format
  const transformNodesToSteps = () => {
    if (!nodes || nodes.length === 0) {
      // Default demo steps
      return [
        {
          id: 'orchestrator',
          name: 'AI Orchestrator',
          type: 'COORDINATOR',
          description: 'Analyzes your request and coordinates the workflow execution',
          status: 'idle' as const,
          color: 'bg-[#FEEF5D]'
        },
        {
          id: 'dalle-3',
          name: 'DALL-E 3 Image Generator',
          type: 'AI MODEL',
          description: 'Generates high-quality images based on text descriptions',
          status: 'idle' as const,
          color: 'bg-[#FF5484]'
        },
        {
          id: 'nft-deployer',
          name: 'NFT Deployer Agent',
          type: 'AI MODEL',
          description: 'Deploys NFTs to the blockchain with smart contract integration',
          status: 'idle' as const,
          color: 'bg-[#7C82FF]'
        }
      ];
    }

    return nodes.map(node => {
      let status = 'idle';
      
      // Determine status based on interaction progress
      if (node.id === activeNodeId) {
        status = 'active';
      } else if (
        (node.id === 'orchestrator' && interactionStep > 0) ||
        (node.id === 'gpt4' && interactionStep > 1) ||
        (node.id === 'stable-diffusion' && interactionStep > 3)
      ) {
        status = 'completed';
      } else if (
        (node.id === 'gpt4' && interactionStep < 1) ||
        (node.id === 'stable-diffusion' && interactionStep < 3)
      ) {
        status = 'pending';
      }

      return {
        id: node.id,
        name: node.data?.label || node.data?.name || 'AI Agent',
        type: node.data?.type || 'AI MODEL',
        description: node.data?.description || 'Processes data using advanced AI capabilities',
        status: status as 'idle' | 'active' | 'completed' | 'pending',
        color: node.data?.color || 'bg-[#FEEF5D]'
      };
    });
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "GENERATING_WORKFLOW":
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <StepLoader
              text="Generating Workflow - AI is analyzing your request and selecting optimal agents..."
            />
          </div>
        );

      case "SHOW_WORKFLOW":
        return (
          <MultiWorkflowComparison 
            prompt={userPrompt}
            onConfirmWorkflow={handleWorkflowConfirm}
            preGeneratedWorkflows={generatedWorkflows}
          />
        );

      case "COST_ESTIMATION":
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <StepLoader
              text="Preparing Execution - Setting up your selected workflow..."
            />
            <div className="mt-8 text-center">
              <p className="text-2xl font-bold">
                Selected Workflow Ready
              </p>
              <p className="text-gray-600 mt-2">
                Initializing execution environment...
              </p>
            </div>
          </div>
        );

      case "SHOW_INTERACTION":
        return (
          <ReactFlowProvider>
            <div className="space-y-4">
              <header className="text-center py-4 text-xs uppercase font-bold text-black/70">
                Watch your workflow execute in real-time
              </header>
              
              <ExecutionCanvas nodes={nodes} edges={edges} />
              
              <LiveLogPanel />
            </div>
          </ReactFlowProvider>
        );

      case "SHOW_RESULT":
        return (
          <div className="space-y-8">
            {executionResults && (
              <ResultPanel 
                result={{
                  ...executionResults,
                  summary: executionSummary
                }}
                workflow={workflow}
                executionId={executionId || undefined}
                onFeedback={(feedback) => {
                  console.log('Feedback received:', feedback);
                  addLog(`User feedback: ${feedback}`, "info");
                }}
                onRunAgain={handleReset}
              />
            )}
            <div className="flex justify-center">
              <button
                onClick={handleReset}
                className="px-8 py-3 bg-blue-500 text-white font-bold border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150"
              >
                CREATE NEW WORKFLOW
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
            <h2 className="text-3xl font-bold mb-8">
              AI Workflow Orchestrator
            </h2>
            
            {/* Prompt Input Form */}
            <form onSubmit={handlePromptSubmit} className="w-full max-w-2xl">
              <div className="space-y-4">
                <div>
                  <label htmlFor="prompt" className="block text-sm font-bold text-gray-700 mb-2">
                    Describe what you want to accomplish:
                  </label>
                  <textarea
                    id="prompt"
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    placeholder="e.g., Can you send a thank you nft to 0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e for attending eth global prague"
                    className="w-full p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] transition-all duration-150 resize-none"
                    rows={4}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!promptInput.trim() || isLoading}
                  className="w-full px-8 py-3 bg-[#FF5484] text-white font-bold border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "CREATING WORKFLOW..." : "CREATE WORKFLOW"}
                </button>
              </div>
            </form>

            {/* Example prompts */}
            <div className="w-full max-w-2xl">
              <h3 className="text-lg font-bold mb-4">Try these examples:</h3>
              <div className="space-y-2">
                {[
                  "Can you send a thank you nft to 0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e for attending eth global prague",
                  "Generate an image of a sunset and create a greeting message",
                  "Create a personalized NFT for my friend's birthday"
                ].map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setPromptInput(example)}
                    className="w-full text-left p-3 bg-gray-100 border-2 border-gray-300 hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 text-sm"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            {/* Or try the demo */}
            {/* Removed demo button that was causing reset issues */}
            {/* <div className="text-center">
              <p className="text-gray-600 mb-4">Or try our interactive demo:</p>
              <button
                onClick={() => {
                  console.log("Starting demo");
                  startDemo();
                }}
                className="px-8 py-3 bg-blue-500 text-white font-bold border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150"
              >
                START DEMO
              </button>
            </div> */}
          </div>
        );
    }
  };

  return (
    <div className="workflow-page bg-[#FFFDEE] min-h-screen">
      <Navbar />

      {/* Debug/Status Bar */}
      <div className="p-4 bg-gray-100 border-b">
        <div className="max-w-7xl mx-auto flex gap-4 items-center text-sm">
          <span className="font-bold">Status:</span>
          <span className={`px-2 py-1 rounded ${
            error ? "bg-red-200 text-red-800" :
            isLoading || isExecuting ? "bg-yellow-200 text-yellow-800" :
            "bg-green-200 text-green-800"
          }`}>
            {error ? "Error" : isLoading || isExecuting ? "Processing" : "Ready"}
          </span>
          <span>Available Agents: {availableAgents.length}</span>
          {selectedWorkflowId && (
            <span className="text-blue-600">Selected: {selectedWorkflowId.slice(0, 8)}...</span>
          )}
          {error && (
            <span className="text-red-600 ml-4">Error: {error}</span>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        {renderCurrentStep()}
      </div>

      {/* Step Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
      >
        <div className="bg-white border-4 border-black shadow-neo-lg p-4 flex items-center space-x-3">
          <div className="flex space-x-2">
            {[
              "GENERATING_WORKFLOW",
              "SHOW_WORKFLOW",
              "COST_ESTIMATION",
              "SHOW_INTERACTION",
              "SHOW_RESULT",
            ].map((step, index) => (
              <div
                key={step}
                className={`w-3 h-3 border-2 border-black ${
                  step === currentStep ? "bg-[#FF5484]" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-black uppercase text-black">
            Step{" "}
            {[
              "GENERATING_WORKFLOW",
              "SHOW_WORKFLOW",
              "COST_ESTIMATION",
              "SHOW_INTERACTION",
              "SHOW_RESULT",
            ].indexOf(currentStep) + 1}{" "}
            of 5
          </span>
        </div>
      </motion.div>
    </div>
  );
}
