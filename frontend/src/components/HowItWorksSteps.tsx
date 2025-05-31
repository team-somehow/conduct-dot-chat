import React from 'react';
import { motion } from 'framer-motion';

interface Step {
  number: string;
  title: string;
  description: string;
  detail: string;
}

const steps: Step[] = [
  {
    number: '1',
    title: 'Describe Your Goal',
    description: 'Tell us what you want to accomplish',
    detail: 'Simply type your objective in natural language. Our AI understands context and breaks down complex tasks into manageable steps.'
  },
  {
    number: '2', 
    title: 'AI Orchestrates',
    description: 'Watch as models connect automatically',
    detail: 'Our intelligent system selects the best AI models for each step and creates an optimized workflow tailored to your specific needs.'
  },
  {
    number: '3',
    title: 'Get Results',
    description: 'Receive your completed workflow',
    detail: 'Monitor progress in real-time and receive high-quality results. Export, share, or iterate on your workflow as needed.'
  }
];

const StepCard: React.FC<{ step: Step; index: number }> = ({ step, index }) => {
  const [isFlipped, setIsFlipped] = React.useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsFlipped(!isFlipped);
    }
  };

  return (
    <motion.div
      whileInView={{ rotateY: 0 }}
      initial={{ rotateY: 90 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      viewport={{ once: true }}
      className="flip-card"
      onClick={() => setIsFlipped(!isFlipped)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
        {/* Front of card */}
        <div className="flip-card-front bg-white shadow-neo">
          <div className="text-center">
            <div className="w-20 h-20 bg-[#7C82FF] border-4 border-black flex items-center justify-center text-4xl font-black text-white mb-4 mx-auto">
              {step.number}
            </div>
            <h3 className="text-xl font-black text-black uppercase tracking-tight mb-2">
              {step.title}
            </h3>
            <p className="text-black font-medium">
              {step.description}
            </p>
            <div className="mt-4 text-xs text-gray-600 font-medium">
              Click to learn more
            </div>
          </div>
        </div>
        
        {/* Back of card */}
        <div className="flip-card-back bg-[#FFE37B] shadow-neo">
          <div className="text-center">
            <h3 className="text-lg font-black text-black uppercase tracking-tight mb-4">
              {step.title}
            </h3>
            <p className="text-black font-medium leading-relaxed">
              {step.detail}
            </p>
            <div className="mt-4 text-xs text-gray-700 font-medium">
              Click to go back
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const HowItWorksSteps = () => {
  return (
    <section className="py-16 lg:py-20 bg-[#FFE37B] border-b-4 border-black">
      <div className="max-w-screen-xl mx-auto px-6 md:px-12">
        <motion.h2 
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center text-3xl md:text-4xl font-black text-black uppercase tracking-tight mb-12"
        >
          How It Works
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          {steps.map((step, index) => (
            <StepCard key={index} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSteps; 