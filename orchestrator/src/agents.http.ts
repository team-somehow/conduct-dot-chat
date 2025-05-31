import Ajv, { ValidateFunction } from "ajv";
import fetch from "node-fetch";
import { z } from "zod";

/* ---------- types ---------- */
export interface AgentPricing {
  model: string;
  amount: number;
  currency: string;
  unit: string;
}

export interface AgentRating {
  score: number;
  reviews: number;
  lastUpdated: string;
}

export interface AgentPerformance {
  avgResponseTime: number;
  uptime: number;
  successRate: number;
}

export interface HttpAgent {
  url: string; // base URL
  name: string;
  description: string;
  wallet: `0x${string}`; // on-chain key
  vendor?: string;
  category?: string;
  tags?: string[];
  pricing?: AgentPricing;
  rating?: AgentRating;
  performance?: AgentPerformance;
  inputValidate: ValidateFunction;
  outputValidate: ValidateFunction;
  previewURI: string;
}

/* ---------- discovery ---------- */
const ajv = new Ajv({ strict: false });

export async function loadAgent(url: string): Promise<HttpAgent> {
  const metaRes = await fetch(`${url}/meta`);
  if (!metaRes.ok) throw new Error(`meta fetch failed: ${url}`);
  const meta = await metaRes.json();

  // compile schema validators once
  return {
    url,
    name: meta.name,
    description: meta.description,
    wallet: meta.wallet,
    vendor: meta.vendor,
    category: meta.category,
    tags: meta.tags,
    pricing: meta.pricing,
    rating: meta.rating,
    performance: meta.performance,
    previewURI: meta.previewURI,
    inputValidate: ajv.compile(meta.inputSchema),
    outputValidate: ajv.compile(meta.outputSchema),
  };
}

/* ---------- run helper ---------- */
export async function runAgent<TIn, TOut>(
  agent: HttpAgent,
  input: TIn
): Promise<TOut> {
  if (!agent.inputValidate(input))
    throw new Error(`input schema mismatch for ${agent.name}`);

  const res = await fetch(`${agent.url}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`run failed for ${agent.name}`);

  const data: unknown = await res.json();
  if (!agent.outputValidate(data))
    throw new Error(`output schema mismatch for ${agent.name}`);

  return data as TOut;
}
