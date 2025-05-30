// Call-to-action section component
// Features: Neo-Brutalist design with bold CTA

import React from 'react';
import { ArrowRight } from 'lucide-react';

// TODO(CTASection):
// 1. Add animated background effects
// 2. Implement A/B testing for different CTAs
// 3. Add conversion tracking
// 4. Create multiple CTA variants
// 5. Add social proof elements
// END TODO

const CTASection = () => {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-screen-xl px-6 md:px-10">
        {/* TODO(brutalism): future interactive micro-animations */}
        <div className="bg-[#7C82FF] border-t-4 border-b-4 border-black shadow-neo p-12 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-white font-bold text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already orchestrating AI models with precision and ease.
          </p>
          <button 
            onClick={() => {/* TODO: Implement CTA action */}}
            className="inline-flex items-center space-x-2 bg-white text-black font-black uppercase px-8 py-4 border-4 border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150 text-lg"
          >
            <span>Try It Free</span>
            <ArrowRight className="h-5 w-5 stroke-2" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTASection; 