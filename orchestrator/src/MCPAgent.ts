import { MCPManager } from "./MCPManager";
import { MCPAgent as MCPAgentType } from "./types";
import { ValidateFunction } from "ajv";
import Ajv from "ajv";

export interface MCPAgentAdapter {
  url: string; // Virtual URL for compatibility
  name: string;
  description: string;
  serverName: string;
  inputValidate: ValidateFunction;
  outputValidate: ValidateFunction;
  tools: any[];
  resources?: any[];
  prompts?: any[];
  previewURI: string;
}

/**
 * Adapter class that makes MCP servers compatible with the existing HTTP agent interface
 */
export class MCPAgentService {
  private mcpManager: MCPManager;
  private ajv: Ajv;

  constructor(mcpManager: MCPManager) {
    this.mcpManager = mcpManager;
    this.ajv = new Ajv({ strict: false });
  }

  /**
   * Convert MCP agents to HTTP-compatible agent adapters
   */
  async getMCPAgentAdapters(): Promise<MCPAgentAdapter[]> {
    const mcpAgents = await this.mcpManager.getAvailableAgents();
    return mcpAgents.map((agent) => this.createAgentAdapter(agent));
  }

  /**
   * Create an agent adapter from an MCP agent
   */
  private createAgentAdapter(mcpAgent: MCPAgentType): MCPAgentAdapter {
    return {
      url: `mcp://${mcpAgent.serverName}`, // Virtual URL for compatibility
      name: mcpAgent.name,
      description: mcpAgent.description,
      serverName: mcpAgent.serverName,
      tools: mcpAgent.tools,
      resources: mcpAgent.resources,
      prompts: mcpAgent.prompts,
      previewURI: mcpAgent.previewURI,
      inputValidate: this.ajv.compile(mcpAgent.inputSchema),
      outputValidate: this.ajv.compile(mcpAgent.outputSchema),
    };
  }

  /**
   * Execute an MCP agent task (compatible with HTTP agent interface)
   */
  async runMCPAgent<TIn, TOut>(
    adapter: MCPAgentAdapter,
    input: TIn
  ): Promise<TOut> {
    // Validate input
    if (!adapter.inputValidate(input)) {
      console.warn(
        `Input schema mismatch for MCP agent ${adapter.name}, proceeding anyway`
      );
    }

    try {
      let result: any;

      // Handle different input formats
      if (this.isToolCall(input)) {
        // Direct tool call
        const { tool, args } = input as any;
        result = await this.mcpManager.callTool(adapter.serverName, tool, args);
      } else if (this.isPromptInput(input)) {
        // Handle prompt-based input - smart routing for Akave
        result = await this.handlePromptInput(adapter, input);
      } else {
        // Try to infer the best tool to use
        result = await this.inferAndExecuteTool(adapter, input);
      }

      // Validate output
      if (!adapter.outputValidate(result)) {
        console.warn(
          `Output schema mismatch for MCP agent ${adapter.name}, proceeding anyway`
        );
      }

      return result as TOut;
    } catch (error: any) {
      throw new Error(
        `MCP agent execution failed for ${adapter.name}: ${error.message}`
      );
    }
  }

  /**
   * Check if input is a direct tool call
   */
  private isToolCall(input: any): boolean {
    return (
      input && typeof input === "object" && "tool" in input && "args" in input
    );
  }

  /**
   * Check if input is prompt-based
   */
  private isPromptInput(input: any): boolean {
    return input && typeof input === "object" && "prompt" in input;
  }

  /**
   * Handle prompt-based input by finding the best tool
   */
  private async handlePromptInput(
    adapter: MCPAgentAdapter,
    input: any
  ): Promise<any> {
    const prompt = input.prompt || input.description || "";

    console.log(`🤖 Processing prompt for ${adapter.serverName}: "${prompt}"`);

    // Generic MCP tool handling - let the LLM decide which tool to use
    if (adapter.tools.length === 0) {
      throw new Error(`No tools available for MCP agent ${adapter.name}`);
    }

    // If only one tool, use it
    if (adapter.tools.length === 1) {
      const tool = adapter.tools[0];
      return await this.mcpManager.callTool(adapter.serverName, tool.name, {
        prompt,
      });
    }

    // For multiple tools, try to infer the best one based on the prompt
    const bestTool = this.inferBestTool(adapter.tools, prompt);
    return await this.mcpManager.callTool(adapter.serverName, bestTool.name, {
      prompt,
    });
  }

  /**
   * Infer and execute the best tool for the given input
   */
  private async inferAndExecuteTool(
    adapter: MCPAgentAdapter,
    input: any
  ): Promise<any> {
    if (adapter.tools.length === 0) {
      throw new Error(`No tools available for MCP agent ${adapter.name}`);
    }

    // If only one tool, use it
    if (adapter.tools.length === 1) {
      const tool = adapter.tools[0];
      return await this.mcpManager.callTool(
        adapter.serverName,
        tool.name,
        input
      );
    }

    // For multiple tools, use the first one (could be made smarter)
    const tool = adapter.tools[0];
    return await this.mcpManager.callTool(adapter.serverName, tool.name, input);
  }

  /**
   * Infer the best tool based on prompt content
   */
  private inferBestTool(tools: any[], prompt: string): any {
    // Simple heuristic: match keywords in tool names/descriptions
    const promptLower = prompt.toLowerCase();

    // Look for exact matches in tool names
    for (const tool of tools) {
      if (tool.name && promptLower.includes(tool.name.toLowerCase())) {
        return tool;
      }
    }

    // Look for keyword matches in descriptions
    for (const tool of tools) {
      if (tool.description) {
        const descWords = tool.description.toLowerCase().split(/\s+/);
        for (const word of descWords) {
          if (word.length > 3 && promptLower.includes(word)) {
            return tool;
          }
        }
      }
    }

    // Fallback to first tool
    return tools[0];
  }

  /**
   * Get MCP server status information
   */
  getServerStatuses(): Record<string, any> {
    return this.mcpManager.getServerStatuses();
  }

  /**
   * Check if a URL is an MCP URL
   */
  static isMCPUrl(url: string): boolean {
    return url.startsWith("mcp://");
  }

  /**
   * Extract server name from MCP URL
   */
  static extractServerName(mcpUrl: string): string {
    return mcpUrl.replace("mcp://", "");
  }
}
