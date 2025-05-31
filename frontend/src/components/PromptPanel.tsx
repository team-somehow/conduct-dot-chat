import React from 'react';
import { ArrowRight } from 'lucide-react';

interface PromptPanelProps {
  onSubmit: (prompt: string) => void;
  placeholder?: string;
  initialValue?: string;
}

const PromptPanel: React.FC<PromptPanelProps> = ({
  onSubmit,
  placeholder = 'Create a marketing campaign for a new eco-friendly product',
  initialValue = '',
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-white border-4 border-black shadow-neo p-8 flex flex-col md:flex-row gap-4 max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 w-full">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 h-12 px-4 bg-white text-black placeholder-gray-500 border-4 border-black focus:outline-none focus:ring-2 focus:ring-[#FF5484] transition-all duration-200 font-medium"
          aria-label="Prompt"
        />
        <button
          type="submit"
          className="h-12 px-6 bg-[#FF5484] text-black font-bold uppercase border-4 border-black shadow-neo hover:-translate-x-1 hover:-translate-y-1 hover:shadow-none transition-all duration-150 flex items-center justify-center gap-2 whitespace-nowrap"
          aria-label="Generate workflow"
        >
          <span className="hidden sm:inline">Generate Workflow</span>
          <span className="sm:hidden">Generate</span>
          <ArrowRight className="h-4 w-4 stroke-2" />
        </button>
      </form>
    </div>
  );
};

export default PromptPanel; 