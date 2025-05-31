import React from 'react';

interface Feature {
  icon: string;
  title: string;
  text: string;
}

const features: Feature[] = [
  {
    icon: '✨',
    title: 'Smart Orchestration',
    text: 'Our AI automatically creates the optimal workflow for your specific task, connecting models intelligently.'
  },
  {
    icon: '⚡',
    title: 'Model Marketplace',
    text: 'Access hundreds of specialized AI models to handle any task in your workflow with lightning speed.'
  },
  {
    icon: '🖥️',
    title: 'Visual Workflows',
    text: 'Watch your AI models work together in real-time with our interactive visualization dashboard.'
  }
];

const FeatureTiles = () => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // Could add click handler here if needed
    }
  };

  return (
    <section className="py-16 lg:py-20 bg-[#FFFDEE] border-b-4 border-black">
      <div className="max-w-screen-xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white border-4 border-black shadow-neo p-6 transition-transform hover:-translate-x-1 hover:-translate-y-1 icon-spin-hover cursor-pointer"
              role="button"
              tabIndex={0}
              onKeyDown={handleKeyDown}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="icon-square w-16 h-16 bg-[#FFE37B] border-3 border-black flex items-center justify-center text-2xl transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-black text-black uppercase tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-black font-medium leading-relaxed">
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

export default FeatureTiles; 