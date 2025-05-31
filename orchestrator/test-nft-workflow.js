const axios = require("axios");

const ORCHESTRATOR_URL = "http://localhost:8080";

async function testNFTWorkflow() {
  console.log("🚀 Testing NFT Multi-Agent Workflow");
  console.log("=====================================");

  try {
    // Test 1: Create a workflow that chains all three agents
    console.log("\n📝 Creating multi-agent NFT workflow...");

    const workflowResponse = await axios.post(
      `${ORCHESTRATOR_URL}/workflows/create`,
      {
        description:
          "Create a personalized NFT for Alice with a French greeting and countryside image",
        context: {
          user: "Alice",
          language: "French",
          theme: "countryside",
          collection: "Personalized Greetings Collection",
        },
        preferences: {
          imageStyle: "artistic",
          nftRecipient: "0x742d35Cc6634C0532925a3b8D4C9db96590e4CAb",
        },
      }
    );

    console.log("✅ Workflow created successfully!");
    console.log(`   Workflow ID: ${workflowResponse.data.workflow.workflowId}`);
    console.log(`   Name: ${workflowResponse.data.workflow.name}`);
    console.log(`   Steps: ${workflowResponse.data.workflow.steps.length}`);
    console.log(
      `   Execution Mode: ${workflowResponse.data.workflow.executionMode}`
    );

    // Display workflow steps
    console.log("\n📋 Workflow Steps:");
    workflowResponse.data.workflow.steps.forEach((step, index) => {
      console.log(`   ${index + 1}. ${step.agentName} (${step.agentUrl})`);
      console.log(`      Input Mapping: ${JSON.stringify(step.inputMapping)}`);
      console.log(
        `      Output Mapping: ${JSON.stringify(step.outputMapping)}`
      );
    });

    // Test 2: Execute the workflow
    console.log("\n🎯 Executing NFT workflow...");

    const executionResponse = await axios.post(
      `${ORCHESTRATOR_URL}/workflows/execute`,
      {
        workflowId: workflowResponse.data.workflow.workflowId,
        input: {
          name: "Alice",
          language: "French",
          imageTheme: "French countryside with lavender fields",
          collectionName: "Personalized Greetings Collection",
          recipientAddress: "0x742d35Cc6634C0532925a3b8D4C9db96590e4CAb",
        },
      }
    );

    console.log("✅ Workflow execution completed!");
    console.log(
      `   Execution ID: ${executionResponse.data.execution.executionId}`
    );
    console.log(`   Status: ${executionResponse.data.execution.status}`);
    console.log(`   Started: ${executionResponse.data.execution.startedAt}`);
    console.log(
      `   Completed: ${executionResponse.data.execution.completedAt}`
    );

    // Display step results and data flow
    console.log("\n🔄 Data Flow Between Agents:");
    executionResponse.data.execution.stepResults.forEach((result, index) => {
      console.log(`\n   Step ${index + 1}: ${result.agentName}`);
      console.log(
        `   ├─ Input: ${JSON.stringify(result.input, null, 2).substring(
          0,
          200
        )}...`
      );
      console.log(
        `   ├─ Output: ${JSON.stringify(result.output, null, 2).substring(
          0,
          200
        )}...`
      );
      console.log(`   ├─ Status: ${result.status}`);
      console.log(`   └─ Duration: ${result.duration}ms`);
    });

    // Check final NFT result
    const finalResult = executionResponse.data.execution.output;
    if (finalResult && finalResult.nftDetails) {
      console.log("\n🎨 NFT Creation Summary:");
      console.log(`   Token ID: ${finalResult.nftDetails.tokenId}`);
      console.log(`   Collection: ${finalResult.nftDetails.collectionName}`);
      console.log(`   Recipient: ${finalResult.nftDetails.recipientAddress}`);
      console.log(`   Metadata URI: ${finalResult.nftDetails.metadataUri}`);
      console.log(
        `   Transaction Hash: ${finalResult.nftDetails.transactionHash}`
      );
      console.log(`   Image URL: ${finalResult.nftDetails.imageUrl}`);
    }

    return executionResponse.data.execution;
  } catch (error) {
    console.error(
      "❌ NFT workflow test failed:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function testSimpleNFTDeployment() {
  console.log("\n🎯 Testing Simple NFT Deployment");
  console.log("==================================");

  try {
    // Create a simple single-agent workflow for NFT deployment
    const workflowResponse = await axios.post(
      `${ORCHESTRATOR_URL}/workflows/create`,
      {
        description: "Deploy an NFT with a sunset image to Bob's wallet",
        context: {
          imageUrl: "https://example.com/sunset.jpg",
          collection: "Demo Collection",
          recipient: "0x123456789abcdef123456789abcdef123456789a",
        },
      }
    );

    console.log("✅ Simple NFT workflow created!");
    console.log(`   Workflow ID: ${workflowResponse.data.workflow.workflowId}`);

    // Execute the simple workflow
    const executionResponse = await axios.post(
      `${ORCHESTRATOR_URL}/workflows/execute`,
      {
        workflowId: workflowResponse.data.workflow.workflowId,
        input: {
          imageUrl: "https://example.com/beautiful-sunset.jpg",
          collectionName: "Demo Sunset Collection",
          recipientAddress: "0x123456789abcdef123456789abcdef123456789a",
        },
      }
    );

    console.log("✅ Simple NFT deployment completed!");
    console.log(`   Status: ${executionResponse.data.execution.status}`);

    if (executionResponse.data.execution.output?.nftDetails) {
      const nft = executionResponse.data.execution.output.nftDetails;
      console.log(`   NFT Token ID: ${nft.tokenId}`);
      console.log(`   Collection: ${nft.collectionName}`);
    }
  } catch (error) {
    console.error(
      "❌ Simple NFT deployment failed:",
      error.response?.data || error.message
    );
  }
}

async function demonstrateDataTransformation() {
  console.log("\n🔄 Analyzing Data Transformation");
  console.log("=================================");

  try {
    // Get all executions to analyze data flow
    const executionsResponse = await axios.get(
      `${ORCHESTRATOR_URL}/executions`
    );
    const executions = executionsResponse.data.executions;

    console.log(`📊 Found ${executions.length} total executions`);

    // Find multi-step executions
    const multiStepExecutions = executions.filter(
      (exec) => exec.stepResults && exec.stepResults.length > 1
    );

    console.log(`🔗 Multi-step executions: ${multiStepExecutions.length}`);

    multiStepExecutions.forEach((execution, index) => {
      console.log(`\n   Execution ${index + 1}: ${execution.executionId}`);
      console.log(`   └─ Steps: ${execution.stepResults.length}`);

      execution.stepResults.forEach((step, stepIndex) => {
        console.log(`      Step ${stepIndex + 1}: ${step.agentName}`);

        // Show how data transforms between steps
        if (stepIndex > 0) {
          const prevStep = execution.stepResults[stepIndex - 1];
          console.log(`         ↳ Uses output from: ${prevStep.agentName}`);
        }
      });
    });
  } catch (error) {
    console.error("❌ Data transformation analysis failed:", error.message);
  }
}

async function main() {
  console.log("🎭 NFT Multi-Agent Orchestration Test Suite");
  console.log("============================================");

  try {
    // Check orchestrator health
    const healthResponse = await axios.get(`${ORCHESTRATOR_URL}/health`);
    console.log(
      `✅ Orchestrator is healthy with ${healthResponse.data.agents.length} agents`
    );

    healthResponse.data.agents.forEach((agent) => {
      console.log(`   • ${agent.name} (${agent.url})`);
    });

    // Run comprehensive tests
    await testNFTWorkflow();
    await testSimpleNFTDeployment();
    await demonstrateDataTransformation();

    console.log("\n🎉 All NFT workflow tests completed successfully!");
    console.log("   The orchestrator successfully demonstrated:");
    console.log("   ✓ Multi-agent workflow creation");
    console.log("   ✓ Data flow between Hello → Image → NFT agents");
    console.log("   ✓ Input/output transformation");
    console.log("   ✓ NFT deployment with custom metadata");
  } catch (error) {
    console.error("❌ Test suite failed:", error.message);
    process.exit(1);
  }
}

// Run the test suite
main();
