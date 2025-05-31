import React, { useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import BrutalNode from './BrutalNode';
import BrutalEdge from './BrutalEdge';
import { useExecutionAnimator } from './useExecutionAnimator';
import { useWorkflowStore } from '../store/workflow';
import '../styles/execution.css';

// Register custom node and edge types
const nodeTypes = {
  brutalNode: BrutalNode,
};

const edgeTypes = {
  brutal: BrutalEdge,
};

interface ExecutionCanvasProps {
  nodes?: Node[];
  edges?: Edge[];
}

const ExecutionCanvas: React.FC<ExecutionCanvasProps> = ({
  nodes: propNodes = [],
  edges: propEdges = [],
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const { activeNodeId, activeEdgeIds } = useExecutionAnimator();
  const { isPaused, togglePause } = useWorkflowStore();

  // Transform nodes to include active state
  const enhancedNodes = propNodes.map(node => ({
    ...node,
    type: 'brutalNode',
    data: {
      ...node.data,
      isActive: node.id === activeNodeId,
    },
  }));

  // Transform edges to include active state and use brutal type
  const enhancedEdges = propEdges.map(edge => ({
    ...edge,
    type: 'brutal',
    data: {
      ...edge.data,
      isActive: activeEdgeIds.includes(edge.id),
    },
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(enhancedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(enhancedEdges);

  // Update nodes and edges when props change
  useEffect(() => {
    setNodes(enhancedNodes);
  }, [propNodes, activeNodeId]);

  useEffect(() => {
    setEdges(enhancedEdges);
  }, [propEdges, activeEdgeIds]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        togglePause();
      } else if (event.code === 'KeyC') {
        event.preventDefault();
        fitView();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [togglePause, fitView]);

  // Viewport shake on error
  useEffect(() => {
    const errorLog = useWorkflowStore.getState().logs.find(log => log.type === 'error');
    if (errorLog && canvasRef.current) {
      canvasRef.current.classList.add('shake');
      setTimeout(() => {
        canvasRef.current?.classList.remove('shake');
      }, 600);
    }
  }, [useWorkflowStore.getState().logs]);

  const handleZoomIn = useCallback(() => {
    zoomIn();
  }, [zoomIn]);

  const handleZoomOut = useCallback(() => {
    zoomOut();
  }, [zoomOut]);

  const handleFitView = useCallback(() => {
    fitView();
  }, [fitView]);

  return (
    <div 
      ref={canvasRef}
      className="relative h-[520px] md:h-[600px] border-4 border-black shadow-neo-lg bg-[#FFFDEE]"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        attributionPosition="bottom-left"
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        zoomOnScroll={false}
        panOnScroll={false}
        zoomOnDoubleClick={false}
        panOnDrag={false}
      >
        {/* Custom Zoom Controls */}
        <div className="zoom-controls">
          <button
            onClick={handleZoomIn}
            className="zoom-btn"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            className="zoom-btn"
            title="Zoom Out"
          >
            −
          </button>
          <button
            onClick={handleFitView}
            className="zoom-btn text-sm"
            title="Fit View (C)"
          >
            ⤢
          </button>
        </div>

        {/* Brutalist MiniMap */}
        <MiniMap
          className="border-4 border-black shadow-neo"
          nodeColor="#000"
          maskColor="rgba(0, 0, 0, 0.1)"
          position="bottom-right"
        />

        <Background color="#000" gap={20} size={1} />
      </ReactFlow>

      {/* Pause Indicator */}
      {isPaused && (
        <div className="absolute top-4 right-4 bg-yellow-400 border-4 border-black shadow-neo px-4 py-2 font-bold">
          PAUSED (Space to resume)
        </div>
      )}
    </div>
  );
};

export default ExecutionCanvas; 