import React from 'react';
import { getBezierPath, Position } from 'reactflow';
import { useWorkflowStore } from '../store/workflow';

interface CustomEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
  style?: React.CSSProperties;
  markerEnd?: string;
}

const CustomEdge: React.FC<CustomEdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}) => {
  const { edgeState } = useWorkflowStore();
  
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  
  const state = edgeState[id] || 'IDLE';
  const isRunning = state === 'RUNNING';
  const isDone = state === 'DONE';
  
  return (
    <>
      {/* Define arrow marker */}
      <defs>
        <marker
          id={`arrow-${id}`}
          markerWidth="12"
          markerHeight="12"
          refX="6"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M0,0 L0,6 L9,3 z"
            fill="#000"
            stroke="#000"
            strokeWidth="1"
          />
        </marker>
      </defs>
      
      {/* Main edge path */}
      <path
        id={id}
        style={style}
        className={`react-flow__edge-path ${isRunning ? 'animated-edge' : ''}`}
        d={edgePath}
        strokeWidth={4}
        stroke="#000"
        strokeDasharray={isRunning ? '6 6' : 'none'}
        markerEnd={`url(#arrow-${id})`}
        fill="none"
      />
      
      {/* Done checkmark label */}
      {isDone && (
        <g transform={`translate(${labelX - 12}, ${labelY - 12})`}>
          <circle
            cx="12"
            cy="12"
            r="12"
            fill="#7C82FF"
            stroke="#000"
            strokeWidth="2"
          />
          <path
            d="M6 12l3 3 6-6"
            stroke="#fff"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )}
    </>
  );
};

export default CustomEdge; 