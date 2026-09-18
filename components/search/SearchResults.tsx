'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Train, Clock } from 'lucide-react';
import { SearchResult } from '@/types/train';
import { useSearchStore } from '@/store/search';
import { Skeleton } from '@/components/ui/Skeleton';

interface SearchResultsProps {
  results?: SearchResult[];
  isLoading?: boolean;
  onSelectTrain?: (train: SearchResult) => void;
}

export function SearchResults({
  results = [],
  isLoading = false,
  onSelectTrain,
}: SearchResultsProps) {
  const addRecentSearch = useSearchStore((state) => state.addRecentSearch);

  if (isLoading) {
    return (
      <div className="space-y-3 py-2">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
        No matching trains found. Try searching by number like 12951 or 22436.
      </div>
    );
  }

  return (
    <div className="space-y-3 py-2">
      {results.map((train, idx) => (
        <motion.div
          key={train.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: idx * 0.04 }}
        >
          <Link
            href={`/train/${train.id}`}
            onClick={() => {
              addRecentSearch(train);
              if (onSelectTrain) onSelectTrain(train);
            }}
            className="glass-panel group flex items-center justify-between rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glass-hover"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-rail-blue/10 text-rail-blue transition-colors group-hover:bg-rail-blue group-hover:text-white">
                <Train className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                    {train.number}
                  </span>
                  <h4 className="font-semibold text-slate-900 group-hover:text-rail-blue dark:text-white">
                    {train.name}
                  </h4>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <span>{train.origin.name} ({train.origin.code})</span>
                  <ArrowRight className="h-3 w-3 text-slate-400" />
                  <span>{train.destination.name} ({train.destination.code})</span>
                </div>
              </div>
            </div>

            {train.duration && (
              <div className="hidden sm:flex items-center gap-1.5 rounded-xl bg-slate-100/80 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800/80 dark:text-slate-300">
                <Clock className="h-3.5 w-3.5" />
                {train.duration}
              </div>
            )}
          </Link>
        </motion.div>
      ))}
    </div>
  );
}