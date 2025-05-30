// StarRating component with Neo-Brutalist styling
// Features: Static star icons with support for half-star ratings (0-5, 0.5 steps)

import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
}

const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  maxRating = 5, 
  size = 18 
}) => {
  const stars = [];
  
  for (let i = 1; i <= maxRating; i++) {
    const filled = rating >= i;
    const halfFilled = rating >= i - 0.5 && rating < i;
    
    stars.push(
      <div key={i} className="relative">
        <Star 
          size={size}
          className={`fill-current ${
            filled ? 'text-black' : 'text-gray-300'
          } stroke-black stroke-2`}
        />
        {halfFilled && (
          <div 
            className="absolute top-0 left-0 overflow-hidden"
            style={{ width: '50%' }}
          >
            <Star 
              size={size}
              className="fill-current text-black stroke-black stroke-2"
            />
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="flex items-center space-x-1">
      {stars}
      <span className="ml-2 text-sm font-bold text-black">
        {rating.toFixed(1)}
      </span>
    </div>
  );
};

export default StarRating; 