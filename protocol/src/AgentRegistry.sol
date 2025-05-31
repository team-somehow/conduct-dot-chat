// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title AgentRegistry
 * @notice Registry contract for AI agents in the orchestrator protocol
 * @dev Stores agent metadata and enables discovery by orchestrators
 */
contract AgentRegistry {
    enum AgentType { HTTP, MCP }
    
    struct Agent {
        address wallet;           // Agent's payment wallet
        string agentUrl;         // HTTP endpoint or MCP identifier
        string metadataURI;      // IPFS hash with schemas/capabilities
        uint256 baseCostPerTask; // Cost in wei per task execution
        AgentType agentType;     // HTTP or MCP
        bool isActive;           // Can receive work
        uint256 registeredAt;    // Registration timestamp
        address owner;           // Agent owner who can update settings
    }
    
    // Events
    event AgentRegistered(
        address indexed agentAddress,
        string agentUrl,
        AgentType agentType,
        uint256 baseCostPerTask
    );
    
    event AgentUpdated(
        address indexed agentAddress,
        string agentUrl,
        uint256 baseCostPerTask
    );
    
    event AgentDeactivated(address indexed agentAddress);
    event AgentActivated(address indexed agentAddress);
    
    // Storage
    mapping(address => Agent) public agents;
    mapping(string => address) public urlToAgent; // For URL-based lookup
    address[] public agentAddresses; // For enumeration
    
    // Modifiers
    modifier onlyAgentOwner(address agentAddress) {
        require(
            agents[agentAddress].owner == msg.sender,
            "Only agent owner can perform this action"
        );
        _;
    }
    
    modifier agentExists(address agentAddress) {
        require(agents[agentAddress].registeredAt != 0, "Agent does not exist");
        _;
    }
    
    /**
     * @notice Register a new agent in the registry
     * @param agentAddress Address of the agent's wallet
     * @param agentUrl HTTP endpoint or MCP identifier
     * @param metadataURI IPFS hash containing agent metadata
     * @param baseCostPerTask Cost in wei for executing one task
     * @param agentType Type of agent (HTTP or MCP)
     */
    function registerAgent(
        address agentAddress,
        string calldata agentUrl,
        string calldata metadataURI,
        uint256 baseCostPerTask,
        AgentType agentType
    ) external {
        require(agentAddress != address(0), "Invalid agent address");
        require(bytes(agentUrl).length > 0, "Agent URL cannot be empty");
        require(agents[agentAddress].registeredAt == 0, "Agent already registered");
        require(urlToAgent[agentUrl] == address(0), "URL already registered");
        
        agents[agentAddress] = Agent({
            wallet: agentAddress,
            agentUrl: agentUrl,
            metadataURI: metadataURI,
            baseCostPerTask: baseCostPerTask,
            agentType: agentType,
            isActive: true,
            registeredAt: block.timestamp,
            owner: msg.sender
        });
        
        urlToAgent[agentUrl] = agentAddress;
        agentAddresses.push(agentAddress);
        
        emit AgentRegistered(agentAddress, agentUrl, agentType, baseCostPerTask);
    }
    
    /**
     * @notice Update agent information
     * @param agentAddress Address of the agent to update
     * @param agentUrl New URL (optional, pass empty string to keep current)
     * @param metadataURI New metadata URI (optional, pass empty string to keep current)
     * @param baseCostPerTask New cost per task
     */
    function updateAgent(
        address agentAddress,
        string calldata agentUrl,
        string calldata metadataURI,
        uint256 baseCostPerTask
    ) external onlyAgentOwner(agentAddress) agentExists(agentAddress) {
        Agent storage agent = agents[agentAddress];
        
        // Update URL if provided
        if (bytes(agentUrl).length > 0 && keccak256(bytes(agentUrl)) != keccak256(bytes(agent.agentUrl))) {
            require(urlToAgent[agentUrl] == address(0), "URL already registered");
            delete urlToAgent[agent.agentUrl];
            agent.agentUrl = agentUrl;
            urlToAgent[agentUrl] = agentAddress;
        }
        
        // Update metadata URI if provided
        if (bytes(metadataURI).length > 0) {
            agent.metadataURI = metadataURI;
        }
        
        agent.baseCostPerTask = baseCostPerTask;
        
        emit AgentUpdated(agentAddress, agent.agentUrl, baseCostPerTask);
    }
    
    /**
     * @notice Deactivate an agent (prevents it from receiving new tasks)
     * @param agentAddress Address of the agent to deactivate
     */
    function deactivateAgent(address agentAddress) 
        external 
        onlyAgentOwner(agentAddress) 
        agentExists(agentAddress) 
    {
        agents[agentAddress].isActive = false;
        emit AgentDeactivated(agentAddress);
    }
    
    /**
     * @notice Reactivate an agent
     * @param agentAddress Address of the agent to reactivate
     */
    function activateAgent(address agentAddress) 
        external 
        onlyAgentOwner(agentAddress) 
        agentExists(agentAddress) 
    {
        agents[agentAddress].isActive = true;
        emit AgentActivated(agentAddress);
    }
    
    /**
     * @notice Get all active agents
     * @return activeAgents Array of active agent data
     */
    function getActiveAgents() external view returns (Agent[] memory activeAgents) {
        uint256 activeCount = 0;
        
        // Count active agents
        for (uint256 i = 0; i < agentAddresses.length; i++) {
            if (agents[agentAddresses[i]].isActive) {
                activeCount++;
            }
        }
        
        // Build active agents array
        activeAgents = new Agent[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < agentAddresses.length; i++) {
            if (agents[agentAddresses[i]].isActive) {
                activeAgents[index] = agents[agentAddresses[i]];
                index++;
            }
        }
    }
    
    /**
     * @notice Get agents by type
     * @param agentType Type of agents to retrieve
     * @return typeAgents Array of agents of the specified type
     */
    function getAgentsByType(AgentType agentType) external view returns (Agent[] memory typeAgents) {
        uint256 typeCount = 0;
        
        // Count agents of specified type
        for (uint256 i = 0; i < agentAddresses.length; i++) {
            Agent memory agent = agents[agentAddresses[i]];
            if (agent.isActive && agent.agentType == agentType) {
                typeCount++;
            }
        }
        
        // Build agents array
        typeAgents = new Agent[](typeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < agentAddresses.length; i++) {
            Agent memory agent = agents[agentAddresses[i]];
            if (agent.isActive && agent.agentType == agentType) {
                typeAgents[index] = agent;
                index++;
            }
        }
    }
    
    /**
     * @notice Get agent by URL
     * @param agentUrl URL to look up
     * @return agent Agent data
     */
    function getAgentByUrl(string calldata agentUrl) external view returns (Agent memory agent) {
        address agentAddress = urlToAgent[agentUrl];
        require(agentAddress != address(0), "Agent not found");
        return agents[agentAddress];
    }
    
    /**
     * @notice Get total number of registered agents
     * @return Total count of registered agents
     */
    function getAgentCount() external view returns (uint256) {
        return agentAddresses.length;
    }
    
    /**
     * @notice Get active agent count
     * @return Total count of active agents
     */
    function getActiveAgentCount() external view returns (uint256) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < agentAddresses.length; i++) {
            if (agents[agentAddresses[i]].isActive) {
                activeCount++;
            }
        }
        return activeCount;
    }
} 