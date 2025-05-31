// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "forge-std/console2.sol";
import "../src/AgentRegistry.sol";
import "../src/ReputationLayer.sol";
import "../src/OrchestrationContract.sol";

/**
 * @title Deploy
 * @notice Deployment script for the Orchestrator Protocol contracts
 * @dev Deploys AgentRegistry, ReputationLayer, and OrchestrationContract in correct order
 */
contract Deploy is Script {
    // Deployment addresses (will be set after deployment)
    AgentRegistry public agentRegistry;
    ReputationLayer public reputationLayer;
    OrchestrationContract public orchestrationContract;
    
    function run() external {
        // Get deployer private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console2.log("Deploying contracts with account:", deployer);
        console2.log("Account balance:", deployer.balance);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy AgentRegistry first (no dependencies)
        console2.log("Deploying AgentRegistry...");
        agentRegistry = new AgentRegistry();
        console2.log("AgentRegistry deployed at:", address(agentRegistry));
        
        // Deploy ReputationLayer (no dependencies)
        console2.log("Deploying ReputationLayer...");
        reputationLayer = new ReputationLayer();
        console2.log("ReputationLayer deployed at:", address(reputationLayer));
        
        // Deploy OrchestrationContract (depends on both previous contracts)
        console2.log("Deploying OrchestrationContract...");
        orchestrationContract = new OrchestrationContract(
            address(agentRegistry),
            address(reputationLayer)
        );
        console2.log("OrchestrationContract deployed at:", address(orchestrationContract));
        
        // Authorize OrchestrationContract to update reputation
        console2.log("Authorizing OrchestrationContract to update reputation...");
        reputationLayer.authorizeOrchestrator(address(orchestrationContract));
        
        vm.stopBroadcast();
        
        // Verify deployments
        console2.log("\n=== Deployment Summary ===");
        console2.log("AgentRegistry:", address(agentRegistry));
        console2.log("ReputationLayer:", address(reputationLayer));
        console2.log("OrchestrationContract:", address(orchestrationContract));
        
        // Verify contract states
        require(agentRegistry.getAgentCount() == 0, "AgentRegistry should start empty");
        require(reputationLayer.getAgentCount() == 0, "ReputationLayer should start empty");
        require(orchestrationContract.getTaskCount() == 0, "OrchestrationContract should start empty");
        require(
            reputationLayer.authorizedOrchestrators(address(orchestrationContract)),
            "OrchestrationContract should be authorized"
        );
        
        console2.log("All contracts deployed and configured successfully!");
        
        // Log example usage commands
        console2.log("\n=== Example Usage ===");
        console2.log("Register an agent:");
        console2.log("cast send", address(agentRegistry));
        console2.log("  'registerAgent(address,string,string,uint256,uint8)'");
        console2.log("  <agent_wallet> 'http://localhost:3001' 'ipfs://QmHash' 1000000000000000000 0");
        
        console2.log("\nCreate a task:");
        console2.log("cast send", address(orchestrationContract));
        console2.log("  'createTask(address,bytes32,uint256)' --value 0.5ether");
        console2.log("  <agent_address> <input_hash> <deadline_timestamp>");
    }
}

/**
 * @title DeployLocal
 * @notice Local deployment script with test data for development
 */
contract DeployLocal is Script {
    AgentRegistry public agentRegistry;
    ReputationLayer public reputationLayer;
    OrchestrationContract public orchestrationContract;
    
    // Test addresses
    address constant TEST_AGENT1 = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
    address constant TEST_AGENT2 = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC;
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
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
        
        // Register test agents
        agentRegistry.registerAgent(
            TEST_AGENT1,
            "http://localhost:3001",
            "ipfs://QmTestAgent1Hash",
            1 ether,
            AgentRegistry.AgentType.HTTP
        );
        
        agentRegistry.registerAgent(
            TEST_AGENT2,
            "mcp://akave",
            "ipfs://QmTestAgent2Hash",
            0.5 ether,
            AgentRegistry.AgentType.MCP
        );
        
        vm.stopBroadcast();
        
        console2.log("=== Local Development Deployment ===");
        console2.log("AgentRegistry:", address(agentRegistry));
        console2.log("ReputationLayer:", address(reputationLayer));
        console2.log("OrchestrationContract:", address(orchestrationContract));
        console2.log("Test Agent 1 (HTTP):", TEST_AGENT1);
        console2.log("Test Agent 2 (MCP):", TEST_AGENT2);
        console2.log("Registered agents:", agentRegistry.getAgentCount());
    }
}

/**
 * @title DeployWithVerification
 * @notice Deployment script that includes contract verification
 */
contract DeployWithVerification is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        string memory rpcUrl = vm.envString("RPC_URL");
        string memory etherscanApiKey = vm.envString("ETHERSCAN_API_KEY");
        
        console2.log("Deploying to network:", rpcUrl);
        
        vm.startBroadcast(deployerPrivateKey);
        
        AgentRegistry agentRegistry = new AgentRegistry();
        ReputationLayer reputationLayer = new ReputationLayer();
        OrchestrationContract orchestrationContract = new OrchestrationContract(
            address(agentRegistry),
            address(reputationLayer)
        );
        
        reputationLayer.authorizeOrchestrator(address(orchestrationContract));
        
        vm.stopBroadcast();
        
        // Verify contracts (requires etherscan API key)
        if (bytes(etherscanApiKey).length > 0) {
            console2.log("Verifying contracts on Etherscan...");
            
            // Note: In a real script, you would use vm.verify() or similar
            console2.log("AgentRegistry verification command:");
            console2.log("forge verify-contract", address(agentRegistry), "src/AgentRegistry.sol:AgentRegistry");
            
            console2.log("ReputationLayer verification command:");
            console2.log("forge verify-contract", address(reputationLayer), "src/ReputationLayer.sol:ReputationLayer");
            
            console2.log("OrchestrationContract verification command:");
            console2.log("forge verify-contract", address(orchestrationContract), "src/OrchestrationContract.sol:OrchestrationContract");
            console2.log("  --constructor-args");
            console2.logBytes(abi.encode(address(agentRegistry), address(reputationLayer)));
        }
        
        console2.log("=== Deployment Complete ===");
        console2.log("AgentRegistry:", address(agentRegistry));
        console2.log("ReputationLayer:", address(reputationLayer));
        console2.log("OrchestrationContract:", address(orchestrationContract));
    }
} 