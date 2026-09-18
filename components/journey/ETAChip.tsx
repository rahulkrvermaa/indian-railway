import React from 'react';
import { Navigation } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ETAChipProps {
  eta: string;
  className?: string;
}

export function ETAChip({ eta, className }: ETAChipProps) {
  return (
    <div
      className={cn(
        'glass-panel inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200',
        className
      )}
    >
      <Navigation className="h-3.5 w-3.5 text-rail-blue animate-pulse" />
      <span>ETA: {eta}</span>
    </div>
  );
}