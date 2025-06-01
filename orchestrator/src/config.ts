import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { MCPServersConfig } from "./types";

// Load environment variables
dotenv.config();

export const AGENTS = [
  // "http://localhost:3001", // Hello World Agent (commented out)
  "http://localhost:7030", // DALL-E 3 Image Generator Agent
  "http://localhost:7031", // NFT Deployer Agent
  "http://localhost:7032", // 1inch Balance Agent
  "http://localhost:7033", // Aave Investor Agent
  "http://localhost:7034", // NFT Metadata Creator Agent
];

// Flow EVM Testnet Configuration - Deployed Contracts
export const FLOW_EVM_CONFIG = {
  NETWORK_NAME: "Flow EVM Testnet",
  CHAIN_ID: 545,
  RPC_URL: "https://testnet.evm.nodes.onflow.org",
  BLOCK_EXPLORER: "https://evm-testnet.flowscan.io",
  GAS_PRICE: "2000000000", // 2 gwei in wei

  // Deployed Contract Addresses
  CONTRACTS: {
    AgentRegistry: "0x0dcCe2649be92E4457d9d381D8173f3fD7FcAA68",
    ReputationLayer: "0xDE36662dD44343a65a60FB6c1927A2FCB042936e",
    OrchestrationContract: "0xBE0caD36B87c428a2d67e73f6738B321A86547df",
  },

  // Private key for blockchain transactions (from .env)
  PRIVATE_KEY: process.env.MY_METAMASK_PRIVATE_KEY,
};

// Hedera Testnet Configuration - Deployed Contracts
export const HEDERA_CONFIG = {
  NETWORK_NAME: "Hedera Testnet",
  CHAIN_ID: 296,
  RPC_URL: "https://testnet.hashio.io/api",
  BLOCK_EXPLORER: "https://hashscan.io/testnet/dashboard",
  GAS_PRICE: "2000000000", // Example gas price, adjust based on Hedera recommendations

  // Deployed Contract Addresses (replace with actual Hedera contract IDs/addresses if applicable)
  // Hedera uses HAPI for smart contracts, often represented as 0.0.X or EVM addresses.
  // This will depend on how your contracts are deployed on Hedera.
  CONTRACTS: {
    AgentRegistry: "0x84F4928AD2817dbBC83F354F1267cB7972C06D3b",
    ReputationLayer: "0x58B94Cf65DA1F72B72CCD5871653F4c52C34E760",
    OrchestrationContract: "0xCE47fF8fCC8aEC9e192Fc80127eA6f839F77bD20",
  },

  // Private key for blockchain transactions (from .env)
  // PRIVATE_KEY: process.env.HEDERA_OPERATOR_KEY, // Assuming this is your Hedera private key

  OPERATOR_ID: process.env.HEDERA_OPERATOR_ID,
  PRIVATE_KEY: process.env.MY_METAMASK_PRIVATE_KEY,
};

// Determine the active blockchain configuration
const ACTIVE_BLOCKCHAIN_NETWORK =
  process.env.ACTIVE_BLOCKCHAIN_NETWORK || "flow";

const ACTIVE_CHAIN_CONFIG =
  ACTIVE_BLOCKCHAIN_NETWORK === "hedera" ? HEDERA_CONFIG : FLOW_EVM_CONFIG;

// Configuration with blockchain integration
export const config = {
  PORT: process.env.PORT || 8080,
  NODE_ENV: process.env.NODE_ENV || "development",

  // Blockchain Configuration
  BLOCKCHAIN: {
    ENABLED: true,
    RPC_URL: ACTIVE_CHAIN_CONFIG.RPC_URL,
    CHAIN_ID: ACTIVE_CHAIN_CONFIG.CHAIN_ID,
    PRIVATE_KEY: ACTIVE_CHAIN_CONFIG.PRIVATE_KEY,
    CONTRACTS: ACTIVE_CHAIN_CONFIG.CONTRACTS,
    GAS_SETTINGS: {
      gasPrice: ACTIVE_CHAIN_CONFIG.GAS_PRICE,
      gasLimit: "500000", // Default gas limit
    },
  },

  // Agent Discovery: Use blockchain contracts instead of hardcoded URLs
  AGENT_DISCOVERY: {
    SOURCE: "blockchain", // "blockchain" | "hardcoded"
    FALLBACK_AGENTS: AGENTS, // Fallback if blockchain is unavailable
    REFRESH_INTERVAL: 300000, // 5 minutes
  },

  // Reputation & Cost Management: Use blockchain contracts
  REPUTATION_SOURCE: "blockchain", // "blockchain" | "local"
  COST_SOURCE: "blockchain", // "blockchain" | "agent"
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
        // "local-sse-server": {
        //   command: "node",
        //   args: [
        //     "/Users/vinay/Desktop/Ongoing/ethprauge/hedera-mcp-server/build/index.js",
        //   ],
        //   env: {
        //     HEDERA_OPERATOR_ID: "0.0.4838555",
        //     HEDERA_OPERATOR_KEY:
        //       "3030020100300706052b8104000a04220420a5b399386598cd5ae067ec7ffedd7cb4617527c8b8824d52d180eab8d3091274",
        //     HEDERA_NETWORK: "testnet",
        //     PORT: "3000",
        //   },
        // },
      },
    };
  }

  return mcpConfig;
}

/**
 * Load blockchain configuration and validate contract addresses
 */
export function validateBlockchainConfig(): boolean {
  try {
    if (!config.BLOCKCHAIN.ENABLED) {
      console.log("📋 Blockchain integration disabled");
      return false;
    }

    if (!config.BLOCKCHAIN.PRIVATE_KEY) {
      console.warn("⚠️ No private key configured for blockchain transactions");
      console.log(
        `💡 Set PRIVATE_KEY in .env file for ${ACTIVE_CHAIN_CONFIG.NETWORK_NAME}`
      );
      return false;
    }

    if (!config.BLOCKCHAIN.RPC_URL) {
      console.error("❌ No RPC URL configured for blockchain");
      return false;
    }

    const contracts = config.BLOCKCHAIN.CONTRACTS;
    if (
      !contracts.AgentRegistry ||
      !contracts.ReputationLayer ||
      !contracts.OrchestrationContract
    ) {
      console.error("❌ Missing contract addresses");
      return false;
    }

    console.log("✅ Blockchain configuration validated");
    console.log(
      `🌐 Network: ${ACTIVE_CHAIN_CONFIG.NETWORK_NAME} (Chain ID: ${ACTIVE_CHAIN_CONFIG.CHAIN_ID})`
    );
    console.log(`📍 RPC: ${config.BLOCKCHAIN.RPC_URL}`);
    console.log(
      `💼 Contracts: AgentRegistry, ReputationLayer, OrchestrationContract`
    );
    return true;
  } catch (error) {
    console.error("❌ Failed to validate blockchain config:", error);
    return false;
  }
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
      // "local-sse-server": {
      //   command: "node",
      //   args: [
      //     "/Users/vinay/Desktop/Ongoing/ethprauge/hedera-mcp-server/build/index.js",
      //   ],
      //   env: {
      //     HEDERA_OPERATOR_ID: "0.0.4838555",
      //     HEDERA_OPERATOR_KEY:
      //       "3030020100300706052b8104000a04220420a5b399386598cd5ae067ec7ffedd7cb4617527c8b8824d52d180eab8d3091274",
      //     HEDERA_NETWORK: "testnet",
      //     PORT: "3000",
      //   },
      // },
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
