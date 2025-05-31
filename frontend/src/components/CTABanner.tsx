import React from 'react';
import { ArrowRight } from 'lucide-react';

const CTABanner = () => {
  const [isWiggling, setIsWiggling] = React.useState(false);

  const handleClick = () => {
    setIsWiggling(true);
    setTimeout(() => setIsWiggling(false), 600);
    
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <section className="py-16 md:py-24 bg-[#7C82FF] border-b-4 border-black">
      <div className="max-w-screen-xl mx-auto px-6 md:px-12 text-center">
        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tight leading-tight">
          Ready to Transform<br className="hidden sm:block" /> Your Workflow?
        </h2>
        
        <p className="text-white font-bold text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
          Join thousands of users who are already orchestrating AI models with precision and ease.
        </p>
        
        <button
          onClick={handleClick}
          className={`inline-flex items-center gap-3 bg-white text-black font-black uppercase px-8 py-4 border-4 border-black shadow-neo hover:-translate-x-1 hover:-translate-y-1 hover:shadow-none transition-all duration-150 text-lg ${
            isWiggling ? 'animate-pulse' : ''
          }`}
          aria-label="Try the AI workflow orchestrator for free"
        >
          <span>Try It Free</span>
          <ArrowRight className="h-5 w-5 stroke-2" />
        </button>
        
        <div className="mt-6 text-white/80 text-sm font-medium">
          No credit card required • Start in seconds
        </div>
      </div>
    </section>
  );
};

export default CTABanner; 