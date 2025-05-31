import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface PromptStickerProps {
  onSubmit: (prompt: string) => void;
  placeholder?: string;
  initialValue?: string;
}

const PaperClip: React.FC<{ className: string }> = ({ className }) => (
  <svg
    className={`paper-clip ${className}`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.49" />
  </svg>
);

const PromptSticker: React.FC<PromptStickerProps> = ({
  onSubmit,
  placeholder = 'Create a marketing campaign for a new eco-friendly product',
  initialValue = '',
}) => {
  const [value, setValue] = useState(initialValue);
  const [isStamped, setIsStamped] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) {
      alert('Please enter a prompt to continue');
      return;
    }
    
    // Trigger stamp animation
    setIsStamped(true);
    setTimeout(() => {
      onSubmit(value.trim());
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex justify-center px-[clamp(1.5rem,6vw,4rem)] py-8">
      <div className="relative inline-block bg-white border-4 border-black shadow-neo max-w-xl w-full p-8 space-y-4">
        {/* Paper clips */}
        <PaperClip className="paper-clip-tl text-gray-600" />
        <PaperClip className="paper-clip-tr text-gray-600" />
        
        {/* Stamp overlay */}
        {isStamped && (
          <div className="absolute inset-0 flex items-center justify-center z-20 animate-stamp">
            <div className="bg-red-600 text-white font-black uppercase px-6 py-3 border-4 border-black transform rotate-12 text-xl">
              ✓ Queued
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-lg font-black text-black text-center uppercase tracking-tight">
            What would you like to accomplish?
          </label>
          
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full h-12 px-4 bg-white text-black placeholder-gray-500 border-4 border-black focus:outline-none focus:ring-2 focus:ring-[#FF5484] transition-all duration-200 font-medium"
            aria-label="Prompt input"
            disabled={isStamped}
          />
          
          <button
            type="submit"
            disabled={isStamped}
            className="w-full h-12 px-6 bg-[#FF5484] text-black font-black uppercase border-4 border-black shadow-neo hover:-translate-x-1 hover:-translate-y-1 hover:shadow-none transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Generate workflow"
          >
            <span>Generate Workflow</span>
            <ArrowRight className="h-4 w-4 stroke-2" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default PromptSticker; 