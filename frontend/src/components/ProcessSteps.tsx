import React from 'react';

interface Step {
  number: string;
  title: string;
  description: string;
  doodle: string;
}

const steps: Step[] = [
  {
    number: '01',
    title: 'Input Your Prompt',
    description: 'Type your creative request or question into our intuitive interface',
    doodle: '✏️'
  },
  {
    number: '02',
    title: 'AI Processing',
    description: 'Our advanced models analyze and understand your requirements',
    doodle: '⚡'
  },
  {
    number: '03',
    title: 'Get Results',
    description: 'Receive high-quality outputs tailored to your specific needs',
    doodle: '🎯'
  }
];

const Arrow: React.FC = () => (
  <div className="hidden md:flex items-center justify-center px-4">
    <svg 
      width="60" 
      height="40" 
      viewBox="0 0 60 40" 
      className="text-black"
      style={{ transform: 'rotate(-5deg)' }}
    >
      <path 
        d="M5 20 L45 20 M35 10 L45 20 L35 30" 
        stroke="currentColor" 
        strokeWidth="4" 
        fill="none" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <circle cx="15" cy="12" r="2" fill="currentColor" />
      <circle cx="25" cy="28" r="1.5" fill="currentColor" />
    </svg>
  </div>
);

const StepCard: React.FC<{ step: Step; index: number }> = ({ step, index }) => (
  <div className="flex-1 min-w-[280px]">
    <div 
      className="bg-white border-4 border-black shadow-neo p-6 h-full transform hover:scale-105 transition-transform duration-200"
      style={{ 
        transform: `rotate(${index % 2 === 0 ? '1deg' : '-1deg'})`,
      }}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Step Number */}
        <div className="w-16 h-16 bg-[#7C82FF] border-3 border-black flex items-center justify-center">
          <span className="text-2xl font-black text-white">
            {step.number}
          </span>
        </div>
        
        {/* Doodle */}
        <div className="text-4xl">
          {step.doodle}
        </div>
        
        {/* Title */}
        <h3 className="text-xl font-black text-black uppercase tracking-tight">
          {step.title}
        </h3>
        
        {/* Description */}
        <p className="text-sm text-black font-medium leading-relaxed">
          {step.description}
        </p>
      </div>
    </div>
  </div>
);

const ProcessSteps = () => {
  return (
    <section className="bg-[#FFE37B] py-16 px-[clamp(1.5rem,6vw,4rem)]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-black uppercase tracking-tight mb-4">
            How It Works
          </h2>
          <p className="text-lg text-black font-medium max-w-2xl mx-auto">
            Get started with AI in three simple steps
          </p>
        </div>
        
        {/* Steps Container */}
        <div className="flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <StepCard step={step} index={index} />
              {index < steps.length - 1 && <Arrow />}
            </React.Fragment>
          ))}
        </div>
        
        {/* Bottom Doodles */}
        <div className="flex justify-center items-center mt-12 space-x-8 text-2xl">
          <span style={{ transform: 'rotate(15deg)' }}>⭐</span>
          <span style={{ transform: 'rotate(-10deg)' }}>🚀</span>
          <span style={{ transform: 'rotate(20deg)' }}>💫</span>
        </div>
      </div>
    </section>
  );
};

export default ProcessSteps; 