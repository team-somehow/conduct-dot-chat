import React, { useCallback, useEffect, useMemo } from 'react';
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
import { useSyncHighlight } from './useSyncHighlight';

interface Step {
  id: string;
  order: number;
  name: string;
  modelType: string;
  description: string;
  status: 'IDLE' | 'READY' | 'RUNNING' | 'COMPLETE' | 'ERROR';
  icon?: string;
}

interface WorkflowGraphProps {
  steps: Step[];
  className?: string;
}

// Custom Brutal Node Component
const BrutalNode: React.FC<{ data: any; selected: boolean }> = ({ data, selected }) => {
  const { activeId } = useSyncHighlight();
  const isActive = activeId === data.id;

  return (
    <div className={`
      bg-white border-4 border-black p-2 
      w-[200px] h-[120px] 
      flex flex-col justify-between
      transition-all duration-200
      ${isActive ? 'shadow-neo-lg pulse-brutal' : 'shadow-neo'}
      ${selected ? 'ring-4 ring-[#7C82FF]' : ''}
      ${!isActive ? 'grayscale opacity-60' : ''}
    `}>
      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: 'transparent', border: 'none', width: 1, height: 1 }}
      />
      <Handle
        type="source"
        position={Position.Right}
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
      
      {/* Status pill */}
      <div className="flex justify-start my-1">
        <StatusPill status={data.status || 'IDLE'} className="text-xs px-2 py-1" />
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

const WorkflowGraphInner: React.FC<WorkflowGraphProps> = ({ steps, className = '' }) => {
  const { fitView, setCenter } = useReactFlow();
  const { activeId, setActive } = useSyncHighlight();

  // Create nodes for React Flow
  const nodes: Node[] = steps.map((step, index) => ({
    id: step.id,
    type: 'brutal',
    position: { x: index * 250, y: 50 },
    data: { 
      ...step,  // Spread all step properties directly
      isActive: activeId === step.id 
    },
    draggable: false,
    selectable: false,
    style: {
      width: 200,
      height: 120,
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

  // Update nodes when steps change
  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  // Handle node clicks
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setActive(node.id);
  }, [setActive]);

  // Fit view when active node changes
  useEffect(() => {
    if (activeId) {
      const activeNode = nodes.find((n: any) => n.id === activeId);
      if (activeNode) {
        const x = activeNode.position.x + 100; // Center of 200px wide node
        const y = activeNode.position.y + 60;  // Center of 120px tall node
        
        setCenter(x, y, { zoom: 1.0, duration: 800 });
      }
    }
  }, [activeId, nodes, setCenter]);

  // Auto-fit view on mount
  useEffect(() => {
    setTimeout(() => {
      fitView({ duration: 500 });
    }, 100);
  }, [fitView]);

  return (
    <div className={`h-[340px] md:h-[340px] sm:h-[240px] bg-white border-4 border-black shadow-neo ${className}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        panOnScroll={false}
        zoomOnDoubleClick={false}
        selectNodesOnDrag={false}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        minZoom={0.5}
        maxZoom={2}
        connectionLineStyle={{ stroke: '#000', strokeWidth: 2 }}
        defaultEdgeOptions={{
          type: 'brutal',
          style: { stroke: '#000', strokeWidth: 2 }
        }}
      >
        <Background 
          color="#000" 
          gap={20} 
          size={1}
          variant={BackgroundVariant.Dots}
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