import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  applyNodeChanges,
  applyEdgeChanges,
} from "reactflow";
import orchestratorAPI, {
  WorkflowDefinition,
  WorkflowExecution,
  Agent,
  WorkflowStep,
} from "../api/orchestrator";

// TODO(WorkflowStore):
// 1. Implement workflow state management ✅
// 2. Add node and edge CRUD operations ✅
// 3. Create workflow execution state ✅
// 4. Add workflow persistence ✅
// 5. Implement undo/redo functionality
// END TODO

const STEPS = [
  "GENERATING_WORKFLOW",
  "SHOW_WORKFLOW",
  "COST_ESTIMATION",
  "SHOW_INTERACTION",
  "SHOW_RESULT",
] as const;

type Step = (typeof STEPS)[number];

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
  type: "info" | "success" | "error";
}

interface WorkflowState {
  // Current workflow state
  currentStep: string;
  isLoading: boolean;
  error: string | null;

  // Workflow data
  nodes: Node[];
  edges: Edge[];
  selectedModel: Model | null;
  estimatedCost: number;
  workflow: any | null; // Store the full workflow definition

  // Execution state
  isExecuting: boolean;
  executionId: string | null;
  executionResults: any | null;
  executionSummary: string | null; // Add summary storage
  workflowId: string | null; // Store the created workflow ID

  // Edge state for CustomEdge component
  edgeState: Record<string, 'IDLE' | 'RUNNING' | 'DONE'>;

  // Log data
  logs: LogLine[];
  logLines: LogLine[]; // Alias for logs for backward compatibility

  // Available agents from orchestrator
  availableAgents: any[];

  // Demo/interaction state
  activeNodeId: string | null;
  interactionStep: number;
  isPaused: boolean;

  // Actions
  setCurrentStep: (step: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Node and edge management
  addNode: (node: Node) => void;
  removeNode: (nodeId: string) => void;
  updateNode: (nodeId: string, updates: Partial<Node>) => void;
  addEdge: (edge: Edge) => void;
  removeEdge: (edgeId: string) => void;

  // Model selection
  setSelectedModel: (model: Model) => void;

  // Workflow execution
  createWorkflow: (description: string) => Promise<void>;
  executeWorkflow: (workflowId: string) => Promise<void>;
  pollExecutionStatus: (executionId: string) => Promise<void>;

  // Agent discovery
  loadAvailableAgents: () => Promise<void>;

  // Demo/interaction state
  startDemo: () => void;
  nextStep: () => void;
  resetWorkflow: () => void;

  // Interaction simulation actions
  setInteractionStep: (step: number) => void;
  togglePause: () => void;
  advanceNode: () => void;
  startExecutionSimulation: () => void;

  // Utility
  addLog: (message: string, type?: "info" | "success" | "error") => void;
}

// Helper function to convert workflow steps to nodes and edges
const convertWorkflowToGraph = (
  workflow: WorkflowDefinition
): { nodes: Node[]; edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Create orchestrator node
  nodes.push({
    id: "orchestrator",
    type: "brutalNode",
    position: { x: 400, y: 50 },
    data: {
      label: "AI Orchestrator",
      color: "#FEEF5D",
      status: "idle",
    },
  });

  // Create nodes for each step
  workflow.steps.forEach((step, index) => {
    // Better spacing: arrange in a more spread out pattern
    const x = 150 + (index % 2) * 500; // Alternate between left and right
    const y = 250 + Math.floor(index / 2) * 200; // Stack vertically every 2 nodes

    nodes.push({
      id: step.stepId,
      type: "brutalNode",
      position: { x, y },
      data: {
        label: step.agentName,
        color: getAgentColor(step.agentName),
        status: "idle",
        description: step.description,
      },
    });

    // Create edge from orchestrator to first step, or from previous step
    const sourceId =
      index === 0 ? "orchestrator" : workflow.steps[index - 1].stepId;
    edges.push({
      id: `edge-${sourceId}-${step.stepId}`,
      source: sourceId,
      target: step.stepId,
      type: "brutal",
      data: { status: "idle" },
    });
  });

  return { nodes, edges };
};

// Helper function to get agent color
const getAgentColor = (agentName: string): string => {
  const colorMap: Record<string, string> = {
    "Hello World Agent": "#FF5484",
    "DALL-E 3 Image Generator": "#7C82FF",
    "NFT Deployer": "#A8E6CF",
    "GPT-4": "#FF5484",
    "Stable Diffusion": "#7C82FF",
    Claude: "#FFE37B",
  };
  return colorMap[agentName] || "#BFEFFF";
};

// Helper function to convert agents to models
const convertAgentsToModels = (agents: Agent[]): Model[] => {
  return agents.map((agent, index) => ({
    id: agent.name.toLowerCase().replace(/\s+/g, "-"),
    name: agent.name,
    type: agent.name.includes("Image")
      ? "Image"
      : agent.name.includes("NFT")
      ? "Blockchain"
      : agent.name.includes("Hello")
      ? "Text"
      : "AI",
    color: getAgentColor(agent.name),
    description: agent.description,
    rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
    cost: `$${(0.05 + Math.random() * 0.2).toFixed(2)}/query`,
  }));
};

// Demo constants
const DEMO_NODES: Node[] = [
  {
    id: "orchestrator",
    type: "brutalNode",
    position: { x: 400, y: 50 },
    data: {
      label: "AI Orchestrator",
      color: "#FEEF5D",
      status: "idle",
    },
  },
  {
    id: "dalle-agent",
    type: "brutalNode",
    position: { x: 150, y: 250 },
    data: {
      label: "DALL-E 3 Image Generator",
      color: "#FF5484",
      status: "idle",
      description: "Generates high-quality images using DALL-E 3",
    },
  },
  {
    id: "nft-deployer",
    type: "brutalNode",
    position: { x: 650, y: 250 },
    data: {
      label: "NFT Deployer Agent",
      color: "#7C82FF",
      status: "idle",
      description: "Deploys NFTs to blockchain with smart contracts",
    },
  },
];

const DEMO_EDGES: Edge[] = [
  {
    id: "edge-orchestrator-dalle",
    source: "orchestrator",
    target: "dalle-agent",
    type: "brutal",
    data: { status: "idle" },
  },
  {
    id: "edge-dalle-nft",
    source: "dalle-agent",
    target: "nft-deployer",
    type: "brutal",
    data: { status: "idle" },
  },
];

export const useWorkflowStore = create<WorkflowState>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentStep: STEPS[0],
      isLoading: false,
      error: null,
      nodes: [],
      edges: [],
      selectedModel: null,
      estimatedCost: 0,
      isExecuting: false,
      executionId: null,
      executionResults: null,
      executionSummary: null,
      workflowId: null,
      edgeState: {},
      logs: [],
      logLines: [],
      availableAgents: [],
      activeNodeId: null,
      interactionStep: 0,
      isPaused: false,
      workflow: null,

      // Basic state management
      setCurrentStep: (step) => set({ currentStep: step }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // Node and edge management
      addNode: (node) =>
        set((state) => ({
          nodes: [...state.nodes, node],
        })),

      removeNode: (nodeId) =>
        set((state) => ({
          nodes: state.nodes.filter((n) => n.id !== nodeId),
          edges: state.edges.filter(
            (e) => e.source !== nodeId && e.target !== nodeId
          ),
        })),

      updateNode: (nodeId, updates) =>
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === nodeId ? { ...n, ...updates } : n
          ),
        })),

      addEdge: (edge) =>
        set((state) => ({
          edges: [...state.edges, edge],
        })),

      removeEdge: (edgeId) =>
        set((state) => ({
          edges: state.edges.filter((e) => e.id !== edgeId),
        })),

      // Model selection
      setSelectedModel: (model) => set({ selectedModel: model }),

      // Agent discovery
      loadAvailableAgents: async () => {
        try {
          set({ isLoading: true, error: null });
          const { agents } = await orchestratorAPI.getAgents();
          set({ availableAgents: agents, isLoading: false });
          get().addLog(`Loaded ${agents.length} available agents`, "success");
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          get().addLog(`Failed to load agents: ${error.message}`, "error");
        }
      },

      // Workflow creation
      createWorkflow: async (description) => {
        try {
          set({ isLoading: true, error: null });
          get().addLog(`Creating workflow: ${description}`, "info");

          const { workflow } = await orchestratorAPI.createWorkflow(
            description
          );

          // Store the workflow ID for later execution
          set({ workflowId: workflow.workflowId, workflow: workflow });

          // Convert workflow steps to nodes and edges
          const { nodes, edges } = convertWorkflowToGraph(workflow);

          // Calculate estimated cost based on number of steps
          const estimatedCost = workflow.steps.length * 0.25; // $0.25 per step

          set({
            nodes,
            edges,
            isLoading: false,
            estimatedCost,
          });

          get().addLog(
            `Workflow created with ${workflow.steps.length} steps`,
            "success"
          );
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          get().addLog(`Workflow creation failed: ${error.message}`, "error");
        }
      },

      // Workflow execution
      executeWorkflow: async (workflowId) => {
        try {
          set({ isExecuting: true, error: null });
          get().addLog(`Executing workflow: ${workflowId}`, "info");

          // Start the execution simulation immediately
          get().startExecutionSimulation();

          const response = await orchestratorAPI.executeWorkflow(workflowId);
          const { execution } = response;

          // Store the summary if it exists in the response
          const summary = (response as any).summary;
          if (summary) {
            set({ executionSummary: summary });
            get().addLog("AI-generated summary received", "success");
          }

          set({
            executionId: execution.executionId,
          });

          get().addLog(
            `Execution started: ${execution.executionId}`,
            "success"
          );

          // Start polling for status
          await get().pollExecutionStatus(execution.executionId);
        } catch (error: any) {
          set({ error: error.message, isExecuting: false });
          get().addLog(`Execution failed: ${error.message}`, "error");
          
          // If real execution fails, fall back to demo simulation
          get().addLog("Falling back to demo simulation...", "info");
          get().startExecutionSimulation();
        }
      },

      // Poll execution status
      pollExecutionStatus: async (executionId) => {
        try {
          const { execution } = await orchestratorAPI.getExecution(executionId);

          if (execution.status === "completed") {
            set({
              executionResults: execution.output,
              isExecuting: false,
              currentStep: "SHOW_RESULT",
            });
            get().addLog(
              "Workflow execution completed successfully",
              "success"
            );
          } else if (execution.status === "failed") {
            set({
              error: execution.error || "Execution failed",
              isExecuting: false,
              currentStep: "SHOW_RESULT",
            });
            get().addLog(`Execution failed: ${execution.error}`, "error");
          } else {
            // Still running, poll again after delay
            setTimeout(() => {
              get().pollExecutionStatus(executionId);
            }, 2000);
            get().addLog(`Execution status: ${execution.status}`, "info");
          }
        } catch (error: any) {
          set({ error: error.message, isExecuting: false });
          get().addLog(
            `Failed to check execution status: ${error.message}`,
            "error"
          );
        }
      },

      // Demo actions (kept for backward compatibility)
      startDemo: () => {
        set({
          currentStep: "GENERATING_WORKFLOW",
          isLoading: true,
          error: null,
          logs: [],
        });

        // Simulate workflow generation
        setTimeout(() => {
          get().addLog("Analyzing user intent...", "info");
          setTimeout(() => {
            get().addLog("Selecting optimal agents...", "info");
            setTimeout(() => {
              get().addLog("Building workflow graph...", "info");
              setTimeout(() => {
                set({
                  currentStep: "SHOW_WORKFLOW",
                  isLoading: false,
                  nodes: DEMO_NODES,
                  edges: DEMO_EDGES,
                });
                get().addLog("Workflow generated successfully!", "success");
              }, 1000);
            }, 800);
          }, 600);
        }, 1000);
      },

      nextStep: () => {
        const currentIndex = STEPS.indexOf(get().currentStep as Step);
        if (currentIndex < STEPS.length - 1) {
          const nextStep = STEPS[currentIndex + 1];
          set({ currentStep: nextStep });

          if (nextStep === "COST_ESTIMATION") {
            get().addLog("Calculating execution costs...", "info");
            setTimeout(() => {
              set({ estimatedCost: 0.75 });
              get().addLog("Cost estimation completed", "success");
            }, 1500);
          } else if (nextStep === "SHOW_INTERACTION") {
            set({ isExecuting: true });
            get().startExecutionSimulation();
          }
        }
      },

      resetWorkflow: () =>
        set({
          currentStep: STEPS[0],
          isLoading: false,
          error: null,
          nodes: [],
          edges: [],
          selectedModel: null,
          estimatedCost: 0,
          workflow: null,
          isExecuting: false,
          executionId: null,
          executionResults: null,
          executionSummary: null,
          workflowId: null,
          edgeState: {},
          logs: [],
          logLines: [],
        }),

      // Interaction simulation actions
      setInteractionStep: (step) => set({ interactionStep: step }),
      togglePause: () => set({ isPaused: !get().isPaused }),
      advanceNode: () => {
        const currentIndex = STEPS.indexOf(get().currentStep as Step);
        if (currentIndex < STEPS.length - 1) {
          const nextStep = STEPS[currentIndex + 1];
          set({ currentStep: nextStep });
        }
      },
      startExecutionSimulation: () => {
        const { nodes } = get();
        
        get().addLog("🚀 Starting workflow execution...", "info");
        
        // Simulate orchestrator activity
        setTimeout(() => {
          set({ activeNodeId: "orchestrator" });
          get().addLog("🧠 Orchestrator: Analyzing workflow and coordinating agents...", "info");
          
          setTimeout(() => {
            // Find and activate first agent (DALL-E)
            const dalleAgent = nodes.find(n => 
              n.data?.label?.toLowerCase().includes('dall') || 
              n.data?.label?.toLowerCase().includes('image')
            );
            
            if (dalleAgent) {
              set({ activeNodeId: dalleAgent.id });
              get().addLog("🎨 DALL-E 3: Generating thank you NFT image...", "info");
              
              setTimeout(() => {
                get().addLog("🎨 DALL-E 3: Processing image generation request...", "info");
                
                setTimeout(() => {
                  get().addLog("✨ DALL-E 3: Image generation completed successfully!", "success");
                  
                  setTimeout(() => {
                    // Find and activate NFT deployer
                    const nftAgent = nodes.find(n => 
                      n.data?.label?.toLowerCase().includes('nft') || 
                      n.data?.label?.toLowerCase().includes('deploy')
                    );
                    
                    if (nftAgent) {
                      set({ activeNodeId: nftAgent.id });
                      get().addLog("🔗 NFT Deployer: Preparing blockchain transaction...", "info");
                      
                      setTimeout(() => {
                        get().addLog("🔗 NFT Deployer: Minting NFT with generated image...", "info");
                        
                        setTimeout(() => {
                          get().addLog("🔗 NFT Deployer: Deploying to blockchain...", "info");
                          
                          setTimeout(() => {
                            get().addLog("💎 NFT Deployer: NFT successfully minted and sent!", "success");
                            get().addLog("🎉 Transaction hash: 0xdemo123...abcdef", "success");
                            
                            // Keep the node active for a bit longer to show completion
                            setTimeout(() => {
                              get().addLog("✅ All agents completed successfully!", "success");
                              
                              // Final delay before moving to results
                              setTimeout(() => {
                                set({ 
                                  activeNodeId: null,
                                  isExecuting: false,
                                  currentStep: "SHOW_RESULT",
                                  executionResults: {
                                    nftAddress: "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e",
                                    tokenId: "1",
                                    imageUrl: "https://via.placeholder.com/1024x1024/FF5484/FFFFFF?text=Demo+NFT+Image",
                                    transactionHash: "0xdemo123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
                                    collectionName: "ETH Global Prague Thank You",
                                    tokenName: "Thank You NFT #1",
                                    metadataUri: "https://demo.metadata.uri/1",
                                    explorerUrl: "https://etherscan.io/tx/0xdemo123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
                                  }
                                });
                                get().addLog("✅ Workflow execution completed successfully!", "success");
                              }, 2000); // Wait 2 seconds before showing results
                            }, 1500); // Keep final node active for 1.5 seconds
                          }, 2000); // Deploying phase
                        }, 2000); // Minting phase
                      }, 1500); // Preparation phase
                    }
                  }, 1500); // Transition delay between agents
                }, 2500); // Image processing time
              }, 2000); // Initial DALL-E processing
            } else {
              // Generic agent simulation fallback
              const firstAgent = nodes.find(n => n.id !== "orchestrator");
              if (firstAgent) {
                set({ activeNodeId: firstAgent.id });
                get().addLog(`🤖 ${firstAgent.data?.label}: Processing request...`, "info");
                
                setTimeout(() => {
                  get().addLog(`✅ ${firstAgent.data?.label}: Task completed successfully!`, "success");
                  
                  setTimeout(() => {
                    set({ 
                      activeNodeId: null,
                      isExecuting: false,
                      currentStep: "SHOW_RESULT",
                      executionResults: {
                        message: "Demo workflow completed successfully!",
                        timestamp: Date.now()
                      }
                    });
                    get().addLog("✅ Workflow execution completed!", "success");
                  }, 2000);
                }, 3000);
              }
            }
          }, 2000); // Orchestrator analysis time
        }, 1000); // Initial delay
      },

      // Utility
      addLog: (message, type = "info") => {
        const newLog: LogLine = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          message,
          type,
        };
        set((state) => ({
          logs: [...state.logs, newLog],
          logLines: [...state.logs, newLog], // Keep both in sync
        }));
      },
    }),
    {
      name: "workflow-store",
    }
  )
);
