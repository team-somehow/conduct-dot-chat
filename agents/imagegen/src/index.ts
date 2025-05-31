import express, { Request, Response } from "express";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Validate OpenAI setup on startup
const validateOpenAISetup = async () => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ OPENAI_API_KEY environment variable is not set");
      return false;
    }

    if (process.env.OPENAI_API_KEY.length < 10) {
      console.error("❌ OPENAI_API_KEY appears to be invalid (too short)");
      return false;
    }

    // Test API connection with a simple request
    console.log("🔍 Testing OpenAI API connection...");
    const models = await openai.models.list();
    console.log("✅ OpenAI API connection successful");
    return true;
  } catch (error: any) {
    console.error("❌ OpenAI API validation failed:", error.message);
    console.error("   This could be due to:");
    console.error("   - Invalid API key");
    console.error("   - Account billing issues");
    console.error("   - API key permissions");
    console.error("   - Rate limiting");
    return false;
  }
};

// Agent metadata - static information for MAHA protocol
const AGENT_META = {
  name: "DALL-E 3 Image Generator",
  description: "AI-powered image generation using OpenAI's DALL-E 3 model",
  wallet: "0x1234567890123456789012345678901234567890", // Replace with actual wallet
  vendor: "OpenAI",
  category: "Image",
  tags: ["image", "generation", "art", "ai", "creative"],
  pricing: {
    model: "per_image",
    amount: 0.25,
    currency: "USD",
    unit: "image",
  },
  rating: {
    score: 4.9,
    reviews: 3421,
    lastUpdated: "2024-01-20T00:00:00Z",
  },
  performance: {
    avgResponseTime: 8500,
    uptime: 99.7,
    successRate: 98.9,
  },
  inputSchema: {
    type: "object",
    properties: {
      prompt: {
        type: "string",
        minLength: 1,
        maxLength: 1000,
        description: "Text description of the image to generate",
      },
      size: {
        type: "string",
        enum: ["1024x1024", "1024x1792", "1792x1024"],
        default: "1024x1024",
        description: "Image dimensions",
      },
      quality: {
        type: "string",
        enum: ["standard", "hd"],
        default: "standard",
        description: "Image quality level",
      },
      style: {
        type: "string",
        enum: ["vivid", "natural"],
        default: "vivid",
        description: "Image style preference",
      },
    },
    required: ["prompt"],
  },
  outputSchema: {
    type: "object",
    properties: {
      imageUrl: {
        type: "string",
        format: "uri",
        description: "URL of the generated image",
      },
      prompt: {
        type: "string",
        description: "The prompt used for generation",
      },
      size: {
        type: "string",
        description: "Image dimensions used",
      },
      quality: {
        type: "string",
        description: "Quality level used",
      },
      style: {
        type: "string",
        description: "Style used",
      },
      timestamp: {
        type: "string",
        format: "date-time",
        description: "When the image was generated",
      },
    },
    required: ["imageUrl", "prompt", "size", "quality", "style", "timestamp"],
  },
  previewURI: "ipfs://QmImageGenAgentPreview123",
};

// GET /meta - Return agent metadata (MAHA contract requirement)
app.get("/meta", (req: Request, res: Response) => {
  res.json(AGENT_META);
});

// Image generation function
const sanitizePrompt = (prompt: string): string => {
  // Remove potentially problematic words/phrases that might trigger content policy
  const problematicPatterns = [
    /chaos.*underworld/gi,
    /dark.*chaotic/gi,
    /violent/gi,
    /gore/gi,
    /blood/gi,
    /death/gi,
    /horror/gi,
    /scary/gi,
    /evil/gi,
    /demon/gi,
    /hell/gi,
    /violence/gi,
    /weapon/gi,
    /kill/gi,
    /murder/gi,
    /hate/gi,
    /offensive/gi,
    /explicit/gi,
    /sexual/gi,
    /nude/gi,
    /naked/gi,
  ];

  let sanitizedPrompt = prompt;

  // Replace problematic patterns with safer alternatives
  sanitizedPrompt = sanitizedPrompt.replace(
    /chaos.*underworld.*dark.*chaotic/gi,
    "mystical fantasy realm with magical creatures"
  );
  sanitizedPrompt = sanitizedPrompt.replace(
    /dark.*chaotic.*scene/gi,
    "mysterious fantasy scene"
  );
  sanitizedPrompt = sanitizedPrompt.replace(
    /chaos.*underworld/gi,
    "mystical realm"
  );
  sanitizedPrompt = sanitizedPrompt.replace(/dark.*chaotic/gi, "mysterious");
  sanitizedPrompt = sanitizedPrompt.replace(/underworld/gi, "fantasy realm");

  // Remove other problematic words
  problematicPatterns.forEach((pattern) => {
    sanitizedPrompt = sanitizedPrompt.replace(pattern, "");
  });

  // Clean up extra spaces
  sanitizedPrompt = sanitizedPrompt.replace(/\s+/g, " ").trim();

  // Ensure prompt is not empty after sanitization
  if (!sanitizedPrompt || sanitizedPrompt.length < 3) {
    sanitizedPrompt =
      "beautiful artistic illustration, colorful, detailed background";
  }

  return sanitizedPrompt;
};

const generateImage = async (
  prompt: string,
  size: "1024x1024" | "1024x1792" | "1792x1024" = "1024x1024",
  quality: "standard" | "hd" = "standard",
  style: "vivid" | "natural" = "vivid"
) => {
  try {
    // Sanitize the prompt to avoid content policy violations
    const sanitizedPrompt = sanitizePrompt(prompt);

    console.log(`🔄 Original prompt: "${prompt}"`);
    if (sanitizedPrompt !== prompt) {
      console.log(`🧹 Sanitized prompt: "${sanitizedPrompt}"`);
    }

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: sanitizedPrompt,
      n: 1,
      size,
      quality,
      style,
    });

    return {
      imageUrl: response.data?.[0]?.url,
      originalPrompt: prompt,
      sanitizedPrompt: sanitizedPrompt,
      wasSanitized: sanitizedPrompt !== prompt,
    };
  } catch (error: any) {
    console.error("OpenAI API error:", error);

    // If it's a content policy error, try with a more generic prompt
    if (error.status === 400 && error.type === "image_generation_user_error") {
      console.log(
        "🚨 Content policy violation detected, trying with generic prompt..."
      );
      try {
        const fallbackPrompt =
          "beautiful digital artwork, colorful illustration with creative design";
        const fallbackResponse = await openai.images.generate({
          model: "dall-e-3",
          prompt: fallbackPrompt,
          n: 1,
          size,
          quality,
          style,
        });

        return {
          imageUrl: fallbackResponse.data?.[0]?.url,
          originalPrompt: prompt,
          sanitizedPrompt: fallbackPrompt,
          wasSanitized: true,
          fallbackUsed: true,
        };
      } catch (fallbackError: any) {
        console.error("Fallback generation also failed:", fallbackError);
        throw new Error(
          `Image generation failed with content policy violation and fallback failed: ${fallbackError.message}`
        );
      }
    }

    throw new Error(
      `Image generation failed: ${error.status} ${
        error.message || error.type || "Unknown error"
      }`
    );
  }
};

// POST /run - Execute the agent logic (MAHA contract requirement)
app.post("/run", async (req: Request, res: Response) => {
  try {
    const {
      prompt,
      size = "1024x1024",
      quality = "standard",
      style = "vivid",
    } = req.body;

    // Validate input
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({
        error: "Invalid input: prompt is required and must be a string",
      });
    }

    if (prompt.length < 1 || prompt.length > 1000) {
      return res.status(400).json({
        error: "Invalid input: prompt must be between 1 and 1000 characters",
      });
    }

    const validSizes = ["1024x1024", "1024x1792", "1792x1024"];
    if (!validSizes.includes(size)) {
      return res.status(400).json({
        error: `Invalid size: must be one of ${validSizes.join(", ")}`,
      });
    }

    const validQualities = ["standard", "hd"];
    if (!validQualities.includes(quality)) {
      return res.status(400).json({
        error: `Invalid quality: must be one of ${validQualities.join(", ")}`,
      });
    }

    const validStyles = ["vivid", "natural"];
    if (!validStyles.includes(style)) {
      return res.status(400).json({
        error: `Invalid style: must be one of ${validStyles.join(", ")}`,
      });
    }

    console.log(
      `🎨 Generating image: "${prompt}" (${size}, ${quality}, ${style})`
    );

    // // Generate image
    const imageResult = await generateImage(
      prompt,
      size as any,
      quality as any,
      style as any
    );
    // const imageUrl = "https://picsum.photos/200/300";

    if (!imageResult.imageUrl) {
      return res.status(500).json({
        error: "Image generation failed: No URL returned",
      });
    }

    // Return result matching output schema
    const result = {
      imageUrl: imageResult.imageUrl,
      prompt: imageResult.originalPrompt,
      size,
      quality,
      style,
      timestamp: new Date().toISOString(),
      originalPrompt: imageResult.originalPrompt,
      sanitizedPrompt: imageResult.sanitizedPrompt,
      wasSanitized: imageResult.wasSanitized,
      fallbackUsed: imageResult.fallbackUsed,
    };

    console.log(`✅ Image generated successfully: ${imageResult.imageUrl}`);
    res.json(result);
  } catch (error: any) {
    console.error("Image generation error:", error);
    res.status(500).json({
      error: "Image generation failed",
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
    openaiConfigured: !!process.env.OPENAI_API_KEY,
  });
});

// Legacy endpoint for backward compatibility
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "DALL-E 3 Image Generator - MAHA Protocol Compatible",
    endpoints: {
      meta: "/meta",
      run: "/run (POST)",
      health: "/health",
    },
  });
});

// Legacy GET endpoint for backward compatibility
app.get("/run", async (req: Request, res: Response) => {
  try {
    const input = req.query.input as string;
    if (!input) {
      return res.status(400).json({
        error: "Input parameter is required",
        hint: "Use POST /run with JSON body for full MAHA compatibility",
      });
    }

    const imageResult = await generateImage(input);
    res.json({
      imageUrl: imageResult.imageUrl,
      prompt: imageResult.originalPrompt,
      size: "1024x1024",
      quality: "standard",
      style: "vivid",
      timestamp: new Date().toISOString(),
      legacy: true,
      originalPrompt: imageResult.originalPrompt,
      sanitizedPrompt: imageResult.sanitizedPrompt,
      wasSanitized: imageResult.wasSanitized,
      fallbackUsed: imageResult.fallbackUsed,
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Image generation failed",
      details: error.message,
    });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`🎨 DALL-E 3 Image Generator Agent running on port ${PORT}`);
  console.log(`📋 Metadata: http://localhost:${PORT}/meta`);
  console.log(`🚀 Execute: POST http://localhost:${PORT}/run`);
  console.log(`❤️ Health: http://localhost:${PORT}/health`);

  // Validate OpenAI setup
  const isValid = await validateOpenAISetup();
  if (!isValid) {
    console.error(
      "⚠️  OpenAI API validation failed - image generation may not work"
    );
    console.error("   Please check your OPENAI_API_KEY and account status");
  }
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("👋 Shutting down gracefully...");
  process.exit(0);
});
