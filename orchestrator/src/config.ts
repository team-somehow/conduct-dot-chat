import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export const AGENTS = [
  "http://localhost:3001", // Hello World Agent
  "http://localhost:3002", // DALL-E 3 Image Generator Agent
  "http://localhost:3003", // NFT Deployer Agent
];

// Basic configuration (no blockchain for now)
export const config = {
  PORT: process.env.PORT || 8080,
  NODE_ENV: process.env.NODE_ENV || "development",
};
