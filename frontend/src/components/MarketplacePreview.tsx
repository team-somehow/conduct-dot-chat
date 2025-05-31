// Marketplace preview section with Neo-Brutalist styling
// Features: Bold horizontal carousel of AI model cards

import { useNavigate } from "react-router";
import ModelCard from "./ModelCard/index";

// TODO(MarketplacePreview):
// 1. Implement horizontal scroll with smooth scrolling
// 2. Add navigation arrows
// 3. Connect to real marketplace data
// 4. Add auto-scroll functionality
// 5. Implement touch/swipe gestures
// END TODO

const MarketplacePreview = () => {
  const navigate = useNavigate();

  // Placeholder data
  const models = [
    {
      name: "GPT-4",
      description: "Advanced language model for complex reasoning",
      rating: 4.8,
      price: 0.03,
    },
    {
      name: "DALL-E 3",
      description: "State-of-the-art image generation model",
      rating: 4.7,
      price: 0.04,
    },
    {
      name: "Claude 3",
      description: "Helpful, harmless, and honest AI assistant",
      rating: 4.9,
      price: 0.025,
    },
    {
      name: "Midjourney",
      description: "Creative AI for artistic image generation",
      rating: 4.6,
      price: 0.035,
    },
    {
      name: "Whisper",
      description: "Automatic speech recognition system",
      rating: 4.5,
      price: 0.006,
    },
  ];

  return (
    <section className="py-20 bg-[#FF9BBD] border-t-4 border-b-4 border-black">
      {/* TODO(brutalism): future interactive micro-animations */}
      <div className="mx-auto max-w-screen-xl px-6 md:px-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-black text-black mb-6 uppercase tracking-tight">
            Explore AI Models
          </h2>
          <p className="text-black font-bold text-lg md:text-xl max-w-2xl mx-auto">
            Choose from hundreds of specialized AI models to power your
            workflows
          </p>
        </div>

        <div className="overflow-x-auto pb-4">
          <div className="flex space-x-6 min-w-max">
            {models.map((model, index) => (
              <div key={index} className="w-80 flex-shrink-0">
                <ModelCard
                  name={model.name}
                  description={model.description}
                  rating={model.rating}
                  price={model.price}
                  onSelect={() => {
                    /* TODO: Implement model selection */
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <button
            className="bg-white text-black font-black uppercase px-8 py-4 border-4 border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150 text-lg tracking-tight"
            onClick={() => navigate("/marketplace")}
          >
            View All Models
          </button>
        </div>
      </div>
    </section>
  );
};

export default MarketplacePreview;
