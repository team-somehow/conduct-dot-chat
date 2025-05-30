import React from 'react';

interface CostOverlayProps {
  costFraction: number; // 0-1 representing the cost percentage
  nodeId: string;
}

const CostOverlay: React.FC<CostOverlayProps> = ({ costFraction, nodeId }) => {
  // Only show overlay if cost fraction is above a threshold
  if (costFraction < 0.1) return null;
  
  const percentage = Math.round(costFraction * 100);
  
  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      {/* Cost fill overlay */}
      <div 
        className="absolute inset-0 bg-[#FFE37B]/60 transition-all duration-500 ease-out"
        style={{ 
          width: `${percentage}%`,
          borderRadius: '0 0 0 0'
        }}
      />
      
      {/* Cost indicator */}
      {costFraction > 0.3 && (
        <div className="absolute top-1 right-1 bg-black text-white text-[8px] font-black px-1 py-0.5 rounded">
          ${percentage}%
        </div>
      )}
    </div>
  );
};

export default CostOverlay; 