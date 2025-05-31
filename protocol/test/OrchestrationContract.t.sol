// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/OrchestrationContract.sol";
import "../src/AgentRegistry.sol";
import "../src/ReputationLayer.sol";

contract OrchestrationContractTest is Test {
    OrchestrationContract public orchestration;
    AgentRegistry public registry;
    ReputationLayer public reputation;
    
    address public owner = address(1);
    address public orchestrator = address(2);
    address public agent1 = address(3);
    address public agent2 = address(4);
    
    string constant AGENT1_URL = "http://localhost:3001";
    string constant METADATA_URI = "ipfs://QmTestHash123";
    uint256 constant BASE_COST = 1 ether;
    uint256 constant PAYMENT_AMOUNT = 0.5 ether;
    
    bytes32 constant INPUT_HASH = keccak256("test input data");
    bytes32 constant OUTPUT_HASH = keccak256("test output data");
    
    event TaskCreated(
        bytes32 indexed taskId,
        address indexed orchestrator,
        address indexed agent,
        uint256 payment,
        uint256 deadline
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
    
    event PaymentWithdrawn(
        address indexed agent,
        uint256 amount
    );
    
    function setUp() public {
        vm.prank(owner);
        registry = new AgentRegistry();
        
        vm.prank(owner);
        reputation = new ReputationLayer();
        
        vm.prank(owner);
        orchestration = new OrchestrationContract(address(registry), address(reputation));
        
        // Authorize orchestration contract to update reputation
        vm.prank(owner);
        reputation.authorizeOrchestrator(address(orchestration));
        
        // Register test agents
        vm.prank(owner);
        registry.registerAgent(
            agent1,
            AGENT1_URL,
            METADATA_URI,
            BASE_COST,
            AgentRegistry.AgentType.HTTP
        );
        
        // Fund orchestrator
        vm.deal(orchestrator, 10 ether);
    }
    
    function testCreateTask() public {
        uint256 deadline = block.timestamp + 1 hours;
        
        vm.prank(orchestrator);
        vm.expectEmit(false, true, true, true); // Don't check taskId as it's computed
        emit TaskCreated(bytes32(0), orchestrator, agent1, PAYMENT_AMOUNT, deadline);
        
        bytes32 taskId = orchestration.createTask{value: PAYMENT_AMOUNT}(
            agent1,
            INPUT_HASH,
            deadline
        );
        
        // Verify task creation
        OrchestrationContract.TaskExecution memory task = orchestration.getTask(taskId);
        assertEq(task.orchestrator, orchestrator);
        assertEq(task.agent, agent1);
        assertEq(task.payment, PAYMENT_AMOUNT);
        assertEq(task.inputHash, INPUT_HASH);
        assertEq(task.deadline, deadline);
        assertTrue(uint8(task.status) == uint8(OrchestrationContract.TaskStatus.PENDING));
        
        // Verify contract balance
        assertEq(address(orchestration).balance, PAYMENT_AMOUNT);
        
        // Verify task count
        assertEq(orchestration.getTaskCount(), 1);
    }
    
    function testCannotCreateTaskWithZeroPayment() public {
        uint256 deadline = block.timestamp + 1 hours;
        
        vm.prank(orchestrator);
        vm.expectRevert("Payment must be greater than 0");
        orchestration.createTask{value: 0}(agent1, INPUT_HASH, deadline);
    }
    
    function testCannotCreateTaskWithInvalidAgent() public {
        uint256 deadline = block.timestamp + 1 hours;
        
        vm.prank(orchestrator);
        vm.expectRevert("Invalid agent address");
        orchestration.createTask{value: PAYMENT_AMOUNT}(address(0), INPUT_HASH, deadline);
    }
    
    function testCannotCreateTaskWithInactiveAgent() public {
        // Deactivate agent
        vm.prank(owner);
        registry.deactivateAgent(agent1);
        
        uint256 deadline = block.timestamp + 1 hours;
        
        vm.prank(orchestrator);
        vm.expectRevert("Agent is not active");
        orchestration.createTask{value: PAYMENT_AMOUNT}(agent1, INPUT_HASH, deadline);
    }
    
    function testCannotCreateTaskWithPastDeadline() public {
        vm.prank(orchestrator);
        vm.expectRevert("Deadline must be in the future");
        orchestration.createTask{value: PAYMENT_AMOUNT}(agent1, INPUT_HASH, block.timestamp - 1);
    }
    
    function testAcceptTask() public {
        uint256 deadline = block.timestamp + 1 hours;
        
        vm.prank(orchestrator);
        bytes32 taskId = orchestration.createTask{value: PAYMENT_AMOUNT}(
            agent1,
            INPUT_HASH,
            deadline
        );
        
        vm.prank(agent1);
        orchestration.acceptTask(taskId);
        
        OrchestrationContract.TaskExecution memory task = orchestration.getTask(taskId);
        assertTrue(uint8(task.status) == uint8(OrchestrationContract.TaskStatus.EXECUTING));
    }
    
    function testOnlyAssignedAgentCanAccept() public {
        uint256 deadline = block.timestamp + 1 hours;
        
        vm.prank(orchestrator);
        bytes32 taskId = orchestration.createTask{value: PAYMENT_AMOUNT}(
            agent1,
            INPUT_HASH,
            deadline
        );
        
        vm.prank(agent2);
        vm.expectRevert("Only assigned agent can perform this action");
        orchestration.acceptTask(taskId);
    }
    
    function testSubmitTaskResult() public {
        uint256 deadline = block.timestamp + 1 hours;
        
        vm.prank(orchestrator);
        bytes32 taskId = orchestration.createTask{value: PAYMENT_AMOUNT}(
            agent1,
            INPUT_HASH,
            deadline
        );
        
        vm.prank(agent1);
        orchestration.acceptTask(taskId);
        
        // Warp time forward to simulate execution time
        vm.warp(block.timestamp + 10);
        
        vm.prank(agent1);
        vm.expectEmit(true, true, false, true);
        emit TaskCompleted(taskId, orchestrator, agent1, PAYMENT_AMOUNT);
        
        orchestration.submitTaskResult(taskId, OUTPUT_HASH);
        
        // Verify task completion
        OrchestrationContract.TaskExecution memory task = orchestration.getTask(taskId);
        assertTrue(uint8(task.status) == uint8(OrchestrationContract.TaskStatus.COMPLETED));
        assertEq(task.outputHash, OUTPUT_HASH);
        assertGe(task.executionTime, 10); // Should be at least 10 seconds
        
        // Verify agent balance
        assertEq(orchestration.agentBalances(agent1), PAYMENT_AMOUNT);
        assertEq(orchestration.totalEarnings(agent1), PAYMENT_AMOUNT);
        
        // Verify reputation update
        (uint256 totalTasks, uint256 successfulTasks,,,) = reputation.getReputationData(agent1);
        assertEq(totalTasks, 1);
        assertEq(successfulTasks, 1);
    }
    
    function testWithdrawBalance() public {
        uint256 deadline = block.timestamp + 1 hours;
        
        vm.prank(orchestrator);
        bytes32 taskId = orchestration.createTask{value: PAYMENT_AMOUNT}(
            agent1,
            INPUT_HASH,
            deadline
        );
        
        vm.prank(agent1);
        orchestration.acceptTask(taskId);
        
        vm.prank(agent1);
        orchestration.submitTaskResult(taskId, OUTPUT_HASH);
        
        uint256 initialBalance = agent1.balance;
        
        vm.prank(agent1);
        vm.expectEmit(true, false, false, true);
        emit PaymentWithdrawn(agent1, PAYMENT_AMOUNT);
        
        orchestration.withdrawBalance();
        
        // Verify withdrawal
        assertEq(agent1.balance, initialBalance + PAYMENT_AMOUNT);
        assertEq(orchestration.agentBalances(agent1), 0);
    }
    
    function testCannotWithdrawZeroBalance() public {
        vm.prank(agent1);
        vm.expectRevert("No balance to withdraw");
        orchestration.withdrawBalance();
    }
    
    function testMarkTaskFailed() public {
        uint256 deadline = block.timestamp + 1 hours;
        
        vm.prank(orchestrator);
        bytes32 taskId = orchestration.createTask{value: PAYMENT_AMOUNT}(
            agent1,
            INPUT_HASH,
            deadline
        );
        
        vm.prank(agent1);
        orchestration.acceptTask(taskId);
        
        string memory reason = "Agent failure";
        uint256 orchestratorInitialBalance = orchestrator.balance;
        
        vm.prank(agent1);
        vm.expectEmit(true, true, false, true);
        emit TaskFailed(taskId, agent1, reason);
        
        orchestration.markTaskFailed(taskId, reason);
        
        // Verify task failure
        OrchestrationContract.TaskExecution memory task = orchestration.getTask(taskId);
        assertTrue(uint8(task.status) == uint8(OrchestrationContract.TaskStatus.FAILED));
        
        // Verify refund to orchestrator
        assertEq(orchestrator.balance, orchestratorInitialBalance + PAYMENT_AMOUNT);
        
        // Verify reputation update (failure)
        (uint256 totalTasks, uint256 successfulTasks,,,) = reputation.getReputationData(agent1);
        assertEq(totalTasks, 1);
        assertEq(successfulTasks, 0);
    }
    
    function testCancelTask() public {
        uint256 deadline = block.timestamp + 1 hours;
        
        vm.prank(orchestrator);
        bytes32 taskId = orchestration.createTask{value: PAYMENT_AMOUNT}(
            agent1,
            INPUT_HASH,
            deadline
        );
        
        uint256 orchestratorInitialBalance = orchestrator.balance;
        
        vm.prank(orchestrator);
        orchestration.cancelTask(taskId);
        
        // Verify task cancellation
        OrchestrationContract.TaskExecution memory task = orchestration.getTask(taskId);
        assertTrue(uint8(task.status) == uint8(OrchestrationContract.TaskStatus.CANCELLED));
        
        // Verify refund
        assertEq(orchestrator.balance, orchestratorInitialBalance + PAYMENT_AMOUNT);
    }
    
    function testCannotCancelExecutingTask() public {
        uint256 deadline = block.timestamp + 1 hours;
        
        vm.prank(orchestrator);
        bytes32 taskId = orchestration.createTask{value: PAYMENT_AMOUNT}(
            agent1,
            INPUT_HASH,
            deadline
        );
        
        vm.prank(agent1);
        orchestration.acceptTask(taskId);
        
        vm.prank(orchestrator);
        vm.expectRevert("Can only cancel pending tasks");
        orchestration.cancelTask(taskId);
    }
    
    function testDisputeTask() public {
        uint256 deadline = block.timestamp + 1 hours;
        
        vm.prank(orchestrator);
        bytes32 taskId = orchestration.createTask{value: PAYMENT_AMOUNT}(
            agent1,
            INPUT_HASH,
            deadline
        );
        
        vm.prank(agent1);
        orchestration.acceptTask(taskId);
        
        vm.prank(agent1);
        orchestration.submitTaskResult(taskId, OUTPUT_HASH);
        
        vm.prank(orchestrator);
        orchestration.disputeTask(taskId);
        
        // Verify dispute
        OrchestrationContract.TaskExecution memory task = orchestration.getTask(taskId);
        assertTrue(uint8(task.status) == uint8(OrchestrationContract.TaskStatus.DISPUTED));
        
        // Verify balance frozen
        assertEq(orchestration.agentBalances(agent1), 0);
    }
    
    function testResolveDisputeInFavorOfAgent() public {
        uint256 deadline = block.timestamp + 1 hours;
        
        vm.prank(orchestrator);
        bytes32 taskId = orchestration.createTask{value: PAYMENT_AMOUNT}(
            agent1,
            INPUT_HASH,
            deadline
        );
        
        vm.prank(agent1);
        orchestration.acceptTask(taskId);
        
        vm.prank(agent1);
        orchestration.submitTaskResult(taskId, OUTPUT_HASH);
        
        vm.prank(orchestrator);
        orchestration.disputeTask(taskId);
        
        vm.prank(owner); // Owner is authorized disputer
        orchestration.resolveDispute(taskId, true); // Favor agent
        
        // Verify resolution
        OrchestrationContract.TaskExecution memory task = orchestration.getTask(taskId);
        assertTrue(uint8(task.status) == uint8(OrchestrationContract.TaskStatus.COMPLETED));
        assertEq(orchestration.agentBalances(agent1), PAYMENT_AMOUNT);
    }
    
    function testResolveDisputeInFavorOfOrchestrator() public {
        uint256 deadline = block.timestamp + 1 hours;
        
        vm.prank(orchestrator);
        bytes32 taskId = orchestration.createTask{value: PAYMENT_AMOUNT}(
            agent1,
            INPUT_HASH,
            deadline
        );
        
        vm.prank(agent1);
        orchestration.acceptTask(taskId);
        
        vm.prank(agent1);
        orchestration.submitTaskResult(taskId, OUTPUT_HASH);
        
        vm.prank(orchestrator);
        orchestration.disputeTask(taskId);
        
        uint256 orchestratorInitialBalance = orchestrator.balance;
        
        vm.prank(owner);
        orchestration.resolveDispute(taskId, false); // Favor orchestrator
        
        // Verify resolution
        OrchestrationContract.TaskExecution memory task = orchestration.getTask(taskId);
        assertTrue(uint8(task.status) == uint8(OrchestrationContract.TaskStatus.FAILED));
        assertEq(orchestrator.balance, orchestratorInitialBalance + PAYMENT_AMOUNT);
    }
    
    function testGetTasksByOrchestrator() public {
        uint256 deadline = block.timestamp + 1 hours;
        
        // Create multiple tasks
        vm.prank(orchestrator);
        bytes32 taskId1 = orchestration.createTask{value: PAYMENT_AMOUNT}(
            agent1,
            INPUT_HASH,
            deadline
        );
        
        vm.prank(orchestrator);
        bytes32 taskId2 = orchestration.createTask{value: PAYMENT_AMOUNT}(
            agent1,
            keccak256("different input"),
            deadline
        );
        
        bytes32[] memory tasks = orchestration.getTasksByOrchestrator(orchestrator);
        assertEq(tasks.length, 2);
        assertTrue(tasks[0] == taskId1 || tasks[0] == taskId2);
        assertTrue(tasks[1] == taskId1 || tasks[1] == taskId2);
        assertTrue(tasks[0] != tasks[1]);
    }
    
    function testGetTasksByAgent() public {
        uint256 deadline = block.timestamp + 1 hours;
        
        vm.prank(orchestrator);
        bytes32 taskId = orchestration.createTask{value: PAYMENT_AMOUNT}(
            agent1,
            INPUT_HASH,
            deadline
        );
        
        bytes32[] memory tasks = orchestration.getTasksByAgent(agent1);
        assertEq(tasks.length, 1);
        assertEq(tasks[0], taskId);
    }
    
    function testTaskDeadlineExpiry() public {
        uint256 deadline = block.timestamp + 1 hours;
        
        vm.prank(orchestrator);
        bytes32 taskId = orchestration.createTask{value: PAYMENT_AMOUNT}(
            agent1,
            INPUT_HASH,
            deadline
        );
        
        vm.prank(agent1);
        orchestration.acceptTask(taskId);
        
        // Fast forward past deadline
        vm.warp(deadline + 1);
        
        string memory reason = "Deadline expired";
        uint256 orchestratorInitialBalance = orchestrator.balance;
        
        // Anyone can mark as failed after deadline
        vm.prank(address(999));
        orchestration.markTaskFailed(taskId, reason);
        
        // Verify failure and refund
        OrchestrationContract.TaskExecution memory task = orchestration.getTask(taskId);
        assertTrue(uint8(task.status) == uint8(OrchestrationContract.TaskStatus.FAILED));
        assertEq(orchestrator.balance, orchestratorInitialBalance + PAYMENT_AMOUNT);
    }
    
    function testFuzzCreateTask(
        address agent,
        uint256 payment,
        uint256 deadlineOffset
    ) public {
        vm.assume(agent != address(0));
        vm.assume(payment > 0 && payment <= 100 ether);
        vm.assume(deadlineOffset > 0 && deadlineOffset <= 7 days);
        
        // Register the agent
        vm.prank(owner);
        registry.registerAgent(
            agent,
            "http://test.com",
            METADATA_URI,
            BASE_COST,
            AgentRegistry.AgentType.HTTP
        );
        
        uint256 deadline = block.timestamp + deadlineOffset;
        
        vm.deal(orchestrator, payment);
        vm.prank(orchestrator);
        bytes32 taskId = orchestration.createTask{value: payment}(
            agent,
            INPUT_HASH,
            deadline
        );
        
        OrchestrationContract.TaskExecution memory task = orchestration.getTask(taskId);
        assertEq(task.agent, agent);
        assertEq(task.payment, payment);
        assertEq(task.deadline, deadline);
    }
} 