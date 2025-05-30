// Main landing page with Neo-Brutalist hero section and feature showcase
// Features: Bold, flat design with thick borders and hard shadows

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import PromptInput from '../../components/PromptInput';
import FeatureCard from '../../components/FeatureCard';
import MarketplacePreview from '../../components/MarketplacePreview';
import HowItWorks from '../../components/HowItWorks';
import CTASection from '../../components/CTASection';
import Footer from '../../components/Footer';
import '../../styles/landing.css';

// TODO(Landing):
// 1. Add scroll-based animations and parallax effects
// 2. Implement A/B testing for different hero variants
// 3. Add performance monitoring and analytics
// 4. Create interactive demo section
// 5. Add testimonials and social proof
// END TODO

const LandingPage = () => {
  const navigate = useNavigate();

  const handlePromptSubmit = (prompt: string) => {
    navigate(`/run?prompt=${encodeURIComponent(prompt)}`);
  };

  const features = [
    {
      icon: '✨',
      title: 'Smart Orchestration',
      description: 'Our AI automatically creates the optimal workflow for your specific task.',
    },
    {
      icon: '⚡',
      title: 'Model Marketplace',
      description: 'Access hundreds of specialized AI models to handle any task in your workflow.',
    },
    {
      icon: '🖥️',
      title: 'Visual Workflows',
      description: 'Watch your AI models work together in real-time with our interactive visualization.',
    },
  ];

  return (
    <div className="neo-brutalist-bg min-h-screen">
      {/* TODO(brutalism): future interactive micro-animations */}
      <Navbar />
      
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6 md:px-10 pt-20 pb-20">
        <div className="mx-auto max-w-screen-xl">
          <div className="text-center md:text-left">
            <h1 className="text-5xl md:text-7xl font-black leading-tight text-black tracking-tight mb-6">
              Orchestrate AI Models with{' '}
              <span className="text-[#FF5484]">
                Precision
              </span>
            </h1>
            
            <div className="max-w-lg md:max-w-4xl mb-16">
              <p className="text-xl md:text-2xl text-black font-medium leading-relaxed">
                Transform your ideas into powerful AI workflows. Connect, configure, and execute multiple AI models seamlessly.
              </p>
            </div>
          </div>
          
          <PromptInput onSubmit={handlePromptSubmit} />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="mx-auto max-w-screen-xl px-6 md:px-10">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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