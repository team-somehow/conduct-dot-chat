// AI Marketplace page with Neo-Brutalist styling
// Features: Interactive grid of AI models with search, filtering, and sorting

import { abi } from "@/abis/Greeting.json";
import { useEffect, useMemo, useState } from "react";
import { useReadContract } from "wagmi";
import CategoryFilter from "../../components/CategoryFilter";
import ModelCard from "../../components/ModelCard";
import Navbar from "../../components/Navbar";
import SearchBar from "../../components/SearchBar";
import SortDropdown from "../../components/SortDropdown";

interface Model {
  id: string;
  name: string;
  vendor: string;
  category: string;
  description: string;
  tags: string[];
  rating: number;
  priceLabel: string;
  accent: string;
}

const MOCK_MODELS: Model[] = [
  {
    id: "data-analyst",
    name: "DataAnalyst",
    vendor: "Anthropic",
    category: "Data",
    description:
      "Specialized model for analyzing complex datasets and generating business insights with advanced statistical methods.",
    tags: ["data", "analysis", "business"],
    rating: 4.9,
    priceLabel: "$0.10/query",
    accent: "#FEEF5D",
  },
  {
    id: "code-assistant",
    name: "CodeAssistant",
    vendor: "OpenAI",
    category: "Code",
    description:
      "Advanced programming assistant that helps with code generation, debugging, and optimization across multiple languages.",
    tags: ["coding", "debugging", "optimization"],
    rating: 4.8,
    priceLabel: "$0.15/query",
    accent: "#7C82FF",
  },
  {
    id: "content-genius",
    name: "ContentGenius",
    vendor: "Cohere",
    category: "Text",
    description:
      "Creative writing and content generation model perfect for marketing copy, articles, and social media content.",
    tags: ["writing", "marketing", "creative"],
    rating: 4.7,
    priceLabel: "$0.08/query",
    accent: "#FF5484",
  },
  {
    id: "image-creator",
    name: "ImageCreator",
    vendor: "Stability AI",
    category: "Image",
    description:
      "High-quality image generation model capable of creating stunning visuals from text descriptions.",
    tags: ["image", "generation", "art"],
    rating: 4.6,
    priceLabel: "$0.25/image",
    accent: "#FFE37B",
  },
  {
    id: "audio-processor",
    name: "AudioProcessor",
    vendor: "ElevenLabs",
    category: "Audio",
    description:
      "Advanced audio processing model for speech synthesis, voice cloning, and audio enhancement.",
    tags: ["audio", "speech", "voice"],
    rating: 4.5,
    priceLabel: "$0.20/minute",
    accent: "#A8E6CF",
  },
  {
    id: "video-editor",
    name: "VideoEditor",
    vendor: "RunwayML",
    category: "Video",
    description:
      "AI-powered video editing and generation tool for creating professional video content automatically.",
    tags: ["video", "editing", "automation"],
    rating: 4.4,
    priceLabel: "$0.50/minute",
    accent: "#FFB3BA",
  },
  {
    id: "sentiment-analyzer",
    name: "SentimentAnalyzer",
    vendor: "Hugging Face",
    category: "Text",
    description:
      "Powerful sentiment analysis model for understanding emotions and opinions in text data.",
    tags: ["sentiment", "emotion", "nlp"],
    rating: 4.3,
    priceLabel: "$0.05/query",
    accent: "#BFEFFF",
  },
];

const MarketplacePage = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("rating");

  const [models, setModels] = useState(MOCK_MODELS);

  const { data, isLoading, error } = useReadContract({
    abi,
    address: "0x205530e2551aA810c48d317ba0406BbA919b36b2",
    functionName: "greet",
  });

  const filteredModels = useMemo(() => {
    let filtered = models;

    // Apply search filter
    if (search) {
      filtered = filtered.filter(
        (model) =>
          model.name.toLowerCase().includes(search.toLowerCase()) ||
          model.description.toLowerCase().includes(search.toLowerCase()) ||
          model.tags.some((tag) =>
            tag.toLowerCase().includes(search.toLowerCase())
          )
      );
    }

    // Apply category filter
    if (category !== "All") {
      filtered = filtered.filter((model) => model.category === category);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sort) {
        case "rating":
          return b.rating - a.rating;
        case "cost": {
          // Extract first number from price label for comparison
          const priceA = parseFloat(
            a.priceLabel.match(/\d+\.?\d*/)?.[0] || "0"
          );
          const priceB = parseFloat(
            b.priceLabel.match(/\d+\.?\d*/)?.[0] || "0"
          );
          return priceA - priceB;
        }
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [search, category, sort]);

  useEffect(() => {
    if (!isLoading) {
      // TODO: setModels from contract
      console.log(data, error);
    }
  }, [isLoading, data, error]);

  return (
    <div className="min-h-screen bg-[#FFFDEE]">
      <Navbar />

      <section className="max-w-screen-xl mx-auto px-6 md:px-10 py-12 pt-24 space-y-10">
        {/* Header */}
        <header className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-black">
            AI Model Marketplace
          </h1>
          <p className="max-w-xl mx-auto text-lg font-medium text-black/70">
            Discover and integrate specialized AI models for your workflows.
          </p>
        </header>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <SearchBar value={search} onChange={setSearch} />
          <CategoryFilter value={category} onChange={setCategory} />
          <SortDropdown value={sort} onChange={setSort} />
        </div>

        {/* Results Count */}
        <div className="text-center">
          <p className="text-sm font-bold text-black/60 uppercase">
            {filteredModels.length}{" "}
            {filteredModels.length === 1 ? "Model" : "Models"} Found
          </p>
        </div>

        {/* Models Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredModels.map((model) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>

        {/* Empty State */}
        {filteredModels.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white border-4 border-black shadow-neo p-8 max-w-md mx-auto">
              <h3 className="text-xl font-black uppercase tracking-tight text-black mb-4">
                No Models Found
              </h3>
              <p className="text-sm font-medium text-black/70">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          </div>
        )}

        {/* TODO(pagination): Add pagination for large result sets */}
      </section>
    </div>
  );
};

export default MarketplacePage;
