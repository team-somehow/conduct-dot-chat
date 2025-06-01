import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import OpenAI from "openai";
dotenv.config();

const app = express();
const port = process.env.PORT || 7034;

app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const AKAVE_S3_ACCESS_KEY_ID = process.env.AKAVE_S3_ACCESS_KEY_ID || "";
const AKAVE_S3_SECRET_ACCESS_KEY = process.env.AKAVE_S3_SECRET_ACCESS_KEY || "";
const AKAVE_S3_ENDPOINT_URL = process.env.AKAVE_S3_ENDPOINT_URL || "";
const AKAVE_S3_BUCKET_NAME = process.env.AKAVE_S3_BUCKET_NAME || "nft-metadata"; // Default bucket name
const AKAVE_S3_REGION = process.env.AKAVE_S3_REGION || "us-east-1"; // Default region

const s3Client = new S3Client({
  region: AKAVE_S3_REGION,
  endpoint: AKAVE_S3_ENDPOINT_URL,
  credentials: {
    accessKeyId: AKAVE_S3_ACCESS_KEY_ID,
    secretAccessKey: AKAVE_S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true, // Required for some S3-compatible services like MinIO, potentially Akave O3
});

// Agent metadata - static information for MAHA protocol
const AGENT_META = {
  name: "NFT Metadata Creator Agent",
  description:
    "Generates OpenSea-compliant NFT metadata JSON from image URL, name, and description, using AI to suggest attributes.",
  wallet: "0x0Dd7D7Ad21d15A999dcc7218E7Df3F25700e696f", // Replace with actual wallet
  vendor: "MAHA Labs",
  category: "NFT",
  tags: ["nft", "metadata", "json", "image", "web3", "opensea"],
  pricing: {
    model: "per_request",
    amount: 0.05,
    currency: "USD",
    unit: "request",
  },
  rating: {
    score: 4.8,
    reviews: 1247,
    lastUpdated: "2024-01-15T00:00:00Z",
  },
  performance: {
    avgResponseTime: 120,
    uptime: 99.9,
    successRate: 99.8,
  },
  inputSchema: {
    type: "object",
    properties: {
      imageUrl: {
        type: "string",
        format: "uri",
        description: "URL to the NFT image (should be publicly accessible)",
      },
      name: {
        type: "string",
        maxLength: 100,
        description: "Name of the NFT",
      },
      description: {
        type: "string",
        maxLength: 1000,
        description: "Description of the NFT (optional)",
      },
      externalUrl: {
        type: "string",
        format: "uri",
        description: "External URL for the NFT (optional)",
      },
    },
    required: ["imageUrl", "name"],
  },
  outputSchema: {
    type: "object",
    properties: {
      metadata: {
        type: "object",
        properties: {
          name: { type: "string", description: "Name of the NFT" },
          description: {
            type: "string",
            description: "Description of the NFT",
          },
          image: {
            type: "string",
            format: "uri",
            description: "URL to the NFT image",
          },
          external_url: {
            type: "string",
            format: "uri",
            description: "External URL for the NFT (optional)",
          },
          attributes: {
            type: "array",
            description: "Array of attribute objects for OpenSea traits",
            items: {
              type: "object",
              properties: {
                trait_type: { type: "string" },
                value: {},
                display_type: { type: "string" },
              },
              required: ["trait_type", "value"],
            },
          },
        },
        required: ["name", "description", "image", "attributes"],
      },
      metadataUrl: {
        type: "string",
        format: "uri",
        description:
          "Publicly accessible URL to the uploaded NFT metadata JSON on IPFS via Lighthouse gateway.",
      },
    },
    required: ["metadata", "metadataUrl"],
  },
  previewURI: "ipfs://QmNFTMetadataPreview123",
};

// GET /meta - Return agent metadata (MAHA contract requirement)
app.get("/meta", (req: Request, res: Response) => {
  res.json(AGENT_META);
});

// POST /run - Execute the agent logic (MAHA contract requirement)
app.post("/run", async (req: Request, res: Response) => {
  try {
    const { imageUrl, name, description = "", externalUrl = "" } = req.body;

    // Validate input
    if (!imageUrl || typeof imageUrl !== "string") {
      return res.status(400).json({
        error: "Invalid input: imageUrl is required and must be a string",
      });
    }
    if (!name || typeof name !== "string") {
      return res.status(400).json({
        error: "Invalid input: name is required and must be a string",
      });
    }
    if (name.length > 100) {
      return res.status(400).json({
        error: "Invalid input: name must be 100 characters or less",
      });
    }
    if (description && typeof description !== "string") {
      return res.status(400).json({
        error: "Invalid input: description must be a string",
      });
    }
    if (description && description.length > 1000) {
      return res.status(400).json({
        error: "Invalid input: description must be 1000 characters or less",
      });
    }
    if (externalUrl && typeof externalUrl !== "string") {
      return res.status(400).json({
        error: "Invalid input: externalUrl must be a string",
      });
    }
    // Optionally, validate imageUrl is a valid URL
    try {
      new URL(imageUrl);
    } catch {
      return res.status(400).json({
        error: "Invalid input: imageUrl must be a valid URL",
      });
    }
    if (externalUrl) {
      try {
        new URL(externalUrl);
      } catch {
        return res.status(400).json({
          error: "Invalid input: externalUrl must be a valid URL",
        });
      }
    }

    // Use OpenAI to generate description and attributes if needed
    let finalDescription = description;
    let attributes = [];
    if (!description || description.trim().length < 10) {
      // Generate a description using OpenAI
      const descPrompt = `Write a creative, human-readable NFT description for an item called '${name}'.`;
      const descResp = await openai.chat.completions.create({
        model: "gpt-4.1-nano",
        messages: [{ role: "user", content: descPrompt }],
        max_tokens: 80,
      });
      finalDescription = descResp.choices[0]?.message?.content?.trim() || name;
    }

    // Generate attributes using OpenAI
    const attrPrompt = `Suggest 3-5 interesting OpenSea NFT attributes (as an array of objects with 'trait_type' and 'value') for an NFT named '${name}'. If the image is a known type (e.g. animal, robot, etc.), infer traits. Output only a JSON array.`;
    const attrResp = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [{ role: "user", content: attrPrompt }],
      max_tokens: 120,
    });
    try {
      attributes = JSON.parse(attrResp.choices[0]?.message?.content || "[]");
    } catch {
      attributes = [];
    }
    // Fallback: ensure attributes is an array
    if (!Array.isArray(attributes)) attributes = [];

    // Standard OpenSea NFT metadata JSON
    const metadata: any = {
      name,
      description: finalDescription,
      image: imageUrl,
      ...(externalUrl ? { external_url: externalUrl } : {}),
      attributes,
    };

    // Remove undefined fields
    Object.keys(metadata).forEach(
      (k) => (metadata as any)[k] === undefined && delete (metadata as any)[k]
    );

    console.log(`Generated OpenSea NFT metadata for '${name}':`, metadata);

    console.log("🌐 Uploading metadata to Akave O3...");

    // Upload to Akave O3 (S3-compatible)
    const uploadCommand = new PutObjectCommand({
      Bucket: AKAVE_S3_BUCKET_NAME,
      Key: `metadata/${name.replace(/\s/g, "-")}.json`, // Unique key for the object
      Body: JSON.stringify(metadata),
      ContentType: "application/json",
      ACL: "public-read", // Make the object publicly accessible
    });

    await s3Client.send(uploadCommand);

    const metadataUrl = `${AKAVE_S3_ENDPOINT_URL}/${AKAVE_S3_BUCKET_NAME}/metadata/${name.replace(
      /\s/g,
      "-"
    )}.json`;

    console.log("🌐 Metadata URL:", metadataUrl);

    res.json({
      metadata,
      metadataUrl,
    });
  } catch (error: any) {
    console.error("Processing error:", error);
    res.status(500).json({
      error: "Internal processing error",
      details: error.message,
    });
  }
});

// Health check endpoint (optional but recommended)
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Legacy endpoint for backward compatibility
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Hello World Agent - MAHA Protocol Compatible",
    endpoints: {
      meta: "/meta",
      run: "/run (POST)",
      health: "/health",
    },
  });
});

// Start server
app.listen(port, () => {
  console.log(`🤖 Hello World Agent running on port ${port}`);
  console.log(`📋 Metadata: http://localhost:${port}/meta`);
  console.log(`🏃 Execute: POST http://localhost:${port}/run`);
  console.log(`❤️  Health: http://localhost:${port}/health`);
  console.log(`🌍 Legacy: http://localhost:${port}/`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("👋 Shutting down gracefully...");
  process.exit(0);
});
