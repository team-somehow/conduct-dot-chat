// How it works timeline component with Neo-Brutalist styling
// Features: Bold 3-step process visualization with blocky design

import React from 'react';

// TODO(HowItWorks):
// 1. Add animated timeline progression
// 2. Implement step-by-step reveal on scroll
// 3. Add interactive step details
// 4. Create mobile-responsive timeline
// 5. Add video demonstrations for each step
// END TODO

const HowItWorks = () => {
  const steps = [
    {
      title: 'Describe Your Goal',
      description: 'Simply tell us what you want to accomplish in natural language.',
      color: '#FFE37B',
    },
    {
      title: 'AI Auto-Plans',
      description: 'Our AI automatically selects and connects the best models for your task.',
      color: '#7C82FF',
    },
    {
      title: 'Watch It Execute',
      description: 'See your workflow come to life with real-time visualization and results.',
      color: '#FF5484',
    },
  ];

  return (
    <section className="py-20 bg-[#FEEF5D] border-t-4 border-b-4 border-black">
      {/* TODO(brutalism): future interactive micro-animations */}
      <div className="mx-auto max-w-screen-xl px-6 md:px-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-black mb-6 uppercase tracking-tight">
            How It Works
          </h2>
          <p className="text-black font-bold text-lg md:text-xl max-w-2xl mx-auto">
            From idea to execution in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              {/* Step Card */}
              <div className="bg-white border-4 border-black shadow-neo-lg p-8 h-80 flex flex-col justify-between hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150">
                <div className="flex flex-col items-center">
                  {/* Step Number */}
                  <div 
                    className="w-16 h-16 border-4 border-black shadow-neo flex items-center justify-center mb-6"
                    style={{ backgroundColor: step.color }}
                  >
                    <span className="text-black font-black text-2xl">{index + 1}</span>
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl md:text-2xl font-black text-black mb-4 uppercase tracking-tight text-center">{step.title}</h3>
                </div>
                
                <p className="text-black font-medium leading-relaxed text-center">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-16">
          <button className="bg-[#FF5484] text-black font-black uppercase px-10 py-4 border-4 border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150 text-lg tracking-tight">
            Start Building Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks; 