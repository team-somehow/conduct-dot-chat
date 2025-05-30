// SortDropdown component with Neo-Brutalist styling
// Features: Select dropdown for sorting models by different criteria

import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

const SORT_OPTIONS = [
  { value: 'rating', label: 'Highest Rated' },
  { value: 'cost', label: 'Lowest Cost' },
  { value: 'name', label: 'A-Z' }
];

const SortDropdown: React.FC<SortDropdownProps> = ({ value, onChange }) => {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Sort models"
        className="appearance-none bg-white border-4 border-black shadow-neo px-4 py-3 pr-10 font-bold uppercase text-sm text-black focus:outline-none focus:translate-x-[-2px] focus:translate-y-[-2px] focus:shadow-neo-lg transition-all duration-150 cursor-pointer"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black pointer-events-none" />
    </div>
  );
};

export default SortDropdown; 