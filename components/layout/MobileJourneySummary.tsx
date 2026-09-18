'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock, Gauge } from 'lucide-react';
import { LiveJourney } from '@/types/train';
import { cn } from '@/utils/cn';

interface MobileJourneySummaryProps {
  journey: LiveJourney;
}

export function MobileJourneySummary({ journey }: MobileJourneySummaryProps) {
  const progress = Math.min(journey.completionPercentage, 100);
  const delayPositive = journey.delayMinutes > 0;

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="md:hidden glass-panel rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-glass p-4 space-y-3"
    >
      {/* Train name & delay */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Live Journey</p>
          <h2 className="font-bold text-sm text-slate-900 dark:text-white truncate">{journey.name}</h2>
        </div>
        <span
          className={cn(
            'flex-shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold border',
            delayPositive
              ? 'bg-amber-500/10 text-amber-700 border-amber-500/20'
              : 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
          )}
        >
          {delayPositive ? `+${journey.delayMinutes} min late` : 'On time'}
        </span>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
          <span>{journey.origin.name}</span>
          <span className="font-mono font-bold text-rail-blue">{progress.toFixed(0)}%</span>
          <span>{journey.destination.name}</span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-sky-400 to-rail-blue"
          />
        </div>
      </div>

      {/* Live stats row */}
      <div className="flex items-center gap-3">
        {[
          { icon: Gauge, value: `${journey.speedKmh} km/h`, label: 'Speed' },
          { icon: Activity, value: `${journey.distanceCoveredKm} km`, label: 'Covered' },
          { icon: Clock, value: journey.ETA, label: 'ETA' },
        ].map(({ icon: Icon, value, label }) => (
          <div key={label} className="flex-1 flex items-center gap-1.5">
            <Icon className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-mono text-[11px] font-bold text-slate-900 dark:text-white truncate">{value}</p>
              <p className="text-[10px] text-slate-400">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
