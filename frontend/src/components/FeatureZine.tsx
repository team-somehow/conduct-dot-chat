import React, { useState } from 'react';

interface Feature {
  icon: string;
  title: string;
  text: string;
  rotation: string;
}

const features: Feature[] = [
  {
    icon: '✨',
    title: 'Smart Orchestration',
    text: 'Our AI automatically creates the optimal workflow for your specific task, connecting models intelligently and optimizing performance.',
    rotation: 'rotate-[-3deg]'
  },
  {
    icon: '⚡',
    title: 'Model Marketplace',
    text: 'Access hundreds of specialized AI models to handle any task in your workflow with lightning speed and precision.',
    rotation: 'rotate-[2deg]'
  },
  {
    icon: '🖥️',
    title: 'Visual Workflows',
    text: 'Watch your AI models work together in real-time with our interactive visualization dashboard and monitoring tools.',
    rotation: 'rotate-[-1deg]'
  }
];

const FeatureCard: React.FC<{ 
  feature: Feature; 
  index: number; 
  isExpanded: boolean; 
  onToggle: () => void; 
}> = ({ feature, index, isExpanded, onToggle }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <div className="md:hidden">
      <button
        className={`accordion-item w-full bg-white border-4 border-black shadow-neo p-6 text-left transition-all duration-300 ${
          isExpanded ? 'expanded' : 'collapsed'
        }`}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        aria-expanded={isExpanded}
        aria-controls={`feature-content-${index}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#FFE37B] border-3 border-black flex items-center justify-center text-xl">
              {feature.icon}
            </div>
            <h3 className="text-lg font-black text-black uppercase tracking-tight">
              {feature.title}
            </h3>
          </div>
          <div className="text-2xl font-black">
            {isExpanded ? '−' : '+'}
          </div>
        </div>
        
        {isExpanded && (
          <div id={`feature-content-${index}`} className="mt-4 pt-4 border-t-2 border-black">
            <p className="text-black font-medium leading-relaxed">
              {feature.text}
            </p>
          </div>
        )}
      </button>
    </div>
  );
};

const FeatureZine = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpanded = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <section className="py-16 lg:py-20 bg-[#FFFDEE] border-b-4 border-black">
      <div className="px-[clamp(1.5rem,6vw,4rem)]">
        {/* Mobile Accordion */}
        <div className="md:hidden space-y-4 max-w-2xl mx-auto">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              feature={feature}
              index={index}
              isExpanded={expandedIndex === index}
              onToggle={() => toggleExpanded(index)}
            />
          ))}
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`bg-white border-4 border-black shadow-neo p-6 transition-transform hover:-translate-x-1 hover:-translate-y-1 w-[320px] h-[320px] ${feature.rotation} mx-auto`}
            >
              <div className="flex flex-col items-center text-center space-y-4 h-full">
                <div className="w-16 h-16 bg-[#FFE37B] border-3 border-black flex items-center justify-center text-2xl">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-black text-black uppercase tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-black font-medium leading-relaxed flex-1 flex items-center">
                  {feature.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureZine; 