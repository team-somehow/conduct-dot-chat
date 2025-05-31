// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/AgentRegistry.sol";

contract AgentRegistryTest is Test {
    AgentRegistry public registry;
    
    address public owner = address(1);
    address public agent1 = address(2);
    address public agent2 = address(3);
    address public agent3 = address(4);
    
    string constant AGENT1_URL = "http://localhost:3001";
    string constant AGENT2_URL = "mcp://akave";
    string constant AGENT3_URL = "http://localhost:3002";
    string constant METADATA_URI = "ipfs://QmTestHash123";
    uint256 constant BASE_COST = 1 ether;
    
    event AgentRegistered(
        address indexed agentAddress,
        string agentUrl,
        AgentRegistry.AgentType agentType,
        uint256 baseCostPerTask
    );
    
    event AgentUpdated(
        address indexed agentAddress,
        string agentUrl,
        uint256 baseCostPerTask
    );
    
    event AgentDeactivated(address indexed agentAddress);
    event AgentActivated(address indexed agentAddress);
    
    function setUp() public {
        vm.prank(owner);
        registry = new AgentRegistry();
    }
    
    function testRegisterHttpAgent() public {
        vm.prank(owner);
        vm.expectEmit(true, false, false, true);
        emit AgentRegistered(agent1, AGENT1_URL, AgentRegistry.AgentType.HTTP, BASE_COST);
        
        registry.registerAgent(
            agent1,
            AGENT1_URL,
            METADATA_URI,
            BASE_COST,
            AgentRegistry.AgentType.HTTP
        );
        
        // Verify agent data
        (
            address wallet,
            string memory agentUrl,
            string memory metadataURI,
            uint256 baseCostPerTask,
            AgentRegistry.AgentType agentType,
            bool isActive,
            uint256 registeredAt,
            address agentOwner
        ) = registry.agents(agent1);
        
        assertEq(wallet, agent1);
        assertEq(agentUrl, AGENT1_URL);
        assertEq(metadataURI, METADATA_URI);
        assertEq(baseCostPerTask, BASE_COST);
        assertTrue(uint8(agentType) == uint8(AgentRegistry.AgentType.HTTP));
        assertTrue(isActive);
        assertGt(registeredAt, 0);
        assertEq(agentOwner, owner);
        
        // Verify URL mapping
        assertEq(registry.urlToAgent(AGENT1_URL), agent1);
        
        // Verify agent count
        assertEq(registry.getAgentCount(), 1);
        assertEq(registry.getActiveAgentCount(), 1);
    }
    
    function testRegisterMcpAgent() public {
        vm.prank(owner);
        vm.expectEmit(true, false, false, true);
        emit AgentRegistered(agent2, AGENT2_URL, AgentRegistry.AgentType.MCP, BASE_COST);
        
        registry.registerAgent(
            agent2,
            AGENT2_URL,
            METADATA_URI,
            BASE_COST,
            AgentRegistry.AgentType.MCP
        );
        
        // Verify agent type
        (,,,, AgentRegistry.AgentType agentType,,,) = registry.agents(agent2);
        assertTrue(uint8(agentType) == uint8(AgentRegistry.AgentType.MCP));
    }
    
    function testCannotRegisterWithZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert("Invalid agent address");
        registry.registerAgent(
            address(0),
            AGENT1_URL,
            METADATA_URI,
            BASE_COST,
            AgentRegistry.AgentType.HTTP
        );
    }
    
    function testCannotRegisterWithEmptyUrl() public {
        vm.prank(owner);
        vm.expectRevert("Agent URL cannot be empty");
        registry.registerAgent(
            agent1,
            "",
            METADATA_URI,
            BASE_COST,
            AgentRegistry.AgentType.HTTP
        );
    }
    
    function testCannotRegisterDuplicateAgent() public {
        vm.prank(owner);
        registry.registerAgent(
            agent1,
            AGENT1_URL,
            METADATA_URI,
            BASE_COST,
            AgentRegistry.AgentType.HTTP
        );
        
        vm.prank(owner);
        vm.expectRevert("Agent already registered");
        registry.registerAgent(
            agent1,
            AGENT3_URL,
            METADATA_URI,
            BASE_COST,
            AgentRegistry.AgentType.HTTP
        );
    }
    
    function testCannotRegisterDuplicateUrl() public {
        vm.prank(owner);
        registry.registerAgent(
            agent1,
            AGENT1_URL,
            METADATA_URI,
            BASE_COST,
            AgentRegistry.AgentType.HTTP
        );
        
        vm.prank(owner);
        vm.expectRevert("URL already registered");
        registry.registerAgent(
            agent2,
            AGENT1_URL,
            METADATA_URI,
            BASE_COST,
            AgentRegistry.AgentType.HTTP
        );
    }
    
    function testUpdateAgent() public {
        // Register agent first
        vm.prank(owner);
        registry.registerAgent(
            agent1,
            AGENT1_URL,
            METADATA_URI,
            BASE_COST,
            AgentRegistry.AgentType.HTTP
        );
        
        // Update agent
        string memory newUrl = "http://localhost:4001";
        string memory newMetadata = "ipfs://QmNewHash456";
        uint256 newCost = 2 ether;
        
        vm.prank(owner);
        vm.expectEmit(true, false, false, true);
        emit AgentUpdated(agent1, newUrl, newCost);
        
        registry.updateAgent(agent1, newUrl, newMetadata, newCost);
        
        // Verify updates
        (,
         string memory agentUrl,
         string memory metadataURI,
         uint256 baseCostPerTask,
         ,,,) = registry.agents(agent1);
        
        assertEq(agentUrl, newUrl);
        assertEq(metadataURI, newMetadata);
        assertEq(baseCostPerTask, newCost);
        
        // Verify URL mapping updated
        assertEq(registry.urlToAgent(newUrl), agent1);
        assertEq(registry.urlToAgent(AGENT1_URL), address(0));
    }
    
    function testCannotUpdateNonExistentAgent() public {
        vm.prank(owner);
        vm.expectRevert("Only agent owner can perform this action");
        registry.updateAgent(agent1, AGENT1_URL, METADATA_URI, BASE_COST);
    }
    
    function testOnlyOwnerCanUpdateAgent() public {
        vm.prank(owner);
        registry.registerAgent(
            agent1,
            AGENT1_URL,
            METADATA_URI,
            BASE_COST,
            AgentRegistry.AgentType.HTTP
        );
        
        vm.prank(agent1); // Not the owner
        vm.expectRevert("Only agent owner can perform this action");
        registry.updateAgent(agent1, AGENT3_URL, METADATA_URI, BASE_COST);
    }
    
    function testDeactivateAgent() public {
        vm.prank(owner);
        registry.registerAgent(
            agent1,
            AGENT1_URL,
            METADATA_URI,
            BASE_COST,
            AgentRegistry.AgentType.HTTP
        );
        
        vm.prank(owner);
        vm.expectEmit(true, false, false, false);
        emit AgentDeactivated(agent1);
        
        registry.deactivateAgent(agent1);
        
        // Verify deactivation
        (,,,,, bool isActive,,) = registry.agents(agent1);
        assertFalse(isActive);
        
        assertEq(registry.getActiveAgentCount(), 0);
    }
    
    function testActivateAgent() public {
        vm.prank(owner);
        registry.registerAgent(
            agent1,
            AGENT1_URL,
            METADATA_URI,
            BASE_COST,
            AgentRegistry.AgentType.HTTP
        );
        
        vm.prank(owner);
        registry.deactivateAgent(agent1);
        
        vm.prank(owner);
        vm.expectEmit(true, false, false, false);
        emit AgentActivated(agent1);
        
        registry.activateAgent(agent1);
        
        // Verify activation
        (,,,,, bool isActive,,) = registry.agents(agent1);
        assertTrue(isActive);
        
        assertEq(registry.getActiveAgentCount(), 1);
    }
    
    function testGetActiveAgents() public {
        // Register multiple agents
        vm.prank(owner);
        registry.registerAgent(
            agent1,
            AGENT1_URL,
            METADATA_URI,
            BASE_COST,
            AgentRegistry.AgentType.HTTP
        );
        
        vm.prank(owner);
        registry.registerAgent(
            agent2,
            AGENT2_URL,
            METADATA_URI,
            BASE_COST,
            AgentRegistry.AgentType.MCP
        );
        
        vm.prank(owner);
        registry.registerAgent(
            agent3,
            AGENT3_URL,
            METADATA_URI,
            BASE_COST,
            AgentRegistry.AgentType.HTTP
        );
        
        // Deactivate one agent
        vm.prank(owner);
        registry.deactivateAgent(agent2);
        
        // Get active agents
        AgentRegistry.Agent[] memory activeAgents = registry.getActiveAgents();
        
        assertEq(activeAgents.length, 2);
        assertTrue(activeAgents[0].wallet == agent1 || activeAgents[0].wallet == agent3);
        assertTrue(activeAgents[1].wallet == agent1 || activeAgents[1].wallet == agent3);
        assertTrue(activeAgents[0].wallet != activeAgents[1].wallet);
    }
    
    function testGetAgentsByType() public {
        // Register agents of different types
        vm.prank(owner);
        registry.registerAgent(
            agent1,
            AGENT1_URL,
            METADATA_URI,
            BASE_COST,
            AgentRegistry.AgentType.HTTP
        );
        
        vm.prank(owner);
        registry.registerAgent(
            agent2,
            AGENT2_URL,
            METADATA_URI,
            BASE_COST,
            AgentRegistry.AgentType.MCP
        );
        
        vm.prank(owner);
        registry.registerAgent(
            agent3,
            AGENT3_URL,
            METADATA_URI,
            BASE_COST,
            AgentRegistry.AgentType.HTTP
        );
        
        // Get HTTP agents
        AgentRegistry.Agent[] memory httpAgents = registry.getAgentsByType(AgentRegistry.AgentType.HTTP);
        assertEq(httpAgents.length, 2);
        
        // Get MCP agents
        AgentRegistry.Agent[] memory mcpAgents = registry.getAgentsByType(AgentRegistry.AgentType.MCP);
        assertEq(mcpAgents.length, 1);
        assertEq(mcpAgents[0].wallet, agent2);
    }
    
    function testGetAgentByUrl() public {
        vm.prank(owner);
        registry.registerAgent(
            agent1,
            AGENT1_URL,
            METADATA_URI,
            BASE_COST,
            AgentRegistry.AgentType.HTTP
        );
        
        AgentRegistry.Agent memory agent = registry.getAgentByUrl(AGENT1_URL);
        assertEq(agent.wallet, agent1);
        assertEq(agent.agentUrl, AGENT1_URL);
    }
    
    function testCannotGetAgentByNonExistentUrl() public {
        vm.expectRevert("Agent not found");
        registry.getAgentByUrl("http://nonexistent.com");
    }
    
    function testFuzzRegisterAgent(
        address agentAddr,
        string calldata url,
        uint256 cost
    ) public {
        vm.assume(agentAddr != address(0));
        vm.assume(bytes(url).length > 0);
        vm.assume(bytes(url).length < 200); // Reasonable URL length
        
        vm.prank(owner);
        registry.registerAgent(
            agentAddr,
            url,
            METADATA_URI,
            cost,
            AgentRegistry.AgentType.HTTP
        );
        
        (address wallet,,,,,,,) = registry.agents(agentAddr);
        assertEq(wallet, agentAddr);
        assertEq(registry.urlToAgent(url), agentAddr);
    }
} 