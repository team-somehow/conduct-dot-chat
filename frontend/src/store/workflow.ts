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
  SummaryRequest,
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
  hasExecutionStarted: boolean; // Flag to prevent multiple executions

  // Edge state for CustomEdge component
  edgeState: Record<string, "IDLE" | "RUNNING" | "DONE">;

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
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;

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
export const convertWorkflowToGraph = (
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
      cost: 0.01, // Orchestrator cost
    },
  });

  // Filter for unique agents only
  const uniqueAgents = new Map();
  workflow.steps.forEach((step, index) => {
    const agentName = step.agentName;
    if (!uniqueAgents.has(agentName)) {
      uniqueAgents.set(agentName, {
        ...step,
        originalIndex: index,
      });
    }
  });

  const uniqueSteps = Array.from(uniqueAgents.values());

  // Create nodes for each unique step
  uniqueSteps.forEach((step, index) => {
    // Better spacing: arrange in a more spread out pattern
    const x = 150 + (index % 2) * 500; // Alternate between left and right
    const y = 250 + Math.floor(index / 2) * 200; // Stack vertically every 2 nodes

    // Calculate cost based on agent type
    const getCostForAgent = (agentName: string): number => {
      const costMap: Record<string, number> = {
        "Hello World Agent": 0.02,
        "DALL-E 3 Image Generator": 0.15,
        "NFT Deployer": 0.08,
        "GPT-4": 0.12,
        "Stable Diffusion": 0.1,
        Claude: 0.09,
      };
      return costMap[agentName] || 0.05 + Math.random() * 0.1;
    };

    nodes.push({
      id: step.stepId,
      type: "brutalNode",
      position: { x, y },
      data: {
        label: step.agentName,
        color: getAgentColor(step.agentName),
        status: "idle",
        description: step.description,
        cost: getCostForAgent(step.agentName),
      },
    });

    // Create edge from orchestrator to first step, or from previous step
    const sourceId =
      index === 0 ? "orchestrator" : uniqueSteps[index - 1].stepId;
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
      cost: 0.01,
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
      cost: 0.15,
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
      cost: 0.08,
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
      hasExecutionStarted: false,

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

      setNodes: (nodes) => set({ nodes }),

      setEdges: (edges) => set({ edges }),

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
          console.log("🚀 executeWorkflow called with workflowId:", workflowId);
          
          // Check if execution has already started
          if (get().hasExecutionStarted) {
            get().addLog("⚠️ Execution already in progress, skipping duplicate call", "info");
            console.log("⚠️ Execution already started, skipping");
            return;
          }

          console.log("✅ Starting new execution...");
          set({ isExecuting: true, error: null, hasExecutionStarted: true });
          get().addLog(`Executing workflow: ${workflowId}`, "info");

          console.log("📡 Calling backend API...");
          // Call the backend to execute the workflow
          const { execution } = await orchestratorAPI.executeWorkflow(workflowId);
          console.log("✅ Backend API response received:", execution);

          set({
            executionId: execution.executionId,
          });

          get().addLog(`Workflow execution started. Execution ID: ${execution.executionId}`, "success");
          console.log("✅ Execution started, now polling for status...");

          // Start polling for execution status
          get().pollExecutionStatus(execution.executionId);

        } catch (error: any) {
          console.error("❌ Workflow execution failed:", error);
          set({ error: error.message, isExecuting: false });
          get().addLog(`Execution failed: ${error.message}`, "error");
        }
      },

      // Poll execution status
      pollExecutionStatus: async (executionId) => {
        try {
          console.log("🔄 Polling execution status for:", executionId);
          const { execution } = await orchestratorAPI.getExecution(executionId);
          console.log("📊 Execution status received:", {
            executionId: execution.executionId,
            status: execution.status,
            hasOutput: !!execution.output,
            stepResults: execution.stepResults?.length || 0
          });

          if (execution.status === "completed") {
            console.log("🎉 Execution completed! Moving to results...");
            
            // Generate final summary using API
            try {
              const { workflow } = get();
              if (workflow && workflow.workflowId && execution && execution.executionId) {
                console.log("📝 Generating summary for completed execution...");
                const summaryRequest: SummaryRequest = {
                  workflowId: workflow.workflowId,
                  executionId: execution.executionId,
                  workflow: workflow,
                  execution: execution,
                  logs: get().logs,
                  executionType: "api",
                };

                const summaryResponse = await orchestratorAPI.generateSummary(summaryRequest);
                console.log("✅ Summary generated successfully");
                
                set({ 
                  executionSummary: summaryResponse.summary,
                  executionResults: execution.output || execution,
                  isExecuting: false,
                  currentStep: "SHOW_RESULT",
                });
                
                get().addLog("Final AI summary generated", "success");
                get().addLog("✅ Workflow execution completed - showing results", "success");
              } else {
                console.error("❌ Missing data for summary generation");
                // Still show results even without summary
                set({
                  executionResults: execution.output || execution,
                  isExecuting: false,
                  currentStep: "SHOW_RESULT",
                });
                get().addLog("Cannot generate summary: missing workflowId or executionId", "error");
                get().addLog("✅ Workflow execution completed - showing results without summary", "success");
              }
            } catch (summaryError: any) {
              console.error("❌ Summary generation failed:", summaryError);
              // Still show results even if summary fails
              set({
                executionResults: execution.output || execution,
                isExecuting: false,
                currentStep: "SHOW_RESULT",
              });
              get().addLog(`Failed to generate final summary: ${summaryError.message}`, "error");
              get().addLog("✅ Workflow execution completed - showing results without summary", "success");
            }
          } else if (execution.status === "failed") {
            console.log("❌ Execution failed");
            // Generate error summary using API
            try {
              const { workflow } = get();
              if (workflow && workflow.workflowId && execution && execution.executionId) {
                const summaryRequest: SummaryRequest = {
                  workflowId: workflow.workflowId,
                  executionId: execution.executionId,
                  workflow: workflow,
                  execution: execution,
                  logs: get().logs,
                  executionType: "api",
                };

                const summaryResponse = await orchestratorAPI.generateSummary(summaryRequest);
                set({ executionSummary: summaryResponse.summary });
                get().addLog("Error summary generated", "success");
              } else {
                get().addLog("Cannot generate summary: missing workflowId or executionId", "error");
              }
            } catch (summaryError: any) {
              get().addLog(`Failed to generate error summary: ${summaryError.message}`, "error");
            }

            set({
              error: execution.error || "Execution failed",
              isExecuting: false,
              currentStep: "SHOW_RESULT",
              executionResults: execution.output || execution,
            });
            get().addLog(`Execution failed: ${execution.error}`, "error");
          } else {
            console.log("⏳ Execution still running, polling again in 2 seconds...");
            // Still running, poll again after delay
            setTimeout(() => {
              get().pollExecutionStatus(executionId);
            }, 2000);
            get().addLog(`Execution status: ${execution.status}`, "info");
          }
        } catch (error: any) {
          console.error("❌ Failed to poll execution status:", error);
          set({ error: error.message, isExecuting: false });
          get().addLog(`Failed to check execution status: ${error.message}`, "error");
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
          hasExecutionStarted: false,
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
      startExecutionSimulation: async () => {
        const { nodes, edges, workflow, hasExecutionStarted } = get();

        // Prevent multiple executions
        if (hasExecutionStarted && get().isExecuting) {
          get().addLog("⚠️ Execution simulation already running, skipping duplicate call", "info");
          return;
        }

        if (!workflow || !workflow.steps || workflow.steps.length === 0) {
          get().addLog("❌ No workflow data available for simulation", "error");
          return;
        }

        // Helper function to generate mock step output based on component type
        const generateMockStepOutput = (step: any, index: number): any => {
          const agentName = step.agentName.toLowerCase();
          
          if (agentName.includes("dall") || agentName.includes("image")) {
            return {
              imageUrl: `https://via.placeholder.com/1024x1024/FF5484/FFFFFF?text=Generated+Image+${index + 1}`,
              prompt: step.description || "Generated image",
              style: "digital art",
              mockGenerated: true,
            };
          }
          
          if (agentName.includes("nft")) {
            return {
              nftAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
              tokenId: (index + 1).toString(),
              transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
              explorerUrl: `https://etherscan.io/tx/0x${Math.random().toString(16).substr(2, 64)}`,
              mockGenerated: true,
            };
          }
          
          if (agentName.includes("hello") || agentName.includes("greet")) {
            return {
              message: `Hello! Thank you for your participation. This is a personalized greeting generated for step ${index + 1}.`,
              language: "English",
              tone: "friendly",
              mockGenerated: true,
            };
          }
          
          if (agentName.includes("gpt") || agentName.includes("claude") || agentName.includes("llm")) {
            return {
              text: `This is a generated response from ${step.agentName} for step ${index + 1}. The agent has processed the request successfully.`,
              tokens: Math.floor(Math.random() * 1000) + 100,
              model: step.agentName,
              mockGenerated: true,
            };
          }
          
          // Default mock output
          return {
            result: `Mock result from ${step.agentName}`,
            status: "completed",
            stepIndex: index + 1,
            mockGenerated: true,
          };
        };

        // Helper function to generate realistic workflow output
        const generateRealisticOutput = (
          workflow: any,
          realExecutionOutput?: any
        ): any => {
          // Use real execution output if available
          if (realExecutionOutput) {
            return realExecutionOutput;
          }

          const hasImageAgent = workflow.steps.some(
            (step: any) =>
              step.agentName.toLowerCase().includes("dall") ||
              step.agentName.toLowerCase().includes("image")
          );
          const hasNFTAgent = workflow.steps.some(
            (step: any) =>
              step.agentName.toLowerCase().includes("nft") ||
              step.agentName.toLowerCase().includes("deploy")
          );

          const output: any = {
            workflowId: workflow.workflowId,
            executionTime: workflow.steps.length * 5,
            stepsCompleted: workflow.steps.length,
            status: "completed",
            mockGenerated: true,
          };

          if (hasImageAgent) {
            output.imageUrl =
              "https://via.placeholder.com/1024x1024/FF5484/FFFFFF?text=Generated+NFT+Image";
            output.imageDescription =
              "AI-generated image based on user request";
          }

          if (hasNFTAgent) {
            output.nftAddress = "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e";
            output.tokenId = "1";
            output.transactionHash = `0x${Math.random()
              .toString(16)
              .substr(2, 64)}`;
            output.explorerUrl = `https://etherscan.io/tx/${output.transactionHash}`;
            output.collectionName = "AI Generated Collection";
            output.tokenName = `AI NFT #${output.tokenId}`;
          }

          output.message = `Successfully executed ${
            workflow.name || "workflow"
          } with ${workflow.steps.length} steps`;
          output.timestamp = Date.now();

          return output;
        };

        // Helper functions for dynamic simulation
        const getAgentEmoji = (agentName: string): string => {
          const name = agentName.toLowerCase();
          if (
            name.includes("dall") ||
            name.includes("image") ||
            name.includes("generate")
          )
            return "🎨";
          if (name.includes("nft") || name.includes("deploy")) return "💎";
          if (
            name.includes("gpt") ||
            name.includes("claude") ||
            name.includes("llm")
          )
            return "🧠";
          if (name.includes("hello") || name.includes("greet")) return "👋";
          if (name.includes("send") || name.includes("transfer")) return "📤";
          if (name.includes("verify") || name.includes("check")) return "🔍";
          if (name.includes("store") || name.includes("save")) return "💾";
          return "⚡";
        };

        const getProcessingTime = (agentName: string): number => {
          const name = agentName.toLowerCase();
          if (name.includes("dall") || name.includes("image")) return 4000; // Image generation takes longer
          if (name.includes("nft") || name.includes("deploy")) return 3500; // Blockchain operations
          if (name.includes("gpt") || name.includes("claude")) return 2500; // LLM processing
          return 2000; // Default processing time
        };

        const getProgressMessage = (agentName: string): string => {
          const name = agentName.toLowerCase();
          if (name.includes("dall") || name.includes("image"))
            return "Generating high-quality image...";
          if (name.includes("nft") && name.includes("deploy"))
            return "Preparing blockchain transaction...";
          if (name.includes("gpt") || name.includes("claude"))
            return "Processing natural language request...";
          if (name.includes("hello") || name.includes("greet"))
            return "Crafting personalized greeting...";
          if (name.includes("send") || name.includes("transfer"))
            return "Initiating transfer process...";
          return "Processing request...";
        };

        const getCompletionMessage = (agentName: string): string => {
          const name = agentName.toLowerCase();
          if (name.includes("dall") || name.includes("image"))
            return "Image generated successfully!";
          if (name.includes("nft") && name.includes("deploy"))
            return "NFT deployed to blockchain!";
          if (name.includes("gpt") || name.includes("claude"))
            return "Text processing completed!";
          if (name.includes("hello") || name.includes("greet"))
            return "Greeting message created!";
          if (name.includes("send") || name.includes("transfer"))
            return "Transfer completed successfully!";
          return "Task completed successfully!";
        };

        const generateStepOutput = (
          step: any,
          index: number,
          realStepResult?: any
        ): any => {
          // Use real step result if available
          if (realStepResult && realStepResult.output) {
            return realStepResult.output;
          }

          // Use the mock generation function
          return generateMockStepOutput(step, index);
        };

        get().addLog("🚀 Starting dynamic workflow execution...", "info");
        get().addLog(
          `📋 Executing workflow: ${workflow.name || "Unnamed Workflow"}`,
          "info"
        );
        get().addLog(
          `🔗 Processing ${workflow.steps.length} steps with ${nodes.length} agents`,
          "info"
        );
        get().addLog(
          `🎭 Using component-based mocking for optimal performance`,
          "info"
        );

        // Create mock step results for all steps
        let realStepResults: any[] = workflow.steps.map((step: any, index: number) => ({
          stepId: step.stepId,
          status: "completed",
          startedAt: Date.now() - (workflow.steps.length - index) * 1000,
          completedAt: Date.now() - (workflow.steps.length - index - 1) * 1000,
          input: step.inputMapping || {
            name: "User",
            description: step.description,
            userIntent: workflow.userIntent,
          },
          output: generateMockStepOutput(step, index),
          agentUrl: step.agentUrl,
          agentName: step.agentName,
        }));

        // Remove any API call to orchestratorAPI.executeAgent
        // Only use mock simulation for demo

        // Start with orchestrator if it exists, otherwise start with first node
        const orchestratorNode = nodes.find(
          (n) =>
            n.data?.label?.toLowerCase().includes("orchestrator") ||
            n.data?.type?.toLowerCase().includes("coordinator")
        );

        const startingNode = orchestratorNode || nodes[0];

        if (startingNode) {
          set({ activeNodeId: startingNode.id });
          get().addLog(
            `🧠 ${
              startingNode.data?.label || "Orchestrator"
            }: Analyzing workflow and coordinating agents...`,
            "info"
          );
        }

        // Create a dynamic execution plan based on workflow steps
        const executeStep = (stepIndex: number) => {
          if (stepIndex >= workflow.steps.length) {
            // All steps completed
            get().addLog(
              "✅ All workflow steps completed successfully!",
              "success"
            );

            // Generate final summary
            setTimeout(async () => {
              try {
                let finalExecution: any;
                let finalSummary: string;

                // Create mock execution data for simulation
                finalExecution = {
                  executionId: `sim-${Date.now()}`,
                  workflowId: workflow.workflowId,
                  status: "completed" as const,
                  startedAt: Date.now() - workflow.steps.length * 5000, // 5 seconds per step
                  completedAt: Date.now(),
                  input: {
                    userRequest:
                      workflow.userIntent || workflow.description,
                  },
                  output: generateRealisticOutput(workflow),
                  stepResults: workflow.steps.map(
                    (step: any, index: number) => ({
                      stepId: step.stepId,
                      status: "completed" as const,
                      startedAt:
                        Date.now() - (workflow.steps.length - index) * 5000,
                      completedAt:
                        Date.now() -
                        (workflow.steps.length - index - 1) * 5000,
                      input: step.inputMapping || {},
                      output: generateStepOutput(step, index),
                    })
                  ),
                };

                const summaryRequest: SummaryRequest = {
                  workflow: workflow,
                  execution: finalExecution,
                  logs: get().logs,
                  executionType: "simulation",
                };

                get().addLog("🤖 Generating AI summary...", "info");
                const summaryResponse =
                  await orchestratorAPI.generateSummary(summaryRequest);
                finalSummary = summaryResponse.summary;

                set({
                  activeNodeId: null,
                  isExecuting: false,
                  currentStep: "SHOW_RESULT",
                  executionResults:
                    finalExecution.output || generateRealisticOutput(workflow, finalExecution.output),
                  executionSummary: finalSummary,
                });
                get().addLog(
                  "✅ Execution completed with orchestrator integration!",
                  "success"
                );
              } catch (summaryError: any) {
                get().addLog(
                  `Failed to generate AI summary: ${summaryError.message}`,
                  "error"
                );

                // Generate fallback summary with actual workflow data
                const executionTime = workflow.steps.length * 5;
                const agentPerformance = workflow.steps
                  .map(
                    (step: any, index: number) => `\n### ${step.agentName}\n- **Task**: ${step.description || "Process workflow step"}\n- **Status**: ✅ Completed\n- **Performance**: Excellent\n- **Duration**: ${3 + index * 2} seconds`
                  )
                  .join("");

                const fallbackSummary = `# ✅ Workflow Execution Complete\n\n## 📊 Execution Overview\n- **Workflow**: ${workflow.name || "AI Workflow"}\n- **Workflow ID**: ${workflow.workflowId}\n- **Total Steps**: ${workflow.steps.length}\n- **Execution Time**: ${executionTime} seconds\n- **Status**: ✅ Successfully Completed\n- **Mode**: Dynamic Simulation\n\n## 🤖 Agent Performance\n${agentPerformance}\n\n## 🎯 Key Achievements\n- ✅ Successfully processed user request: "${
                  workflow.userIntent || workflow.description
                }"\n- ✅ Completed all ${workflow.steps.length} workflow steps without errors\n- ✅ Generated appropriate outputs for each agent\n- ✅ Workflow executed flawlessly with realistic timing\n\n## 📋 Technical Details\n- **Execution ID**: sim-${Date.now()}\n- **API Mode**: Dynamic Simulation\n- **Error Rate**: 0%\n- **Performance Score**: 100%\n- **Agents Used**: ${workflow.steps.map((s: any) => s.agentName).join(", ")}\n\n## 🚀 Results Summary\nYour workflow "${
                  workflow.name || "AI Workflow"
                }" has been successfully executed! All ${
                  workflow.steps.length
                } agents completed their tasks perfectly, processing your request and generating the expected results based on the actual workflow configuration.\n\n---\n*Summary generated by AI Workflow Orchestrator - Dynamic Simulation Engine*`;

                set({
                  activeNodeId: null,
                  isExecuting: false,
                  currentStep: "SHOW_RESULT",
                  executionResults:
                    generateRealisticOutput(workflow),
                  executionSummary: fallbackSummary,
                });
              }
              get().addLog(
                "✅ Workflow execution completed successfully!",
                "success"
              );
            }, 1000);
            return;
          }

          const currentStep = workflow.steps[stepIndex];
          const stepNode =
            nodes.find(
              (n) =>
                n.data?.label
                  ?.toLowerCase()
                  .includes(currentStep.agentName.toLowerCase()) ||
                n.id.includes(currentStep.stepId) ||
                n.data?.name
                  ?.toLowerCase()
                  .includes(currentStep.agentName.toLowerCase())
            ) || nodes[stepIndex % nodes.length]; // Fallback to index-based selection

          if (stepNode) {
            set({ activeNodeId: stepNode.id });

            const emoji = getAgentEmoji(currentStep.agentName);
            const progressMessage = getProgressMessage(currentStep.agentName);
            const processingTime = getProcessingTime(currentStep.agentName);

            get().addLog(
              `${emoji} ${currentStep.agentName}: ${progressMessage}`,
              "info"
            );

            // Find the corresponding step result
            const stepResult = realStepResults.find(
              (r) => r.stepId === currentStep.stepId
            );

            setTimeout(() => {
              const completionMessage = getCompletionMessage(
                currentStep.agentName
              );

              if (stepResult) {
                // Add component-specific mocked output description
                const agentName = currentStep.agentName.toLowerCase();
                let mockDescription = "";
                
                if (agentName.includes("dall") || agentName.includes("image")) {
                  mockDescription = "🎨 Generated mock image placeholder with realistic metadata";
                } else if (agentName.includes("nft")) {
                  mockDescription = "💎 Generated mock NFT deployment with transaction hash";
                } else if (agentName.includes("hello") || agentName.includes("greet")) {
                  mockDescription = "👋 Generated mock personalized greeting message";
                } else if (agentName.includes("gpt") || agentName.includes("claude") || agentName.includes("llm")) {
                  mockDescription = "🧠 Generated mock LLM response with token count";
                } else {
                  mockDescription = "⚡ Generated mock component output";
                }
                
                get().addLog(mockDescription, "info");
                get().addLog(
                  `📋 Mock output: ${JSON.stringify(
                    stepResult.output
                  ).substring(0, 100)}...`,
                  "info"
                );
              } else {
                get().addLog(
                  `${emoji} ${currentStep.agentName}: ${completionMessage} (Fallback simulation)`,
                  "success"
                );
              }

              // Update edge state to show completion
              const outgoingEdges = get().edges.filter(
                (edge) => edge.source === stepNode.id
              );
              outgoingEdges.forEach((edge) => {
                set((state) => ({
                  edgeState: {
                    ...state.edgeState,
                    [edge.id]: "DONE",
                  },
                }));
              });

              // Continue to next step
              executeStep(stepIndex + 1);
            }, processingTime);
          } else {
            // No matching node found, continue to next step
            executeStep(stepIndex + 1);
          }
        };

        // Start execution after orchestrator analysis
        setTimeout(() => {
          executeStep(0);
        }, 2000);
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
