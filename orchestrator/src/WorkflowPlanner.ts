import OpenAI from "openai";
import fetch from "node-fetch";
import { WorkflowStep, UserIntent, Agent, HttpAgent, MCPAgent } from "./types";

interface AgentWithSchema {
  name: string;
  description: string;
  url: string;
  type: "http" | "mcp";
  inputSchema: any;
  outputSchema: any;
  category?: string;
  tags?: string[];
  tools?: any[]; // For MCP agents
}

export class WorkflowPlanner {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Main entrypoint: fetches all agent schemas, then asks the LLM to plan a workflow.
   */
  async planWorkflow(
    userIntent: UserIntent,
    availableAgents: Agent[]
  ): Promise<WorkflowStep[]> {
    console.log(`🧠 Planning workflow for: "${userIntent.description}"`);
    console.log(`📊 Available agents: ${availableAgents.length}`);
    console.log(
      `📋 Agent list:`,
      availableAgents.map(
        (a) =>
          `${a.name} (${
            a.type === "http"
              ? (a as HttpAgent).url
              : `mcp://${(a as MCPAgent).serverName}`
          })`
      )
    );

    // 1) Fetch schemas for every agent
    const agentsWithSchemas = await this.getAgentSchemas(availableAgents);
    console.log(`📦 Fetched schemas for ${agentsWithSchemas.length} agents`);
    console.log(
      `📝 Agents with valid schemas:`,
      agentsWithSchemas.map(
        (a) =>
          `${a.name} (${a.type}, ${
            Object.keys(a.inputSchema?.properties || {}).length
          } inputs, ${
            Object.keys(a.outputSchema?.properties || {}).length
          } outputs)`
      )
    );

    // 2) Ask the LLM to generate a JSON workflow plan using all schemas + user intent
    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ OPENAI_API_KEY not found in environment");
      throw new Error("OpenAI API key not found in environment.");
    }

    try {
      const steps = await this.llmPlanWorkflow(userIntent, agentsWithSchemas);
      console.log(`✅ LLM planned ${steps.length} workflow steps`);
      return steps;
    } catch (err) {
      console.error("❌ LLM planning failed:", err);
      console.log("🔄 Falling back to rule-based planning");
      return this.fallbackPlanWorkflow(userIntent, agentsWithSchemas);
    }
  }

  /**
   * Fetch schemas from both HTTP and MCP agents
   */
  private async getAgentSchemas(agents: Agent[]): Promise<AgentWithSchema[]> {
    const agentSchemas = await Promise.all(
      agents.map(async (agent) => {
        try {
          if (agent.type === "http") {
            const httpAgent = agent as HttpAgent;
            const resp = await fetch(`${httpAgent.url}/meta`);
            const meta = await resp.json();

            return {
              name: meta.name,
              description: meta.description,
              url: httpAgent.url,
              type: "http" as const,
              inputSchema: meta.inputSchema || {},
              outputSchema: meta.outputSchema || {},
              category: meta.category,
              tags: meta.tags || [],
            } as AgentWithSchema;
          } else {
            // MCP agent
            const mcpAgent = agent as MCPAgent;
            const mcpUrl = `mcp://${mcpAgent.serverName}`;

            return {
              name: mcpAgent.name,
              description: mcpAgent.description,
              url: mcpUrl,
              type: "mcp" as const,
              inputSchema: mcpAgent.inputSchema || {
                type: "object",
                properties: {
                  prompt: { type: "string", description: "Input prompt" },
                  tool: { type: "string", description: "Tool name to execute" },
                  args: { type: "object", description: "Tool arguments" },
                },
                required: ["prompt"],
              },
              outputSchema: mcpAgent.outputSchema || {
                type: "object",
                properties: {
                  result: {
                    type: "object",
                    description: "Tool execution result",
                  },
                },
                required: ["result"],
              },
              category: "mcp",
              tags: mcpAgent.tools?.map((tool) => tool.name) || [],
              tools: mcpAgent.tools || [],
            } as AgentWithSchema;
          }
        } catch (error) {
          console.warn(`⚠️ Failed to fetch schema for ${agent.name}:`, error);
          const url =
            agent.type === "http"
              ? (agent as HttpAgent).url
              : `mcp://${(agent as MCPAgent).serverName}`;
          return {
            name: agent.name,
            description: agent.description,
            url: url,
            type: agent.type,
            inputSchema: {},
            outputSchema: {},
          } as AgentWithSchema;
        }
      })
    );

    return agentSchemas;
  }

  /**
   * Build a single prompt that contains:
   *  - The user's intent/description.
   *  - A JSON dump of every available agent's name, description, inputSchema, outputSchema, tags, etc.
   *  - Clear instructions to return EXACTLY valid JSON listing the steps (with stepId, agentName, inputMapping, outputMapping).
   */
  private buildLLMPlanningPrompt(
    userIntent: UserIntent,
    agents: AgentWithSchema[]
  ): string {
    // 1) USER REQUEST
    const userBlock = `=== USER REQUEST ===
"${userIntent.description}"

Preferences (if any): ${JSON.stringify(userIntent.preferences || {}, null, 2)}
`;

    // 2) AGENT SCHEMAS
    const agentBlocks = agents
      .map((agent, idx) => {
        return `
--- AGENT ${idx + 1} ---
Name: ${agent.name}
Description: ${agent.description}
URL: ${agent.url}
Category: ${agent.category || "N/A"}
Tags: ${agent.tags?.join(", ") || "N/A"}

INPUT SCHEMA:
${JSON.stringify(agent.inputSchema, null, 2)}

OUTPUT SCHEMA:
${JSON.stringify(agent.outputSchema, null, 2)}
`;
      })
      .join("");

    // 3) INSTRUCTIONS
    const instructions = `
You are a powerful AI workflow planner. Based on the USER REQUEST and the EXACT AGENT SCHEMAS provided, produce a valid JSON workflow. 

--- RESPONSE FORMAT REQUIREMENTS ---
• Return ONLY valid JSON (no extra commentary outside of JSON).
• Use this exact structure:

{
  "reasoning": "detailed explanation of why you chose these agents and how you're mapping inputs→outputs",
  "executionMode": "sequential" | "parallel",
  "steps": [
    {
      "stepId": "step_1",
      "agentName": "Exact name of agent (match the 'Name' above)",
      "description": "clear description of what this step accomplishes",
      "inputMapping": {
        "fieldNameInSchema": "sourceValue_or_variable"
      },
      "outputMapping": {
        "fieldNameInSchema": "descriptive_variable_name"
      }
    }
    // ... more steps
  ]
}

--- KEY POINTS ---
1. ONLY use field names that exist in each agent's inputSchema.properties.
2. Ensure ALL required fields (inputSchema.required) are provided via:
   • Direct values from user intent (e.g. if user said "name: Alice", map to that).
   • Or outputs from previous steps (variable names).
   • Or reasonable defaults (if schema has default or enum). 
3. For each step's outputMapping, assign a variable name like "<agentname>_<outputField>".
4. Default workflow to "sequential" UNLESS you identify independent agents that can run in parallel.
5. Explain your reasoning in the "reasoning" field, but do NOT include any additional keys beyond the JSON structure above.

Begin now.
`;

    return `${userBlock}${agentBlocks}${instructions}`;
  }

  /**
   * Calls OpenAI's chat completion endpoint with the constructed prompt,
   * then parses the returned JSON into WorkflowStep[].
   */
  private async llmPlanWorkflow(
    userIntent: UserIntent,
    agents: AgentWithSchema[]
  ): Promise<WorkflowStep[]> {
    console.log(`🤖 Calling LLM with ${agents.length} agent schemas...`);
    const prompt = this.buildLLMPlanningPrompt(userIntent, agents);
    console.log(`📝 Prompt length: ${prompt.length} characters`);

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert AI workflow planner that strictly outputs valid JSON according to instructions.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.0,
      max_tokens: 3000,
    });

    const raw = completion.choices[0]?.message?.content;
    console.log(`🤖 LLM response length: ${raw?.length || 0} characters`);
    console.log(`🤖 LLM response preview: ${raw?.substring(0, 200)}...`);

    if (!raw) {
      throw new Error("No response from LLM");
    }

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
      console.log(`✅ Successfully parsed LLM JSON response`);
      console.log(`📋 Response structure:`, Object.keys(parsed));
    } catch (err) {
      console.error("❌ Failed to parse LLM response as JSON:", raw);
      throw err;
    }

    if (!parsed.steps || !Array.isArray(parsed.steps)) {
      console.error("❌ Invalid workflow JSON: missing 'steps' array");
      console.error("❌ Parsed object:", parsed);
      throw new Error("Invalid workflow JSON: missing 'steps' array");
    }

    console.log(`📋 LLM planned ${parsed.steps.length} steps`);
    parsed.steps.forEach((step: any, idx: number) => {
      console.log(
        `   Step ${idx + 1}: ${step.agentName} - ${step.description}`
      );
    });

    // Convert each step into our internal WorkflowStep type (with agentUrl looked up by name)
    const steps: WorkflowStep[] = parsed.steps.map((step: any, idx: number) => {
      // Find the agent to retrieve its URL
      const agentInfo = agents.find((a) => a.name === step.agentName);
      if (!agentInfo) {
        console.error(
          `❌ Agent "${step.agentName}" not found among fetched schemas.`
        );
        console.error(
          `❌ Available agents:`,
          agents.map((a) => a.name)
        );
        throw new Error(
          `Agent "${step.agentName}" not found among fetched schemas.`
        );
      }

      return {
        stepId: step.stepId || `step_${idx + 1}`,
        agentName: agentInfo.name,
        agentUrl: agentInfo.url,
        description: step.description || `Execute ${agentInfo.name}`,
        inputMapping: step.inputMapping || {},
        outputMapping: step.outputMapping || {},
      } as WorkflowStep;
    });

    console.log(`✅ Converted to ${steps.length} WorkflowStep objects`);
    return steps;
  }

  /**
   * Fallback planning when OpenAI API fails
   */
  private fallbackPlanWorkflow(
    userIntent: UserIntent,
    agents: AgentWithSchema[]
  ): WorkflowStep[] {
    const intent = userIntent.description.toLowerCase();
    console.log(`🔄 Using fallback planning for: ${intent}`);

    // Find available agent types
    const availableAgents = {
      greeting: agents.find(
        (a) =>
          a.name.toLowerCase().includes("hello") ||
          a.name.toLowerCase().includes("greet")
      ),
      image: agents.find(
        (a) =>
          a.name.toLowerCase().includes("dall") ||
          a.name.toLowerCase().includes("image")
      ),
      nft: agents.find(
        (a) =>
          a.name.toLowerCase().includes("nft") ||
          a.name.toLowerCase().includes("deploy")
      ),
      akave: agents.find(
        (a) => a.name.toLowerCase() === "akave" || a.type === "mcp"
      ),
    };

    console.log(
      "🔍 Found agents:",
      Object.fromEntries(
        Object.entries(availableAgents).map(([key, agent]) => [
          key,
          agent?.name || "none",
        ])
      )
    );

    const steps: WorkflowStep[] = [];

    // Akave storage patterns
    if (
      (intent.includes("bucket") ||
        intent.includes("akave") ||
        intent.includes("store") ||
        intent.includes("put")) &&
      availableAgents.akave
    ) {
      console.log("📦 Creating Akave storage workflow");
      steps.push({
        stepId: "step_1",
        agentName: availableAgents.akave.name,
        agentUrl: availableAgents.akave.url,
        description: "Store content in Akave bucket",
        inputMapping: {
          prompt: "userInput",
        },
        outputMapping: {
          result: "akave_result",
        },
      });
    }
    // Image generation workflows
    else if (
      intent.includes("image") &&
      availableAgents.image &&
      !intent.includes("put")
    ) {
      console.log("🎨 Creating image generation workflow");
      steps.push({
        stepId: "step_1",
        agentName: availableAgents.image.name,
        agentUrl: availableAgents.image.url,
        description: "Generate image using DALL-E",
        inputMapping: {
          prompt: "userInput",
        },
        outputMapping: {
          imageUrl: "generated_image",
        },
      });
    }
    // NFT creation workflows
    else if (intent.includes("nft") && availableAgents.nft) {
      console.log("🎨 Creating NFT workflow: Image + NFT");

      if (availableAgents.image) {
        steps.push({
          stepId: "step_1",
          agentName: availableAgents.image.name,
          agentUrl: availableAgents.image.url,
          description:
            "Generate a thank you NFT image themed around ETH Global Prague attendance.",
          inputMapping: {
            prompt:
              "Thank you NFT for attending ETH Global Prague, digital art, celebratory, Ethereum theme",
            size: "1024x1024",
            quality: "standard",
            style: "vivid",
          },
          outputMapping: {
            imageUrl: "generatedImageUrl",
          },
        });
      }

      steps.push({
        stepId: "step_2",
        agentName: availableAgents.nft.name,
        agentUrl: availableAgents.nft.url,
        description:
          "Mint and send the thank you NFT to the recipient address with event-specific metadata.",
        inputMapping: {
          imageUrl: "generatedImageUrl",
          collectionName: "ETH Global Prague 2025 Thank You NFTs",
          recipientAddress: "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e",
          tokenName: "Thank You for Attending ETH Global Prague",
          description:
            "A special NFT to thank you for attending ETH Global Prague 2025.",
          attributes:
            '[{"trait_type":"Event","value":"ETH Global Prague 2025"},{"trait_type":"Type","value":"Thank You"}]',
        },
        outputMapping: {
          transactionHash: "nftTransactionHash",
          tokenId: "nftTokenId",
        },
      });
    }
    // Greeting workflows
    else if (intent.includes("hello") || intent.includes("greet")) {
      console.log("👋 Creating greeting workflow");
      if (availableAgents.greeting) {
        steps.push({
          stepId: "step_1",
          agentName: availableAgents.greeting.name,
          agentUrl: availableAgents.greeting.url,
          description: "Generate personalized greeting",
          inputMapping: {
            prompt: "userInput",
          },
          outputMapping: {
            message: "greeting_message",
          },
        });
      }
    }

    console.log(`✅ Created ${steps.length} steps in fallback planning`);
    return steps;
  }
}
