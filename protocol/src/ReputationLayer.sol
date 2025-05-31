// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ReputationLayer
 * @notice Tracks agent performance and reputation in the orchestrator protocol
 * @dev Manages reputation scores, task completion rates, and ratings
 */
contract ReputationLayer {
    struct AgentReputation {
        uint256 totalTasks;         // Total tasks attempted
        uint256 successfulTasks;    // Successfully completed tasks
        uint256 totalLatency;       // Cumulative response time in seconds
        uint256 totalRatingSum;     // Sum of all ratings received
        uint256 ratingCount;        // Number of ratings received
        uint256 lastUpdated;        // Last reputation update timestamp
        mapping(address => bool) hasRated; // Prevent double rating per orchestrator
    }
    
    // Events
    event TaskCompleted(
        address indexed agent,
        address indexed orchestrator,
        bool success,
        uint256 latency
    );
    
    event AgentRated(
        address indexed agent,
        address indexed rater,
        uint8 rating
    );
    
    event ReputationUpdated(
        address indexed agent,
        uint256 newScore,
        uint256 successRate,
        uint256 averageLatency
    );
    
    // Storage
    mapping(address => AgentReputation) public reputations;
    address[] public agentList; // For enumeration
    
    // Constants
    uint256 public constant MAX_RATING = 5;
    uint256 public constant MIN_RATING = 1;
    uint256 public constant REPUTATION_PRECISION = 10000; // For percentage calculations
    
    // Access control - only authorized orchestrators can record task completions
    mapping(address => bool) public authorizedOrchestrators;
    address public owner;
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }
    
    modifier onlyAuthorizedOrchestrator() {
        require(
            authorizedOrchestrators[msg.sender] || msg.sender == owner,
            "Only authorized orchestrators can record tasks"
        );
        _;
    }
    
    constructor() {
        owner = msg.sender;
        authorizedOrchestrators[msg.sender] = true;
    }
    
    /**
     * @notice Authorize an orchestrator to record task completions
     * @param orchestrator Address of the orchestrator to authorize
     */
    function authorizeOrchestrator(address orchestrator) external onlyOwner {
        authorizedOrchestrators[orchestrator] = true;
    }
    
    /**
     * @notice Revoke orchestrator authorization
     * @param orchestrator Address of the orchestrator to revoke
     */
    function revokeOrchestrator(address orchestrator) external onlyOwner {
        authorizedOrchestrators[orchestrator] = false;
    }
    
    /**
     * @notice Record task completion for an agent
     * @param agent Address of the agent that executed the task
     * @param success Whether the task was completed successfully
     * @param latency Task execution time in seconds
     */
    function recordTaskCompletion(
        address agent,
        bool success,
        uint256 latency
    ) external onlyAuthorizedOrchestrator {
        require(agent != address(0), "Invalid agent address");
        
        AgentReputation storage reputation = reputations[agent];
        
        // Initialize agent if first task
        if (reputation.totalTasks == 0) {
            agentList.push(agent);
        }
        
        reputation.totalTasks++;
        reputation.totalLatency += latency;
        reputation.lastUpdated = block.timestamp;
        
        if (success) {
            reputation.successfulTasks++;
        }
        
        emit TaskCompleted(agent, msg.sender, success, latency);
        
        // Calculate and emit updated reputation score
        uint256 newScore = calculateReputationScore(agent);
        uint256 successRate = (reputation.successfulTasks * REPUTATION_PRECISION) / reputation.totalTasks;
        uint256 averageLatency = reputation.totalLatency / reputation.totalTasks;
        
        emit ReputationUpdated(agent, newScore, successRate, averageLatency);
    }
    
    /**
     * @notice Rate an agent (1-5 stars)
     * @param agent Address of the agent to rate
     * @param rating Rating from 1 to 5
     */
    function rateAgent(address agent, uint8 rating) external {
        require(agent != address(0), "Invalid agent address");
        require(rating >= MIN_RATING && rating <= MAX_RATING, "Rating must be between 1 and 5");
        require(!reputations[agent].hasRated[msg.sender], "Already rated this agent");
        require(reputations[agent].totalTasks > 0, "Agent has no task history");
        
        AgentReputation storage reputation = reputations[agent];
        reputation.hasRated[msg.sender] = true;
        reputation.totalRatingSum += rating;
        reputation.ratingCount++;
        reputation.lastUpdated = block.timestamp;
        
        emit AgentRated(agent, msg.sender, rating);
        
        // Emit updated reputation
        uint256 newScore = calculateReputationScore(agent);
        uint256 successRate = (reputation.successfulTasks * REPUTATION_PRECISION) / reputation.totalTasks;
        uint256 averageLatency = reputation.totalLatency / reputation.totalTasks;
        
        emit ReputationUpdated(agent, newScore, successRate, averageLatency);
    }
    
    /**
     * @notice Calculate comprehensive reputation score for an agent
     * @param agent Address of the agent
     * @return Reputation score (0-10000, with 10000 being perfect)
     */
    function calculateReputationScore(address agent) public view returns (uint256) {
        AgentReputation storage reputation = reputations[agent];
        
        if (reputation.totalTasks == 0) {
            return 0; // No history
        }
        
        // Base score from success rate (0-4000 points, 40% weight)
        uint256 successRate = (reputation.successfulTasks * REPUTATION_PRECISION) / reputation.totalTasks;
        uint256 successScore = (successRate * 4000) / REPUTATION_PRECISION;
        
        // Rating score (0-4000 points, 40% weight)
        uint256 ratingScore = 0;
        if (reputation.ratingCount > 0) {
            uint256 averageRating = reputation.totalRatingSum / reputation.ratingCount;
            // Ensure averageRating is at least MIN_RATING to prevent underflow
            if (averageRating >= MIN_RATING) {
                ratingScore = ((averageRating - 1) * 4000) / (MAX_RATING - 1); // Normalize to 0-4000
            }
        } else {
            // Default neutral rating if no ratings yet
            ratingScore = 2000; // 50% of rating weight
        }
        
        // Latency score (0-2000 points, 20% weight)
        // Lower latency = higher score. Assume 30 seconds is excellent, 300 seconds is poor
        uint256 latencyScore = 2000;
        if (reputation.totalTasks > 0) {
            uint256 averageLatency = reputation.totalLatency / reputation.totalTasks;
            if (averageLatency <= 30) {
                latencyScore = 2000; // Excellent
            } else if (averageLatency >= 300) {
                latencyScore = 0; // Poor
            } else {
                // Linear scale between 30-300 seconds
                // Only calculate if averageLatency > 30 to prevent underflow
                latencyScore = 2000 - ((averageLatency - 30) * 2000) / 270;
            }
        }
        
        return successScore + ratingScore + latencyScore;
    }
    
    /**
     * @notice Get detailed reputation data for an agent
     * @param agent Address of the agent
     * @return totalTasks Total tasks attempted
     * @return successfulTasks Successfully completed tasks
     * @return averageLatency Average response time in seconds
     * @return averageRating Average rating (scaled by 100, so 450 = 4.5 stars)
     * @return reputationScore Overall reputation score (0-10000)
     */
    function getReputationData(address agent) 
        external 
        view 
        returns (
            uint256 totalTasks,
            uint256 successfulTasks,
            uint256 averageLatency,
            uint256 averageRating,
            uint256 reputationScore
        ) 
    {
        AgentReputation storage reputation = reputations[agent];
        
        totalTasks = reputation.totalTasks;
        successfulTasks = reputation.successfulTasks;
        
        if (totalTasks > 0) {
            averageLatency = reputation.totalLatency / totalTasks;
        }
        
        if (reputation.ratingCount > 0) {
            averageRating = (reputation.totalRatingSum * 100) / reputation.ratingCount;
        }
        
        reputationScore = calculateReputationScore(agent);
    }
    
    /**
     * @notice Get success rate for an agent as a percentage (0-10000)
     * @param agent Address of the agent
     * @return Success rate in basis points (10000 = 100%)
     */
    function getSuccessRate(address agent) external view returns (uint256) {
        AgentReputation storage reputation = reputations[agent];
        if (reputation.totalTasks == 0) {
            return 0;
        }
        return (reputation.successfulTasks * REPUTATION_PRECISION) / reputation.totalTasks;
    }
    
    /**
     * @notice Get top agents by reputation score
     * @param count Number of top agents to return
     * @return topAgents Array of agent addresses sorted by reputation score
     * @return scores Array of corresponding reputation scores
     */
    function getTopAgents(uint256 count) 
        external 
        view 
        returns (address[] memory topAgents, uint256[] memory scores) 
    {
        uint256 totalAgents = agentList.length;
        if (count > totalAgents) {
            count = totalAgents;
        }
        
        // Create arrays for sorting
        address[] memory allAgents = new address[](totalAgents);
        uint256[] memory allScores = new uint256[](totalAgents);
        
        for (uint256 i = 0; i < totalAgents; i++) {
            allAgents[i] = agentList[i];
            allScores[i] = calculateReputationScore(agentList[i]);
        }
        
        // Simple bubble sort (not gas efficient for large arrays, but fine for moderate sizes)
        for (uint256 i = 0; i < totalAgents - 1; i++) {
            for (uint256 j = 0; j < totalAgents - i - 1; j++) {
                if (allScores[j] < allScores[j + 1]) {
                    // Swap scores
                    uint256 tempScore = allScores[j];
                    allScores[j] = allScores[j + 1];
                    allScores[j + 1] = tempScore;
                    
                    // Swap agents
                    address tempAgent = allAgents[j];
                    allAgents[j] = allAgents[j + 1];
                    allAgents[j + 1] = tempAgent;
                }
            }
        }
        
        // Return top agents
        topAgents = new address[](count);
        scores = new uint256[](count);
        
        for (uint256 i = 0; i < count; i++) {
            topAgents[i] = allAgents[i];
            scores[i] = allScores[i];
        }
    }
    
    /**
     * @notice Check if an address has rated a specific agent
     * @param agent Agent address
     * @param rater Rater address
     * @return Whether the rater has already rated this agent
     */
    function hasRated(address agent, address rater) external view returns (bool) {
        return reputations[agent].hasRated[rater];
    }
    
    /**
     * @notice Get total number of agents with reputation data
     * @return Total count of agents
     */
    function getAgentCount() external view returns (uint256) {
        return agentList.length;
    }
} 