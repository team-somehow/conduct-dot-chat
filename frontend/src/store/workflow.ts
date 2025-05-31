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
  "SELECTING_MODELS",
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

  // Execution state
  isExecuting: boolean;
  executionId: string | null;
  executionResults: any | null;

  // Log data
  logs: LogLine[];

  // Available agents from orchestrator
  availableAgents: any[];

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

  // Demo actions (kept for backward compatibility)
  startDemo: () => void;
  nextStep: () => void;
  resetWorkflow: () => void;

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
    position: { x: 250, y: 50 },
    data: {
      label: "AI Orchestrator",
      color: "#FEEF5D",
      status: "idle",
    },
  });

  // Create nodes for each step
  workflow.steps.forEach((step, index) => {
    const x = 100 + (index % 3) * 200;
    const y = 200 + Math.floor(index / 3) * 150;

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
      type: "smoothstep",
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
    position: { x: 250, y: 50 },
    data: {
      label: "AI Orchestrator",
      color: "#FEEF5D",
      status: "idle",
    },
  },
  {
    id: "hello-agent",
    type: "brutalNode",
    position: { x: 100, y: 200 },
    data: {
      label: "Hello World Agent",
      color: "#FF5484",
      status: "idle",
    },
  },
  {
    id: "dalle-agent",
    type: "brutalNode",
    position: { x: 400, y: 200 },
    data: {
      label: "DALL-E 3",
      color: "#7C82FF",
      status: "idle",
    },
  },
];

const DEMO_EDGES: Edge[] = [
  {
    id: "edge-orchestrator-hello",
    source: "orchestrator",
    target: "hello-agent",
    type: "smoothstep",
    data: { status: "idle" },
  },
  {
    id: "edge-hello-dalle",
    source: "hello-agent",
    target: "dalle-agent",
    type: "smoothstep",
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
      logs: [],
      availableAgents: [],

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

          // Convert workflow steps to nodes and edges
          const nodes: Node[] = workflow.steps.map(
            (step: any, index: number) => ({
              id: step.stepId,
              type: "agent",
              position: { x: index * 300, y: 100 },
              data: {
                label: step.agentName,
                description: step.description,
                agentUrl: step.agentUrl,
                inputSchema: step.inputMapping,
                outputSchema: step.outputMapping,
              },
            })
          );

          const edges: Edge[] = [];
          for (let i = 0; i < nodes.length - 1; i++) {
            edges.push({
              id: `edge-${i}`,
              source: nodes[i].id,
              target: nodes[i + 1].id,
              type: "smoothstep",
            });
          }

          set({
            nodes,
            edges,
            currentStep: "SHOW_WORKFLOW",
            isLoading: false,
            estimatedCost: workflow.estimatedDuration || 0,
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

          const { execution } = await orchestratorAPI.executeWorkflow(
            workflowId
          );

          set({
            executionId: execution.executionId,
            currentStep: "EXECUTING",
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
              currentStep: "SHOW_RESULTS",
            });
            get().addLog(
              "Workflow execution completed successfully",
              "success"
            );
          } else if (execution.status === "failed") {
            set({
              error: execution.error || "Execution failed",
              isExecuting: false,
              currentStep: "SHOW_RESULTS",
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
            get().addLog("Starting workflow execution...", "info");
            setTimeout(() => {
              get().addLog("Agent 1: Processing input...", "info");
              setTimeout(() => {
                get().addLog("Agent 2: Generating image...", "info");
                setTimeout(() => {
                  get().addLog("Agent 3: Deploying NFT...", "info");
                  setTimeout(() => {
                    set({
                      isExecuting: false,
                      currentStep: "SHOW_RESULT",
                      executionResults: {
                        nftAddress:
                          "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e",
                        tokenId: "1",
                        imageUrl: "https://example.com/generated-image.png",
                        transactionHash: "0xabc123...",
                      },
                    });
                    get().addLog("Workflow execution completed!", "success");
                  }, 2000);
                }, 1500);
              }, 2000);
            }, 1000);
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
          isExecuting: false,
          executionId: null,
          executionResults: null,
          logs: [],
        }),

      // Utility
      addLog: (message, type = "info") =>
        set((state) => ({
          logs: [
            ...state.logs,
            {
              id: Date.now().toString(),
              message,
              type: type as "info" | "success" | "error",
              timestamp: new Date().toISOString(),
            },
          ],
        })),
    }),
    {
      name: "workflow-store",
    }
  )
);
