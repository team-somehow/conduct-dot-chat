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
  ): Promise<WorkflowStep[] | undefined> {
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
      // console.log("🔄 Falling back to rule-based planning");
      // return this.fallbackPlanWorkflow(userIntent, agentsWithSchemas);
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

    // 3) WORKFLOW GUIDANCE
    const workflowGuidance = `
=== COMMON WORKFLOW PATTERNS ===

When planning workflows, consider these common patterns:

**NFT CREATION WORKFLOWS:**
For requests involving NFT creation, minting, or collections, use this sequence:
1. Image Generation Agent (if image needed) → generates image URL
2. NFT Metadata Creator Agent → creates OpenSea-compliant metadata JSON from image + details
3. NFT Deployer Agent → mints/deploys NFT using the metadata URL

**IMPORTANT FOR NFT WORKFLOWS:**
- Step 2 outputMapping should map "metadataUrl" to "nft_metadata_url"
- Step 3 inputMapping should map "metadataUrl" to "nft_metadata_url" (inside the mints array)
- For complex fields like arrays, use simple variable references that will be dynamically constructed

**IMAGE WORKFLOWS:**
- Use Image Generation agents for creating new images
- Pass generated imageUrl to subsequent agents that need images

**BLOCKCHAIN WORKFLOWS:**
- Check wallet balances before transactions
- Use appropriate deployer agents for smart contracts
- Consider gas fees and network selection

**DATA FLOW:**
- Always map outputs from one step as inputs to the next step
- Use descriptive variable names like "generated_image_url", "metadata_url", "nft_contract_address"
- Ensure required fields are properly mapped between agents

**AGENT SELECTION:**
- Choose agents based on their descriptions and capabilities
- Look at agent tags to understand their specializations
- Prefer specialized agents over generic ones when available
`;

    // 4) INSTRUCTIONS
    const instructions = `
You are a powerful AI workflow planner. Based on the USER REQUEST and the EXACT AGENT SCHEMAS provided, produce a valid JSON workflow that intelligently chains agents together.

--- WORKFLOW PLANNING RULES ---
• Analyze the user's intent carefully - what is the end goal?
• Choose the RIGHT SEQUENCE of agents to accomplish the goal
• For NFT-related requests, follow the pattern: Image Gen → Metadata Creator → NFT Deployer
• Map outputs from previous steps as inputs to subsequent steps
• Use the exact field names from each agent's input/output schemas
• Provide descriptive variable names for data passing between steps

--- RESPONSE FORMAT REQUIREMENTS ---
• Return ONLY valid JSON (no extra commentary outside of JSON).
• Use this exact structure:

{
  "reasoning": "detailed explanation of why you chose these agents in this sequence and how data flows between them",
  "executionMode": "sequential" | "parallel",
  "steps": [
    {
      "stepId": "step_1",
      "agentName": "Exact name of agent (match the 'Name' above)",
      "description": "clear description of what this step accomplishes",
      "inputMapping": {
        "fieldNameInSchema": "sourceValue_or_variable_from_previous_step"
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
3. For each step's outputMapping, assign a variable name like "<purpose>_<field>" (e.g. "generated_image_url", "nft_metadata_url").
4. Default workflow to "sequential" UNLESS you identify independent agents that can run in parallel.
5. Think step-by-step about what the user wants to achieve and plan the most logical sequence.
6. Explain your reasoning thoroughly, including why you chose each agent and how data flows between them.

Begin now.
`;

    return `${userBlock}${agentBlocks}${workflowGuidance}${instructions}`;
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
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert AI workflow planner that strictly outputs valid JSON according to instructions. Please make sure the output is valid JSON and does not contain any comments or other non-JSON content, it is very important that the output is valid JSON. Do not include any other text or commentary in your response. Valid JSON means that the output is a valid JSON object with the correct structure and all required fields are present.",
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

  // /**
  //  * Fallback planning when OpenAI API fails
  //  */
  // private fallbackPlanWorkflow(
  //   userIntent: UserIntent,
  //   agents: AgentWithSchema[]
  // ): WorkflowStep[] {
  //   const intent = userIntent.description.toLowerCase();
  //   console.log(`🔄 Using fallback planning for: ${intent}`);

  //   // Find available agent types
  //   const httpAgents = agents.filter((a) => a.type === "http");
  //   const mcpAgents = agents.filter((a) => a.type === "mcp");

  //   console.log("🔍 Found agents:", {
  //     http: httpAgents.map((a) => a.name),
  //     mcp: mcpAgents.map((a) => a.name),
  //   });

  //   const steps: WorkflowStep[] = [];

  //   // Simple single-step fallback - just use the first relevant agent
  //   if (
  //     mcpAgents.length > 0 &&
  //     (intent.includes("bucket") ||
  //       intent.includes("store") ||
  //       intent.includes("put") ||
  //       intent.includes("list"))
  //   ) {
  //     console.log("📦 Creating MCP workflow");
  //     const mcpAgent = mcpAgents[0]; // Use first MCP agent
  //     steps.push({
  //       stepId: "step_1",
  //       agentName: mcpAgent.name,
  //       agentUrl: mcpAgent.url,
  //       description: `Use ${mcpAgent.name} to handle: ${userIntent.description}`,
  //       inputMapping: {
  //         prompt: userIntent.description,
  //       },
  //       outputMapping: {
  //         result: "mcp_result",
  //       },
  //     });
  //   }
  //   // Image generation workflows
  //   else if (intent.includes("image") && !intent.includes("put")) {
  //     const imageAgent = httpAgents.find(
  //       (a) =>
  //         a.name.toLowerCase().includes("dall") ||
  //         a.name.toLowerCase().includes("image")
  //     );
  //     if (imageAgent) {
  //       console.log("🎨 Creating image generation workflow");
  //       steps.push({
  //         stepId: "step_1",
  //         agentName: imageAgent.name,
  //         agentUrl: imageAgent.url,
  //         description: "Generate image using DALL-E",
  //         inputMapping: {
  //           prompt: userIntent.description,
  //         },
  //         outputMapping: {
  //           imageUrl: "generated_image",
  //         },
  //       });
  //     }
  //   }
  //   // NFT creation workflows
  //   else if (intent.includes("nft")) {
  //     const nftAgent = httpAgents.find(
  //       (a) =>
  //         a.name.toLowerCase().includes("nft") ||
  //         a.name.toLowerCase().includes("deploy")
  //     );
  //     const imageAgent = httpAgents.find(
  //       (a) =>
  //         a.name.toLowerCase().includes("dall") ||
  //         a.name.toLowerCase().includes("image")
  //     );

  //     if (nftAgent) {
  //       console.log("🎨 Creating NFT workflow");

  //       if (imageAgent && !intent.includes("dont generate")) {
  //         steps.push({
  //           stepId: "step_1",
  //           agentName: imageAgent.name,
  //           agentUrl: imageAgent.url,
  //           description: "Generate NFT image",
  //           inputMapping: {
  //             prompt: userIntent.description,
  //           },
  //           outputMapping: {
  //             imageUrl: "generatedImageUrl",
  //           },
  //         });
  //       }

  //       steps.push({
  //         stepId: steps.length === 0 ? "step_1" : "step_2",
  //         agentName: nftAgent.name,
  //         agentUrl: nftAgent.url,
  //         description: "Mint NFT",
  //         inputMapping: {
  //           prompt: userIntent.description,
  //         },
  //         outputMapping: {
  //           transactionHash: "nftTransactionHash",
  //           tokenId: "nftTokenId",
  //         },
  //       });
  //     }
  //   }
  //   // Greeting workflows
  //   else if (intent.includes("hello") || intent.includes("greet")) {
  //     const greetingAgent = httpAgents.find(
  //       (a) =>
  //         a.name.toLowerCase().includes("hello") ||
  //         a.name.toLowerCase().includes("greet")
  //     );
  //     if (greetingAgent) {
  //       console.log("👋 Creating greeting workflow");
  //       steps.push({
  //         stepId: "step_1",
  //         agentName: greetingAgent.name,
  //         agentUrl: greetingAgent.url,
  //         description: "Generate personalized greeting",
  //         inputMapping: {
  //           prompt: userIntent.description,
  //         },
  //         outputMapping: {
  //           message: "greeting_message",
  //         },
  //       });
  //     }
  //   }

  //   console.log(`✅ Created ${steps.length} steps in fallback planning`);
  //   return steps;
  // }
}
