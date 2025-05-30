// WorkflowCanvas component with Neo-Brutalist React Flow styling
// Features: Animated workflow visualization with custom node and edge styles

import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useWorkflowStore } from '../store/workflow';
import CustomNode from './CustomNode';
import CustomEdge from './CustomEdge';

// Register custom node and edge types
const nodeTypes = {
  brutalNode: CustomNode,
};

const edgeTypes = {
  brutalEdge: CustomEdge,
};

interface WorkflowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  isAnimating?: boolean;
}

const WorkflowCanvasInner: React.FC<WorkflowCanvasProps> = ({ 
  nodes: initialNodes, 
  edges: initialEdges, 
  isAnimating = false 
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { fitView } = useReactFlow();
  const { activeNodeId, interactionStep } = useWorkflowStore();

  // Update nodes when props change
  useEffect(() => {
    // Update node statuses based on interaction state
    const updatedNodes = initialNodes.map(node => {
      let status = 'idle';
      
      // Determine status based on interaction progress
      if (node.id === activeNodeId) {
        status = 'active';
      } else if (
        (node.id === 'orchestrator' && interactionStep > 0) ||
        (node.id === 'gpt4' && interactionStep > 1) ||
        (node.id === 'stable-diffusion' && interactionStep > 3)
      ) {
        status = 'completed';
      } else if (
        (node.id === 'gpt4' && interactionStep < 1) ||
        (node.id === 'stable-diffusion' && interactionStep < 3)
      ) {
        status = 'pending';
      }
      
      return {
        ...node,
        type: 'brutalNode', // Use custom node type
        data: {
          ...node.data,
          status,
        },
      };
    });
    
    setNodes(updatedNodes);
  }, [initialNodes, activeNodeId, interactionStep, setNodes]);

  // Update edges when props change
  useEffect(() => {
    const updatedEdges = initialEdges.map(edge => ({
      ...edge,
      type: 'brutalEdge', // Use custom edge type
    }));
    setEdges(updatedEdges);
  }, [initialEdges, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Auto-fit view when active node changes
  useEffect(() => {
    if (activeNodeId && isAnimating) {
      const activeNode = nodes.find(n => n.id === activeNodeId);
      if (activeNode) {
        setTimeout(() => {
          fitView({ 
            nodes: [activeNode], 
            duration: 800,
            padding: 0.3 
          });
        }, 100);
      }
    }
  }, [activeNodeId, nodes, fitView, isAnimating]);

  // MiniMap node color function
  const getNodeColor = (node: Node) => {
    if (node.id === activeNodeId) return '#FF5484';
    if (node.data?.status === 'completed') return '#7C82FF';
    if (node.data?.status === 'pending') return '#CCCCCC';
    return node.data?.color || '#FEEF5D';
  };

  return (
    <div className="h-[600px] bg-white border-4 border-black shadow-neo">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        panOnScroll={false}
        zoomOnDoubleClick={false}
        selectNodesOnDrag={false}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      >
        <Background 
          color="#000" 
          gap={20} 
          size={1}
          variant={BackgroundVariant.Dots}
        />
        <Controls 
          showZoom={true}
          showFitView={true}
          showInteractive={false}
          className="border-2 border-black shadow-neo bg-white"
        />
        <MiniMap 
          nodeColor={getNodeColor}
          className="border-4 border-black shadow-neo bg-white"
          maskColor="rgba(0, 0, 0, 0.1)"
          style={{
            backgroundColor: 'white',
          }}
        />
      </ReactFlow>
    </div>
  );
};

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner {...props} />
    </ReactFlowProvider>
  );
};

export default WorkflowCanvas; 