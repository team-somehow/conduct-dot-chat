// Reusable navigation bar component
// Features: Logo, navigation links, and authentication button placeholder

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, ArrowLeft } from 'lucide-react';

// TODO(Navbar):
// 1. Add scroll-based transparency effect
// 2. Implement mobile hamburger menu
// 3. Add authentication state handling
// 4. Create dropdown menus for complex navigation
// 5. Add search functionality
// END TODO

const Navbar = () => {
  const location = useLocation();
  const isWorkflowPage = location.pathname === '/run';
  const isMarketplacePage = location.pathname === '/marketplace';
  const isOnSpecialPage = isWorkflowPage || isMarketplacePage;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b-4 border-black shadow-neo">
      {/* TODO(nav-scroll): Convert this to a scroll-activated effect later */}
      {/* TODO(brutalism): future interactive micro-animations */}
      <div className="mx-auto max-w-screen-xl px-6 md:px-10 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <Zap className="h-8 w-8 text-[#FF5484] stroke-2" />
          <span className="text-xl font-black text-black uppercase tracking-tight">AI Orchestrator</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-6">
          {isOnSpecialPage && (
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-black font-bold uppercase text-sm hover:text-[#FF5484] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          )}
          {!isOnSpecialPage && (
            <>
              <Link 
                to="/" 
                className="text-black font-bold uppercase text-sm hover:text-[#FF5484] transition-colors"
              >
                Home
              </Link>
              <Link 
                to="/marketplace" 
                className="text-black font-bold uppercase text-sm hover:text-[#FF5484] transition-colors"
              >
                Marketplace
              </Link>
            </>
          )}
          
          {/* Auth Button Placeholder */}
          <button 
            onClick={() => {/* TODO: Implement auth */}}
            className="px-4 py-2 bg-[#7C82FF] text-white font-bold uppercase text-sm border-3 border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150"
          >
            Sign In
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 