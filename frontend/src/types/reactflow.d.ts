declare module 'reactflow' {
  export interface Node {
    id: string;
    type?: string;
    position: { x: number; y: number };
    data: any;
    width?: number;
    height?: number;
    selected?: boolean;
    dragging?: boolean;
  }

  export interface Edge {
    id: string;
    source: string;
    target: string;
    type?: string;
    data?: any;
    selected?: boolean;
  }

  export interface NodeChange {
    id: string;
    type: string;
    [key: string]: any;
  }

  export interface EdgeChange {
    id: string;
    type: string;
    [key: string]: any;
  }

  export interface Connection {
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
  }

  export interface NodeProps {
    id: string;
    data: any;
    selected?: boolean;
    [key: string]: any;
  }

  export interface EdgeProps {
    id: string;
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
    [key: string]: any;
  }

  export enum Position {
    Top = 'top',
    Right = 'right',
    Bottom = 'bottom',
    Left = 'left',
  }

  export enum BackgroundVariant {
    Lines = 'lines',
    Dots = 'dots',
    Cross = 'cross',
  }

  export const ReactFlow: any;
  export const ReactFlowProvider: any;
  export const Handle: any;
  export const Controls: any;
  export const Background: any;
  export const MiniMap: any;
  export const useNodesState: any;
  export const useEdgesState: any;
  export const useReactFlow: any;
  export const addEdge: any;
  export const applyNodeChanges: any;
  export const applyEdgeChanges: any;
  export const getBezierPath: any;
  export default ReactFlow;
} 