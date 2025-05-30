// SearchBar component with Neo-Brutalist styling
// Features: Text input with search icon and controlled state

import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  value, 
  onChange, 
  placeholder = "Search AI models..." 
}) => {
  return (
    <div className="relative flex-1 max-w-md">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label="Search models"
          className="w-full pl-12 pr-4 py-3 bg-white border-4 border-black shadow-neo font-medium text-black placeholder-gray-500 focus:outline-none focus:translate-x-[-2px] focus:translate-y-[-2px] focus:shadow-neo-lg transition-all duration-150"
        />
      </div>
    </div>
  );
};

export default SearchBar; 