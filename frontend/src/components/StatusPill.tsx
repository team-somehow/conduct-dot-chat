import React from 'react';

interface StatusPillProps {
  status: 'IDLE' | 'READY' | 'RUNNING' | 'COMPLETE' | 'ERROR';
  className?: string;
}

const StatusPill: React.FC<StatusPillProps> = ({ status, className = '' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'IDLE':
        return {
          label: 'IDLE',
          className: 'bg-[#FFE37B] text-black border-black',
          icon: '💤'
        };
      case 'READY':
        return {
          label: 'READY',
          className: 'bg-[#7C82FF] text-white border-black',
          icon: '⚡'
        };
      case 'RUNNING':
        return {
          label: 'RUNNING',
          className: 'bg-[#7C82FF] text-white border-black pulse-brutal',
          icon: '⚡'
        };
      case 'COMPLETE':
        return {
          label: 'COMPLETE',
          className: 'bg-[#13C27B] text-white border-black',
          icon: '✅'
        };
      case 'ERROR':
        return {
          label: 'ERROR',
          className: 'bg-[#FF5484] text-white border-black',
          icon: '❌'
        };
      default:
        return {
          label: 'UNKNOWN',
          className: 'bg-gray-300 text-black border-black',
          icon: '❓'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`
      inline-flex items-center gap-1 px-3 py-1 
      border-3 border-black font-black text-xs uppercase tracking-wide
      ${config.className} ${className}
    `}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </div>
  );
};

export default StatusPill; 