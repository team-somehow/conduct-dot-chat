import { useState, useEffect } from 'react';
import { useWorkflowStore } from '../store/workflow';

interface ExecutionAnimatorState {
  activeNodeId: string | null;
  activeEdgeIds: string[];
}

export const useExecutionAnimator = () => {
  const [state, setState] = useState<ExecutionAnimatorState>({
    activeNodeId: null,
    activeEdgeIds: []
  });

  const { 
    logs, 
    isExecuting, 
    nodes, 
    edges,
    currentStep,
    activeNodeId: storeActiveNodeId
  } = useWorkflowStore();

  // Primary animation logic based on store's activeNodeId
  useEffect(() => {
    if (currentStep !== 'SHOW_INTERACTION') {
      setState({ activeNodeId: null, activeEdgeIds: [] });
      return;
    }

    // Use the activeNodeId from the store as the primary source
    let activeNodeId = storeActiveNodeId;
    let activeEdgeIds: string[] = [];

    // If we have an active node, find edges leading to it
    if (activeNodeId && edges.length > 0) {
      const incomingEdges = edges.filter(edge => edge.target === activeNodeId);
      activeEdgeIds = incomingEdges.map(edge => edge.id);
    }

    setState({ activeNodeId, activeEdgeIds });
  }, [storeActiveNodeId, currentStep, edges]);

  // Fallback animation logic based on logs (when no explicit activeNodeId is set)
  useEffect(() => {
    if (!isExecuting || currentStep !== 'SHOW_INTERACTION' || storeActiveNodeId) {
      return; // Don't override if we already have an activeNodeId from store
    }

    // Get the most recent log to determine current activity
    const recentLog = logs[logs.length - 1];
    if (!recentLog) return;

    const message = recentLog.message.toLowerCase();
    
    // Determine active node based on log content
    let activeNodeId: string | null = null;
    let activeEdgeIds: string[] = [];

    // Check for orchestrator activity
    if (message.includes('orchestrator') || message.includes('analyzing') || message.includes('coordinating')) {
      activeNodeId = 'orchestrator';
    }
    // Check for specific agent activity
    else if (message.includes('image') || message.includes('dall') || message.includes('generating')) {
      const imageNode = nodes.find(n => 
        n.data?.label?.toLowerCase().includes('dall') || 
        n.data?.label?.toLowerCase().includes('image')
      );
      if (imageNode) {
        activeNodeId = imageNode.id;
        // Find edge leading to this node
        const incomingEdge = edges.find(e => e.target === imageNode.id);
        if (incomingEdge) activeEdgeIds = [incomingEdge.id];
      }
    }
    else if (message.includes('nft') || message.includes('deploy') || message.includes('mint')) {
      const nftNode = nodes.find(n => 
        n.data?.label?.toLowerCase().includes('nft') || 
        n.data?.label?.toLowerCase().includes('deploy')
      );
      if (nftNode) {
        activeNodeId = nftNode.id;
        // Find edge leading to this node
        const incomingEdge = edges.find(e => e.target === nftNode.id);
        if (incomingEdge) activeEdgeIds = [incomingEdge.id];
      }
    }
    else if (message.includes('hello') || message.includes('greet')) {
      const helloNode = nodes.find(n => 
        n.data?.label?.toLowerCase().includes('hello')
      );
      if (helloNode) {
        activeNodeId = helloNode.id;
        // Find edge leading to this node
        const incomingEdge = edges.find(e => e.target === helloNode.id);
        if (incomingEdge) activeEdgeIds = [incomingEdge.id];
      }
    }

    setState({ activeNodeId, activeEdgeIds });

    // Clear active state after a delay to simulate completion
    const timeout = setTimeout(() => {
      setState(prev => ({ 
        ...prev, 
        activeEdgeIds: [] 
      }));
    }, 2000);

    return () => clearTimeout(timeout);
  }, [logs, isExecuting, currentStep, nodes, edges, storeActiveNodeId]);

  // Reset when execution completes
  useEffect(() => {
    if (!isExecuting) {
      setState({ activeNodeId: null, activeEdgeIds: [] });
    }
  }, [isExecuting]);

  return state;
}; 