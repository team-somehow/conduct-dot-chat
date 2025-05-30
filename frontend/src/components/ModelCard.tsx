// ModelCard component with Neo-Brutalist styling
// Features: Card with model info, tags, rating, and cost

import React from 'react';
import TagBadge from './TagBadge';
import StarRating from './StarRating';

interface Model {
  id: string;
  name: string;
  vendor: string;
  category: string;
  description: string;
  tags: string[];
  rating: number;
  priceLabel: string;
  accent: string;
}

interface ModelCardProps {
  model: Model;
}

const ModelCard: React.FC<ModelCardProps> = ({ model }) => {
  return (
    <div className="bg-white border-4 border-black shadow-neo p-6 space-y-4 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-lg transition-all duration-150">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-black uppercase tracking-tight text-black">
            {model.name}
          </h3>
          <div 
            className="w-4 h-4 border-2 border-black"
            style={{ backgroundColor: model.accent }}
          />
        </div>
        <p className="text-sm font-bold text-gray-600 uppercase">
          by {model.vendor}
        </p>
      </div>

      {/* Description */}
      <p className="text-sm font-medium text-black leading-relaxed">
        {model.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {model.tags.map((tag, index) => (
          <TagBadge key={index} tag={tag} />
        ))}
      </div>

      {/* Rating and Price */}
      <div className="flex items-center justify-between">
        <StarRating rating={model.rating} />
        <div className="text-right">
          <p className="text-lg font-black text-black">
            {model.priceLabel}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModelCard; 