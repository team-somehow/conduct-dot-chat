// Footer component with Neo-Brutalist styling
// Features: Bold footer with thick borders and flat design

import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

// TODO(Footer):
// 1. Add social media links
// 2. Implement newsletter signup
// 3. Add legal pages (Privacy, Terms)
// 4. Create multi-column layout for larger footers
// 5. Add contact information
// END TODO

const Footer = () => {
  return (
    <footer className="bg-black border-t-4 border-black py-8 sm:py-12">
      {/* TODO(brutalism): future interactive micro-animations */}
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 sm:space-y-8 md:space-y-0">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-[#FF5484] stroke-2" />
            <span className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
              <span className="hidden sm:inline">AI Orchestrator</span>
              <span className="sm:hidden">AI Orch</span>
            </span>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center md:justify-start gap-4 sm:gap-6 lg:gap-8">
            <Link 
              to="/" 
              className="text-white font-bold uppercase text-xs sm:text-sm hover:text-[#FFE37B] transition-colors border-b-2 border-transparent hover:border-[#FFE37B] pb-1"
            >
              Home
            </Link>
            <Link 
              to="/marketplace" 
              className="text-white font-bold uppercase text-xs sm:text-sm hover:text-[#7C82FF] transition-colors border-b-2 border-transparent hover:border-[#7C82FF] pb-1"
            >
              Marketplace
            </Link>
            <Link 
              to="/history" 
              className="text-white font-bold uppercase text-xs sm:text-sm hover:text-[#FF5484] transition-colors border-b-2 border-transparent hover:border-[#FF5484] pb-1"
            >
              History
            </Link>
            <Link 
              to="/settings" 
              className="text-white font-bold uppercase text-xs sm:text-sm hover:text-[#FEEF5D] transition-colors border-b-2 border-transparent hover:border-[#FEEF5D] pb-1"
            >
              Settings
            </Link>
          </div>

          {/* Copyright */}
          <div className="bg-white text-black font-bold uppercase text-xs sm:text-sm px-3 py-2 sm:px-4 border-3 border-black shadow-neo">
            © 2024 AI Orchestrator
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t-2 border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-wrap justify-center md:justify-start gap-3 sm:gap-6">
              <button className="bg-[#FFE37B] text-black font-bold uppercase text-xs px-2 py-1 sm:px-3 sm:py-2 border-2 border-black shadow-neo hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-150">
                Privacy Policy
              </button>
              <button className="bg-[#7C82FF] text-white font-bold uppercase text-xs px-2 py-1 sm:px-3 sm:py-2 border-2 border-black shadow-neo hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-150">
                Terms of Service
              </button>
            </div>
            
            <div className="text-white/70 font-medium text-xs sm:text-sm text-center md:text-right">
              Built with <span className="text-[#FF5484] font-bold">♥</span> for AI enthusiasts
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 