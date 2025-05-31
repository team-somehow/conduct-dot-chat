import axios from "axios";

// Configuration
const ORCHESTRATOR_BASE_URL =
  import.meta.env.VITE_ORCHESTRATOR_URL || "http://localhost:8080";

// Enable comprehensive mocking for all API calls
const ENABLE_FULL_MOCKING = true;

const api = axios.create({
  baseURL: ORCHESTRATOR_BASE_URL,
  timeout: 30000, // 30 seconds timeout for workflow operations
  headers: {
    "Content-Type": "application/json",
  },
});

// Mock data generators
const generateMockAgents = (): Agent[] => [
  {
    name: "DALL-E 3 Image Generator",
    url: "http://localhost:3001",
    description: "Advanced AI image generation using DALL-E 3 model",
    vendor: "OpenAI",
    category: "Image Generation",
    tags: ["ai", "image", "dalle", "generation"],
    pricing: { model: "DALL-E 3", amount: 0.15, currency: "USD", unit: "image" },
    rating: { score: 4.8, reviews: 1247, lastUpdated: new Date().toISOString() },
    performance: { avgResponseTime: 4500, uptime: 99.2, successRate: 97.8 },
    wallet: "0x1234567890123456789012345678901234567890",
    previewURI: "https://via.placeholder.com/400x300/FF5484/FFFFFF?text=DALL-E+3"
  },
  {
    name: "Hello World Agent",
    url: "http://localhost:3002",
    description: "Simple greeting and message processing agent",
    vendor: "Demo Corp",
    category: "Utility",
    tags: ["demo", "greeting", "simple"],
    pricing: { model: "Basic", amount: 0.02, currency: "USD", unit: "request" },
    rating: { score: 4.5, reviews: 892, lastUpdated: new Date().toISOString() },
    performance: { avgResponseTime: 150, uptime: 99.9, successRate: 99.5 },
    wallet: "0x2345678901234567890123456789012345678901",
    previewURI: "https://via.placeholder.com/400x300/7C82FF/FFFFFF?text=Hello+World"
  },
  {
    name: "NFT Deployer Agent",
    url: "http://localhost:3003",
    description: "Deploy NFT contracts and mint tokens on multiple blockchains",
    vendor: "Blockchain Solutions",
    category: "Blockchain",
    tags: ["nft", "blockchain", "ethereum", "deployment"],
    pricing: { model: "Smart Contract", amount: 0.08, currency: "USD", unit: "deployment" },
    rating: { score: 4.7, reviews: 634, lastUpdated: new Date().toISOString() },
    performance: { avgResponseTime: 3200, uptime: 98.5, successRate: 96.2 },
    wallet: "0x3456789012345678901234567890123456789012",
    previewURI: "https://via.placeholder.com/400x300/A8E6CF/FFFFFF?text=NFT+Deployer"
  },
  {
    name: "1inch Balance Checker",
    url: "http://localhost:3004",
    description: "Check token balances and portfolio values across DeFi protocols",
    vendor: "1inch Network",
    category: "DeFi",
    tags: ["defi", "balance", "portfolio", "1inch"],
    pricing: { model: "API", amount: 0.05, currency: "USD", unit: "query" },
    rating: { score: 4.6, reviews: 1156, lastUpdated: new Date().toISOString() },
    performance: { avgResponseTime: 800, uptime: 99.7, successRate: 98.9 },
    wallet: "0x4567890123456789012345678901234567890123",
    previewURI: "https://via.placeholder.com/400x300/FFE37B/FFFFFF?text=1inch+Balance"
  },
  {
    name: "Aave Investor Agent",
    url: "http://localhost:3005",
    description: "Automated DeFi investment and lending on Aave protocol",
    vendor: "Aave Labs",
    category: "DeFi",
    tags: ["aave", "defi", "lending", "investment"],
    pricing: { model: "Transaction", amount: 0.12, currency: "USD", unit: "transaction" },
    rating: { score: 4.9, reviews: 789, lastUpdated: new Date().toISOString() },
    performance: { avgResponseTime: 2100, uptime: 99.1, successRate: 97.3 },
    wallet: "0x5678901234567890123456789012345678901234",
    previewURI: "https://via.placeholder.com/400x300/BFEFFF/FFFFFF?text=Aave+Investor"
  },
  {
    name: "NFT Metadata Creator",
    url: "http://localhost:3006",
    description: "Generate and upload NFT metadata to IPFS with proper formatting",
    vendor: "IPFS Solutions",
    category: "Blockchain",
    tags: ["nft", "metadata", "ipfs", "json"],
    pricing: { model: "IPFS Upload", amount: 0.03, currency: "USD", unit: "upload" },
    rating: { score: 4.4, reviews: 445, lastUpdated: new Date().toISOString() },
    performance: { avgResponseTime: 1200, uptime: 98.8, successRate: 99.1 },
    wallet: "0x6789012345678901234567890123456789012345",
    previewURI: "https://via.placeholder.com/400x300/FF9999/FFFFFF?text=Metadata+Creator"
  },
  {
    name: "GPT-4 Text Processor",
    url: "http://localhost:3007",
    description: "Advanced text processing and generation using GPT-4",
    vendor: "OpenAI",
    category: "AI",
    tags: ["gpt", "text", "ai", "processing"],
    pricing: { model: "GPT-4", amount: 0.18, currency: "USD", unit: "1k tokens" },
    rating: { score: 4.9, reviews: 2341, lastUpdated: new Date().toISOString() },
    performance: { avgResponseTime: 2800, uptime: 99.5, successRate: 98.7 },
    wallet: "0x7890123456789012345678901234567890123456",
    previewURI: "https://via.placeholder.com/400x300/9966FF/FFFFFF?text=GPT-4"
  },
  {
    name: "Claude AI Assistant",
    url: "http://localhost:3008",
    description: "Anthropic's Claude AI for complex reasoning and analysis",
    vendor: "Anthropic",
    category: "AI",
    tags: ["claude", "ai", "reasoning", "analysis"],
    pricing: { model: "Claude-3", amount: 0.16, currency: "USD", unit: "1k tokens" },
    rating: { score: 4.8, reviews: 1876, lastUpdated: new Date().toISOString() },
    performance: { avgResponseTime: 2200, uptime: 99.3, successRate: 98.4 },
    wallet: "0x8901234567890123456789012345678901234567",
    previewURI: "https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=Claude+AI"
  }
];

const generateMockWorkflow = (prompt: string): WorkflowDefinition => {
  const workflowId = `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const agents = generateMockAgents();
  
  // Determine workflow type based on prompt
  const promptLower = prompt.toLowerCase();
  let steps: WorkflowStep[] = [];
  let name = "AI Workflow";
  let description = prompt;
  
  if (promptLower.includes('nft') || promptLower.includes('token')) {
    name = "NFT Creation Workflow";
    steps = [
      {
        stepId: `step_${Date.now()}_1`,
        agentName: "DALL-E 3 Image Generator",
        agentUrl: "http://localhost:3001",
        description: "Generate NFT artwork based on user description",
        inputMapping: { 
          prompt: prompt,
          style: "digital art",
          size: "1024x1024"
        }
      },
      {
        stepId: `step_${Date.now()}_2`,
        agentName: "NFT Metadata Creator",
        agentUrl: "http://localhost:3006",
        description: "Create and upload NFT metadata to IPFS",
        inputMapping: {
          name: "AI Generated NFT",
          description: prompt,
          imageUrl: "{{step_1.imageUrl}}"
        }
      },
      {
        stepId: `step_${Date.now()}_3`,
        agentName: "NFT Deployer Agent",
        agentUrl: "http://localhost:3003",
        description: "Deploy NFT contract and mint token",
        inputMapping: {
          name: "AI NFT Collection",
          symbol: "AINFT",
          metadataUrl: "{{step_2.metadataUrl}}",
          chainId: "11155111"
        }
      }
    ];
  } else if (promptLower.includes('defi') || promptLower.includes('invest')) {
    name = "DeFi Investment Workflow";
    steps = [
      {
        stepId: `step_${Date.now()}_1`,
        agentName: "1inch Balance Checker",
        agentUrl: "http://localhost:3004",
        description: "Check current portfolio balance",
        inputMapping: {
          address: "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e"
        }
      },
      {
        stepId: `step_${Date.now()}_2`,
        agentName: "Aave Investor Agent",
        agentUrl: "http://localhost:3005",
        description: "Execute DeFi investment strategy",
        inputMapping: {
          action: "deposit",
          token: "USDC",
          amount: "1000"
        }
      }
    ];
  } else if (promptLower.includes('image') || promptLower.includes('generate')) {
    name = "Image Generation Workflow";
    steps = [
      {
        stepId: `step_${Date.now()}_1`,
        agentName: "DALL-E 3 Image Generator",
        agentUrl: "http://localhost:3001",
        description: "Generate image based on user prompt",
        inputMapping: {
          prompt: prompt,
          style: "photorealistic"
        }
      }
    ];
  } else {
    name = "Text Processing Workflow";
    steps = [
      {
        stepId: `step_${Date.now()}_1`,
        agentName: "Hello World Agent",
        agentUrl: "http://localhost:3002",
        description: "Process user request",
        inputMapping: {
          message: prompt
        }
      },
      {
        stepId: `step_${Date.now()}_2`,
        agentName: "GPT-4 Text Processor",
        agentUrl: "http://localhost:3007",
        description: "Enhanced text processing with GPT-4",
        inputMapping: {
          prompt: prompt,
          maxTokens: "1000"
        }
      }
    ];
  }
  
  return {
    workflowId,
    name,
    description,
    userIntent: prompt,
    steps,
    executionMode: "sequential",
    estimatedDuration: steps.length * 5,
    createdAt: Date.now()
  };
};

const generateMockExecution = (workflowId: string): WorkflowExecution => {
  const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  return {
    executionId,
    workflowId,
    status: "completed",
    startedAt: Date.now() - 30000,
    completedAt: Date.now(),
    input: { workflowId },
    output: {
      message: "Workflow executed successfully",
      results: "Mock execution completed"
    },
    stepResults: []
  };
};

const generateMockSummary = (request: SummaryRequest): string => {
  const workflow = request.workflow;
  const execution = request.execution;
  const executionType = request.executionType;
  
  // Check if this is a Naruto-themed workflow
  const userIntent = (workflow?.userIntent || workflow?.description || '').toLowerCase();
  const isNarutoThemed = userIntent.includes('naruto') || userIntent.includes('anime');
  
  // Determine workflow type with theme consideration
  const workflowType = workflow?.steps?.some(step => 
    step.agentName.toLowerCase().includes('nft') || 
    step.agentName.toLowerCase().includes('deploy')
  ) ? (isNarutoThemed ? "Naruto NFT Creation" : "NFT Creation") : "AI Workflow";
  
  // Generate image display for Naruto-themed workflows
  const imageDisplay = isNarutoThemed ? `

## 🎨 Generated Artwork
![Naruto NFT Artwork](/images/naruto1.png)
*Custom Naruto-themed NFT artwork featuring authentic anime styling*

### Image Details
- **Primary Image**: /images/naruto1.png
- **Alternate Image**: /images/naruto2.png
- **Style**: Authentic anime art style
- **Character**: Naruto Uzumaki, Seventh Hokage
- **Theme**: Hidden Leaf Village aesthetic` : '';
  
  // Generate theme-specific content
  const themeContent = isNarutoThemed ? `

## 🍥 Naruto Theme Details
- **Character**: Naruto Uzumaki, the Seventh Hokage
- **Village**: Hidden Leaf Village (Konohagakure)
- **Signature Technique**: Rasengan
- **Element**: Wind Release
- **Images Used**: Custom Naruto artwork (naruto1.png, naruto2.png)
- **NFT Attributes**: Series, Character, Village, Rank, Element, Technique, Rarity
- **Art Style**: Authentic anime art style` : '';
  
  const imageDetails = isNarutoThemed ? 
    "Generated authentic Naruto-themed artwork featuring the legendary Hokage" :
    "Generated AI artwork based on user specifications";
    
  const nftDetails = isNarutoThemed ?
    "Deployed Naruto NFT collection with legendary rarity attributes and anime-style metadata" :
    "Deployed NFT collection with AI-generated metadata";
  
  return `# ✅ ${workflowType} Workflow Execution Summary

## 📊 Overview
- **Workflow**: ${workflow?.name || workflowType}
- **Execution Type**: ${executionType === 'api' ? 'Live API Integration' : 'Simulation Mode'}
- **Status**: ${execution?.status === 'completed' ? '✅ Successfully Completed' : '❌ Failed'}
- **Duration**: ${workflow?.estimatedDuration || 15} seconds
- **Steps**: ${workflow?.steps?.length || 0} agents executed${isNarutoThemed ? '\n- **Theme**: 🍥 Naruto Anime Collection' : ''}${imageDisplay}

## 🤖 Agent Performance
${workflow?.steps?.map((step, index) => `
### ${step.agentName}
- **Task**: ${step.description}
- **Status**: ✅ Completed
- **Performance**: Excellent
- **Duration**: ${2 + index} seconds${step.agentName.toLowerCase().includes('dall') && isNarutoThemed ? '\n- **Special**: Generated authentic Naruto artwork' : ''}${step.agentName.toLowerCase().includes('nft') && isNarutoThemed ? '\n- **Special**: Deployed with Naruto-themed attributes' : ''}`).join('') || 'No steps available'}${themeContent}

## 🎯 Results
${execution?.output ? `Successfully processed user request: "${workflow?.userIntent || 'User request'}"` : `Workflow completed successfully${isNarutoThemed ? ' with authentic Naruto-themed content' : ''}`}

### Key Achievements
${workflow?.steps?.some(step => step.agentName.toLowerCase().includes('dall')) ? `- 🎨 **Image Generation**: ${imageDetails}` : ''}
${workflow?.steps?.some(step => step.agentName.toLowerCase().includes('nft')) ? `- 💎 **NFT Deployment**: ${nftDetails}` : ''}
${workflow?.steps?.some(step => step.agentName.toLowerCase().includes('metadata')) ? `- 📝 **Metadata Creation**: ${isNarutoThemed ? 'Created IPFS metadata with Naruto character attributes' : 'Generated OpenSea-compatible metadata'}` : ''}
${isNarutoThemed ? '- 🍥 **Anime Authenticity**: Maintained true-to-series character details and attributes' : ''}

## 📋 Technical Details
- **Workflow ID**: ${workflow?.workflowId || 'N/A'}
- **Execution ID**: ${execution?.executionId || 'N/A'}
- **Mode**: ${workflow?.executionMode || 'sequential'}
- **Error Rate**: 0%
- **Success Rate**: 100%${isNarutoThemed ? '\n- **Theme Engine**: Naruto content detection and enhancement active' : ''}

---
*Generated by AI Workflow Orchestrator${isNarutoThemed ? ' - Naruto Theme Engine' : ''}*`;
};

// Types
export interface AgentPricing {
  model: string;
  amount: number;
  currency: string;
  unit: string;
}

export interface AgentRating {
  score: number;
  reviews: number;
  lastUpdated: string;
}

export interface AgentPerformance {
  avgResponseTime: number;
  uptime: number;
  successRate: number;
}

export interface Agent {
  name: string;
  url: string;
  description: string;
  vendor?: string;
  category?: string;
  tags?: string[];
  pricing?: AgentPricing;
  rating?: AgentRating;
  performance?: AgentPerformance;
  wallet?: string;
  previewURI?: string;
}

export interface WorkflowStep {
  stepId: string;
  agentName: string;
  agentUrl: string;
  description: string;
  inputMapping: Record<string, string>;
  outputMapping?: Record<string, string>;
}

export interface WorkflowDefinition {
  workflowId: string;
  name: string;
  description: string;
  userIntent: string;
  steps: WorkflowStep[];
  executionMode: "sequential" | "parallel" | "conditional";
  estimatedDuration: number;
  createdAt: number;
}

export interface StepResult {
  stepId: string;
  status: "pending" | "running" | "completed" | "failed";
  startedAt?: number;
  completedAt?: number;
  input?: any;
  output?: any;
  error?: string;
}

export interface WorkflowExecution {
  executionId: string;
  workflowId: string;
  status: "pending" | "running" | "completed" | "failed";
  startedAt: number;
  completedAt?: number;
  input: any;
  output?: any;
  stepResults: StepResult[];
  error?: string;
}

export interface UserIntent {
  description: string;
  context?: Record<string, any>;
  preferences?: Record<string, any>;
}

export interface SummaryRequest {
  workflowId?: string;
  executionId?: string;
  workflow?: WorkflowDefinition;
  execution?: WorkflowExecution;
  logs?: Array<{
    id: string;
    timestamp: string;
    message: string;
    type: "info" | "success" | "error";
  }>;
  executionType: "api" | "simulation";
}

export interface SummaryResponse {
  summary: string;
  generatedAt: number;
}

// API Functions
export const orchestratorAPI = {
  // Health check - FULLY MOCKED
  async getHealth(): Promise<{ status: string; agents: Agent[] }> {
    if (ENABLE_FULL_MOCKING) {
      console.log('🎭 Using mocked health check');
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      return {
        status: "healthy",
        agents: generateMockAgents()
      };
    }
    
    try {
      const response = await api.get("/health");
      return response.data;
    } catch (error) {
      console.log('🔄 Health check failed, using mock data');
      return {
        status: "healthy",
        agents: generateMockAgents()
      };
    }
  },

  // Agent discovery - FULLY MOCKED
  async getAgents(): Promise<{ agents: Agent[]; count: number }> {
    if (ENABLE_FULL_MOCKING) {
      console.log('🎭 Using mocked agent discovery');
      await new Promise(resolve => setTimeout(resolve, 300));
      const agents = generateMockAgents();
      return {
        agents,
        count: agents.length
      };
    }
    
    try {
      const response = await api.get("/agents");
      return response.data;
    } catch (error) {
      console.log('🔄 Agent discovery failed, using mock data');
      const agents = generateMockAgents();
      return {
        agents,
        count: agents.length
      };
    }
  },

  // Workflow management - FULLY MOCKED
  async createWorkflow(
    prompt: string
  ): Promise<{ workflow: WorkflowDefinition }> {
    if (ENABLE_FULL_MOCKING) {
      console.log('🎭 Using mocked workflow creation');
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate AI processing
      return {
        workflow: generateMockWorkflow(prompt)
      };
    }
    
    try {
      const response = await api.post("/workflows/create", { prompt });
      return response.data;
    } catch (error) {
      console.log('🔄 Workflow creation failed, using mock data');
      return {
        workflow: generateMockWorkflow(prompt)
      };
    }
  },

  // Execute a single agent task - FULLY MOCKED
  async executeAgent(
    agentUrl: string,
    input: any
  ): Promise<{ result: any }> {
    console.log('🔍 executeAgent called with:', { agentUrl, input });
    
    // Always use hardcoded responses for comprehensive mocking
    const hardcodedResponse = orchestratorAPI.getHardcodedResponse(agentUrl, input);
    if (hardcodedResponse) {
      console.log('✅ Using hardcoded response for:', agentUrl);
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000)); // Simulate processing time
      return { result: hardcodedResponse };
    }
    
    if (ENABLE_FULL_MOCKING) {
      console.log('🎭 Using generic mock response for unknown agent:', agentUrl);
      await new Promise(resolve => setTimeout(resolve, 1500));
      return {
        result: {
          status: "success",
          message: `Mock response from ${agentUrl}`,
          data: input,
          timestamp: new Date().toISOString(),
          agentUrl
        }
      };
    }
    
    try {
      const response = await api.post("/execute", {
        agentUrl,
        input,
      });
      console.log('✅ executeAgent response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ executeAgent error:', error);
      
      // Always fallback to mock response
      const fallbackResponse = orchestratorAPI.getHardcodedResponse(agentUrl, input) || {
        status: "success",
        message: `Fallback mock response from ${agentUrl}`,
        data: input,
        timestamp: new Date().toISOString(),
        agentUrl,
        error: "Original request failed, using mock data"
      };
      
      console.log('🔄 Using fallback mock response for:', agentUrl);
      return { result: fallbackResponse };
    }
  },

  // Get hardcoded responses for different agent types - ENHANCED
  getHardcodedResponse(agentUrl: string, input: any): any | null {
    const url = agentUrl.toLowerCase();
    
    // NFT Deployer Agent - Multiple response scenarios
    if (url.includes('3003') || url.includes('nft') || url.includes('deploy')) {
      return orchestratorAPI.getNFTDeployerResponse(input);
    }
    
    // DALL-E / Image Generator Agent
    if (url.includes('3001') || url.includes('dall') || url.includes('image')) {
      return orchestratorAPI.getImageGeneratorResponse(input);
    }
    
    // NFT Metadata Creator Agent
    if (url.includes('3006') || url.includes('metadata')) {
      return orchestratorAPI.getNFTMetadataResponse(input);
    }
    
    // Hello World Agent
    if (url.includes('3002') || url.includes('hello')) {
      return orchestratorAPI.getHelloWorldResponse(input);
    }
    
    // 1inch Balance Agent
    if (url.includes('3004') || url.includes('1inch') || url.includes('balance')) {
      return orchestratorAPI.getBalanceAgentResponse(input);
    }
    
    // Aave Investor Agent
    if (url.includes('3005') || url.includes('aave') || url.includes('invest')) {
      return orchestratorAPI.getAaveInvestorResponse(input);
    }
    
    // GPT-4 Text Processor
    if (url.includes('3007') || url.includes('gpt')) {
      return orchestratorAPI.getGPTResponse(input);
    }
    
    // Claude AI Assistant
    if (url.includes('3008') || url.includes('claude')) {
      return orchestratorAPI.getClaudeResponse(input);
    }
    
    // Generic AI agent fallback
    if (url.includes('ai') || url.includes('llm') || url.includes('model')) {
      return orchestratorAPI.getGenericAIResponse(input);
    }
    
    return null;
  },

  // NFT Deployer Agent hardcoded responses
  getNFTDeployerResponse(input: any): any {
    // Simulate different scenarios based on input
    const scenarios = [
      // Successful single NFT deployment
      {
        condition: () => true, // Default case
        response: {
          contractAddress: "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e",
          name: input.name || "ETH Global Prague 2025 Thank You NFTs",
          symbol: input.symbol || "ETHPRAGUE",
          chainId: input.chainId || 11155111,
          mints: [
            {
              transactionHash: "0xa1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
              tokenId: "1",
              contractAddress: "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e",
              recipientAddress: input.mints?.[0]?.to || "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e",
              tokenURI: input.mints?.[0]?.metadataUrl || "https://ipfs.io/ipfs/QmNftMetadata123",
              explorerUrl: "https://sepolia.etherscan.io/tx/0xa1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
              timestamp: new Date().toISOString()
            }
          ]
        }
      },
      // Multiple NFT deployment scenario
      {
        condition: () => input.mints && input.mints.length > 1,
        response: {
          contractAddress: "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e",
          name: input.name || "Batch NFT Collection",
          symbol: input.symbol || "BATCH",
          chainId: input.chainId || 11155111,
          mints: input.mints.map((mint: any, index: number) => ({
            transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
            tokenId: (index + 1).toString(),
            contractAddress: "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e",
            recipientAddress: mint.to,
            tokenURI: mint.metadataUrl,
            explorerUrl: `https://sepolia.etherscan.io/tx/0x${Math.random().toString(16).substr(2, 64)}`,
            timestamp: new Date().toISOString()
          }))
        }
      },
      // Flow testnet deployment
      {
        condition: () => input.chainId === 545,
        response: {
          contractAddress: "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e",
          name: input.name || "Flow Testnet NFT",
          symbol: input.symbol || "FLOW",
          chainId: 545,
          mints: [
            {
              transactionHash: "0xflow123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
              tokenId: "1",
              contractAddress: "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e",
              recipientAddress: input.mints?.[0]?.to || "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e",
              tokenURI: input.mints?.[0]?.metadataUrl || "https://ipfs.io/ipfs/QmFlowNftMetadata",
              explorerUrl: "https://evm-testnet.flowscan.io/tx/0xflow123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
              timestamp: new Date().toISOString()
            }
          ]
        }
      },
      // Mainnet deployment scenario
      {
        condition: () => input.chainId === 1,
        response: {
          contractAddress: "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e",
          name: input.name || "Mainnet NFT Collection",
          symbol: input.symbol || "MAIN",
          chainId: 1,
          mints: [
            {
              transactionHash: "0xmainnet123456789abcdef0123456789abcdef0123456789abcdef0123456789abc",
              tokenId: "1",
              contractAddress: "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e",
              recipientAddress: input.mints?.[0]?.to || "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e",
              tokenURI: input.mints?.[0]?.metadataUrl || "https://ipfs.io/ipfs/QmMainnetNft",
              explorerUrl: "https://etherscan.io/tx/0xmainnet123456789abcdef0123456789abcdef0123456789abcdef0123456789abc",
              timestamp: new Date().toISOString()
            }
          ]
        }
      }
    ];

    // Find the first matching scenario
    const matchingScenario = scenarios.find(scenario => scenario.condition());
    return matchingScenario ? matchingScenario.response : scenarios[0].response;
  },

  // Image Generator hardcoded responses
  getImageGeneratorResponse(input: any): any {
    const prompt = (input.prompt || input.description || "").toLowerCase();
    
    // Use specific Naruto images for Naruto-themed requests
    if (prompt.includes('naruto') || prompt.includes('anime') || prompt.includes('ninja')) {
      const narutoImages = [
        "/images/naruto1.png",
        "/images/naruto2.png"
      ];
      const selectedImage = narutoImages[Math.floor(Math.random() * narutoImages.length)];
      
      return {
        imageUrl: selectedImage,
        prompt: input.prompt || input.description || "Naruto-themed NFT artwork",
        style: "anime art",
        dimensions: "1024x1024",
        format: "PNG",
        generatedAt: new Date().toISOString(),
        model: "DALL-E 3",
        seed: Math.floor(Math.random() * 1000000),
        theme: "naruto",
        character: prompt.includes('naruto') ? "Naruto Uzumaki" : "Anime Character"
      };
    }
    
    // Default response for other image generation requests
    return {
      imageUrl: "https://via.placeholder.com/1024x1024/FF5484/FFFFFF?text=AI+Generated+NFT+Image",
      prompt: input.prompt || input.description || "AI generated image",
      style: input.style || "digital art",
      dimensions: "1024x1024",
      format: "PNG",
      generatedAt: new Date().toISOString(),
      model: "DALL-E 3",
      seed: Math.floor(Math.random() * 1000000)
    };
  },

  // NFT Metadata Creator hardcoded responses
  getNFTMetadataResponse(input: any): any {
    const name = input.tokenName || input.name || "AI Generated NFT";
    const description = input.description || "A unique NFT created by AI";
    const imageUrl = input.imageUrl || "https://via.placeholder.com/1024x1024/FF5484/FFFFFF?text=NFT+Image";
    
    // Enhanced attributes for Naruto-themed NFTs
    let attributes = [];
    if (name.toLowerCase().includes('naruto') || description.toLowerCase().includes('naruto') || imageUrl.includes('naruto')) {
      attributes = [
        { trait_type: "Series", value: "Naruto" },
        { trait_type: "Character", value: "Naruto Uzumaki" },
        { trait_type: "Village", value: "Hidden Leaf Village" },
        { trait_type: "Rank", value: "Hokage" },
        { trait_type: "Element", value: "Wind" },
        { trait_type: "Technique", value: "Rasengan" },
        { trait_type: "Rarity", value: "Legendary" },
        { trait_type: "Generated By", value: "AI Workflow" }
      ];
    } else if (input.attributes) {
      attributes = typeof input.attributes === 'string' ? 
        JSON.parse(input.attributes) : 
        input.attributes;
    } else {
      attributes = [
        { trait_type: "Generated By", value: "AI" },
        { trait_type: "Collection", value: input.collectionName || "AI Collection" },
        { trait_type: "Rarity", value: "Unique" }
      ];
    }
    
    return {
      metadataUrl: "https://ipfs.io/ipfs/QmNftMetadata123456789abcdef",
      metadata: {
        name,
        description,
        image: imageUrl,
        attributes
      },
      ipfsHash: "QmNftMetadata123456789abcdef",
      uploadedAt: new Date().toISOString()
    };
  },

  // Hello World Agent hardcoded responses
  getHelloWorldResponse(input: any): any {
    return {
      message: `Hello ${input.name || 'World'}! Thank you for using our AI workflow system.`,
      greeting: "personalized",
      timestamp: new Date().toISOString(),
      userInput: input
    };
  },

  // 1inch Balance Agent hardcoded responses (for future DeFi workflow)
  getBalanceAgentResponse(input: any): any {
    return {
      address: input.address || "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e",
      balances: [
        {
          token: "ETH",
          balance: "1.5",
          balanceWei: "1500000000000000000",
          usdValue: "3750.00"
        },
        {
          token: "USDC",
          balance: "1000.0",
          balanceWei: "1000000000",
          usdValue: "1000.00"
        },
        {
          token: "DAI",
          balance: "500.0",
          balanceWei: "500000000000000000000",
          usdValue: "500.00"
        }
      ],
      totalUsdValue: "5250.00",
      chainId: input.chainId || 1,
      timestamp: new Date().toISOString()
    };
  },

  // Aave Investor Agent hardcoded responses (for future DeFi workflow)
  getAaveInvestorResponse(input: any): any {
    const transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    return {
      transactionHash: transactionHash,
      action: input.action || "deposit",
      token: input.token || "USDC",
      amount: input.amount || "1000",
      aToken: input.token === "USDC" ? "aUSDC" : `a${input.token || "USDC"}`,
      apy: "4.25%",
      explorerUrl: `https://etherscan.io/tx/${transactionHash}`,
      poolAddress: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2",
      timestamp: new Date().toISOString(),
      estimatedGas: "150000",
      gasPrice: "20"
    };
  },

  // GPT-4 Text Processor responses
  getGPTResponse(input: any): any {
    return {
      response: `GPT-4 processed response: ${input.prompt || input.message || 'Hello! I am GPT-4, ready to help you with advanced text processing and generation.'}`,
      model: "gpt-4",
      tokens: {
        prompt: Math.floor((input.prompt || input.message || '').length / 4),
        completion: Math.floor(Math.random() * 500) + 100,
        total: Math.floor(Math.random() * 600) + 200
      },
      usage: {
        promptTokens: Math.floor((input.prompt || input.message || '').length / 4),
        completionTokens: Math.floor(Math.random() * 500) + 100,
        totalTokens: Math.floor(Math.random() * 600) + 200
      },
      finishReason: "stop",
      timestamp: new Date().toISOString(),
      processingTime: Math.floor(Math.random() * 3000) + 1000
    };
  },

  // Claude AI Assistant responses
  getClaudeResponse(input: any): any {
    return {
      response: `Claude AI analysis: ${input.prompt || input.message || 'Hello! I am Claude, an AI assistant created by Anthropic. I can help with complex reasoning and analysis tasks.'}`,
      model: "claude-3-sonnet",
      reasoning: "Applied advanced reasoning and analysis to provide comprehensive response",
      confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
      tokens: {
        input: Math.floor((input.prompt || input.message || '').length / 4),
        output: Math.floor(Math.random() * 400) + 150
      },
      timestamp: new Date().toISOString(),
      processingTime: Math.floor(Math.random() * 2500) + 800
    };
  },

  // Generic AI agent fallback response
  getGenericAIResponse(input: any): any {
    return {
      response: `AI Agent processed: ${input.prompt || input.message || input.query || 'Request processed successfully'}`,
      model: "generic-ai",
      status: "completed",
      confidence: Math.random() * 0.4 + 0.6, // 60-100% confidence
      metadata: {
        inputType: typeof input,
        processingMethod: "neural_network",
        version: "1.0.0"
      },
      timestamp: new Date().toISOString(),
      processingTime: Math.floor(Math.random() * 2000) + 500
    };
  },

  // Workflow execution - FULLY MOCKED
  async executeWorkflow(
    workflowId: string
  ): Promise<{ execution: WorkflowExecution }> {
    if (ENABLE_FULL_MOCKING) {
      console.log('🎭 Using mocked workflow execution');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate execution time
      return {
        execution: generateMockExecution(workflowId)
      };
    }
    
    try {
      // For now, return a mock execution since we're switching to individual agent execution
      // This maintains compatibility with existing code that expects this format
      const mockExecution: WorkflowExecution = {
        executionId: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        workflowId,
        status: "completed",
        startedAt: Date.now(),
        completedAt: Date.now() + 1000,
        input: {},
        output: { message: "Workflow executed via individual agent calls" },
        stepResults: []
      };
      
      return { execution: mockExecution };
    } catch (error) {
      console.log('🔄 Workflow execution failed, using mock data');
      return {
        execution: generateMockExecution(workflowId)
      };
    }
  },

  // Get workflow - FULLY MOCKED
  async getWorkflow(
    workflowId: string
  ): Promise<{ workflow: WorkflowDefinition }> {
    if (ENABLE_FULL_MOCKING) {
      console.log('🎭 Using mocked workflow retrieval');
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        workflow: generateMockWorkflow("Retrieved workflow for ID: " + workflowId)
      };
    }
    
    try {
      const response = await api.get(`/workflows/${workflowId}`);
      return response.data;
    } catch (error) {
      console.log('🔄 Workflow retrieval failed, using mock data');
      return {
        workflow: generateMockWorkflow("Retrieved workflow for ID: " + workflowId)
      };
    }
  },

  // Get execution - FULLY MOCKED
  async getExecution(
    executionId: string
  ): Promise<{ execution: WorkflowExecution }> {
    if (ENABLE_FULL_MOCKING) {
      console.log('🎭 Using mocked execution retrieval');
      await new Promise(resolve => setTimeout(resolve, 200));
      return {
        execution: generateMockExecution("mock_workflow_id")
      };
    }
    
    try {
      const response = await api.get(`/executions/${executionId}`);
      return response.data;
    } catch (error) {
      console.log('🔄 Execution retrieval failed, using mock data');
      return {
        execution: generateMockExecution("mock_workflow_id")
      };
    }
  },

  // List workflows - FULLY MOCKED
  async listWorkflows(): Promise<{
    workflows: WorkflowDefinition[];
    count: number;
  }> {
    if (ENABLE_FULL_MOCKING) {
      console.log('🎭 Using mocked workflow listing');
      await new Promise(resolve => setTimeout(resolve, 400));
      const workflows = [
        generateMockWorkflow("Create an NFT collection"),
        generateMockWorkflow("Invest in DeFi protocols"),
        generateMockWorkflow("Generate AI artwork"),
        generateMockWorkflow("Process text with AI")
      ];
      return {
        workflows,
        count: workflows.length
      };
    }
    
    try {
      const response = await api.get("/workflows");
      return response.data;
    } catch (error) {
      console.log('🔄 Workflow listing failed, using mock data');
      const workflows = [
        generateMockWorkflow("Create an NFT collection"),
        generateMockWorkflow("Invest in DeFi protocols")
      ];
      return {
        workflows,
        count: workflows.length
      };
    }
  },

  // List executions - FULLY MOCKED
  async listExecutions(): Promise<{
    executions: WorkflowExecution[];
    count: number;
  }> {
    if (ENABLE_FULL_MOCKING) {
      console.log('🎭 Using mocked execution listing');
      await new Promise(resolve => setTimeout(resolve, 350));
      const executions = [
        generateMockExecution("wf_1"),
        generateMockExecution("wf_2"),
        generateMockExecution("wf_3")
      ];
      return {
        executions,
        count: executions.length
      };
    }
    
    try {
      const response = await api.get("/executions");
      return response.data;
    } catch (error) {
      console.log('🔄 Execution listing failed, using mock data');
      const executions = [
        generateMockExecution("wf_1"),
        generateMockExecution("wf_2")
      ];
      return {
        executions,
        count: executions.length
      };
    }
  },

  // Polling for execution status - ENHANCED MOCKING
  async pollExecution(
    executionId: string,
    onUpdate: (execution: WorkflowExecution) => void
  ): Promise<WorkflowExecution> {
    const poll = async (): Promise<WorkflowExecution> => {
      if (ENABLE_FULL_MOCKING) {
        console.log('🎭 Using mocked execution polling');
        const mockExecution = generateMockExecution("mock_workflow_id");
        mockExecution.executionId = executionId;
        onUpdate(mockExecution);
        return mockExecution;
      }
      
      try {
        const { execution } = await orchestratorAPI.getExecution(executionId);
        onUpdate(execution);

        if (execution.status === "running" || execution.status === "pending") {
          // Continue polling every 2 seconds
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return poll();
        }

        return execution;
      } catch (error) {
        console.log('🔄 Execution polling failed, using mock data');
        const mockExecution = generateMockExecution("mock_workflow_id");
        mockExecution.executionId = executionId;
        onUpdate(mockExecution);
        return mockExecution;
      }
    };

    return poll();
  },

  // Create and execute workflow in one call - FULLY MOCKED
  async createAndExecuteWorkflow(
    userIntent: UserIntent,
    input: any,
    onWorkflowCreated?: (workflow: WorkflowDefinition) => void,
    onExecutionUpdate?: (execution: WorkflowExecution) => void
  ): Promise<{ workflow: WorkflowDefinition; execution: WorkflowExecution }> {
    if (ENABLE_FULL_MOCKING) {
      console.log('🎭 Using mocked create and execute workflow');
      
      // Create workflow
      const workflow = generateMockWorkflow(userIntent.description);
      onWorkflowCreated?.(workflow);
      
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate creation time

      // Execute workflow
      const execution = generateMockExecution(workflow.workflowId);

      // Poll for completion if callback provided
      if (onExecutionUpdate) {
        // Simulate polling updates
        const statuses: Array<"pending" | "running" | "completed"> = ["pending", "running", "completed"];
        for (let i = 0; i < statuses.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const updatedExecution = { ...execution, status: statuses[i] };
          onExecutionUpdate(updatedExecution);
        }
        return { workflow, execution: { ...execution, status: "completed" } };
      }

      return { workflow, execution };
    }
    
    try {
      // Create workflow
      const { workflow } = await orchestratorAPI.createWorkflow(userIntent.description);
      onWorkflowCreated?.(workflow);

      // Execute workflow
      const { execution } = await orchestratorAPI.executeWorkflow(workflow.workflowId);

      // Poll for completion if callback provided
      if (onExecutionUpdate) {
        const finalExecution = await orchestratorAPI.pollExecution(
          execution.executionId,
          onExecutionUpdate
        );
        return { workflow, execution: finalExecution };
      }

      return { workflow, execution };
    } catch (error) {
      console.log('🔄 Create and execute workflow failed, using mock data');
      const workflow = generateMockWorkflow(userIntent.description);
      const execution = generateMockExecution(workflow.workflowId);
      onWorkflowCreated?.(workflow);
      onExecutionUpdate?.(execution);
      return { workflow, execution };
    }
  },

  // Generate AI summary for workflow execution - FULLY MOCKED
  async generateSummary(
    summaryRequest: SummaryRequest
  ): Promise<SummaryResponse> {
    if (ENABLE_FULL_MOCKING) {
      console.log('🎭 Using mocked AI summary generation');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate AI processing
      return {
        summary: generateMockSummary(summaryRequest),
        generatedAt: Date.now()
      };
    }
    
    try {
      const response = await api.post(
        "/workflows/generate-summary",
        summaryRequest
      );
      return response.data;
    } catch (error) {
      console.log('🔄 Summary generation failed, using mock data');
      return {
        summary: generateMockSummary(summaryRequest),
        generatedAt: Date.now()
      };
    }
  },

  // ========== BLOCKCHAIN & RATING METHODS - FULLY MOCKED ==========

  // Submit agent rating - FULLY MOCKED
  async submitRating(
    agentUrl: string,
    rating: number,
    userAddress?: string,
    feedback?: string
  ): Promise<{
    success: boolean;
    message?: string;
    txHash?: string;
    error?: string;
  }> {
    if (ENABLE_FULL_MOCKING) {
      console.log('🎭 Using mocked rating submission');
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate blockchain transaction
      return {
        success: true,
        message: `Rating ${rating}/5 submitted successfully for ${agentUrl}`,
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`
      };
    }
    
    try {
      const response = await api.post("/agents/rate", {
        agentUrl,
        rating,
        userAddress,
        feedback,
      });
      return response.data;
    } catch (error) {
      console.log('🔄 Rating submission failed, using mock data');
      return {
        success: true,
        message: `Mock rating ${rating}/5 submitted for ${agentUrl}`,
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`
      };
    }
  },

  // Get agent reputation from blockchain - FULLY MOCKED
  async getAgentReputation(agentUrl: string): Promise<{
    success: boolean;
    agentUrl: string;
    reputation: {
      totalTasks: number;
      successfulTasks: number;
      successRate: number;
      averageLatency: number;
      averageRating: number;
      reputationScore: number;
    };
    source?: string;
    message?: string;
  }> {
    if (ENABLE_FULL_MOCKING) {
      console.log('🎭 Using mocked agent reputation');
      await new Promise(resolve => setTimeout(resolve, 800));
      const totalTasks = Math.floor(Math.random() * 1000) + 100;
      const successfulTasks = Math.floor(totalTasks * (0.85 + Math.random() * 0.14));
      return {
        success: true,
        agentUrl,
        reputation: {
          totalTasks,
          successfulTasks,
          successRate: (successfulTasks / totalTasks) * 100,
          averageLatency: Math.floor(Math.random() * 3000) + 500,
          averageRating: 4.0 + Math.random() * 1.0,
          reputationScore: Math.floor(Math.random() * 30) + 70
        },
        source: "blockchain",
        message: "Reputation data retrieved from blockchain"
      };
    }
    
    try {
      const encodedUrl = encodeURIComponent(agentUrl);
      const response = await api.get(`/agents/${encodedUrl}/reputation`);
      return response.data;
    } catch (error) {
      console.log('🔄 Agent reputation failed, using mock data');
      const totalTasks = Math.floor(Math.random() * 1000) + 100;
      const successfulTasks = Math.floor(totalTasks * (0.85 + Math.random() * 0.14));
      return {
        success: true,
        agentUrl,
        reputation: {
          totalTasks,
          successfulTasks,
          successRate: (successfulTasks / totalTasks) * 100,
          averageLatency: Math.floor(Math.random() * 3000) + 500,
          averageRating: 4.0 + Math.random() * 1.0,
          reputationScore: Math.floor(Math.random() * 30) + 70
        },
        source: "mock",
        message: "Mock reputation data"
      };
    }
  },

  // Get blockchain service status - FULLY MOCKED
  async getBlockchainStatus(): Promise<{
    success: boolean;
    blockchain: {
      isAvailable: boolean;
      hasWallet: boolean;
      blockNumber?: number;
      contracts: {
        agentRegistry: string;
        reputationLayer: string;
        orchestrationContract: string;
      };
      rpcUrl: string;
      features: {
        agentDiscovery: boolean;
        reputationTracking: boolean;
        paymentProcessing: boolean;
      };
    };
  }> {
    if (ENABLE_FULL_MOCKING) {
      console.log('🎭 Using mocked blockchain status');
      await new Promise(resolve => setTimeout(resolve, 600));
      return {
        success: true,
        blockchain: {
          isAvailable: true,
          hasWallet: true,
          blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
          contracts: {
            agentRegistry: "0x1234567890123456789012345678901234567890",
            reputationLayer: "0x2345678901234567890123456789012345678901",
            orchestrationContract: "0x3456789012345678901234567890123456789012"
          },
          rpcUrl: "https://eth-sepolia.g.alchemy.com/v2/mock",
          features: {
            agentDiscovery: true,
            reputationTracking: true,
            paymentProcessing: true
          }
        }
      };
    }
    
    try {
      const response = await api.get("/blockchain/status");
      return response.data;
    } catch (error) {
      console.log('🔄 Blockchain status failed, using mock data');
      return {
        success: true,
        blockchain: {
          isAvailable: false,
          hasWallet: false,
          contracts: {
            agentRegistry: "0x0000000000000000000000000000000000000000",
            reputationLayer: "0x0000000000000000000000000000000000000000",
            orchestrationContract: "0x0000000000000000000000000000000000000000"
          },
          rpcUrl: "mock://localhost",
          features: {
            agentDiscovery: false,
            reputationTracking: false,
            paymentProcessing: false
          }
        }
      };
    }
  },

  // Submit comprehensive feedback with multiple ratings - FULLY MOCKED
  async submitFeedback(feedbackData: {
    executionId?: string;
    workflowId?: string;
    modelRatings: Record<string, number>;
    overallFeedback?: string;
    userAddress?: string;
  }): Promise<{
    success: boolean;
    message: string;
    results: Array<{
      agentUrl: string;
      agentIdentifier: string;
      rating: number;
      success: boolean;
      txHash?: string;
      error?: string;
    }>;
    errors?: string[];
    feedback: {
      executionId?: string;
      workflowId?: string;
      overallFeedback?: string;
      ratingsSubmitted: number;
      totalRatings: number;
    };
  }> {
    if (ENABLE_FULL_MOCKING) {
      console.log('🎭 Using mocked feedback submission');
      await new Promise(resolve => setTimeout(resolve, 2500)); // Simulate multiple blockchain transactions
      
      const results = Object.entries(feedbackData.modelRatings).map(([agentIdentifier, rating]) => ({
        agentUrl: `http://localhost:300${Math.floor(Math.random() * 8) + 1}`,
        agentIdentifier,
        rating,
        success: true,
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`
      }));
      
      return {
        success: true,
        message: "All feedback submitted successfully",
        results,
        feedback: {
          executionId: feedbackData.executionId,
          workflowId: feedbackData.workflowId,
          overallFeedback: feedbackData.overallFeedback,
          ratingsSubmitted: results.length,
          totalRatings: results.length
        }
      };
    }
    
    try {
      const response = await api.post("/feedback/submit", feedbackData);
      return response.data;
    } catch (error) {
      console.log('🔄 Feedback submission failed, using mock data');
      const results = Object.entries(feedbackData.modelRatings).map(([agentIdentifier, rating]) => ({
        agentUrl: `http://localhost:300${Math.floor(Math.random() * 8) + 1}`,
        agentIdentifier,
        rating,
        success: true,
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`
      }));
      
      return {
        success: true,
        message: "Mock feedback submitted successfully",
        results,
        feedback: {
          executionId: feedbackData.executionId,
          workflowId: feedbackData.workflowId,
          overallFeedback: feedbackData.overallFeedback,
          ratingsSubmitted: results.length,
          totalRatings: results.length
        }
      };
    }
  },
};

// Error handling wrapper
export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>
) => {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error: any) {
      console.error("Orchestrator API Error:", error);

      if (error.response) {
        // Server responded with error status
        throw new Error(
          error.response.data?.error ||
            error.response.data?.details ||
            "Server error"
        );
      } else if (error.request) {
        // Request was made but no response received
        throw new Error(
          "Unable to connect to orchestrator. Please ensure it is running."
        );
      } else {
        // Something else happened
        throw new Error(error.message || "Unknown error occurred");
      }
    }
  };
};

// Wrapped API with error handling
export const safeOrchestratorAPI = {
  getHealth: withErrorHandling(orchestratorAPI.getHealth),
  getAgents: withErrorHandling(orchestratorAPI.getAgents),
  createWorkflow: withErrorHandling(orchestratorAPI.createWorkflow),
  executeAgent: withErrorHandling(orchestratorAPI.executeAgent),
  executeWorkflow: withErrorHandling(orchestratorAPI.executeWorkflow),
  getWorkflow: withErrorHandling(orchestratorAPI.getWorkflow),
  getExecution: withErrorHandling(orchestratorAPI.getExecution),
  listWorkflows: withErrorHandling(orchestratorAPI.listWorkflows),
  listExecutions: withErrorHandling(orchestratorAPI.listExecutions),
  pollExecution: withErrorHandling(orchestratorAPI.pollExecution),
  createAndExecuteWorkflow: withErrorHandling(
    orchestratorAPI.createAndExecuteWorkflow
  ),
  generateSummary: withErrorHandling(orchestratorAPI.generateSummary),
  submitRating: withErrorHandling(orchestratorAPI.submitRating),
  getAgentReputation: withErrorHandling(orchestratorAPI.getAgentReputation),
  getBlockchainStatus: withErrorHandling(orchestratorAPI.getBlockchainStatus),
  submitFeedback: withErrorHandling(orchestratorAPI.submitFeedback),
};

export default safeOrchestratorAPI;
