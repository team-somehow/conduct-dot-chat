import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export const AGENT_ENDPOINTS = [
  "http://localhost:3000", // Hello World Agent (local)
];

// Basic configuration (no blockchain for now)
export const config = {
  PORT: process.env.PORT || 8080,
  NODE_ENV: process.env.NODE_ENV || "development",
};
