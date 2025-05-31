import React from 'react';

interface TimelineRailProps {
  order: number;
  active: boolean;
  className?: string;
}

const TimelineRail: React.FC<TimelineRailProps> = ({ order, active, className = '' }) => {
  return (
    <div className={`timeline-rail flex items-center justify-center ${className}`}>
      <div className={`
        w-10 h-10 border-4 border-black font-black text-lg
        flex items-center justify-center relative z-10
        transition-all duration-200
        ${active 
          ? 'bg-[#FF5484] text-white shadow-neo-lg scale-110' 
          : 'bg-white text-black shadow-neo hover:bg-[#FFE37B]'
        }
      `}>
        {order}
      </div>
    </div>
  );
};

export default TimelineRail; 