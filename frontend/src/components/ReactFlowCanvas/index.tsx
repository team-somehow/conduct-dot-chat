import React from 'react';
import ReactFlow, { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';

// TODO(ReactFlowCanvas):
// 1. Implement custom node types
// 2. Add node connection validation
// 3. Create node configuration panel
// 4. Add zoom and pan controls
// 5. Implement undo/redo functionality
// END TODO

interface ReactFlowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange?: (changes: any) => void;
  onEdgesChange?: (changes: any) => void;
  onConnect?: (connection: any) => void;
}

const ReactFlowCanvas: React.FC<ReactFlowCanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
}) => {
  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        attributionPosition="bottom-right"
      />
    </div>
  );
};

export default ReactFlowCanvas; 