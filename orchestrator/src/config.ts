import dotenv from "dotenv";
import { MCPServersConfig } from "./types";
import fs from "fs";
import path from "path";

// Load environment variables
dotenv.config();

export const AGENTS = [
  "http://localhost:3001", // Hello World Agent
  "http://localhost:3002", // DALL-E 3 Image Generator Agent
  "http://localhost:3003", // NFT Deployer Agent
  "http://localhost:3004", // 1inch Balance Agent
  "http://localhost:3005", // Aave Investor Agent
  "http://localhost:3006", // NFT Metadata Creator Agent
];

// Basic configuration (no blockchain for now)
export const config = {
  PORT: process.env.PORT || 8080,
  NODE_ENV: process.env.NODE_ENV || "development",
};

/**
 * Load MCP server configuration from various sources
 */
export function loadMCPConfig(): MCPServersConfig {
  // Default empty configuration
  let mcpConfig: MCPServersConfig = { mcpServers: {} };

  // Try to load from environment variable first
  if (process.env.MCP_CONFIG) {
    try {
      const envConfig = JSON.parse(process.env.MCP_CONFIG);
      mcpConfig = envConfig;
      console.log("📋 Loaded MCP config from environment variable");
    } catch (error) {
      console.error("❌ Failed to parse MCP config from environment:", error);
    }
  }

  // Try to load from mcp.json file in various locations
  const configPaths = [
    path.join(process.cwd(), "mcp.json"),
    path.join(process.cwd(), ".mcp.json"),
    path.join(process.cwd(), "config", "mcp.json"),
    path.join(process.cwd(), "orchestrator", "mcp.json"),
    path.join(process.cwd(), "orchestrator", ".mcp.json"),
  ];

  for (const configPath of configPaths) {
    try {
      if (fs.existsSync(configPath)) {
        const fileContent = fs.readFileSync(configPath, "utf8");
        const fileConfig = JSON.parse(fileContent);

        // Merge with existing config
        mcpConfig = {
          mcpServers: {
            ...mcpConfig.mcpServers,
            ...fileConfig.mcpServers,
          },
        };

        console.log(`📋 Loaded MCP config from ${configPath}`);
        break;
      }
    } catch (error) {
      console.warn(`⚠️  Failed to load MCP config from ${configPath}:`, error);
    }
  }

  // Add example MCP server if no configuration found
  if (Object.keys(mcpConfig.mcpServers).length === 0) {
    console.log("📋 No MCP configuration found, using example Akave server");
    mcpConfig = {
      mcpServers: {
        akave: {
          command: "npx",
          args: ["-y", "akave-mcp-js"],
          env: {
            AKAVE_ACCESS_KEY_ID:
              process.env.AKAVE_ACCESS_KEY_ID || "O3_6THFMI6LDIIJR41QF",
            AKAVE_SECRET_ACCESS_KEY:
              process.env.AKAVE_SECRET_ACCESS_KEY ||
              "b7DBOkhUhuWbEas4tScYer4E0YzRfyEa7DvLLJ11",
            AKAVE_ENDPOINT_URL:
              process.env.AKAVE_ENDPOINT_URL || "https://o3-rc1.akave.xyz",
          },
        },
      },
    };
  }

  return mcpConfig;
}

/**
 * Create a sample MCP configuration file for users
 */
export function createSampleMCPConfig(): string {
  const sampleConfig: MCPServersConfig = {
    mcpServers: {
      akave: {
        command: "npx",
        args: ["-y", "akave-mcp-js"],
        env: {
          AKAVE_ACCESS_KEY_ID: "your_access_key_here",
          AKAVE_SECRET_ACCESS_KEY: "your_secret_key_here",
          AKAVE_ENDPOINT_URL: "https://o3-rc1.akave.xyz",
        },
      },
      "github-mcp": {
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-github"],
        env: {
          GITHUB_TOKEN: "your_github_token_here",
        },
      },
      "filesystem-mcp": {
        command: "npx",
        args: [
          "-y",
          "@modelcontextprotocol/server-filesystem",
          "/path/to/allowed/directory",
        ],
        timeout: 30000,
      },
      "fetch-mcp": {
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-fetch"],
      },
    },
  };

  return JSON.stringify(sampleConfig, null, 2);
}

/**
 * Validate MCP configuration
 */
export function validateMCPConfig(config: MCPServersConfig): string[] {
  const errors: string[] = [];

  if (!config.mcpServers || typeof config.mcpServers !== "object") {
    errors.push("mcpServers must be an object");
    return errors;
  }

  for (const [serverName, serverConfig] of Object.entries(config.mcpServers)) {
    if (!serverName || serverName.length === 0) {
      errors.push("Server name cannot be empty");
      continue;
    }

    if (serverName.length > 250) {
      errors.push(
        `Server name "${serverName}" is too long (max 250 characters)`
      );
    }

    if (!serverConfig.command || typeof serverConfig.command !== "string") {
      errors.push(`Server "${serverName}" must have a command string`);
    }

    if (serverConfig.args && !Array.isArray(serverConfig.args)) {
      errors.push(`Server "${serverName}" args must be an array`);
    }

    if (serverConfig.env && typeof serverConfig.env !== "object") {
      errors.push(`Server "${serverName}" env must be an object`);
    }

    if (
      serverConfig.timeout &&
      (typeof serverConfig.timeout !== "number" || serverConfig.timeout <= 0)
    ) {
      errors.push(`Server "${serverName}" timeout must be a positive number`);
    }
  }

  return errors;
}
