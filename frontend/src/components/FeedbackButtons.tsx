// FeedbackButtons component with Neo-Brutalist styling
// Features: Thumbs up/down buttons with click handlers and accessibility

import React from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface FeedbackButtonsProps {
  onFeedback: (feedback: 'up' | 'down') => void;
  selectedFeedback?: 'up' | 'down' | null;
}

const FeedbackButtons: React.FC<FeedbackButtonsProps> = ({ 
  onFeedback, 
  selectedFeedback 
}) => {
  return (
    <div className="flex space-x-4 justify-center">
      {/* Thumbs Up Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onFeedback('up')}
        className={`
          p-4 border-4 border-black shadow-neo font-black uppercase text-sm
          hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-lg
          transition-all duration-150 flex items-center space-x-2
          ${selectedFeedback === 'up' 
            ? 'bg-green-400 text-black' 
            : 'bg-[#FEEF5D] text-black hover:bg-[#FFE37B]'
          }
        `}
        aria-label="Thumbs up"
      >
        <ThumbsUp className="h-5 w-5" />
        <span>Good</span>
      </motion.button>

      {/* Thumbs Down Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onFeedback('down')}
        className={`
          p-4 border-4 border-black shadow-neo font-black uppercase text-sm
          hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-lg
          transition-all duration-150 flex items-center space-x-2
          ${selectedFeedback === 'down' 
            ? 'bg-red-400 text-black' 
            : 'bg-[#FF5484] text-white hover:bg-[#FF3366]'
          }
        `}
        aria-label="Thumbs down"
      >
        <ThumbsDown className="h-5 w-5" />
        <span>Bad</span>
      </motion.button>
    </div>
  );
};

export default FeedbackButtons; 