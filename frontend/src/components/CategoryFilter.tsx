// CategoryFilter component with Neo-Brutalist styling
// Features: Select dropdown for filtering models by category

import React from 'react';
import { ChevronDown } from 'lucide-react';

interface CategoryFilterProps {
  value: string;
  onChange: (value: string) => void;
}

const CATEGORIES = [
  'All',
  'Data',
  'Text',
  'Code',
  'Image',
  'Audio',
  'Video'
];

const CategoryFilter: React.FC<CategoryFilterProps> = ({ value, onChange }) => {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Filter category"
        className="appearance-none bg-white border-4 border-black shadow-neo px-4 py-3 pr-10 font-bold uppercase text-sm text-black focus:outline-none focus:translate-x-[-2px] focus:translate-y-[-2px] focus:shadow-neo-lg transition-all duration-150 cursor-pointer"
      >
        {CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black pointer-events-none" />
    </div>
  );
};

export default CategoryFilter; 