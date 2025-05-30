// TagBadge component with Neo-Brutalist styling
// Features: Pill-shaped tag with flat color and black border

import React from 'react';

interface TagBadgeProps {
  tag: string;
  color?: string;
}

const TAG_COLORS = [
  '#7C82FF', // Purple
  '#FF5484', // Pink
  '#FEEF5D', // Yellow
  '#FFE37B', // Light Orange
  '#A8E6CF', // Light Green
  '#FFB3BA', // Light Pink
  '#BFEFFF', // Light Blue
];

const TagBadge: React.FC<TagBadgeProps> = ({ tag, color }) => {
  // Use provided color or generate one based on tag hash
  const tagColor = color || TAG_COLORS[tag.length % TAG_COLORS.length];
  
  return (
    <span
      className="inline-block px-3 py-1 border-3 border-black font-bold uppercase text-xs text-black"
      style={{ backgroundColor: tagColor }}
    >
      {tag}
    </span>
  );
};

export default TagBadge; 