'use client';

import React from 'react';
import { Search, Command, X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onFocus?: () => void;
  inputRef?: React.RefObject<HTMLInputElement>;
  className?: string;
}

export function SearchBar({ value, onChange, onFocus, inputRef, className }: SearchBarProps) {
  return (
    <div
      className={cn(
        'glass-panel relative flex items-center rounded-2xl px-4 py-3 shadow-glass transition-all duration-300 focus-within:border-rail-blue/50 focus-within:shadow-glow',
        className
      )}
    >
      <Search className="h-5 w-5 flex-shrink-0 text-slate-400 dark:text-slate-500" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        placeholder="Enter train number or name (e.g. 12951, Rajdhani)..."
        className="w-full bg-transparent px-3 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none dark:text-white dark:placeholder-slate-500"
      />
      {value ? (
        <button
          onClick={() => onChange('')}
          className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
        >
          <X className="h-4 w-4" />
        </button>
      ) : (
        <kbd className="hidden sm:inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          <Command className="h-3 w-3" /> K
        </kbd>
      )}
    </div>
  );
}