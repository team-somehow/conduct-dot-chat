// Main landing page with Neo-Brutalist hero section and feature showcase
// Features: Bold, flat design with thick borders and hard shadows

import BlockscoutTransactionWidget from "@/components/BlockscoutTransactionWidget";
import Navbar from "@/components/Navbar";
import { useNotification, useTransactionPopup } from "@blockscout/app-sdk";
import { useNavigate } from "react-router-dom";
import CTASection from "../../components/CTASection";
import FeatureCard from "../../components/FeatureCard";
import Footer from "../../components/Footer";
import HowItWorks from "../../components/HowItWorks";
import MarketplacePreview from "../../components/MarketplacePreview";
import PromptInput from "../../components/PromptInput";
import "../../styles/landing.css";

// TODO(Landing):
// 1. Add scroll-based animations and parallax effects
// 2. Implement A/B testing for different hero variants
// 3. Add performance monitoring and analytics
// 4. Create interactive demo section
// 5. Add testimonials and social proof
// END TODO

const LandingPage = () => {
  const navigate = useNavigate();

  const { openTxToast } = useNotification();
  const { openPopup } = useTransactionPopup();

  const sendTransaction = async () => {
    const txHash =
      "0xc93c92ba22ea93861a5897f7068465b3cdd687a9b367b7b4fc66252690f0aea4"; // Your transaction hash
    await openTxToast("1", txHash);
  };

  const viewHistory = () => {
    openPopup({
      chainId: "1",
      address: "0x0Dd7D7Ad21d15A999dcc7218E7Df3F25700e696f", // Optional
    });
  };

  const handlePromptSubmit = (prompt: string) => {
    navigate(`/run?prompt=${encodeURIComponent(prompt)}`);
  };

  const features = [
    {
      icon: "✨",
      title: "Smart Orchestration",
      description:
        "Our AI automatically creates the optimal workflow for your specific task.",
    },
    {
      icon: "⚡",
      title: "Model Marketplace",
      description:
        "Access hundreds of specialized AI models to handle any task in your workflow.",
    },
    {
      icon: "🖥️",
      title: "Visual Workflows",
      description:
        "Watch your AI models work together in real-time with our interactive visualization.",
    },
  ];

  return (
    <div className="neo-brutalist-bg min-h-screen">
      {/* TODO(brutalism): future interactive micro-animations */}
      <Navbar />

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-10 pt-20 pb-12 sm:pb-20">
        {/* <div>
          <button
            onClick={sendTransaction}
            className="w-full lg:w-auto h-10 sm:h-12 px-4 sm:px-6 lg:px-8 bg-[#FF5484] text-black font-bold uppercase border-4 border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150 flex items-center justify-center space-x-2 text-sm sm:text-base"
            aria-label="Generate workflow"
          >
            Send Transaction
          </button>
          <button
            onClick={viewHistory}
            className="w-full lg:w-auto h-10 sm:h-12 px-4 sm:px-6 lg:px-8 bg-[#FF5484] text-black font-bold uppercase border-4 border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150 flex items-center justify-center space-x-2 text-sm sm:text-base"
            aria-label="Generate workflow"
          >
            View Transaction History
          </button>
        </div> */}
        <div className="mx-auto max-w-screen-xl w-full">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-tight text-black tracking-tight mb-4 sm:mb-6 lg:mb-8">
              Orchestrate AI Models with{" "}
              <span className="text-[#FF5484] block sm:inline">Precision</span>
            </h1>

            <div className="max-w-lg sm:max-w-2xl lg:max-w-4xl mx-auto lg:mx-0 mb-8 sm:mb-12 lg:mb-16">
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-black font-medium leading-relaxed">
                Transform your ideas into powerful AI workflows. Connect,
                configure, and execute multiple AI models seamlessly.
              </p>
            </div>
          </div>

          <BlockscoutTransactionWidget txHash="0xc93c92ba22ea93861a5897f7068465b3cdd687a9b367b7b4fc66252690f0aea4" />

          <div className="w-full max-w-4xl mx-auto lg:mx-0">
            <PromptInput onSubmit={handlePromptSubmit} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Marketplace Preview */}
      <MarketplacePreview />

      {/* How It Works */}
      <HowItWorks />

      {/* Call to Action */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
