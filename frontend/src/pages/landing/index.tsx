// Main landing page with Neo-Brutalist hero section and conductor theme
// Features: Bold, flat design with thick borders and hard shadows

import Navbar from "@/components/Navbar";
import { useNotification, useTransactionPopup } from "@blockscout/app-sdk";
import { useNavigate } from "react-router-dom";
import HeroTitle from "../../components/HeroTitle";
import PromptPanel from "../../components/PromptPanel";
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

      {/* Hero Section */}
      <section className="min-h-[90vh] flex items-center justify-center border-b-4 border-black relative">
        <div className="max-w-screen-xl mx-auto w-full px-6 md:px-12 pt-20 pb-12">
          <div className="text-center lg:text-left mb-12">
            <HeroTitle />
          </div>

          {/* <BlockscoutTransactionWidget txHash="0xc93c92ba22ea93861a5897f7068465b3cdd687a9b367b7b4fc66252690f0aea4" /> */}

          <div className="w-full max-w-4xl mx-auto lg:mx-0">
            <PromptPanel onSubmit={handlePromptSubmit} />
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
