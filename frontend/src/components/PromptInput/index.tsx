import React from 'react';
import { ArrowRight } from 'lucide-react';

// TODO(PromptInput):
// 1. Implement Radix UI TextField for better accessibility
// 2. Add character count and validation
// 3. Create loading state for submission
// 4. Add keyboard shortcuts (Enter to submit)
// 5. Implement auto-suggestions
// END TODO

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  placeholder?: string;
  initialValue?: string;
  className?: string;
}

const PromptInput: React.FC<PromptInputProps> = ({
  onSubmit,
  placeholder = 'Create a marketing campaign for a new eco-friendly product',
  initialValue = '',
  className = '',
}) => {
  const [value, setValue] = React.useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) {
      alert('Please enter a prompt to continue');
      return;
    }
    onSubmit(value.trim());
  };

  return (
    <div className={`w-full max-w-xl md:max-w-2xl mx-auto mt-14 md:mt-20 ${className}`}>
      {/* TODO(brutalism): future interactive micro-animations */}
      <div className="bg-white border-4 border-black shadow-neo-lg p-10 space-y-6">
        <label className="block text-xl md:text-2xl font-black text-black text-center uppercase tracking-tight">
          What would you like to accomplish?
        </label>
        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-0 md:flex md:space-x-4">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="w-full md:flex-1 h-12 px-4 bg-white text-black placeholder-gray-500 border-4 border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-dashed transition-all duration-200 font-medium"
            aria-label="Prompt input"
          />
          <button
            type="submit"
            className="w-full md:w-auto h-12 px-8 bg-[#FF5484] text-black font-bold uppercase border-4 border-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150 flex items-center justify-center space-x-2"
            aria-label="Generate workflow"
          >
            <span>Generate Workflow</span>
            <ArrowRight className="h-[18px] w-[18px] stroke-2" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default PromptInput; 