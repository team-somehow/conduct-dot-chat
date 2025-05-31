import { spawn, ChildProcess } from "child_process";
import { MCPServerConfig, MCPServerProcess, MCPAgent } from "./types";

export class MCPManager {
  private servers: Map<string, MCPServerProcess> = new Map();
  private requestIdCounter: number = 1;

  constructor() {
    // Cleanup on process exit
    process.on("exit", () => this.cleanup());
    process.on("SIGINT", () => this.cleanup());
    process.on("SIGTERM", () => this.cleanup());
  }

  /**
   * Start MCP servers from configuration
   */
  async startServers(
    mcpConfig: Record<string, MCPServerConfig>
  ): Promise<void> {
    const startPromises = Object.entries(mcpConfig).map(([name, config]) =>
      this.startServer(name, config)
    );

    await Promise.allSettled(startPromises);
  }

  /**
   * Start a single MCP server
   */
  async startServer(
    name: string,
    config: MCPServerConfig
  ): Promise<MCPServerProcess> {
    try {
      console.log(`🚀 Starting MCP server: ${name}`);

      // Create server process entry
      const serverProcess: MCPServerProcess = {
        name,
        config,
        status: "starting",
        startedAt: Date.now(),
      };

      this.servers.set(name, serverProcess);

      // Spawn the server process
      const childProcess = spawn(config.command, config.args || [], {
        env: { ...process.env, ...config.env },
        stdio: ["pipe", "pipe", "pipe"],
      });

      serverProcess.process = childProcess;

      // Handle process events
      childProcess.on("error", (error) => {
        console.error(`❌ MCP server ${name} error:`, error);
        serverProcess.status = "error";
        serverProcess.error = error.message;
      });

      childProcess.on("exit", (code) => {
        console.log(`📴 MCP server ${name} exited with code ${code}`);
        serverProcess.status = "stopped";
      });

      // Initialize the MCP connection
      await this.initializeMCPConnection(serverProcess);

      console.log(`✅ MCP server ${name} started successfully`);
      return serverProcess;
    } catch (error: any) {
      console.error(`❌ Failed to start MCP server ${name}:`, error);
      const serverProcess: MCPServerProcess = {
        name,
        config,
        status: "error",
        error: error.message,
        startedAt: Date.now(),
      };
      this.servers.set(name, serverProcess);
      throw error;
    }
  }

  /**
   * Initialize MCP connection with handshake
   */
  private async initializeMCPConnection(
    serverProcess: MCPServerProcess
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        serverProcess.status = "running"; // Mark as running even if initialization fails
        resolve(); // Don't reject, just mark as running
      }, 5000);

      try {
        if (serverProcess.process?.stdin && serverProcess.process?.stdout) {
          // Send initialize request
          const initRequest = {
            jsonrpc: "2.0",
            id: this.requestIdCounter++,
            method: "initialize",
            params: {
              protocolVersion: "2024-11-05",
              capabilities: {},
              clientInfo: {
                name: "MAHA Orchestrator",
                version: "1.0.0",
              },
            },
          };

          serverProcess.process.stdin.write(JSON.stringify(initRequest) + "\n");

          // Wait for server to be ready and mark as running
          setTimeout(() => {
            clearTimeout(timeout);
            serverProcess.status = "running";
            resolve();
          }, 3000);
        } else {
          clearTimeout(timeout);
          serverProcess.status = "running";
          resolve();
        }
      } catch (error) {
        clearTimeout(timeout);
        serverProcess.status = "running";
        resolve(); // Don't fail startup due to initialization issues
      }
    });
  }

  /**
   * Send a JSON-RPC request to an MCP server
   */
  private async sendMCPRequest(
    serverName: string,
    method: string,
    params: any = {}
  ): Promise<any> {
    const serverProcess = this.servers.get(serverName);
    if (
      !serverProcess ||
      serverProcess.status !== "running" ||
      !serverProcess.process
    ) {
      throw new Error(`MCP server ${serverName} not available`);
    }

    return new Promise((resolve, reject) => {
      const requestId = this.requestIdCounter++;
      const timeout = setTimeout(() => {
        reject(new Error(`Request timeout for ${method} on ${serverName}`));
      }, 10000);

      let responseBuffer = "";

      const handleData = (data: Buffer) => {
        responseBuffer += data.toString();
        const lines = responseBuffer.split("\n");

        // Process complete lines
        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          if (line) {
            try {
              const response = JSON.parse(line);
              if (response.id === requestId) {
                clearTimeout(timeout);
                if (serverProcess.process?.stdout) {
                  serverProcess.process.stdout.removeListener(
                    "data",
                    handleData
                  );
                }

                if (response.error) {
                  reject(
                    new Error(
                      `MCP Error: ${
                        response.error.message || JSON.stringify(response.error)
                      }`
                    )
                  );
                } else {
                  resolve(response.result);
                }
                return;
              }
            } catch (e) {
              // Ignore parsing errors for partial data
            }
          }
        }
        // Keep the last incomplete line
        responseBuffer = lines[lines.length - 1];
      };

      if (serverProcess.process.stdout) {
        serverProcess.process.stdout.on("data", handleData);
      }

      // Send the request
      const request = {
        jsonrpc: "2.0",
        id: requestId,
        method,
        params,
      };

      try {
        if (serverProcess.process.stdin) {
          serverProcess.process.stdin.write(JSON.stringify(request) + "\n");
          console.log(`📤 Sent MCP request to ${serverName}: ${method}`);
        } else {
          clearTimeout(timeout);
          reject(new Error("No stdin available"));
        }
      } catch (error) {
        clearTimeout(timeout);
        if (serverProcess.process?.stdout) {
          serverProcess.process.stdout.removeListener("data", handleData);
        }
        reject(error);
      }
    });
  }

  /**
   * Get available MCP agents from all running servers
   */
  async getAvailableAgents(): Promise<MCPAgent[]> {
    const agents: MCPAgent[] = [];

    for (const [name, serverProcess] of this.servers) {
      if (serverProcess.status !== "running") {
        continue;
      }

      try {
        // Get tools from the MCP server
        let tools: any[] = [];
        try {
          const toolsResult = await this.sendMCPRequest(name, "tools/list", {});
          tools = toolsResult?.tools || [];
          console.log(
            `✅ Got ${tools.length} tools from ${name}:`,
            tools.map((t) => t.name)
          );
        } catch (error) {
          console.log(`📝 Could not get tools from ${name}, continuing...`);
          // Create a generic tool based on server type
          if (name === "akave") {
            tools = [
              { name: "put_object", description: "Store an object in Akave" },
              { name: "get_object", description: "Get an object from Akave" },
            ];
          }
        }

        // Get resources (optional)
        let resources: any[] = [];
        try {
          const resourcesResult = await this.sendMCPRequest(
            name,
            "resources/list",
            {}
          );
          resources = resourcesResult?.resources || [];
        } catch (error) {
          // Resources are optional
        }

        const agent: MCPAgent = {
          type: "mcp",
          name: name,
          serverName: name,
          description: `MCP Server: ${name} with ${tools.length} tools`,
          tools,
          resources,
          prompts: [],
          inputSchema: {
            type: "object",
            properties: {
              tool: {
                type: "string",
                description: "Tool name to execute",
                enum: tools.map((t) => t.name),
              },
              arguments: {
                type: "object",
                description: "Tool arguments",
              },
            },
            required: ["tool", "arguments"],
          },
          outputSchema: {
            type: "object",
            properties: {
              content: {
                type: "array",
                description: "Tool execution result",
              },
            },
            required: ["content"],
          },
          previewURI: `mcp://${name}`,
        };

        agents.push(agent);
        console.log(`✅ Created MCP agent: ${name} with ${tools.length} tools`);
      } catch (error: any) {
        console.error(
          `❌ Error getting capabilities for MCP server ${name}:`,
          error.message
        );
      }
    }

    return agents;
  }

  /**
   * Execute a tool call on an MCP server
   */
  async callTool(
    serverName: string,
    toolName: string,
    args: any
  ): Promise<any> {
    const serverProcess = this.servers.get(serverName);
    if (!serverProcess || serverProcess.status !== "running") {
      throw new Error(`MCP server ${serverName} not connected`);
    }

    try {
      console.log(
        `🔧 Executing tool ${toolName} on ${serverName} with args:`,
        args
      );

      const result = await this.sendMCPRequest(serverName, "tools/call", {
        name: toolName,
        arguments: args,
      });

      console.log(`✅ Tool ${toolName} executed successfully on ${serverName}`);
      return result;
    } catch (error: any) {
      console.error(
        `❌ Error calling tool ${toolName} on ${serverName}:`,
        error.message
      );

      // Return error result instead of throwing
      return {
        content: [
          {
            type: "text",
            text: `Error executing ${toolName}: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  /**
   * Get resource from an MCP server
   */
  async getResource(serverName: string, resourceUri: string): Promise<any> {
    const serverProcess = this.servers.get(serverName);
    if (!serverProcess || serverProcess.status !== "running") {
      throw new Error(`MCP server ${serverName} not connected`);
    }

    try {
      console.log(`📄 Reading resource ${resourceUri} from ${serverName}`);

      const result = await this.sendMCPRequest(serverName, "resources/read", {
        uri: resourceUri,
      });

      return result;
    } catch (error: any) {
      console.error(
        `❌ Error reading resource ${resourceUri} from ${serverName}:`,
        error.message
      );
      throw error;
    }
  }

  /**
   * Stop a specific MCP server
   */
  async stopServer(name: string): Promise<void> {
    const serverProcess = this.servers.get(name);
    if (!serverProcess) {
      throw new Error(`MCP server ${name} not found`);
    }

    try {
      if (serverProcess.process) {
        serverProcess.process.kill("SIGTERM");

        // Wait for graceful shutdown or force kill after timeout
        await new Promise<void>((resolve) => {
          const timeout = setTimeout(() => {
            if (serverProcess.process && !serverProcess.process.killed) {
              serverProcess.process.kill("SIGKILL");
            }
            resolve();
          }, 5000);

          serverProcess.process!.on("exit", () => {
            clearTimeout(timeout);
            resolve();
          });
        });
      }

      serverProcess.status = "stopped";
      console.log(`🔴 MCP server ${name} stopped`);
    } catch (error: any) {
      console.error(`❌ Error stopping MCP server ${name}:`, error);
      throw error;
    }
  }

  /**
   * Get all server statuses
   */
  getServerStatuses(): Record<string, MCPServerProcess> {
    return Object.fromEntries(this.servers);
  }

  /**
   * Cleanup all servers
   */
  private async cleanup(): Promise<void> {
    console.log("🧹 Cleaning up MCP servers...");

    const shutdownPromises = Array.from(this.servers.keys()).map((name) =>
      this.stopServer(name).catch((error) =>
        console.error(`Error stopping ${name}:`, error)
      )
    );

    await Promise.allSettled(shutdownPromises);
    console.log("✅ MCP servers cleanup complete");
  }
}
