require("dotenv").config();
const { ethers } = require("ethers");
const path = require("path");
const fs = require("fs");

const ORCHESTRATOR_URL = "http://localhost:8080";
const abi = require("/Users/vinay/Desktop/Ongoing/maha-wrapper/protocol/out/AgentRegistry.sol/AgentRegistry.json");

const AGENTS = [
  // "http://localhost:3001", // Hello World Agent (commented out)
  "http://localhost:7030", // DALL-E 3 Image Generator Agent
  "http://localhost:7031", // NFT Deployer Agent
  "http://localhost:7032", // 1inch Balance Agent
  "http://localhost:7033", // Aave Investor Agent
  "http://localhost:7034", // NFT Metadata Creator Agent
];

const FLOW_EVM_CONFIG = {
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
const HEDERA_CONFIG = {
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

function loadABI(contractName) {
  try {
    const abiPath = path.join(
      __dirname,
      "../../protocol/out",
      `${contractName}.sol`,
      `${contractName}.json`
    );
    if (fs.existsSync(abiPath)) {
      const abiFile = JSON.parse(fs.readFileSync(abiPath, "utf8"));
      return abiFile.abi;
    } else {
      console.warn(`❌ ABI file not found for ${contractName} at ${abiPath}`);
      return [];
    }
  } catch (error) {
    console.error(`❌ Error loading ABI for ${contractName}:`, error);
    return [];
  }
}

async function testWithWeb3() {
  AGENTS.map(async (agent) => {
    const metaData = await fetch(`${agent}/meta`);
    if (!metaData.ok) {
      throw new Error(`Failed to fetch metadata from ${agent}`);
    }
    const agentData = await metaData.json();

    // const agentRegistryABI = loadABI("AgentRegistry");
    // const reputationLayerABI = loadABI("ReputationLayer");
    // const orchestrationContractABI = loadABI("OrchestrationContract");
    const provider = new ethers.JsonRpcProvider(ACTIVE_CHAIN_CONFIG.RPC_URL);

    const network = await provider.getNetwork();
    console.log(
      `✅ Connected to network: ${network.name} (Chain ID: ${network.chainId})`
    );

    let wallet = null;
    if (ACTIVE_CHAIN_CONFIG.PRIVATE_KEY) {
      wallet = new ethers.Wallet(ACTIVE_CHAIN_CONFIG.PRIVATE_KEY, provider);
      console.log(`💼 Wallet initialized: ${wallet.address}`);
    } else {
      console.error(
        "❌ No PRIVATE_KEY set in environment. Cannot send transactions."
      );
      return;
    }
    const signer = wallet;

    const agentRegistry = new ethers.Contract(
      ACTIVE_CHAIN_CONFIG.CONTRACTS.AgentRegistry,
      abi.abi,
      signer
    );
    // const reputationLayer = new ethers.Contract(
    //   ACTIVE_CHAIN_CONFIG.CONTRACTS.ReputationLayer,
    //   reputationLayerABI,
    //   signer
    // );
    // const orchestrationContract = new ethers.Contract(
    //   ACTIVE_CHAIN_CONFIG.CONTRACTS.OrchestrationContract,
    //   orchestrationContractABI,
    //   signer
    // );

    // Get agent address from AgentRegistry contract
    const agentAddress = await agentRegistry.urlToAgent(agent);
    console.log(`Agent address for ${agent}:`, agentAddress);

    if (agentAddress === ethers.ZeroAddress) {
      // Register agent if not found on-chain
      try {
        // Prepare registration arguments from agentData
        // You may need to adjust these fields based on your agentData structure
        const agentWallet = wallet ? wallet.address : ethers.ZeroAddress;
        const agentUrl = agent;
        const metadataURI = agentData.metadataURI || "";
        const baseCostPerTask =
          agentData.baseCostPerTask || ethers.parseEther("0.01"); // fallback to 0.01 ETH
        const agentType = agentData.agentType || 0; // 0 = HTTP, 1 = MCP

        const tx = await agentRegistry.registerAgent(
          agentWallet,
          agentUrl,
          metadataURI,
          baseCostPerTask,
          agentType
        );
        console.log(`⏳ Registering agent on-chain... TX: ${tx.hash}`);
        await tx.wait();
        console.log(`✅ Agent registered for ${agentUrl}`);
      } catch (err) {
        console.error(`❌ Failed to register agent ${agent}:`, err);
      }
    }

    try {
    } catch (error) {
      console.error(`❌ Error updating agent ${agent} to contract:`, error);
    }
  });
}

testWithWeb3();
