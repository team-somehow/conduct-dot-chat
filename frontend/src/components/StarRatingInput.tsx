import React, { useState } from 'react';

interface Props {
  value: number;
  onChange: (v: number) => void;
}

export default function StarRatingInput({ value, onChange }: Props) {
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
          onClick={() => onChange(i)}
          className="w-8 h-8 text-2xl leading-none text-yellow-400 hover:text-yellow-300 transition-colors"
          aria-label={`${i} star${i > 1 ? 's' : ''}`}
        >
          {(hover ?? value) >= i ? '★' : '☆'}
        </button>
      ))}
    </div>
  );
} 