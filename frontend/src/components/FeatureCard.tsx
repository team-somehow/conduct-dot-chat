// Feature card component with Neo-Brutalist styling
// Features: Icon, title, description with bold design

import React from 'react';

// TODO(FeatureCard):
// 1. Add Framer Motion hover animations
// 2. Implement click interactions
// 3. Add more visual effects
// 4. Create different card variants
// 5. Add accessibility improvements
// END TODO

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  className?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  className = '',
}) => {
  return (
    <div className={`bg-white border-3 border-black shadow-neo p-8 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150 ${className}`}>
      {/* TODO(brutalism): future interactive micro-animations */}
      <div className="bg-[#FEEF5D] border-3 border-black shadow-neo w-12 h-12 flex items-center justify-center text-2xl mb-6">
        {icon}
      </div>
      <h3 className="text-xl md:text-2xl font-black text-black mb-4 uppercase tracking-tight">{title}</h3>
      <p className="text-black font-medium leading-relaxed">{description}</p>
    </div>
  );
};

export default FeatureCard; 