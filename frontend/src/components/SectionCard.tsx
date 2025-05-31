import React from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function SectionCard({ children, className = '' }: Props) {
  return (
    <div className={`bg-white border-4 border-black shadow-neo space-y-4 p-6 ${className}`}>
      {children}
    </div>
  );
} 