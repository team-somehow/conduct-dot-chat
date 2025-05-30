// Reusable navigation bar component
// Features: Logo, navigation links, and authentication button placeholder

import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { ArrowLeft, Menu, X, Zap } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

// TODO(Navbar):
// 1. Add scroll-based transparency effect
// 2. Implement mobile hamburger menu ✓
// 3. Add authentication state handling
// 4. Create dropdown menus for complex navigation
// 5. Add search functionality
// END TODO

const Navbar = () => {
  const { setShowAuthFlow, user } = useDynamicContext();

  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isWorkflowPage = location.pathname === "/run";
  const isMarketplacePage = location.pathname === "/marketplace";
  const isOnSpecialPage = isWorkflowPage || isMarketplacePage;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b-4 border-black shadow-neo">
      {/* TODO(nav-scroll): Convert this to a scroll-activated effect later */}
      {/* TODO(brutalism): future interactive micro-animations */}
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-10 h-14 sm:h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center space-x-2"
          onClick={closeMobileMenu}
        >
          <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-[#FF5484] stroke-2" />
          <span className="text-lg sm:text-xl font-black text-black uppercase tracking-tight">
            <span className="hidden sm:inline">AI Orchestrator</span>
            <span className="sm:hidden">AI Orch</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
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
          {user ? (
            <></>
          ) : (
            <button
              onClick={() => setShowAuthFlow(true)}
              className="px-3 py-2 lg:px-4 bg-[#7C82FF] text-white font-bold uppercase text-xs sm:text-sm border-3 border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden p-2 text-black hover:text-[#FF5484] transition-colors"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6 stroke-2" />
          ) : (
            <Menu className="h-6 w-6 stroke-2" />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-14 sm:top-16 bg-white border-t-4 border-black z-40">
          <div className="px-4 py-6 space-y-4">
            {isOnSpecialPage && (
              <Link
                to="/"
                onClick={closeMobileMenu}
                className="flex items-center space-x-2 text-black font-bold uppercase text-base hover:text-[#FF5484] transition-colors py-3 border-b-2 border-gray-200"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Home</span>
              </Link>
            )}
            {!isOnSpecialPage && (
              <>
                <Link
                  to="/"
                  onClick={closeMobileMenu}
                  className="block text-black font-bold uppercase text-base hover:text-[#FF5484] transition-colors py-3 border-b-2 border-gray-200"
                >
                  Home
                </Link>
                <Link
                  to="/marketplace"
                  onClick={closeMobileMenu}
                  className="block text-black font-bold uppercase text-base hover:text-[#FF5484] transition-colors py-3 border-b-2 border-gray-200"
                >
                  Marketplace
                </Link>
              </>
            )}

            {/* Mobile Auth Button */}
            <button
              onClick={() => {
                setShowAuthFlow(true);
                closeMobileMenu();
              }}
              className="w-full mt-6 px-4 py-3 bg-[#7C82FF] text-white font-bold uppercase text-base border-3 border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150"
            >
              Sign In
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
