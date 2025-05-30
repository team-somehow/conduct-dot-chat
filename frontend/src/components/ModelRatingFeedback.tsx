// ModelRatingFeedback component with Neo-Brutalist styling
// Features: Individual 5-star ratings for each AI model

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface Model {
  id: string;
  name: string;
  type: string;
  color: string;
  description?: string;
  rating?: number;
  cost?: string;
}

interface ModelRatingFeedbackProps {
  models: Model[];
  onRatingChange?: (modelId: string, rating: number) => void;
}

const ModelRatingFeedback: React.FC<ModelRatingFeedbackProps> = ({ 
  models, 
  onRatingChange 
}) => {
  const [ratings, setRatings] = useState<Record<string, number>>({});

  const handleRating = (modelId: string, rating: number) => {
    setRatings(prev => ({ ...prev, [modelId]: rating }));
    onRatingChange?.(modelId, rating);
  };

  const StarRating = ({ modelId, currentRating }: { modelId: string; currentRating: number }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleRating(modelId, star)}
            className="focus:outline-none"
          >
            <Star
              className={`h-6 w-6 transition-colors duration-150 ${
                star <= currentRating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 hover:text-yellow-300'
              }`}
            />
          </motion.button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-black uppercase tracking-tight text-black text-center mb-6">
        Rate Each AI Model
      </h3>
      
      {models.map((model, index) => (
        <motion.div
          key={model.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white border-4 border-black shadow-neo p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div 
                className="w-4 h-4 border-2 border-black"
                style={{ backgroundColor: model.color }}
              />
              <div>
                <h4 className="text-lg font-black uppercase tracking-tight text-black">
                  {model.name}
                </h4>
                <span className="text-sm font-bold text-gray-600 uppercase">
                  {model.type}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col items-end space-y-2">
              <StarRating 
                modelId={model.id} 
                currentRating={ratings[model.id] || 0} 
              />
              <span className="text-xs font-bold text-gray-500 uppercase">
                {ratings[model.id] ? `${ratings[model.id]} star${ratings[model.id] !== 1 ? 's' : ''}` : 'Not rated'}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ModelRatingFeedback; 