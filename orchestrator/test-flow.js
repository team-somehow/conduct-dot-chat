require("dotenv").config();
const { ethers } = require("ethers");
const path = require("path");
const fs = require("fs");

const ORCHESTRATOR_URL = "http://localhost:8080";
const abi = require("/Users/vinay/Desktop/Ongoing/maha-wrapper/protocol/out/AgentRegistry.sol/AgentRegistry.json");
const ReputationLayerABI = require("/Users/vinay/Desktop/Ongoing/maha-wrapper/protocol/out/ReputationLayer.sol/ReputationLayer.json");
const OrchestrationABI = require("/Users/vinay/Desktop/Ongoing/maha-wrapper/protocol/out/OrchestrationContract.sol/OrchestrationContract.json");

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

async function registerAgentsToContract() {
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

    let alreadyRegistered = false;
    if (agentAddress !== ethers.ZeroAddress) {
      alreadyRegistered = true;
      console.log(`Agent already registered by URL: ${agent}`);
    } else if (agentData.wallet) {
      // Check by wallet address as well
      let agentWallet = agentData.wallet;
      if (!agentWallet || !ethers.isAddress(agentWallet)) {
        agentWallet = wallet.address;
      }
      const agentByWallet = await agentRegistry.agents(agentWallet);
      if (
        agentByWallet &&
        agentByWallet.registeredAt &&
        agentByWallet.registeredAt != 0
      ) {
        alreadyRegistered = true;
        console.log(`Agent already registered by wallet: ${agentWallet}`);
      }
    }

    if (!alreadyRegistered) {
      try {
        // Validate agentData.wallet
        let agentWallet = agentData.wallet;
        if (!agentWallet || !ethers.isAddress(agentWallet)) {
          agentWallet = wallet.address;
        }
        const agentUrl = agent;
        const metadataURI = agentData.previewURI || "";
        const baseCostPerTask =
          agentData.baseCostPerTask || ethers.parseEther("0.01");
        const agentType = 0; // 0 = HTTP, 1 = MCP

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

async function orchestrators() {
  const agent = AGENTS[0];
  const metaData = await fetch(`${agent}/meta`);
  if (!metaData.ok) {
    throw new Error(`Failed to fetch metadata from ${agent}`);
  }
  const agentData = await metaData.json();

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

  const orchestrationContract = new ethers.Contract(
    ACTIVE_CHAIN_CONFIG.CONTRACTS.OrchestrationContract,
    OrchestrationABI.abi,
    signer
  );

  const testTx = await orchestrationContract.owner();

  const input = { prompt: "Generate an image of a cat on the moon" };
  const inputString = JSON.stringify(input);
  const inputHash = ethers.keccak256(ethers.toUtf8Bytes(inputString));
  const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
  // Fetch live gas price and use it to set paymentAmount
  const gasPrice = await provider.getFeeData();
  const liveGasPrice = gasPrice.gasPrice || gasPrice.maxFeePerGas;
  console.log("Live gas price (wei):", liveGasPrice.toString());
  // Estimate a reasonable gas limit for createTask (e.g., 300000)
  const estimatedGasLimit = 300000;
  // Calculate minimum payment: liveGasPrice * estimatedGasLimit
  const minPayment = liveGasPrice * BigInt(estimatedGasLimit);
  // Use agent's baseCostPerTask if higher, else use minPayment

  // 1. Create Task
  let taskId;

  console.log("deadline:", deadline);

  try {
    const tx = await orchestrationContract.createTask(
      agentData.wallet,
      inputHash,
      deadline,
      { value: minPayment }
    );
    console.log(`⏳ Creating task... TX: ${tx.hash}`);
    const receipt = await tx.wait();
  } catch (err) {
    console.error("❌ Failed to create task:", err);
    return;
  }

  // 2. Accept Task (simulate agent accepting)
  try {
    const agentSigner = new ethers.Wallet(agentData.walletPrivateKey, provider); // You need agent's private key for this
    const agentOrchestration = orchestrationContract.connect(agentSigner);
    const tx = await agentOrchestration.acceptTask(taskId);
    console.log(`⏳ Accepting task... TX: ${tx.hash}`);
    await tx.wait();
    console.log(`✅ Task accepted by agent`);
  } catch (err) {
    console.error("❌ Failed to accept task:", err);
    return;
  }

  // 3. Submit Task Result (simulate agent submitting result)
  try {
    const agentSigner = new ethers.Wallet(agentData.walletPrivateKey, provider);
    const agentOrchestration = orchestrationContract.connect(agentSigner);
    const output = { imageUrl: "ipfs://QmExampleImageHash" };
    const outputString = JSON.stringify(output);
    const outputHash = ethers.keccak256(ethers.toUtf8Bytes(outputString));
    const tx = await agentOrchestration.submitTaskResult(taskId, outputHash);
    console.log(`⏳ Submitting task result... TX: ${tx.hash}`);
    await tx.wait();
    console.log(`✅ Task result submitted by agent`);
  } catch (err) {
    console.error("❌ Failed to submit task result:", err);
    return;
  }
}

async function reputeAgent() {
  const agent1 = AGENTS[0];
  const agent2 = AGENTS[1];

  const metaData = await fetch(`${agent1}/meta`);
  if (!metaData.ok) {
    throw new Error(`Failed to fetch metadata from ${agent1}`);
  }
  const agent1Data = await metaData.json();

  const metaData2 = await fetch(`${agent2}/meta`);
  if (!metaData2.ok) {
    throw new Error(`Failed to fetch metadata from ${agent2}`);
  }
  const agent2Data = await metaData2.json();

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
  const reputationLayer = new ethers.Contract(
    ACTIVE_CHAIN_CONFIG.CONTRACTS.ReputationLayer,
    ReputationLayerABI.abi,
    signer
  );

  const reputationData = await reputationLayer.getReputationData(
    agent2Data.wallet
  );
  console.log(`Reputation data for ${agent2Data.wallet}:`, reputationData);

  // Authorize orchestrator to manage agent reputation
  const tx = await reputationLayer.authorizeOrchestrator(
    ACTIVE_CHAIN_CONFIG.CONTRACTS.OrchestrationContract
  );
  console.log(`⏳ Authorizing orchestrator... TX: ${tx.hash}`);
  await tx.wait();

  // Record a task completion for the agent before rating
  try {
    const success = true; // Simulate a successful task
    const latency = 10; // Simulate 10 seconds latency
    const recordTx = await reputationLayer.recordTaskCompletion(
      agent2Data.wallet,
      success,
      latency
    );
    console.log(`⏳ Recording task completion... TX: ${recordTx.hash}`);
    await recordTx.wait();
    console.log(`✅ Task completion recorded for ${agent2Data.wallet}`);
  } catch (err) {
    console.error(`❌ Failed to record task completion:`, err);
  }

  // Rate the agent (1-5 stars)
  try {
    const rating = 5; // Example rating
    const rateTx = await reputationLayer.rateAgent(agent2Data.wallet, rating);
    console.log(`⏳ Rating agent... TX: ${rateTx.hash}`);
    await rateTx.wait();
    console.log(`✅ Agent rated with ${rating} stars`);
  } catch (err) {
    console.error(`❌ Failed to rate agent:`, err);
  }

  // Calculate reputation score
  // try {
  //   const score = await reputationLayer.calculateReputationScore(
  //     agent2Data.wallet
  //   );
  //   console.log(`Reputation score for ${agent2Data.wallet}:`, score.toString());
  // } catch (err) {
  //   console.error(`❌ Failed to calculate reputation score:`, err);
  // }

  // // Get success rate
  // try {
  //   const successRate = await reputationLayer.getSuccessRate(agent2Data.wallet);
  //   console.log(
  //     `Success rate for ${agent2Data.wallet}:`,
  //     successRate.toString()
  //   );
  // } catch (err) {
  //   console.error(`❌ Failed to get success rate:`, err);
  // }
}

registerAgentsToContract();
