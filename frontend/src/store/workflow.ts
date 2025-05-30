import { create } from 'zustand';
import { Node, Edge, NodeChange, EdgeChange, Connection, applyNodeChanges, applyEdgeChanges } from 'reactflow';

// TODO(WorkflowStore):
// 1. Implement workflow state management
// 2. Add node and edge CRUD operations
// 3. Create workflow execution state
// 4. Add workflow persistence
// 5. Implement undo/redo functionality
// END TODO

const STEPS = [
  'GENERATING_WORKFLOW',
  'SHOW_WORKFLOW',
  'SELECTING_MODELS',
  'COST_ESTIMATION',
  'SHOW_INTERACTION',
  'SHOW_RESULT',
] as const;

type Step = typeof STEPS[number];

interface Model {
  id: string;
  name: string;
  type: string;
  color: string;
  description?: string;
  rating?: number;
  cost?: string;
}

interface LogLine {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

interface WorkflowState {
  nodes: Node[];
  edges: Edge[];
  isExecuting: boolean;
  executionResults: any[];
  // Demo state
  currentStep: Step;
  stepIndex: number;
  selectedModels: Model[];
  feedback: 'up' | 'down' | null;
  result: string;
  isApproved: boolean;
  // Interaction simulation state
  activeNodeId: string | null;
  isPaused: boolean;
  edgeState: Record<string, 'IDLE' | 'RUNNING' | 'DONE'>;
  logLines: LogLine[];
  interactionStep: number;
  onInteractionComplete?: () => void;
  // Actions
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (node: Node) => void;
  updateNode: (id: string, data: any) => void;
  removeNode: (id: string) => void;
  addEdge: (edge: Edge) => void;
  removeEdge: (id: string) => void;
  executeWorkflow: () => Promise<void>;
  // Demo actions
  nextStep: () => void;
  setStep: (step: Step) => void;
  setFeedback: (feedback: 'up' | 'down') => void;
  resetDemo: () => void;
  initializeDemoData: () => void;
  approveWorkflow: () => void;
  // Interaction simulation actions
  advanceNode: () => void;
  togglePause: () => void;
  setInteractionStep: (step: number) => void;
  resetInteraction: () => void;
  startInteractionSimulation: () => void;
  setInteractionCompleteCallback: (callback: () => void) => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],
  isExecuting: false,
  executionResults: [],
  // Demo state
  currentStep: 'GENERATING_WORKFLOW',
  stepIndex: 0,
  selectedModels: [],
  feedback: null,
  result: "Successfully generated a comprehensive AI workflow that combines GPT-4's natural language processing with Stable Diffusion's image generation capabilities. The orchestrator efficiently managed the model interactions and produced high-quality results.",
  isApproved: false,
  // Interaction simulation state
  activeNodeId: null,
  isPaused: true,
  edgeState: {},
  logLines: [],
  interactionStep: 0,
  onInteractionComplete: undefined,
  
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection) => {
    const newEdge = {
      id: `edge-${Date.now()}`,
      source: connection.source!,
      target: connection.target!,
      type: 'smoothstep',
    };
    set({ edges: [...get().edges, newEdge] });
  },
  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
  updateNode: (id, data) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...data } } : node
      ),
    })),
  removeNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter(
        (edge) => edge.source !== id && edge.target !== id
      ),
    })),
  addEdge: (edge) => set((state) => ({ edges: [...state.edges, edge] })),
  removeEdge: (id) =>
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== id),
    })),
  executeWorkflow: async () => {
    set({ isExecuting: true });
    // TODO: Implement workflow execution
    set({ isExecuting: false });
  },
  
  // Demo actions
  nextStep: () => {
    const { stepIndex } = get();
    const nextIndex = stepIndex + 1;
    // Only advance if we haven't reached the last step
    if (nextIndex < STEPS.length) {
      set({
        stepIndex: nextIndex,
        currentStep: STEPS[nextIndex],
      });
    }
  },
  
  setStep: (step: Step) => {
    const stepIndex = STEPS.indexOf(step);
    set({ currentStep: step, stepIndex });
  },
  
  setFeedback: (feedback: 'up' | 'down') => {
    set({ feedback });
    console.log(`Feedback received: ${feedback}`);
  },
  
  resetDemo: () => {
    set({
      currentStep: 'GENERATING_WORKFLOW',
      stepIndex: 0,
      feedback: null,
      isApproved: false,
      // Don't clear nodes, edges, and selectedModels as they should persist
    });
  },
  
  initializeDemoData: () => {
    const demoNodes: Node[] = [
      {
        id: 'orchestrator',
        type: 'brutalNode',
        position: { x: 250, y: 50 },
        data: { 
          label: 'AI Orchestrator',
          color: '#FEEF5D',
          status: 'idle'
        },
      },
      {
        id: 'gpt4',
        type: 'brutalNode',
        position: { x: 100, y: 200 },
        data: { 
          label: 'GPT-4',
          color: '#FF5484',
          status: 'pending'
        },
      },
      {
        id: 'stable-diffusion',
        type: 'brutalNode',
        position: { x: 400, y: 200 },
        data: { 
          label: 'Stable Diffusion',
          color: '#7C82FF',
          status: 'pending'
        },
      },
    ];

    const demoEdges: Edge[] = [
      {
        id: 'edge-1',
        source: 'orchestrator',
        target: 'gpt4',
        type: 'brutalEdge',
        style: { strokeWidth: 3, stroke: '#000' },
        animated: false,
      },
      {
        id: 'edge-2',
        source: 'orchestrator',
        target: 'stable-diffusion',
        type: 'brutalEdge',
        style: { strokeWidth: 3, stroke: '#000' },
        animated: false,
      },
    ];

    const demoModels: Model[] = [
      { 
        id: 'gpt4', 
        name: 'GPT-4', 
        type: 'Language Model', 
        color: '#FF5484',
        description: 'Advanced language model for natural language processing and text generation',
        rating: 4.8,
        cost: '$0.15/query'
      },
      { 
        id: 'stable-diffusion', 
        name: 'Stable Diffusion', 
        type: 'Image Generation', 
        color: '#7C82FF',
        description: 'High-quality image generation model for creating visuals from text descriptions',
        rating: 4.6,
        cost: '$0.25/image'
      },
    ];

    set({
      nodes: demoNodes,
      edges: demoEdges,
      selectedModels: demoModels,
    });
  },
  approveWorkflow: () => {
    set({ isApproved: true });
    // Advance to next step after approval
    const { currentStep, stepIndex } = get();
    const steps = ['GENERATING_WORKFLOW', 'SHOW_WORKFLOW', 'SELECTING_MODELS', 'COST_ESTIMATION', 'SHOW_INTERACTION', 'SHOW_RESULT'];
    const nextIndex = stepIndex + 1;
    if (nextIndex < steps.length) {
      set({
        stepIndex: nextIndex,
        currentStep: steps[nextIndex] as Step,
      });
    }
  },
  // Interaction simulation actions
  advanceNode: () => {
    const { nodes, edges, interactionStep, logLines } = get();
    // New sequence: orchestrator -> gpt4 -> orchestrator -> stable-diffusion -> orchestrator (done)
    const nodeSequence = ['orchestrator', 'gpt4', 'orchestrator', 'stable-diffusion', 'orchestrator'];
    const stepNames = ['Starting', 'GPT-4 Processing', 'Coordinating', 'Stable Diffusion Processing', 'Completed'];
    
    if (interactionStep >= nodeSequence.length) return;
    
    const currentNodeId = nodeSequence[interactionStep];
    const stepName = stepNames[interactionStep];
    
    // Get node name for better logging
    const currentNode = nodes.find(n => n.id === currentNodeId);
    const nodeName = currentNode?.data.label || currentNodeId;
    
    // Add log entry based on the step
    let logMessage = '';
    if (interactionStep === 0) {
      logMessage = `🚀 ${nodeName} initializing workflow...`;
    } else if (interactionStep === 1) {
      logMessage = `⚡ Activating ${nodeName}...`;
    } else if (interactionStep === 2) {
      logMessage = `🔄 ${nodeName} coordinating next step...`;
    } else if (interactionStep === 3) {
      logMessage = `⚡ Activating ${nodeName}...`;
    } else if (interactionStep === 4) {
      logMessage = `✅ ${nodeName} workflow completed!`;
    }
    
    const newLogLine: LogLine = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      message: logMessage,
      type: interactionStep === 4 ? 'success' : 'info'
    };
    
    // Update edge state based on the step
    const newEdgeState = { ...get().edgeState };
    if (interactionStep === 1) {
      // GPT-4 step - edge-1 running
      newEdgeState['edge-1'] = 'RUNNING';
    } else if (interactionStep === 2) {
      // Back to orchestrator - edge-1 done
      newEdgeState['edge-1'] = 'DONE';
    } else if (interactionStep === 3) {
      // Stable Diffusion step - edge-2 running
      newEdgeState['edge-2'] = 'RUNNING';
    } else if (interactionStep === 4) {
      // Final orchestrator - edge-2 done
      newEdgeState['edge-2'] = 'DONE';
    }
    
    set({
      activeNodeId: currentNodeId,
      logLines: [...logLines, newLogLine],
      edgeState: newEdgeState,
    });
    
    // Add processing log after 1 second (except for final step)
    if (interactionStep < 4) {
      setTimeout(() => {
        const { logLines: currentLogLines } = get();
        let processingMessage = '';
        if (interactionStep === 0) {
          processingMessage = `🔄 Setting up AI workflow pipeline...`;
        } else if (interactionStep === 1) {
          processingMessage = `🔄 ${nodeName} generating content...`;
        } else if (interactionStep === 2) {
          processingMessage = `🔄 Preparing next AI agent...`;
        } else if (interactionStep === 3) {
          processingMessage = `🔄 ${nodeName} creating images...`;
        }
        
        const processingLog: LogLine = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          message: processingMessage,
          type: 'info'
        };
        
        set({
          logLines: [...currentLogLines, processingLog],
        });
      }, 1000);
    }
    
    // After 2.5 seconds, move to next step
    setTimeout(() => {
      const { logLines: currentLogLines, interactionStep: currentStep } = get();
      
      let completionMessage = '';
      if (currentStep === 0) {
        completionMessage = `✅ Workflow pipeline ready`;
      } else if (currentStep === 1) {
        completionMessage = `✅ ${nodeName} content generation complete`;
      } else if (currentStep === 2) {
        completionMessage = `✅ Next agent prepared`;
      } else if (currentStep === 3) {
        completionMessage = `✅ ${nodeName} image generation complete`;
      }
      
      const newInteractionStep = currentStep + 1;
      
      // Add completion log (except for final step)
      if (currentStep < 4) {
        const completionLog: LogLine = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          message: completionMessage,
          type: 'success'
        };
        
        set({
          logLines: [...currentLogLines, completionLog],
          interactionStep: newInteractionStep,
          activeNodeId: newInteractionStep < nodeSequence.length ? nodeSequence[newInteractionStep] : null,
        });
      }
      
      // If we've completed all steps, trigger final completion
      if (newInteractionStep >= nodeSequence.length) {
        setTimeout(() => {
          const { logLines: finalLogLines, onInteractionComplete } = get();
          const finalLog: LogLine = {
            id: `log-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            message: '🎉 All AI agents completed successfully! Workflow finished.',
            type: 'success'
          };
          
          set({
            logLines: [...finalLogLines, finalLog],
            activeNodeId: null, // Clear active node when complete
          });
          
          // Call completion callback after a short delay to show the final message
          if (onInteractionComplete) {
            setTimeout(() => {
              onInteractionComplete();
            }, 2000); // 2 second delay to show completion message
          }
        }, 500);
      }
    }, interactionStep === 4 ? 1000 : 2500); // Shorter delay for final step
  },
  
  togglePause: () => {
    set((state) => ({ isPaused: !state.isPaused }));
  },
  
  setInteractionStep: (step: number) => {
    const { nodes } = get();
    const nodeSequence = ['orchestrator', 'gpt4', 'orchestrator', 'stable-diffusion', 'orchestrator'];
    
    // Reset edge states
    const newEdgeState: Record<string, 'IDLE' | 'RUNNING' | 'DONE'> = {};
    
    // Set edge states based on the step
    if (step >= 2) {
      newEdgeState['edge-1'] = 'DONE'; // Orchestrator -> GPT-4 completed
    } else if (step === 1) {
      newEdgeState['edge-1'] = 'RUNNING'; // Orchestrator -> GPT-4 running
    }
    
    if (step >= 4) {
      newEdgeState['edge-2'] = 'DONE'; // Orchestrator -> Stable Diffusion completed
    } else if (step === 3) {
      newEdgeState['edge-2'] = 'RUNNING'; // Orchestrator -> Stable Diffusion running
    }
    
    // Set the active node based on the step
    let activeNodeId = null;
    if (step < nodeSequence.length) {
      activeNodeId = nodeSequence[step];
    }
    
    set({
      interactionStep: step,
      activeNodeId: activeNodeId,
      edgeState: newEdgeState,
    });
  },
  
  resetInteraction: () => {
    set({
      activeNodeId: null,
      isPaused: true,
      edgeState: {},
      logLines: [],
      interactionStep: 0,
    });
  },
  
  startInteractionSimulation: () => {
    const { resetInteraction } = get();
    
    // Reset interaction state first
    resetInteraction();
    
    // Add initial log
    const initialLog: LogLine = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      message: '🚀 Starting AI interaction simulation...',
      type: 'info'
    };
    
    set({
      logLines: [initialLog],
      isPaused: false,
    });
    
    // Sequential execution of all 5 steps
    const executeSequence = async () => {
      const { isPaused } = get();
      if (isPaused) return;
      
      // Step 1: Orchestrator starts (interactionStep 0)
      setTimeout(() => {
        const { advanceNode, isPaused } = get();
        if (!isPaused) {
          advanceNode();
        }
      }, 1000);
      
      // Step 2: GPT-4 (interactionStep 1) - wait for orchestrator to complete
      setTimeout(() => {
        const { advanceNode, isPaused } = get();
        if (!isPaused) {
          advanceNode();
        }
      }, 4500); // 1s + 3.5s for orchestrator to complete
      
      // Step 3: Back to Orchestrator (interactionStep 2) - wait for GPT-4 to complete
      setTimeout(() => {
        const { advanceNode, isPaused } = get();
        if (!isPaused) {
          advanceNode();
        }
      }, 8000); // 4.5s + 3.5s for GPT-4 to complete
      
      // Step 4: Stable Diffusion (interactionStep 3) - wait for orchestrator coordination
      setTimeout(() => {
        const { advanceNode, isPaused } = get();
        if (!isPaused) {
          advanceNode();
        }
      }, 11500); // 8s + 3.5s for orchestrator coordination
      
      // Step 5: Final Orchestrator (interactionStep 4) - wait for Stable Diffusion to complete
      setTimeout(() => {
        const { advanceNode, isPaused } = get();
        if (!isPaused) {
          advanceNode();
        }
      }, 15000); // 11.5s + 3.5s for Stable Diffusion to complete
    };
    
    executeSequence();
  },
  
  setInteractionCompleteCallback: (callback: () => void) => {
    set({ onInteractionComplete: callback });
  },
})); 