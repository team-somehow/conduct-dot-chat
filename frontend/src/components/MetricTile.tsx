import React from 'react';

interface Props {
  value: string | number;
  label: string;
}

export default function MetricTile({ value, label }: Props) {
  return (
    <div className="flex flex-col items-center justify-center bg-white border-4 border-black shadow-neo p-4 w-full">
      <span className="text-3xl md:text-4xl font-black">{value}</span>
      <span className="text-xs uppercase font-bold tracking-wide text-black/70">{label}</span>
    </div>
  );
} 