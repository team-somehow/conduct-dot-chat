import React, { useEffect } from 'react';
import { useWorkflowStore } from '../store/workflow';

const TimelineBar: React.FC = () => {
  const { 
    interactionStep, 
    isPaused, 
    setInteractionStep, 
    togglePause,
    advanceNode,
    startExecutionSimulation 
  } = useWorkflowStore();

  const steps = [
    'Start',
    'GPT-4',
    'Coordinate',
    'Stable Diffusion',
    'Complete'
  ];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        togglePause();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        const newStep = Math.max(0, interactionStep - 1);
        setInteractionStep(newStep);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        const newStep = Math.min(steps.length - 1, interactionStep + 1);
        setInteractionStep(newStep);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [interactionStep, togglePause, setInteractionStep]);

  const handleStepClick = (stepIndex: number) => {
    setInteractionStep(stepIndex);
  };

  const handlePlayPause = () => {
    if (interactionStep === 0 && isPaused) {
      // If we're at the start and paused, restart the simulation
      startExecutionSimulation();
    } else {
      togglePause();
    }
  };

  return (
    <div className="bg-white border-4 border-black shadow-neo p-4 mb-6">
      <div className="flex items-center justify-between">
        {/* Timeline dots */}
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <button
                onClick={() => handleStepClick(index)}
                className={`w-4 h-4 border-2 border-black transition-all duration-200 ${
                  index === interactionStep
                    ? 'bg-[#FF5484] scale-125'
                    : index < interactionStep
                    ? 'bg-[#7C82FF]'
                    : 'bg-gray-300'
                } hover:scale-110`}
                title={step}
              />
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-2 ${
                  index < interactionStep ? 'bg-[#7C82FF]' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4">
          <span className="text-sm font-bold uppercase">
            STEP {interactionStep + 1} OF {steps.length}
          </span>
          <button
            onClick={handlePlayPause}
            className="bg-[#7C82FF] text-white font-black uppercase text-sm px-4 py-2 border-2 border-black shadow-neo hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-neo-sm transition-all duration-150"
          >
            {isPaused ? '▶ PLAY' : '⏸ PAUSE'}
          </button>
        </div>
      </div>

      {/* Step name */}
      <div className="mt-2 text-center">
        <span className="text-xs font-bold uppercase text-black/70">
          {steps[interactionStep]}
        </span>
      </div>
    </div>
  );
};

export default TimelineBar; 