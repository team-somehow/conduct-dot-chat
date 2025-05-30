// Cleaned by Mega-Prompt – 2024-12-19
// Purpose: Timeline navigation bar for workflow simulation steps

import React, { useEffect } from 'react';
import { useWorkflowStore } from '../store/workflow';

const STEPS = [
  'Start',
  'GPT-4',
  'Coordinate',
  'Stable Diffusion',
  'Complete'
];

/**
 * TimelineBar - Interactive timeline for navigating workflow simulation steps
 * Provides keyboard navigation and visual progress indication
 */
const TimelineBar: React.FC = () => {
  const { 
    interactionStep, 
    isPaused, 
    setInteractionStep, 
    togglePause,
    advanceNode,
    startInteractionSimulation 
  } = useWorkflowStore();

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
        const newStep = Math.min(STEPS.length - 1, interactionStep + 1);
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
      startInteractionSimulation();
    } else {
      togglePause();
    }
  };

  return (
    <div className="bg-white border-4 border-black shadow-neo p-4 mb-6">
      <div className="flex items-center justify-between">
        {/* Timeline dots */}
        <div className="flex items-center space-x-4">
          {STEPS.map((step, index) => (
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
                aria-label={`Go to step ${index + 1}: ${step}`}
              />
              {index < STEPS.length - 1 && (
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
            STEP {interactionStep + 1} OF {STEPS.length}
          </span>
          <button
            onClick={handlePlayPause}
            className="bg-[#7C82FF] text-white font-black uppercase text-sm px-4 py-2 border-2 border-black shadow-neo hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-neo-sm transition-all duration-150"
            aria-label={isPaused ? 'Play simulation' : 'Pause simulation'}
          >
            {isPaused ? '▶ PLAY' : '⏸ PAUSE'}
          </button>
        </div>
      </div>

      {/* Step name */}
      <div className="mt-2 text-center">
        <span className="text-xs font-bold uppercase text-black/70">
          {STEPS[interactionStep]}
        </span>
      </div>
    </div>
  );
};

export default TimelineBar; 