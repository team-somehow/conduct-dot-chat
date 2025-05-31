// Main landing page with Neo-Brutalist hero section and conductor theme
// Features: Bold, flat design with thick borders and hard shadows

import Navbar from "@/components/Navbar";
import { useNotification, useTransactionPopup } from "@blockscout/app-sdk";
import { useNavigate } from "react-router-dom";
import HeroTitle from "../../components/HeroTitle";
import PromptPanel from "../../components/PromptPanel";
import ExamplePrompts from "../../components/ExamplePrompts";
import ConductorFeatures from "../../components/ConductorFeatures";
import AgentMarquee from "../../components/AgentMarquee";
import ConductorSteps from "../../components/ConductorSteps";
import ConductorCTA from "../../components/ConductorCTA";
import Footer from "../../components/Footer";
import "../../styles/landing-brutal.css";

// TODO(Landing):
// 1. Add scroll-based animations and parallax effects
// 2. Implement A/B testing for different hero variants
// 3. Add performance monitoring and analytics
// 4. Create interactive demo section
// 5. Add testimonials and social proof
// 6. Integrate real agent data from marketplace
// 7. Add conductor tutorial walkthrough
// END TODO

const LandingPage = () => {
  const navigate = useNavigate();

  const { openTxToast } = useNotification();
  const { openPopup } = useTransactionPopup();

  const sendTransaction = async () => {
    const txHash =
      "0xc93c92ba22ea93861a5897f7068465b3cdd687a9b367b7b4fc66252690f0aea4";
    await openTxToast("1", txHash);
  };

  const viewHistory = () => {
    openPopup({
      chainId: "1",
      address: "0x0Dd7D7Ad21d15A999dcc7218E7Df3F25700e696f",
    });
  };

  const handlePromptSubmit = (prompt: string) => {
    navigate(`/run?prompt=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="min-h-screen bg-[#FFFDEE]">
      <Navbar />

      {/* Hero Section - Exactly 100vh */}
      <section className="h-screen flex flex-col justify-center border-b-4 border-black relative overflow-hidden pt-16">
        {/* Animated Background - Conductor and AI Agents */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Conductor Animation */}
          <div className="conductor-animation">
            <div className="conductor-figure"></div>
            <div className="conductor-baton"></div>
          </div>
          
          {/* AI Agent Bots Animation */}
          <div className="ai-agents-orchestra">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i} 
                className={`ai-agent-bot agent-${i + 1}`}
                style={{ animationDelay: `${i * 0.5}s` }}
              >
                🤖
              </div>
            ))}
          </div>

          {/* Musical Staff Lines */}
          <div className="musical-staff">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`staff-line line-${i + 1}`}></div>
            ))}
          </div>

          {/* Floating Musical Notes */}
          <div className="floating-notes">
            {[...Array(12)].map((_, i) => (
              <div 
                key={i} 
                className={`floating-note note-${i + 1}`}
                style={{ animationDelay: `${i * 0.8}s` }}
              >
                {['♪', '♫', '♬', '♩'][i % 4]}
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-screen-xl mx-auto w-full px-6 md:px-12 relative z-10 flex flex-col justify-center items-center text-center h-full">
          {/* Hero Title - Centered */}
          <div className="mb-6">
            <HeroTitle />
          </div>

          {/* Prompt Input Section - Centered and Compact */}
          <div className="w-full max-w-4xl space-y-4">
            <PromptPanel onSubmit={handlePromptSubmit} />
            <ExamplePrompts onPromptSelect={handlePromptSubmit} />
          </div>

          {/* Trust indicators - Centered and Compact */}
          <div className="flex flex-wrap justify-center items-center gap-4 mt-6 opacity-70">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 border border-black animate-pulse"></div>
              <span className="text-xs font-bold text-green-700 uppercase">50K+ Conductors</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 border border-black"></div>
              <span className="text-xs font-bold text-blue-700 uppercase">2M+ Symphonies</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 border border-black"></div>
              <span className="text-xs font-bold text-purple-700 uppercase">99.9% Uptime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Conductor Features Section */}
      <ConductorFeatures />

      {/* AI Agent Orchestra */}
      <AgentMarquee />

      {/* How to Conduct */}
      <ConductorSteps />

      {/* Call to Action */}
      <ConductorCTA />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
