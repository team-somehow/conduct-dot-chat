// Workflow visualization page with step-by-step animated demo
// Features: Auto-cycling through 6 stages with Neo-Brutalist styling

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { useWorkflowStore } from "../../store/workflow";
import Navbar from "../../components/Navbar";
import StepLoader from "../../components/StepLoader";
import WorkflowSteps from "../../components/WorkflowSteps";
import CostEstimation from "../../components/CostEstimation";
import WorkflowCanvas from "../../components/WorkflowCanvas";
import InteractionTerminal from "../../components/InteractionTerminal";
import ResultPanel from "../../components/ResultPanel";
import FinishConfetti from "../../components/FinishConfetti";

const STEP_DURATION = 3000; // 3 seconds per step

export default function WorkflowPage() {
  const [searchParams] = useSearchParams();
  const initialPrompt = searchParams.get("prompt") || "";
  const [userPrompt, setUserPrompt] = useState(initialPrompt);
  const [isCreatingWorkflow, setIsCreatingWorkflow] = useState(false);

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
    logs,
    availableAgents,
    startDemo,
    nextStep,
    resetWorkflow,
    loadAvailableAgents,
    createWorkflow,
  } = useWorkflowStore();

  useEffect(() => {
    // Initialize demo data when component mounts
    // initializeDemoData();
  }, []);

  useEffect(() => {
    // Auto-advance demo when not on workflow creation step
    if (currentStep !== "GENERATING_WORKFLOW" && !isLoading) {
      // Auto-advance logic can be added here if needed
    }
  }, [currentStep, isLoading]);

  useEffect(() => {
    // Handle workflow creation from URL prompt
    if (initialPrompt && !isLoading) {
      // createWorkflowFromPrompt(initialPrompt);
    }
  }, [initialPrompt, isLoading]);

  useEffect(() => {
    // Set up interaction completion callback
    // setInteractionCompleteCallback(() => {
    //   console.log("Interaction simulation completed");
    // });
  }, []);

  const handleStartDemo = () => {
    startDemo();
  };

  const handleStartInteraction = () => {
    // startInteractionSimulation();
  };

  const handleApprove = () => {
    // approveWorkflow();
  };

  const handleCreateWorkflow = async (prompt: string) => {
    if (!prompt.trim()) return;

    setIsCreatingWorkflow(true);
    try {
      await createWorkflowFromPrompt(prompt);
      // After successful creation, advance to show workflow
      setTimeout(() => {
        nextStep();
        setIsCreatingWorkflow(false);
      }, 1000);
    } catch (error) {
      setIsCreatingWorkflow(false);
      console.error("Failed to create workflow:", error);
    }
  };

  const handleExecuteWorkflow = async () => {
    if (!currentWorkflow) return;

    try {
      await executeCurrentWorkflow();
    } catch (error) {
      console.error("Failed to execute workflow:", error);
    }
  };

  // Test function to load agents
  const handleLoadAgents = async () => {
    await loadAvailableAgents();
  };

  // Test function to create a workflow
  const handleCreateWorkflowTest = async () => {
    await createWorkflow(
      "Create a personalized greeting and generate an image of a sunset"
    );
  };

  const handleNextStep = () => {
    nextStep();
  };

  const handleReset = () => {
    resetWorkflow();
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "GENERATING_WORKFLOW":
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <StepLoader
              title="Generating Workflow"
              subtitle="AI is analyzing your request and selecting optimal agents..."
              isLoading={isLoading}
            />
          </div>
        );

      case "SHOW_WORKFLOW":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Generated Workflow</h2>
              <p className="text-gray-600">
                Review the AI-generated workflow below
              </p>
            </div>
            <WorkflowCanvas nodes={nodes} edges={edges} />
            <div className="flex justify-center gap-4">
              <button
                onClick={handleNextStep}
                className="px-8 py-3 bg-[#FF5484] text-white font-bold border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150"
              >
                APPROVE WORKFLOW
              </button>
            </div>
          </div>
        );

      case "COST_ESTIMATION":
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <StepLoader
              title="Cost Estimation"
              subtitle="Calculating execution costs..."
              isLoading={isLoading}
            />
            {estimatedCost > 0 && (
              <div className="mt-8 text-center">
                <p className="text-2xl font-bold">
                  Estimated Cost: ${estimatedCost}
                </p>
                <button
                  onClick={handleNextStep}
                  className="mt-4 px-8 py-3 bg-green-500 text-white font-bold border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150"
                >
                  PROCEED
                </button>
              </div>
            )}
          </div>
        );

      case "SHOW_INTERACTION":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Workflow Execution</h2>
              <p className="text-gray-600">
                Watch your workflow execute in real-time
              </p>
            </div>
            <WorkflowCanvas nodes={nodes} edges={edges} />
            <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-64 overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className="mb-1">
                  <span className="text-gray-500">[{log.timestamp}]</span>{" "}
                  {log.message}
                </div>
              ))}
            </div>
          </div>
        );

      case "SHOW_RESULT":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Workflow Complete!</h2>
              <p className="text-gray-600">
                Your workflow has been executed successfully
              </p>
            </div>
            {executionResults && <ResultPanel results={executionResults} />}
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
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <h2 className="text-3xl font-bold mb-8">
              AI Workflow Orchestrator
            </h2>
            <button
              onClick={handleStartDemo}
              className="px-8 py-3 bg-[#FF5484] text-white font-bold border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150"
            >
              START DEMO
            </button>
          </div>
        );
    }
  };

  return (
    <div className="workflow-page bg-[#FFFDEE] min-h-screen">
      <Navbar />

      {/* Test Controls */}
      <div className="p-4 bg-gray-100 border-b">
        <div className="max-w-7xl mx-auto flex gap-4 items-center">
          <button
            onClick={handleLoadAgents}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Load Agents"}
          </button>
          <button
            onClick={handleCreateWorkflowTest}
            disabled={isLoading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            Create Test Workflow
          </button>
          <span className="text-sm text-gray-600">
            Available Agents: {availableAgents.length}
          </span>
          {error && (
            <span className="text-sm text-red-600">Error: {error}</span>
          )}
        </div>
      </div>

      {renderCurrentStep()}

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
              "SELECTING_MODELS",
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
              "SELECTING_MODELS",
              "COST_ESTIMATION",
              "SHOW_INTERACTION",
              "SHOW_RESULT",
            ].indexOf(currentStep) + 1}{" "}
            of 6
          </span>
        </div>
      </motion.div>
    </div>
  );
}
