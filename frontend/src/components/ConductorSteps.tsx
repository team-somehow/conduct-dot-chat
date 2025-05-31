import React from 'react';
import { motion } from 'framer-motion';

interface StepData {
  number: string;
  title: string;
  description: string;
  icon: string;
  accent: string;
  details: string[];
  musicalNote: string;
}

const steps: StepData[] = [
  {
    number: '01',
    title: 'Assemble Your Orchestra',
    description: 'Choose from our ensemble of specialized AI agents, each a master of their craft',
    icon: '🎼',
    accent: '#7C82FF',
    details: [
      'Browse agent marketplace',
      'Review capabilities & ratings',
      'Select complementary agents',
      'Configure agent parameters'
    ],
    musicalNote: '♪'
  },
  {
    number: '02',
    title: 'Compose Your Score',
    description: 'Design the workflow that will guide your agents through their performance',
    icon: '✍️',
    accent: '#FF5484',
    details: [
      'Visual workflow designer',
      'Drag & drop interface',
      'Set dependencies & timing',
      'Define success criteria'
    ],
    musicalNote: '♫'
  },
  {
    number: '03',
    title: 'Conduct the Performance',
    description: 'Raise your baton and watch as your AI symphony comes to life',
    icon: '🎯',
    accent: '#FEEF5D',
    details: [
      'Real-time monitoring',
      'Dynamic adjustments',
      'Performance metrics',
      'Quality control'
    ],
    musicalNote: '♬'
  },
  {
    number: '04',
    title: 'Enjoy the Ovation',
    description: 'Receive your masterpiece - results that exceed expectations every time',
    icon: '🏆',
    accent: '#A8E6CF',
    details: [
      'High-quality outputs',
      'Detailed analytics',
      'Performance history',
      'Continuous improvement'
    ],
    musicalNote: '♩'
  }
];

const StepCard: React.FC<{ step: StepData; index: number; isActive: boolean }> = ({ 
  step, 
  index, 
  isActive 
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.2, duration: 0.6 }}
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Connecting line */}
      {index < steps.length - 1 && (
        <div className="hidden lg:block absolute top-1/2 -right-8 w-16 h-1 bg-black transform -translate-y-1/2 z-0">
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-black border-t-2 border-b-2 border-t-transparent border-b-transparent"></div>
        </div>
      )}

      {/* Musical note decoration */}
      <div 
        className="absolute -top-4 -right-4 text-4xl font-black opacity-20 transform rotate-12 transition-all duration-300 group-hover:scale-125 group-hover:opacity-40"
        style={{ color: step.accent }}
      >
        {step.musicalNote}
      </div>

      {/* Main card */}
      <div className={`
        bg-white border-4 border-black shadow-neo p-8 transition-all duration-300 relative overflow-hidden
        ${isHovered ? 'translate-x-[-4px] translate-y-[-4px] shadow-neo-lg' : ''}
        ${isActive ? 'ring-4 ring-yellow-400 ring-opacity-50' : ''}
      `}>
        
        {/* Background accent */}
        <div 
          className="absolute top-0 left-0 w-full h-2 transition-all duration-300"
          style={{ backgroundColor: step.accent }}
        />

        {/* Step number */}
        <div className="flex items-center justify-between mb-6">
          <div 
            className="w-16 h-16 border-4 border-black flex items-center justify-center font-black text-xl transition-all duration-300 group-hover:scale-110"
            style={{ backgroundColor: step.accent }}
          >
            {step.number}
          </div>
          <div 
            className="w-12 h-12 border-4 border-black flex items-center justify-center text-2xl transition-all duration-300 group-hover:rotate-12"
            style={{ backgroundColor: step.accent }}
          >
            {step.icon}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h3 className="text-xl font-black uppercase tracking-tight text-black leading-tight">
            {step.title}
          </h3>
          
          <p className="text-sm font-medium text-black/80 leading-relaxed">
            {step.description}
          </p>

          {/* Details - shown on hover */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ 
              opacity: isHovered ? 1 : 0, 
              height: isHovered ? 'auto' : 0 
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="border-t-2 border-black pt-4 mt-4">
              <h4 className="text-xs font-black uppercase text-black mb-3 tracking-wide">
                What You'll Do:
              </h4>
              <ul className="space-y-2">
                {step.details.map((detail, i) => (
                  <motion.li 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center space-x-3 text-xs font-medium text-black/70"
                  >
                    <div 
                      className="w-2 h-2 border border-black"
                      style={{ backgroundColor: step.accent }}
                    ></div>
                    <span>{detail}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Progress indicator */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 border-2 border-black animate-pulse"></div>
              <span className="text-xs font-bold text-green-700 uppercase">
                {isActive ? 'Active' : 'Ready'}
              </span>
            </div>
            <div className="text-xs font-black text-black/50 uppercase tracking-wide">
              Step {index + 1} of {steps.length}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ConductorSteps = () => {
  const [activeStep, setActiveStep] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-[#F0EDD4] via-[#E8E4D0] to-[#DDD8C0] border-b-4 border-black relative overflow-hidden">
      
      {/* Background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 border-8 border-black rounded-full"></div>
        <div className="absolute top-40 right-20 w-24 h-24 border-6 border-black transform rotate-45"></div>
        <div className="absolute bottom-20 left-1/4 w-20 h-20 border-4 border-black"></div>
        <div className="absolute bottom-40 right-1/3 w-28 h-28 border-6 border-black rounded-full"></div>
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
            How to Conduct
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5484] to-[#7C82FF]">
              AI Symphonies
            </span>
          </h2>
          <p className="text-lg md:text-xl font-bold text-black/70 max-w-3xl mx-auto leading-relaxed">
            Master the art of AI orchestration in four simple movements. From assembly to applause, we'll guide you through every note.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8 lg:gap-6 xl:gap-8">
          {steps.map((step, index) => (
            <StepCard 
              key={step.number} 
              step={step} 
              index={index} 
              isActive={activeStep === index}
            />
          ))}
        </div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-16"
        >
          <div className="bg-white border-4 border-black shadow-neo p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black uppercase text-black">
                Symphony Progress
              </h3>
              <span className="text-sm font-bold text-black/70">
                {activeStep + 1} / {steps.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 border-2 border-black h-4">
              <motion.div
                className="h-full bg-gradient-to-r from-[#FF5484] to-[#7C82FF] border-r-2 border-black"
                initial={{ width: 0 }}
                animate={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-xs font-medium text-black/60 mt-2 text-center">
              Currently conducting: {steps[activeStep].title}
            </p>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="text-center mt-12"
        >
          <button className="bg-white text-black font-black uppercase px-10 py-5 border-4 border-black shadow-neo hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-lg transition-all duration-150 text-xl tracking-tight">
            Begin Your First Symphony →
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default ConductorSteps; 