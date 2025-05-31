// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./AgentRegistry.sol";
import "./ReputationLayer.sol";

/**
 * @title OrchestrationContract
 * @notice Handles payments, task assignments, and dispute resolution in the orchestrator protocol
 * @dev Manages task lifecycle, escrow payments, and integrates with registry and reputation systems
 */
contract OrchestrationContract {
    enum TaskStatus { PENDING, EXECUTING, COMPLETED, FAILED, DISPUTED, CANCELLED }
    
    struct TaskExecution {
        bytes32 taskId;           // Unique task identifier
        address orchestrator;     // Address that created the task
        address agent;            // Agent assigned to execute the task
        uint256 payment;          // Payment amount in wei
        bytes32 inputHash;        // Hash of input data for verification
        bytes32 outputHash;       // Hash of output data (set upon completion)
        TaskStatus status;        // Current task status
        uint256 createdAt;        // Task creation timestamp
        uint256 deadline;         // Task deadline timestamp
        uint256 executionTime;    // Time taken to complete task (for reputation)
    }
    
    // Events
    event TaskCreated(
        bytes32 indexed taskId,
        address indexed orchestrator,
        address indexed agent,
        uint256 payment,
        uint256 deadline
    );
    
    event TaskExecuted(
        bytes32 indexed taskId,
        address indexed agent,
        bytes32 outputHash,
        uint256 executionTime
    );
    
    event TaskCompleted(
        bytes32 indexed taskId,
        address indexed orchestrator,
        address indexed agent,
        uint256 payment
    );
    
    event TaskFailed(
        bytes32 indexed taskId,
        address indexed agent,
        string reason
    );
    
    event TaskDisputed(
        bytes32 indexed taskId,
        address indexed disputeInitiator
    );
    
    event TaskCancelled(
        bytes32 indexed taskId,
        address indexed orchestrator
    );
    
    event PaymentWithdrawn(
        address indexed agent,
        uint256 amount
    );
    
    // Storage
    mapping(bytes32 => TaskExecution) public tasks;
    mapping(address => uint256) public agentBalances; // Accumulated payments
    mapping(address => uint256) public totalEarnings; // Total lifetime earnings
    bytes32[] public taskIds; // For enumeration
    
    // Contract dependencies
    AgentRegistry public agentRegistry;
    ReputationLayer public reputationLayer;
    
    // Constants
    uint256 public constant DISPUTE_PERIOD = 24 hours; // Time to dispute after completion
    uint256 public constant MAX_TASK_DURATION = 7 days; // Maximum task duration
    
    // Access control
    address public owner;
    mapping(address => bool) public authorizedDisputers; // Can resolve disputes
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }
    
    modifier taskExists(bytes32 taskId) {
        require(tasks[taskId].createdAt != 0, "Task does not exist");
        _;
    }
    
    modifier onlyOrchestrator(bytes32 taskId) {
        require(tasks[taskId].orchestrator == msg.sender, "Only orchestrator can perform this action");
        _;
    }
    
    modifier onlyAssignedAgent(bytes32 taskId) {
        require(tasks[taskId].agent == msg.sender, "Only assigned agent can perform this action");
        _;
    }
    
    constructor(address _agentRegistry, address _reputationLayer) {
        owner = msg.sender;
        agentRegistry = AgentRegistry(_agentRegistry);
        reputationLayer = ReputationLayer(_reputationLayer);
        authorizedDisputers[msg.sender] = true;
    }
    
    /**
     * @notice Create a new task and escrow payment
     * @param agent Address of the agent to execute the task
     * @param inputHash Hash of the task input data
     * @param deadline Task deadline timestamp
     * @return taskId Generated task identifier
     */
    function createTask(
        address agent,
        bytes32 inputHash,
        uint256 deadline
    ) external payable returns (bytes32 taskId) {
        require(agent != address(0), "Invalid agent address");
        require(msg.value > 0, "Payment must be greater than 0");
        require(deadline > block.timestamp, "Deadline must be in the future");
        require(deadline <= block.timestamp + MAX_TASK_DURATION, "Deadline too far in future");
        
        // Verify agent is registered and active
        (,,,,,bool isActive,,) = agentRegistry.agents(agent);
        require(isActive, "Agent is not active");
        
        // Generate unique task ID
        taskId = keccak256(abi.encodePacked(
            msg.sender,
            agent,
            inputHash,
            block.timestamp,
            block.number
        ));
        
        require(tasks[taskId].createdAt == 0, "Task ID collision");
        
        // Create task
        tasks[taskId] = TaskExecution({
            taskId: taskId,
            orchestrator: msg.sender,
            agent: agent,
            payment: msg.value,
            inputHash: inputHash,
            outputHash: bytes32(0),
            status: TaskStatus.PENDING,
            createdAt: block.timestamp,
            deadline: deadline,
            executionTime: 0
        });
        
        taskIds.push(taskId);
        
        emit TaskCreated(taskId, msg.sender, agent, msg.value, deadline);
    }
    
    /**
     * @notice Agent accepts and starts executing a task
     * @param taskId Task identifier to execute
     */
    function acceptTask(bytes32 taskId) 
        external 
        taskExists(taskId) 
        onlyAssignedAgent(taskId) 
    {
        TaskExecution storage task = tasks[taskId];
        require(task.status == TaskStatus.PENDING, "Task is not pending");
        require(block.timestamp <= task.deadline, "Task deadline passed");
        
        task.status = TaskStatus.EXECUTING;
    }
    
    /**
     * @notice Agent submits task execution result
     * @param taskId Task identifier
     * @param outputHash Hash of the output data
     */
    function submitTaskResult(
        bytes32 taskId,
        bytes32 outputHash
    ) external taskExists(taskId) onlyAssignedAgent(taskId) {
        TaskExecution storage task = tasks[taskId];
        require(task.status == TaskStatus.EXECUTING, "Task is not being executed");
        require(block.timestamp <= task.deadline, "Task deadline passed");
        require(outputHash != bytes32(0), "Output hash cannot be empty");
        
        task.outputHash = outputHash;
        task.executionTime = block.timestamp - task.createdAt;
        task.status = TaskStatus.COMPLETED;
        
        // Add payment to agent's balance
        agentBalances[task.agent] += task.payment;
        totalEarnings[task.agent] += task.payment;
        
        // Update reputation
        reputationLayer.recordTaskCompletion(task.agent, true, task.executionTime);
        
        emit TaskExecuted(taskId, task.agent, outputHash, task.executionTime);
        emit TaskCompleted(taskId, task.orchestrator, task.agent, task.payment);
    }
    
    /**
     * @notice Mark a task as failed (can be called by agent or when deadline passes)
     * @param taskId Task identifier
     * @param reason Failure reason
     */
    function markTaskFailed(
        bytes32 taskId,
        string calldata reason
    ) external taskExists(taskId) {
        TaskExecution storage task = tasks[taskId];
        
        // Agent can mark their own task as failed, or anyone can mark after deadline
        require(
            msg.sender == task.agent || 
            msg.sender == task.orchestrator ||
            block.timestamp > task.deadline,
            "Not authorized to mark task as failed"
        );
        
        require(
            task.status == TaskStatus.PENDING || task.status == TaskStatus.EXECUTING,
            "Task cannot be marked as failed in current status"
        );
        
        task.status = TaskStatus.FAILED;
        task.executionTime = block.timestamp - task.createdAt;
        
        // Refund payment to orchestrator
        payable(task.orchestrator).transfer(task.payment);
        
        // Update reputation with failure
        reputationLayer.recordTaskCompletion(task.agent, false, task.executionTime);
        
        emit TaskFailed(taskId, task.agent, reason);
    }
    
    /**
     * @notice Cancel a pending task (only orchestrator, only if not started)
     * @param taskId Task identifier
     */
    function cancelTask(bytes32 taskId) 
        external 
        taskExists(taskId) 
        onlyOrchestrator(taskId) 
    {
        TaskExecution storage task = tasks[taskId];
        require(task.status == TaskStatus.PENDING, "Can only cancel pending tasks");
        
        task.status = TaskStatus.CANCELLED;
        
        // Refund payment to orchestrator
        payable(task.orchestrator).transfer(task.payment);
        
        emit TaskCancelled(taskId, task.orchestrator);
    }
    
    /**
     * @notice Dispute a completed task
     * @param taskId Task identifier
     */
    function disputeTask(bytes32 taskId) 
        external 
        taskExists(taskId) 
        onlyOrchestrator(taskId) 
    {
        TaskExecution storage task = tasks[taskId];
        require(task.status == TaskStatus.COMPLETED, "Can only dispute completed tasks");
        require(
            block.timestamp <= task.createdAt + task.executionTime + DISPUTE_PERIOD,
            "Dispute period has expired"
        );
        
        task.status = TaskStatus.DISPUTED;
        
        // Freeze agent's balance for this payment
        agentBalances[task.agent] -= task.payment;
        
        emit TaskDisputed(taskId, msg.sender);
    }
    
    /**
     * @notice Resolve a disputed task (only authorized disputers)
     * @param taskId Task identifier
     * @param favorAgent Whether to favor the agent (true) or orchestrator (false)
     */
    function resolveDispute(
        bytes32 taskId,
        bool favorAgent
    ) external taskExists(taskId) {
        require(authorizedDisputers[msg.sender], "Not authorized to resolve disputes");
        
        TaskExecution storage task = tasks[taskId];
        require(task.status == TaskStatus.DISPUTED, "Task is not disputed");
        
        if (favorAgent) {
            // Return payment to agent
            agentBalances[task.agent] += task.payment;
            task.status = TaskStatus.COMPLETED;
        } else {
            // Refund to orchestrator
            payable(task.orchestrator).transfer(task.payment);
            task.status = TaskStatus.FAILED;
            
            // Update reputation with negative feedback
            reputationLayer.recordTaskCompletion(task.agent, false, task.executionTime);
        }
    }
    
    /**
     * @notice Agent withdraws accumulated balance
     */
    function withdrawBalance() external {
        uint256 balance = agentBalances[msg.sender];
        require(balance > 0, "No balance to withdraw");
        
        agentBalances[msg.sender] = 0;
        payable(msg.sender).transfer(balance);
        
        emit PaymentWithdrawn(msg.sender, balance);
    }
    
    /**
     * @notice Authorize address to resolve disputes
     * @param disputer Address to authorize
     */
    function authorizeDisputer(address disputer) external onlyOwner {
        authorizedDisputers[disputer] = true;
    }
    
    /**
     * @notice Revoke dispute resolution authority
     * @param disputer Address to revoke
     */
    function revokeDisputer(address disputer) external onlyOwner {
        authorizedDisputers[disputer] = false;
    }
    
    /**
     * @notice Get task details
     * @param taskId Task identifier
     * @return Task execution details
     */
    function getTask(bytes32 taskId) external view returns (TaskExecution memory) {
        return tasks[taskId];
    }
    
    /**
     * @notice Get tasks by orchestrator
     * @param orchestrator Address of the orchestrator
     * @return orchestratorTasks Array of task IDs created by the orchestrator
     */
    function getTasksByOrchestrator(address orchestrator) 
        external 
        view 
        returns (bytes32[] memory orchestratorTasks) 
    {
        uint256 count = 0;
        
        // Count tasks by orchestrator
        for (uint256 i = 0; i < taskIds.length; i++) {
            if (tasks[taskIds[i]].orchestrator == orchestrator) {
                count++;
            }
        }
        
        // Build array
        orchestratorTasks = new bytes32[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < taskIds.length; i++) {
            if (tasks[taskIds[i]].orchestrator == orchestrator) {
                orchestratorTasks[index] = taskIds[i];
                index++;
            }
        }
    }
    
    /**
     * @notice Get tasks by agent
     * @param agent Address of the agent
     * @return agentTasks Array of task IDs assigned to the agent
     */
    function getTasksByAgent(address agent) 
        external 
        view 
        returns (bytes32[] memory agentTasks) 
    {
        uint256 count = 0;
        
        // Count tasks by agent
        for (uint256 i = 0; i < taskIds.length; i++) {
            if (tasks[taskIds[i]].agent == agent) {
                count++;
            }
        }
        
        // Build array
        agentTasks = new bytes32[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < taskIds.length; i++) {
            if (tasks[taskIds[i]].agent == agent) {
                agentTasks[index] = taskIds[i];
                index++;
            }
        }
    }
    
    /**
     * @notice Get total number of tasks
     * @return Total task count
     */
    function getTaskCount() external view returns (uint256) {
        return taskIds.length;
    }
    
    /**
     * @notice Emergency withdrawal (only owner, for stuck funds)
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient contract balance");
        payable(owner).transfer(amount);
    }
} 