import React from 'react';
import { motion } from 'framer-motion';

interface FeatureData {
  icon: string;
  title: string;
  description: string;
  accent: string;
  details: string[];
}

const features: FeatureData[] = [
  {
    icon: '🎼',
    title: 'Orchestrate Workflows',
    description: 'Compose complex AI workflows like a musical masterpiece',
    accent: '#7C82FF',
    details: ['Visual workflow builder', 'Drag & drop interface', 'Real-time preview', 'Version control']
  },
  {
    icon: '🎯',
    title: 'Precision Direction',
    description: 'Direct each agent with surgical precision and clarity',
    accent: '#FF5484',
    details: ['Fine-tuned controls', 'Custom parameters', 'Performance metrics', 'Quality assurance']
  },
  {
    icon: '🎵',
    title: 'Harmonic Integration',
    description: 'Seamlessly blend different AI capabilities in perfect harmony',
    accent: '#FEEF5D',
    details: ['Cross-platform APIs', 'Data synchronization', 'Error handling', 'Fallback systems']
  },
  {
    icon: '⚡',
    title: 'Lightning Performance',
    description: 'Execute workflows at the speed of thought with optimized routing',
    accent: '#A8E6CF',
    details: ['Parallel processing', 'Smart caching', 'Load balancing', 'Auto-scaling']
  },
  {
    icon: '🎭',
    title: 'Adaptive Ensemble',
    description: 'Agents learn and adapt to your conducting style over time',
    accent: '#FFB3BA',
    details: ['Machine learning', 'Pattern recognition', 'Behavioral adaptation', 'Continuous improvement']
  },
  {
    icon: '🏆',
    title: 'Masterful Results',
    description: 'Achieve professional-grade outputs worthy of standing ovations',
    accent: '#C8A8E9',
    details: ['Quality validation', 'Output optimization', 'Performance analytics', 'Success tracking']
  }
];

const FeatureCard: React.FC<{ feature: FeatureData; index: number }> = ({ feature, index }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Neumorphism card */}
      <div className="bg-[#FFFDEE] border-4 border-black shadow-neo p-8 transition-all duration-300 hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-neo-lg relative overflow-hidden">
        
        {/* Background accent */}
        <div 
          className="absolute top-0 right-0 w-20 h-20 opacity-20 transform rotate-12 transition-all duration-300 group-hover:scale-110"
          style={{ backgroundColor: feature.accent }}
        />
        
        {/* Icon */}
        <div 
          className="w-16 h-16 border-4 border-black flex items-center justify-center text-3xl mb-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 relative z-10"
          style={{ backgroundColor: feature.accent }}
        >
          {feature.icon}
        </div>

        {/* Content */}
        <div className="relative z-10">
          <h3 className="text-xl font-black uppercase tracking-tight text-black mb-4 leading-tight">
            {feature.title}
          </h3>
          
          <p className="text-sm font-medium text-black/80 leading-relaxed mb-6">
            {feature.description}
          </p>

          {/* Feature details - shown on hover */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ 
              opacity: isHovered ? 1 : 0, 
              height: isHovered ? 'auto' : 0 
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="border-t-2 border-black pt-4">
              <ul className="space-y-2">
                {feature.details.map((detail, i) => (
                  <li key={i} className="flex items-center space-x-2 text-xs font-bold text-black/70">
                    <div className="w-2 h-2 bg-black"></div>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Action indicator */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 border-2 border-black animate-pulse"></div>
              <span className="text-xs font-bold text-green-700 uppercase">Ready</span>
            </div>
            <motion.div
              animate={{ x: isHovered ? 4 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-black font-black text-lg"
            >
              →
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ConductorFeatures = () => {
  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-[#FFFDEE] via-[#F8F6E8] to-[#F0EDD4] border-b-4 border-black relative overflow-hidden">
      
      {/* Background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 text-9xl font-black text-black transform -rotate-12">♪</div>
        <div className="absolute top-40 right-20 text-7xl font-black text-black transform rotate-12">♫</div>
        <div className="absolute bottom-20 left-1/4 text-6xl font-black text-black transform -rotate-45">♬</div>
        <div className="absolute bottom-40 right-1/3 text-8xl font-black text-black transform rotate-45">♩</div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-black mb-6">
            Master the Art of
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5484] to-[#7C82FF]">
              AI Conducting
            </span>
          </h2>
          <p className="text-lg md:text-xl font-bold text-black/70 max-w-3xl mx-auto leading-relaxed">
            Every great conductor needs the right tools. Our platform gives you everything you need to create AI symphonies that resonate with perfection.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center mt-16"
        >
          <div className="bg-white border-4 border-black shadow-neo-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-black uppercase text-black mb-4">
              Ready to Take the Podium?
            </h3>
            <p className="text-sm font-medium text-black/80 mb-6">
              Join thousands of AI conductors creating extraordinary workflows
            </p>
            <button className="bg-gradient-to-r from-[#FF5484] to-[#7C82FF] text-white font-black uppercase px-8 py-4 border-4 border-black shadow-neo hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-lg transition-all duration-150 text-lg tracking-tight">
              Start Your Symphony
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ConductorFeatures; 