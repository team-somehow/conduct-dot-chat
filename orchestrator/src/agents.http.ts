import Ajv, { ValidateFunction } from "ajv";
import fetch from "node-fetch";
import { z } from "zod";

/* ---------- types ---------- */
export interface HttpAgent {
  url: string; // base URL
  name: string;
  description: string;
  wallet: `0x${string}`; // on-chain key
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
