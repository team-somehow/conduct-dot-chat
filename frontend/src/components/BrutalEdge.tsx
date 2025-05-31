import React from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';
import '../styles/execution.css';

interface BrutalEdgeProps extends EdgeProps {
  isActive?: boolean;
}

const BrutalEdge: React.FC<BrutalEdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}) => {
  const isActive = data?.isActive || false;

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edgeStyle = {
    stroke: '#000',
    strokeWidth: 3,
    fill: 'none',
    ...style,
  };

  const activeStyle = isActive ? {
    strokeDasharray: '8 8',
    strokeWidth: 6,
    stroke: '#FFD700',
    filter: 'drop-shadow(0 0 8px #FFD700) drop-shadow(0 0 16px #FFD700)',
    ...edgeStyle,
  } : edgeStyle;

  return (
    <>
      {/* Active edge glow background */}
      {isActive && (
        <path
          id={`${id}-glow`}
          style={{
            ...activeStyle,
            strokeWidth: 12,
            stroke: '#FFD700',
            opacity: 0.3,
            filter: 'blur(4px)',
          }}
          d={edgePath}
        />
      )}
      
      <path
        id={id}
        style={activeStyle}
        className={isActive ? 'animate-dash animate-glow' : ''}
        d={edgePath}
        markerEnd={markerEnd}
      />
    </>
  );
};

export default BrutalEdge; 