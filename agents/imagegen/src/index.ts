import express, { Request, Response } from "express";
import OpenAI from "openai";

import dotenv from "dotenv";
dotenv.config();

const app = express();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateImage = async (prompt: string) => {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt,
    n: 1,
    size: "1024x1024",
  });
  return response.data?.[0]?.url;
};

app.get("/run", async (req: Request, res: Response) => {
  const input = req.query.input as string;
  if (!input) {
    res.status(400).send("Input is required");
    return;
  }
  const image = await generateImage(input);
  res.send(image);
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
