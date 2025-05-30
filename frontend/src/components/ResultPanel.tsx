// ResultPanel component with Neo-Brutalist styling
// Features: Displays workflow results with individual model rating system

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Zap, Home, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ModelRatingFeedback from './ModelRatingFeedback';

interface Model {
  id: string;
  name: string;
  type: string;
  color: string;
  description?: string;
  rating?: number;
  cost?: string;
}

interface ResultPanelProps {
  result: string;
  onFeedback: (feedback: 'up' | 'down') => void;
  selectedFeedback?: 'up' | 'down' | null;
  onRunAgain?: () => void;
  selectedModels?: Model[];
}

const ResultPanel: React.FC<ResultPanelProps> = ({ 
  result, 
  onFeedback, 
  selectedFeedback,
  onRunAgain,
  selectedModels = []
}) => {
  const navigate = useNavigate();

  const handleModelRating = (modelId: string, rating: number) => {
    // TODO: Implement rating storage logic here
    // Store the rating for the specific model in state management or API
  };

  const handleEndWorkflow = () => {
    navigate('/');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto p-6"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center space-x-3 mb-4">
          <CheckCircle className="h-8 w-8 text-green-500" />
          <h2 className="text-3xl font-black uppercase tracking-tight text-black">
            Workflow Complete
          </h2>
          <Zap className="h-8 w-8 text-[#FF5484]" />
        </div>
        <p className="text-lg font-bold text-gray-600 uppercase">
          AI Models Successfully Executed
        </p>
      </motion.div>

      {/* Result Content */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-[#FF5484] text-black border-4 border-black shadow-neo-lg p-8 mb-8"
      >
        <h3 className="text-xl font-black uppercase tracking-tight mb-4">
          Execution Summary
        </h3>
        <p className="text-base font-bold leading-relaxed">
          {result}
        </p>
        
        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white border-3 border-black shadow-neo p-4 text-center">
            <div className="text-2xl font-black text-[#FEEF5D]">{selectedModels.length}</div>
            <div className="text-xs font-bold uppercase">Models Used</div>
          </div>
          <div className="bg-white border-3 border-black shadow-neo p-4 text-center">
            <div className="text-2xl font-black text-[#7C82FF]">3.2s</div>
            <div className="text-xs font-bold uppercase">Execution Time</div>
          </div>
          <div className="bg-white border-3 border-black shadow-neo p-4 text-center">
            <div className="text-2xl font-black text-[#FF5484]">98%</div>
            <div className="text-xs font-bold uppercase">Success Rate</div>
          </div>
        </div>
      </motion.div>

      {/* Model Rating Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mb-8"
      >
        <ModelRatingFeedback 
          models={selectedModels}
          onRatingChange={handleModelRating}
        />
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex justify-center space-x-4 mt-8"
      >
        <button 
          onClick={handleEndWorkflow}
          className="inline-flex items-center space-x-3 bg-[#7C82FF] text-white font-black uppercase text-sm px-6 py-3 border-4 border-black shadow-neo hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-lg transition-all duration-150"
        >
          <Send className="h-5 w-5" />
          <span>Submit Feedback</span>
        </button>
        <button 
          onClick={onRunAgain}
          className="bg-[#FEEF5D] text-black font-black uppercase text-sm px-6 py-3 border-4 border-black shadow-neo hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-lg transition-all duration-150"
        >
          Run Again
        </button>
      </motion.div>
    </motion.div>
  );
};

export default ResultPanel; 