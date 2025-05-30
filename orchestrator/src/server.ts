// src/server.ts  (CLI demo)
import { loadAgent, runAgent } from "./agents.http";
import { AGENT_ENDPOINTS } from "./config";
import { write } from "./Contract";
import { parseEther, keccak256, toBytes } from "viem";
import { JobRunner } from "./JobRunner";

// 1. discover & register agents (once at startup)
async function syncAgents() {
  console.log("🔄 Syncing agents...");

  for (const url of AGENT_ENDPOINTS) {
    try {
      const agent = await loadAgent(url);

      // push/update profile & stake check
      await write(
        "agentStore",
        "upsert",
        [
          agent.name,
          agent.description,
          JSON.stringify(agent.inputValidate.schema),
          agent.previewURI,
        ],
        undefined
      ); // no stake top-up by orchestrator

      // grant RATER / slasher rights already handled in deployment
      console.log(`✔ ${agent.name} ready`);
    } catch (error) {
      console.warn(`⚠ Failed to sync agent ${url}:`, error);
    }
  }
  console.log("✅ All agents synced");
}

// 2. run a job (fan-out two agents)
async function runDemo() {
  console.log("🎬 Starting demo job...");

  try {
    const dalle = await loadAgent("https://dalle3.my-agent.net");
    const water = await loadAgent("https://watermarker.ai");

    const user =
      "0xAabb1234567890123456789012345678901234567890" as `0x${string}`;
    const jobId = keccak256(
      toBytes(user + Date.now().toString())
    ) as `0x${string}`;
    const total = parseEther("0.05");

    /* escrow */
    await write(
      "taskHub",
      "createJob",
      [jobId, JSON.stringify({ prompt: "cyberpunk corgi astronaut" })],
      total
    );

    /* first sub-task */
    const img = await runAgent(dalle, { prompt: "cyberpunk corgi astronaut" });
    await write("taskHub", "payAgent", [
      jobId,
      dalle.wallet,
      parseEther("0.02"),
      JSON.stringify(img),
    ]);

    /* second sub-task */
    const watermarked = await runAgent(water, {
      imgUrl: (img as any).imageUrl,
    });
    await write("taskHub", "payAgent", [
      jobId,
      water.wallet,
      parseEther("0.01"),
      JSON.stringify(watermarked),
    ]);

    /* orchestrator fee */
    await write("taskHub", "payOrchestrator", [jobId, parseEther("0.02")]);

    /* finalise & 5-star both */
    await write("taskHub", "completeJob", [
      jobId,
      [dalle.wallet, water.wallet],
      [5, 5],
    ]);

    console.log("🎉 Job done:", { jobId, img, watermarked });
  } catch (error) {
    console.error("❌ Demo failed:", error);
  }
}

// 3. Advanced demo using JobRunner
async function runAdvancedDemo() {
  console.log("🚀 Starting advanced demo with JobRunner...");

  try {
    const jobRunner = new JobRunner();

    // Load agents
    const dalle = await jobRunner.loadAgent("https://dalle3.my-agent.net");
    const water = await jobRunner.loadAgent("https://watermarker.ai");

    const user =
      "0xAabb1234567890123456789012345678901234567890" as `0x${string}`;
    const totalBudget = parseEther("0.1");

    // Create job
    const jobId = await jobRunner.createJob(
      user,
      { prompt: "futuristic city with flying cars" },
      totalBudget
    );

    // Run job with sequential execution
    const result = await jobRunner.runJob({
      jobId,
      totalBudget,
      jobData: { prompt: "futuristic city with flying cars" },
      agents: [dalle, water],
    });

    console.log("🎉 Advanced job completed:", result);
  } catch (error) {
    console.error("❌ Advanced demo failed:", error);
  }
}

// 4. Health check for agents
async function healthCheck() {
  console.log("🏥 Running health check on all agents...");

  for (const url of AGENT_ENDPOINTS) {
    try {
      const agent = await loadAgent(url);
      console.log(`✅ ${agent.name} (${url}) - healthy`);
    } catch (error) {
      console.log(`❌ ${url} - unhealthy:`, error);
    }
  }
}

// Main execution
async function main() {
  const command = process.argv[2] || "demo";

  switch (command) {
    case "sync":
      await syncAgents();
      break;
    case "demo":
      await syncAgents();
      await runDemo();
      break;
    case "advanced":
      await syncAgents();
      await runAdvancedDemo();
      break;
    case "health":
      await healthCheck();
      break;
    default:
      console.log("Usage: npm run dev [sync|demo|advanced|health]");
      console.log("  sync     - Sync agents with on-chain registry");
      console.log("  demo     - Run basic demo job");
      console.log("  advanced - Run advanced demo with JobRunner");
      console.log("  health   - Check agent health");
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down gracefully...");
  process.exit(0);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Run the main function
if (require.main === module) {
  main().catch(console.error);
}
