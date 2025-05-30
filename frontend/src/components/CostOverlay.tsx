import React from 'react';

interface CostOverlayProps {
  costFraction: number; // 0-1 representing the cost percentage
  nodeId: string;
}

const CostOverlay: React.FC<CostOverlayProps> = ({ costFraction, nodeId }) => {
  // Return null to remove both percentage and progress background color
  return null;
};

export default CostOverlay; 