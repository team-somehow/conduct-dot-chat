// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "forge-std/console2.sol";
import "../src/AgentRegistry.sol";
import "../src/ReputationLayer.sol";
import "../src/OrchestrationContract.sol";

/**
 * @title DeployFlowTestnet
 * @notice Deployment script specifically for Flow EVM Testnet
 * @dev Uses configuration from networks.json and Flow testnet private key
 */
contract DeployFlowTestnet is Script {
    // Flow EVM Testnet Configuration
    string constant NETWORK_NAME = "Flow EVM Testnet";
    uint256 constant CHAIN_ID = 545;
    string constant RPC_URL = "https://testnet.evm.nodes.onflow.org";
    string constant BLOCK_EXPLORER = "https://evm-testnet.flowscan.io";
    string constant CURRENCY_SYMBOL = "FLOW";
    
    // Deployment addresses (will be set after deployment)
    AgentRegistry public agentRegistry;
    ReputationLayer public reputationLayer;
    OrchestrationContract public orchestrationContract;
    
    function run() external {
        // Get Flow testnet private key from environment
        uint256 deployerPrivateKey = vm.envUint("MY_METAMASK_PRIVATE_KEY_WITH_FLOW_TESTNET");
        address deployer = vm.addr(deployerPrivateKey);
        
        console2.log("=== Flow EVM Testnet Deployment ===");
        console2.log("Network:", NETWORK_NAME);
        console2.log("Chain ID:", CHAIN_ID);
        console2.log("RPC URL:", RPC_URL);
        console2.log("Block Explorer:", BLOCK_EXPLORER);
        console2.log("Currency:", CURRENCY_SYMBOL);
        console2.log("Deploying contracts with account:", deployer);
        console2.log("Account balance:", deployer.balance);
        
        require(deployer.balance > 0, "Deployer account has no FLOW tokens. Please fund from faucet.");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy AgentRegistry first (no dependencies)
        console2.log("\n1. Deploying AgentRegistry...");
        agentRegistry = new AgentRegistry();
        console2.log("   AgentRegistry deployed at:", address(agentRegistry));
        
        // Deploy ReputationLayer (no dependencies)
        console2.log("\n2. Deploying ReputationLayer...");
        reputationLayer = new ReputationLayer();
        console2.log("   ReputationLayer deployed at:", address(reputationLayer));
        
        // Deploy OrchestrationContract (depends on both previous contracts)
        console2.log("\n3. Deploying OrchestrationContract...");
        orchestrationContract = new OrchestrationContract(
            address(agentRegistry),
            address(reputationLayer)
        );
        console2.log("   OrchestrationContract deployed at:", address(orchestrationContract));
        
        // Authorize OrchestrationContract to update reputation
        console2.log("\n4. Configuring contract permissions...");
        reputationLayer.authorizeOrchestrator(address(orchestrationContract));
        console2.log("   OrchestrationContract authorized to update reputation");
        
        vm.stopBroadcast();
        
        // Verify deployments
        console2.log("\n=== Deployment Summary ===");
        console2.log("Network: Flow EVM Testnet (Chain ID: 545)");
        console2.log("Block Explorer:", BLOCK_EXPLORER);
        console2.log("");
        console2.log("Contract Addresses:");
        console2.log("  AgentRegistry:         ", address(agentRegistry));
        console2.log("  ReputationLayer:       ", address(reputationLayer));
        console2.log("  OrchestrationContract: ", address(orchestrationContract));
        
        // Verify contract states
        require(agentRegistry.getAgentCount() == 0, "AgentRegistry should start empty");
        require(reputationLayer.getAgentCount() == 0, "ReputationLayer should start empty");
        require(orchestrationContract.getTaskCount() == 0, "OrchestrationContract should start empty");
        require(
            reputationLayer.authorizedOrchestrators(address(orchestrationContract)),
            "OrchestrationContract should be authorized"
        );
        
        console2.log("\nAll contracts deployed and configured successfully!");
        
        // Log verification commands for Flow EVM Testnet
        console2.log("\n=== Contract Verification Commands ===");
        console2.log("Verify AgentRegistry:");
        console2.log("forge verify-contract", address(agentRegistry), "src/AgentRegistry.sol:AgentRegistry --chain-id 545 --verifier-url https://evm-testnet.flowscan.io");
        console2.log("");
        console2.log("Verify ReputationLayer:");
        console2.log("forge verify-contract", address(reputationLayer), "src/ReputationLayer.sol:ReputationLayer --chain-id 545 --verifier-url https://evm-testnet.flowscan.io");
        console2.log("");
        console2.log("Verify OrchestrationContract:");
        console2.log("forge verify-contract", address(orchestrationContract), "src/OrchestrationContract.sol:OrchestrationContract --chain-id 545 --verifier-url https://evm-testnet.flowscan.io");
        console2.log("  --constructor-args");
        console2.logBytes(abi.encode(address(agentRegistry), address(reputationLayer)));
        
        // Log Flow Testnet Resources
        console2.log("\n=== Flow Testnet Resources ===");
        console2.log("Faucet: https://testnet-faucet.onflow.org/fund-account");
        console2.log("Add to MetaMask:");
        console2.log("  Network Name: Flow EVM Testnet");
        console2.log("  RPC URL: https://testnet.evm.nodes.onflow.org");
        console2.log("  Chain ID: 545");
        console2.log("  Currency Symbol: FLOW");
        console2.log("  Block Explorer: https://evm-testnet.flowscan.io");
        
        console2.log("\n=== Next Steps ===");
        console2.log("1. Register your actual agents using their wallet addresses");
        console2.log("2. Update your orchestrator config to use these contract addresses");
        console2.log("3. Start your agent servers (localhost:3001-3006)");
        console2.log("4. Configure the MCP agents (Akave, etc.)");
    }
}

/**
 * @title DeployFlowTestnetWithAgents  
 * @notice Flow EVM Testnet deployment that registers the actual agents from orchestrator config
 * @dev This registers the real agents configured in orchestrator/src/config.ts
 */
contract DeployFlowTestnetWithAgents is Script {
    AgentRegistry public agentRegistry;
    ReputationLayer public reputationLayer;
    OrchestrationContract public orchestrationContract;
    
    // Real agent wallet addresses (you'll need to provide these)
    // These should be the actual wallet addresses for each agent
    address constant HELLO_AGENT_WALLET = 0x1111111111111111111111111111111111111111;      // Hello World Agent
    address constant IMAGEGEN_AGENT_WALLET = 0x2222222222222222222222222222222222222222;   // DALL-E 3 Image Generator
    address constant NFT_DEPLOYER_WALLET = 0x3333333333333333333333333333333333333333;    // NFT Deployer Agent
    address constant ONEINCH_AGENT_WALLET = 0x4444444444444444444444444444444444444444;   // 1inch Balance Agent
    address constant AAVE_AGENT_WALLET = 0x5555555555555555555555555555555555555555;     // Aave Investor Agent
    address constant NFT_METADATA_WALLET = 0x6666666666666666666666666666666666666666;   // NFT Metadata Creator
    address constant AKAVE_MCP_WALLET = 0x7777777777777777777777777777777777777777;      // Akave MCP Agent
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("MY_METAMASK_PRIVATE_KEY_WITH_FLOW_TESTNET");
        address deployer = vm.addr(deployerPrivateKey);
        
        console2.log("=== Flow EVM Testnet Deployment with Real Agents ===");
        console2.log("Deployer:", deployer);
        console2.log("Balance:", deployer.balance);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy contracts
        agentRegistry = new AgentRegistry();
        reputationLayer = new ReputationLayer();
        orchestrationContract = new OrchestrationContract(
            address(agentRegistry),
            address(reputationLayer)
        );
        
        // Configure contracts
        reputationLayer.authorizeOrchestrator(address(orchestrationContract));
        
        // Register real HTTP agents from orchestrator config
        console2.log("\nRegistering HTTP agents from orchestrator config...");
        
        // Hello World Agent (localhost:3001)
        agentRegistry.registerAgent(
            HELLO_AGENT_WALLET,
            "http://localhost:3001",
            "ipfs://QmHelloWorldAgentMetadata",
            0.1 ether,
            AgentRegistry.AgentType.HTTP
        );
        console2.log("Registered Hello World Agent:", HELLO_AGENT_WALLET);
        
        // DALL-E 3 Image Generator Agent (localhost:3002) 
        agentRegistry.registerAgent(
            IMAGEGEN_AGENT_WALLET,
            "http://localhost:3002",
            "ipfs://QmImageGenAgentMetadata",
            0.5 ether,
            AgentRegistry.AgentType.HTTP
        );
        console2.log("Registered Image Generator Agent:", IMAGEGEN_AGENT_WALLET);
        
        // NFT Deployer Agent (localhost:3003)
        agentRegistry.registerAgent(
            NFT_DEPLOYER_WALLET,
            "http://localhost:3003", 
            "ipfs://QmNFTDeployerAgentMetadata",
            1.0 ether,
            AgentRegistry.AgentType.HTTP
        );
        console2.log("Registered NFT Deployer Agent:", NFT_DEPLOYER_WALLET);
        
        // 1inch Balance Agent (localhost:3004)
        agentRegistry.registerAgent(
            ONEINCH_AGENT_WALLET,
            "http://localhost:3004",
            "ipfs://Qm1inchAgentMetadata", 
            0.2 ether,
            AgentRegistry.AgentType.HTTP
        );
        console2.log("Registered 1inch Agent:", ONEINCH_AGENT_WALLET);
        
        // Aave Investor Agent (localhost:3005)
        agentRegistry.registerAgent(
            AAVE_AGENT_WALLET,
            "http://localhost:3005",
            "ipfs://QmAaveAgentMetadata",
            0.8 ether,
            AgentRegistry.AgentType.HTTP
        );
        console2.log("Registered Aave Agent:", AAVE_AGENT_WALLET);
        
        // NFT Metadata Creator Agent (localhost:3006)
        agentRegistry.registerAgent(
            NFT_METADATA_WALLET,
            "http://localhost:3006",
            "ipfs://QmNFTMetadataAgentMetadata",
            0.3 ether,
            AgentRegistry.AgentType.HTTP
        );
        console2.log("Registered NFT Metadata Agent:", NFT_METADATA_WALLET);
        
        // Register MCP agents
        console2.log("\nRegistering MCP agents...");
        
        // Akave MCP Agent 
        agentRegistry.registerAgent(
            AKAVE_MCP_WALLET,
            "mcp://akave",
            "ipfs://QmAkaveMCPAgentMetadata",
            0.1 ether,
            AgentRegistry.AgentType.MCP
        );
        console2.log("Registered Akave MCP Agent:", AKAVE_MCP_WALLET);
        
        vm.stopBroadcast();
        
        console2.log("\n=== Flow EVM Testnet Deployment Complete ===");
        console2.log("Network: Flow EVM Testnet (Chain ID: 545)");
        console2.log("Block Explorer: https://evm-testnet.flowscan.io");
        console2.log("");
        console2.log("Contract Addresses:");
        console2.log("  AgentRegistry:         ", address(agentRegistry));
        console2.log("  ReputationLayer:       ", address(reputationLayer));
        console2.log("  OrchestrationContract: ", address(orchestrationContract));
        console2.log("");
        console2.log("Registered agents:", agentRegistry.getAgentCount());
        console2.log("");
        console2.log("=== Registered Agents ===");
        console2.log("HTTP Agents:");
        console2.log("  Hello World (3001):    ", HELLO_AGENT_WALLET);
        console2.log("  Image Generator (3002): ", IMAGEGEN_AGENT_WALLET);
        console2.log("  NFT Deployer (3003):   ", NFT_DEPLOYER_WALLET);
        console2.log("  1inch Balance (3004):  ", ONEINCH_AGENT_WALLET);
        console2.log("  Aave Investor (3005):  ", AAVE_AGENT_WALLET);
        console2.log("  NFT Metadata (3006):   ", NFT_METADATA_WALLET);
        console2.log("MCP Agents:");
        console2.log("  Akave Storage:         ", AKAVE_MCP_WALLET);
    }
} 