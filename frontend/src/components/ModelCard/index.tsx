// AI model card component with Neo-Brutalist styling
// Features: Bold, flat design with thick borders and hard shadows

import React from 'react';

// TODO(ModelCard):
// 1. Implement Radix UI Card component
// 2. Add model metrics visualization
// 3. Create rating system
// 4. Add pricing information
// 5. Implement quick-add to workflow
// END TODO

interface ModelCardProps {
  name: string;
  description: string;
  rating: number;
  price: number;
  onSelect: () => void;
}

const ModelCard: React.FC<ModelCardProps> = ({
  name,
  description,
  rating,
  price,
  onSelect,
}) => {
  return (
    <div className="bg-white border-3 border-black shadow-neo p-6 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150">
      {/* TODO(brutalism): future interactive micro-animations */}
      <h3 className="text-lg md:text-xl font-black text-black mb-3 uppercase tracking-tight">{name}</h3>
      <p className="text-black font-medium text-sm mb-6 leading-relaxed">{description}</p>
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <div className="bg-[#FFE37B] border-2 border-black px-2 py-1 flex items-center space-x-1">
            <span className="text-black font-bold">★</span>
            <span className="text-sm font-bold text-black">{rating.toFixed(1)}</span>
          </div>
        </div>
        <div className="bg-[#FEEF5D] border-2 border-black px-3 py-1">
          <span className="text-sm font-bold text-black uppercase">${price.toFixed(3)}/call</span>
        </div>
      </div>
      
      <button
        onClick={onSelect}
        className="w-full px-4 py-3 bg-[#FF5484] text-black font-bold uppercase border-3 border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150 tracking-tight"
      >
        Add to Workflow
      </button>
    </div>
  );
};

export default ModelCard; 