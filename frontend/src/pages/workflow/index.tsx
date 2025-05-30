// Workflow visualization page with step-by-step animated demo
// Features: Auto-cycling through 6 stages with Neo-Brutalist styling

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { useWorkflowStore } from '../../store/workflow';
import Navbar from '../../components/Navbar';
import StepLoader from '../../components/StepLoader';
import WorkflowCanvas from '../../components/WorkflowCanvas';
import WorkflowSteps from '../../components/WorkflowSteps';
import ModelList from '../../components/ModelList';
import ResultPanel from '../../components/ResultPanel';
import CostEstimation from '../../components/CostEstimation';
import InteractionTerminal from '../../components/InteractionTerminal';
import FinishConfetti from '../../components/FinishConfetti';

const STEP_DURATION = 10000; // 10 seconds per step

const WorkflowPage = () => {
  const [searchParams] = useSearchParams();
  const initialPrompt = searchParams.get('prompt');
  
  const {
    currentStep,
    nodes,
    edges,
    selectedModels,
    result,
    feedback,
    isApproved,
    interactionStep,
    nextStep,
    setFeedback,
    initializeDemoData,
    resetDemo,
    approveWorkflow,
    startInteractionSimulation,
    setInteractionCompleteCallback,
  } = useWorkflowStore();

  // Initialize demo data and reset step on mount
  useEffect(() => {
    initializeDemoData();
    resetDemo();
  }, [initializeDemoData, resetDemo]);

  // Set up interaction completion callback
  useEffect(() => {
    setInteractionCompleteCallback(() => {
      // Advance to the next step when interaction simulation completes
      nextStep();
    });
  }, [setInteractionCompleteCallback, nextStep]);

  // Start interaction simulation when entering SHOW_INTERACTION step
  useEffect(() => {
    if (currentStep === 'SHOW_INTERACTION') {
      // Small delay to let the UI render first
      const timer = setTimeout(() => {
        startInteractionSimulation();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [currentStep, startInteractionSimulation]);

  // Auto-advance through steps
  useEffect(() => {
    // Don't set timer if we're already at the last step, waiting for approval, showing workflow (manual start), or showing interaction (controlled by simulation)
    if (currentStep === 'SHOW_RESULT' || 
        (currentStep === 'COST_ESTIMATION' && !isApproved) ||
        currentStep === 'SHOW_WORKFLOW' ||
        currentStep === 'SHOW_INTERACTION') {
      return;
    }

    const timer = setTimeout(() => {
      nextStep();
    }, STEP_DURATION);

    return () => clearTimeout(timer);
  }, [currentStep, nextStep, isApproved]);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'GENERATING_WORKFLOW':
        return (
          <StepLoader text="Generating workflow..." />
        );

      case 'SHOW_WORKFLOW':
        return (
          <div className="min-h-screen bg-[#FFFDEE] px-6 md:px-10 pt-24 pb-32">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
              >
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-black mb-4">
                  AI Workflow Generated
                </h1>
                {initialPrompt && (
                  <div className="bg-white border-4 border-black shadow-neo p-4 inline-block">
                    <p className="text-sm font-bold text-black">
                      <span className="uppercase">Prompt:</span> {initialPrompt}
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Workflow Steps */}
              <WorkflowSteps className="mx-auto" />

              {/* Start Process Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="text-center mt-8"
              >
                <button
                  onClick={nextStep}
                  className="bg-[#7C82FF] text-white font-black uppercase text-lg px-8 py-4 border-4 border-black shadow-neo hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-lg transition-all duration-150"
                >
                  Start Process
                </button>
              </motion.div>
            </div>
          </div>
        );

      case 'SELECTING_MODELS':
        return (
          <StepLoader text="Selecting AI models from marketplace..." />
        );

      case 'COST_ESTIMATION':
        return (
          <div className="min-h-screen bg-[#FFFDEE] px-6 md:px-10 pt-24 pb-32">
            <CostEstimation 
              models={selectedModels}
              onApprove={approveWorkflow}
            />
          </div>
        );

      case 'SHOW_INTERACTION':
        return (
          <div className="min-h-screen bg-[#FFFDEE] px-6 md:px-10 pt-24 pb-32">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
              >
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-black mb-4">
                  AI Network Active
                </h1>
                <p className="text-lg font-bold text-black/70 uppercase">
                  Watch the magic happen in real-time
                </p>
              </motion.div>

              {/* Main interaction area */}
              <div className="flex gap-6">
                {/* Workflow Canvas */}
                <div className="flex-1">
                  <WorkflowCanvas 
                    nodes={nodes} 
                    edges={edges}
                    isAnimating={true}
                  />
                </div>
                
                {/* Terminal Log */}
                <InteractionTerminal />
              </div>
            </div>
          </div>
        );

      case 'SHOW_RESULT':
        return (
          <div className="min-h-screen bg-[#FFFDEE] px-6 md:px-10 pt-24 pb-32">
            <ResultPanel 
              result={result}
              onFeedback={setFeedback}
              selectedFeedback={feedback}
              onRunAgain={resetDemo}
              selectedModels={selectedModels}
            />
            {/* Confetti for successful completion */}
            <FinishConfetti trigger={currentStep === 'SHOW_RESULT'} />
          </div>
        );

      default:
        return <StepLoader text="Loading..." />;
    }
  };

  return (
    <div className="workflow-page bg-[#FFFDEE] min-h-screen">
      <Navbar />
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
            {['GENERATING_WORKFLOW', 'SHOW_WORKFLOW', 'SELECTING_MODELS', 'COST_ESTIMATION', 'SHOW_INTERACTION', 'SHOW_RESULT'].map((step, index) => (
              <div
                key={step}
                className={`w-3 h-3 border-2 border-black ${
                  step === currentStep ? 'bg-[#FF5484]' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-black uppercase text-black">
            Step {['GENERATING_WORKFLOW', 'SHOW_WORKFLOW', 'SELECTING_MODELS', 'COST_ESTIMATION', 'SHOW_INTERACTION', 'SHOW_RESULT'].indexOf(currentStep) + 1} of 6
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default WorkflowPage; 