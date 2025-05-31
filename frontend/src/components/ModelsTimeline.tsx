import React, { useState } from 'react';

interface Model {
  id: string;
  name: string;
  type?: string;
  status: 'completed' | 'running' | 'pending';
  rating?: number;
}

interface Props {
  models: Model[];
  onModelRating?: (modelId: string, rating: number) => void;
}

export default function ModelsTimeline({ models, onModelRating }: Props) {
  const [modelRatings, setModelRatings] = useState<Record<string, number>>({});
  const [hoveredRatings, setHoveredRatings] = useState<Record<string, number>>({});

  const handleStarClick = (modelId: string, rating: number) => {
    setModelRatings(prev => ({ ...prev, [modelId]: rating }));
    onModelRating?.(modelId, rating);
  };

  const handleStarHover = (modelId: string, rating: number) => {
    setHoveredRatings(prev => ({ ...prev, [modelId]: rating }));
  };

  const handleStarLeave = (modelId: string) => {
    setHoveredRatings(prev => ({ ...prev, [modelId]: 0 }));
  };

  const getStarRating = (modelId: string) => {
    return modelRatings[modelId] || 0;
  };

  const getHoveredRating = (modelId: string) => {
    return hoveredRatings[modelId] || 0;
  };

  return (
    <div className="space-y-4">
      {models.map((model, index) => (
        <div key={model.id} className="flex gap-4">
          {/* Step number circle */}
          <div className="flex-shrink-0 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-black text-sm">
            {index + 1}
          </div>
          
          {/* Model card */}
          <div className="flex-1 bg-white border-3 border-black shadow-neo p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-black text-lg">{model.name}</h4>
                {model.type && (
                  <p className="text-sm text-black/70 uppercase font-bold">{model.type}</p>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                {/* Status chip */}
                <div className={`px-3 py-1 border-2 border-black font-black text-xs uppercase ${
                  model.status === 'completed' 
                    ? 'bg-[#13C27B] text-white' 
                    : model.status === 'running'
                    ? 'bg-yellow-400 text-black'
                    : 'bg-gray-300 text-black'
                }`}>
                  {model.status === 'completed' && '✓ Completed'}
                  {model.status === 'running' && '⚡ Running'}
                  {model.status === 'pending' && '⏳ Pending'}
                </div>
                
                {/* Interactive rating stars - only show for completed models */}
                {model.status === 'completed' && (
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs font-bold uppercase tracking-wide text-black/70">Rate Performance</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => {
                        const currentRating = getStarRating(model.id);
                        const hoveredRating = getHoveredRating(model.id);
                        const isActive = star <= (hoveredRating || currentRating);
                        
                        return (
                          <button
                            key={star}
                            onClick={() => handleStarClick(model.id, star)}
                            onMouseEnter={() => handleStarHover(model.id, star)}
                            onMouseLeave={() => handleStarLeave(model.id)}
                            className={`text-lg transition-all duration-150 hover:scale-110 ${
                              isActive ? 'text-yellow-400' : 'text-gray-300'
                            } hover:text-yellow-400`}
                            aria-label={`Rate ${model.name} ${star} stars`}
                          >
                            ★
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 