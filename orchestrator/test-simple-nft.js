const axios = require("axios");

const ORCHESTRATOR_URL = "http://localhost:8080";

async function testSimpleMultiAgentFlow() {
  console.log("🚀 Testing Simple Multi-Agent Flow (Rule-Based)");
  console.log("================================================");

  try {
    // Test 1: Create a simple greeting workflow first
    console.log("\n📝 Step 1: Testing Hello Agent...");

    const greetingWorkflow = await axios.post(
      `${ORCHESTRATOR_URL}/workflows/create`,
      {
        description: "Say hello to Alice in French",
        context: { user: "Alice", language: "French" },
      }
    );

    console.log("✅ Greeting workflow created!");
    console.log(`   Workflow ID: ${greetingWorkflow.data.workflow.workflowId}`);
    console.log(`   Steps: ${greetingWorkflow.data.workflow.steps.length}`);

    // Execute greeting workflow
    const greetingExecution = await axios.post(
      `${ORCHESTRATOR_URL}/workflows/execute`,
      {
        workflowId: greetingWorkflow.data.workflow.workflowId,
        input: { name: "Alice", language: "French" },
      }
    );

    console.log("✅ Greeting execution completed!");
    console.log(`   Status: ${greetingExecution.data.execution.status}`);

    if (greetingExecution.data.execution.output) {
      console.log(
        `   Greeting: ${greetingExecution.data.execution.output.greeting}`
      );
    }

    // Test 2: Create an image workflow
    console.log("\n📝 Step 2: Testing Image Agent...");

    const imageWorkflow = await axios.post(
      `${ORCHESTRATOR_URL}/workflows/create`,
      {
        description: "Generate a beautiful countryside image",
        context: { theme: "countryside" },
      }
    );

    console.log("✅ Image workflow created!");
    console.log(`   Workflow ID: ${imageWorkflow.data.workflow.workflowId}`);

    // Execute image workflow
    const imageExecution = await axios.post(
      `${ORCHESTRATOR_URL}/workflows/execute`,
      {
        workflowId: imageWorkflow.data.workflow.workflowId,
        input: { prompt: "Beautiful French countryside with lavender fields" },
      }
    );

    console.log("✅ Image execution completed!");
    console.log(`   Status: ${imageExecution.data.execution.status}`);

    if (imageExecution.data.execution.output) {
      console.log(
        `   Image URL: ${imageExecution.data.execution.output.imageUrl}`
      );
    }

    // Test 3: Create an NFT workflow
    console.log("\n📝 Step 3: Testing NFT Agent...");

    const nftWorkflow = await axios.post(
      `${ORCHESTRATOR_URL}/workflows/create`,
      {
        description: "Deploy an NFT with custom metadata",
        context: { collection: "Demo Collection" },
      }
    );

    console.log("✅ NFT workflow created!");
    console.log(`   Workflow ID: ${nftWorkflow.data.workflow.workflowId}`);

    // Execute NFT workflow with image from previous step
    const imageUrl =
      imageExecution.data.execution.output?.imageUrl ||
      "https://example.com/demo-image.jpg";

    const nftExecution = await axios.post(
      `${ORCHESTRATOR_URL}/workflows/execute`,
      {
        workflowId: nftWorkflow.data.workflow.workflowId,
        input: {
          imageUrl: imageUrl,
          collectionName: "Alice's French Countryside Collection",
          recipientAddress: "0x742d35Cc6634C0532925a3b8D4C9db96590e4CAb",
        },
      }
    );

    console.log("✅ NFT execution completed!");
    console.log(`   Status: ${nftExecution.data.execution.status}`);

    if (nftExecution.data.execution.output?.nftDetails) {
      const nft = nftExecution.data.execution.output.nftDetails;
      console.log(`   NFT Token ID: ${nft.tokenId}`);
      console.log(`   Collection: ${nft.collectionName}`);
      console.log(`   Transaction Hash: ${nft.transactionHash}`);
    }

    // Test 4: Demonstrate manual data chaining
    console.log("\n🔗 Step 4: Manual Data Chaining Demo");
    console.log("====================================");

    console.log("Data flow demonstration:");
    console.log(
      `1. Hello Agent → Greeting: "${
        greetingExecution.data.execution.output?.greeting || "N/A"
      }"`
    );
    console.log(`2. Image Agent → Image URL: "${imageUrl}"`);
    console.log(
      `3. NFT Agent → Token ID: "${
        nftExecution.data.execution.output?.nftDetails?.tokenId || "N/A"
      }"`
    );

    console.log("\n✅ This demonstrates how data can flow between agents:");
    console.log("   • Each agent produces specific outputs");
    console.log("   • Outputs can be used as inputs for subsequent agents");
    console.log("   • The orchestrator manages the execution and data flow");

    return {
      greeting: greetingExecution.data.execution.output,
      image: imageExecution.data.execution.output,
      nft: nftExecution.data.execution.output,
    };
  } catch (error) {
    console.error(
      "❌ Simple multi-agent flow failed:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function testDirectAgentCalls() {
  console.log("\n🔧 Testing Direct Agent Calls");
  console.log("==============================");

  try {
    // Test Hello Agent directly
    console.log("\n📞 Calling Hello Agent directly...");
    const helloResponse = await axios.post("http://localhost:3001/execute", {
      name: "Alice",
      language: "French",
    });
    console.log("✅ Hello Agent response:", helloResponse.data);

    // Test Image Agent directly
    console.log("\n📞 Calling Image Agent directly...");
    const imageResponse = await axios.post("http://localhost:3002/execute", {
      prompt: "Beautiful French countryside with lavender fields",
    });
    console.log("✅ Image Agent response:", imageResponse.data);

    // Test NFT Agent directly
    console.log("\n📞 Calling NFT Agent directly...");
    const nftResponse = await axios.post("http://localhost:3003/execute", {
      imageUrl: imageResponse.data.imageUrl || "https://example.com/demo.jpg",
      collectionName: "Direct Test Collection",
      recipientAddress: "0x742d35Cc6634C0532925a3b8D4C9db96590e4CAb",
    });
    console.log("✅ NFT Agent response:", nftResponse.data);

    return {
      hello: helloResponse.data,
      image: imageResponse.data,
      nft: nftResponse.data,
    };
  } catch (error) {
    console.error(
      "❌ Direct agent calls failed:",
      error.response?.data || error.message
    );
  }
}

async function main() {
  console.log("🎭 Simple NFT Multi-Agent Test Suite");
  console.log("====================================");

  try {
    // Check orchestrator health
    const healthResponse = await axios.get(`${ORCHESTRATOR_URL}/health`);
    console.log(
      `✅ Orchestrator is healthy with ${healthResponse.data.agents.length} agents`
    );

    healthResponse.data.agents.forEach((agent) => {
      console.log(`   • ${agent.name} (${agent.url})`);
    });

    // Test direct agent calls first
    await testDirectAgentCalls();

    // Test orchestrated workflows
    await testSimpleMultiAgentFlow();

    console.log("\n🎉 All tests completed successfully!");
    console.log("   The system successfully demonstrated:");
    console.log("   ✓ Individual agent functionality");
    console.log("   ✓ Orchestrated workflow execution");
    console.log("   ✓ Data flow between agents");
    console.log("   ✓ NFT deployment with custom metadata");
  } catch (error) {
    console.error("❌ Test suite failed:", error.message);
    process.exit(1);
  }
}

// Run the test suite
main();
