import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  useReactFlow,
  Background,
  BackgroundVariant,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import NodeIcon from './NodeIcon';
import StatusPill from './StatusPill';
import { DollarSign } from 'lucide-react';

interface Step {
  id: string;
  order: number;
  name: string;
  modelType: string;
  description: string;
  status: 'IDLE' | 'READY' | 'RUNNING' | 'COMPLETE' | 'ERROR';
  icon?: string;
  cost?: number;
}

interface WorkflowGraphProps {
  steps: Step[];
  className?: string;
  instanceId?: string; // Add instanceId to make each graph independent
}

// Custom Brutal Node Component
const BrutalNode: React.FC<{ data: any; selected: boolean }> = ({ data, selected }) => {
  const isActive = data.isActive;

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.onClick) {
      data.onClick();
    }
  }, [data]);

  return (
    <div 
      className={`
        bg-white border-4 border-black p-2 
        w-[200px] h-[140px] 
        flex flex-col justify-between
        transition-all duration-200
        cursor-pointer
        ${isActive ? 'shadow-neo-lg pulse-brutal' : 'shadow-neo'}
        ${selected ? 'ring-4 ring-[#7C82FF]' : ''}
        ${!isActive ? 'grayscale opacity-60' : ''}
      `}
      onClick={handleClick}
    >
      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: 'transparent', border: 'none', width: 1, height: 1 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: 'transparent', border: 'none', width: 1, height: 1 }}
      />
      
      {/* Header with icon and title */}
      <div className="flex items-start gap-2 min-h-0">
        <NodeIcon 
          modelType={data.modelType || 'AI MODEL'} 
          icon={data.icon}
          className="h-4 w-4 flex-shrink-0 mt-0.5"
        />
        <h3 className="font-black text-xs uppercase tracking-tight leading-tight flex-1 min-w-0">
          <span className="block truncate">
            {data.name || 'AI Agent'}
          </span>
        </h3>
      </div>
      
      {/* Status pill and cost */}
      <div className="flex justify-between items-center my-1">
        <StatusPill status={data.status || 'IDLE'} className="text-xs px-2 py-1" />
        {data.cost && (
          <div className="flex items-center gap-1 bg-[#FFE37B] border-2 border-black px-2 py-1">
            <DollarSign size={10} />
            <span className="text-xs font-black">{data.cost.toFixed(2)}</span>
          </div>
        )}
      </div>
      
      {/* Description */}
      <div className="flex-1 min-h-0">
        <p className="text-xs text-gray-600 leading-tight overflow-hidden" 
           style={{
             display: '-webkit-box',
             WebkitLineClamp: 2,
             WebkitBoxOrient: 'vertical',
             textOverflow: 'ellipsis'
           }}>
          {data.description || 'AI processing step'}
        </p>
      </div>
    </div>
  );
};

// Custom Brutal Edge Component
const BrutalEdge: React.FC<any> = ({ 
  id, 
  sourceX, 
  sourceY, 
  targetX, 
  targetY, 
  selected 
}) => {
  // Calculate the edge path with proper connection points
  const edgePath = `M${sourceX},${sourceY} L${targetX},${targetY}`;
  
  return (
    <g>
      <defs>
        <marker
          id={`brutal-arrow-${id}`}
          markerWidth="8"
          markerHeight="8"
          refX="7"
          refY="4"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon
            points="0,0 0,8 6,4"
            fill="#000"
            stroke="#000"
            strokeWidth="1"
          />
        </marker>
      </defs>
      <path
        d={edgePath}
        stroke="#000"
        strokeWidth={selected ? 4 : 3}
        fill="none"
        markerEnd={`url(#brutal-arrow-${id})`}
        className="transition-all duration-200"
        strokeDasharray={selected ? "8,4" : "none"}
        style={{ zIndex: 10 }}
      />
    </g>
  );
};

const nodeTypes = {
  brutal: BrutalNode,
};

const edgeTypes = {
  brutal: BrutalEdge,
};

const WorkflowGraphInner: React.FC<WorkflowGraphProps> = ({ steps, className = '', instanceId }) => {
  const { fitView, setCenter } = useReactFlow();
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  // Create nodes for React Flow
  const nodes: Node[] = steps.map((step, index) => ({
    id: step.id,
    type: 'brutal',
    position: { x: index * 250, y: 50 }, // Back to horizontal layout for the graph
    data: { 
      ...step,  // Spread all step properties directly
      isActive: activeNodeId === step.id,
      onClick: () => setActiveNodeId(step.id === activeNodeId ? null : step.id)
    },
    draggable: false,
    selectable: false,
    style: {
      width: 200,
      height: 140, // Increased height to accommodate cost display
    }
  }));

  // Convert steps to edges
  const { edges: initialEdges } = useMemo(() => {
    const edges: Edge[] = [];

    // Create edges between consecutive steps
    steps.forEach((step, index) => {
      if (index > 0) {
        edges.push({
          id: `edge-${steps[index - 1].id}-${step.id}`,
          source: steps[index - 1].id,
          target: step.id,
          type: 'brutal',
        });
      }
    });

    return { edges };
  }, [steps]);

  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Handle node clicks
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setActiveNodeId(node.id === activeNodeId ? null : node.id);
  }, [activeNodeId]);

  // Auto-fit view when nodes change
  useEffect(() => {
    if (nodes.length > 0) {
      setTimeout(() => {
        fitView({ padding: 0.1, duration: 800 });
      }, 100);
    }
  }, [nodes.length, fitView]);

  return (
    <div className={`w-full h-full ${className}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={() => {}} // Disable node changes
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={true}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1} 
          color="#E5E7EB"
        />
      </ReactFlow>
    </div>
  );
};

const WorkflowGraph: React.FC<WorkflowGraphProps> = (props) => {
  return (
    <ReactFlowProvider>
      <WorkflowGraphInner {...props} />
    </ReactFlowProvider>
  );
};

export default WorkflowGraph; 