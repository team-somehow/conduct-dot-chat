import React from 'react';
import { ArrowRight } from 'lucide-react';

const ScatteredElement: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, className = '', style = {} }) => (
  <div 
    className={`absolute text-2xl md:text-3xl ${className}`}
    style={style}
  >
    {children}
  </div>
);

const CallToAction = () => {
  return (
    <section className="bg-[#7C82FF] py-20 px-[clamp(1.5rem,6vw,4rem)] relative overflow-hidden">
      {/* Scattered Background Elements */}
      <ScatteredElement 
        className="top-8 left-8 animate-bounce"
        style={{ animationDelay: '0s', animationDuration: '3s' }}
      >
        🚀
      </ScatteredElement>
      <ScatteredElement 
        className="top-12 right-12 animate-pulse"
        style={{ animationDelay: '1s' }}
      >
        ⭐
      </ScatteredElement>
      <ScatteredElement 
        className="bottom-16 left-16 animate-bounce"
        style={{ animationDelay: '2s', animationDuration: '2.5s' }}
      >
        💫
      </ScatteredElement>
      <ScatteredElement 
        className="bottom-8 right-8 animate-pulse"
        style={{ animationDelay: '0.5s' }}
      >
        🎯
      </ScatteredElement>
      <ScatteredElement 
        className="top-1/3 left-4 animate-bounce"
        style={{ animationDelay: '1.5s', animationDuration: '4s' }}
      >
        ⚡
      </ScatteredElement>
      <ScatteredElement 
        className="top-2/3 right-4 animate-pulse"
        style={{ animationDelay: '2.5s' }}
      >
        🎨
      </ScatteredElement>
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Main Headline */}
        <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight mb-6 leading-tight">
          Ready to Create
          <br />
          <span className="text-[#FFE37B]">Something Amazing?</span>
        </h2>
        
        {/* Subtext */}
        <p className="text-lg md:text-xl text-white font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
          Join thousands of creators using AI to bring their wildest ideas to life. 
          Start your journey today!
        </p>
        
        {/* CTA Button */}
        <div className="flex justify-center">
          <button className="group bg-[#FF5484] hover:bg-[#FFE37B] border-4 border-black shadow-neo hover:shadow-neo-hover text-black font-black text-xl uppercase tracking-tight px-12 py-6 transition-all duration-200 transform hover:scale-105 hover:-rotate-1 flex items-center space-x-3">
            <span>Get Started Now</span>
            <ArrowRight 
              size={24} 
              className="group-hover:translate-x-1 transition-transform duration-200" 
            />
          </button>
        </div>
        
        {/* Bottom Text */}
        <p className="text-white font-medium mt-8 text-sm">
          No credit card required • Free to start • Instant access
        </p>
        
        {/* Decorative Elements */}
        <div className="flex justify-center items-center mt-8 space-x-6">
          <div 
            className="w-4 h-4 bg-[#FFE37B] border-2 border-black transform rotate-45"
            style={{ animation: 'spin 4s linear infinite' }}
          />
          <div 
            className="w-6 h-6 bg-[#FF5484] border-2 border-black rounded-full"
            style={{ animation: 'bounce 2s infinite' }}
          />
          <div 
            className="w-4 h-4 bg-white border-2 border-black transform rotate-45"
            style={{ animation: 'spin 3s linear infinite reverse' }}
          />
        </div>
      </div>
    </section>
  );
};

export default CallToAction; 