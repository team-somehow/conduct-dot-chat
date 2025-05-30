import React from 'react';

// TODO(AnimatedThumb):
// 1. Implement tw-animate-css animations
// 2. Add hover effects
// 3. Create loading state animation
// 4. Add success/error states
// 5. Implement accessibility features
// END TODO

interface AnimatedThumbProps {
  type: 'up' | 'down';
  onClick: () => void;
  isActive?: boolean;
  count?: number;
}

const AnimatedThumb: React.FC<AnimatedThumbProps> = ({
  type,
  onClick,
  isActive = false,
  count = 0,
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        p-2 rounded-full transition-all
        ${type === 'up' ? 'bg-green-500' : 'bg-red-500'}
        ${isActive ? 'ring-2 ring-offset-2 ring-current' : ''}
        hover:scale-110
      `}
    >
      <span className="text-white text-lg">
        {type === 'up' ? '👍' : '👎'}
      </span>
      {count > 0 && (
        <span className="ml-1 text-white text-sm">{count}</span>
      )}
    </button>
  );
};

export default AnimatedThumb; 