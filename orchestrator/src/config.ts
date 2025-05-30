// src/config.ts
export const AGENT_ENDPOINTS = [
  "https://dalle3.my-agent.net",
  "https://watermarker.ai",
  // add / remove freely – no code change
];

// Environment variables
export const config = {
  RPC_URL: process.env.RPC_URL || "http://localhost:8545",
  ORCH_PRIV_KEY: process.env.ORCH_PRIV_KEY || "",
  AGENT_STORE_ADDRESS:
    (process.env.AGENT_STORE_ADDRESS as `0x${string}`) || "0x",
  TASK_HUB_ADDRESS: (process.env.TASK_HUB_ADDRESS as `0x${string}`) || "0x",
};
