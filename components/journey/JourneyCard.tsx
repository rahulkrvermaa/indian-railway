'use client';

import React from 'react';
import { Gauge, MapPin, RefreshCw, ArrowRight, Share2 } from 'lucide-react';
import { LiveJourney } from '@/types/train';
import { DelayBadge } from './DelayBadge';
import { ProgressRing } from './ProgressRing';
import { ETAChip } from './ETAChip';
import { formatDistance, formatTimeAgo } from '@/utils/format';
import { cn } from '@/utils/cn';

interface JourneyCardProps {
  journey: LiveJourney;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  className?: string;
}

export function JourneyCard({
  journey,
  onRefresh,
  isRefreshing,
  className,
}: JourneyCardProps) {
  const isRunning = journey.status === 'running';

  const handleShare = async () => {
    const shareData = {
      title: `${journey.name} (${journey.number}) - Live Status`,
      text: `Track the live location of ${journey.name} from ${journey.origin.name} to ${journey.destination.name}!`,
      url: window.location.href,
    };
    
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Journey link copied to clipboard!');
      }
    } catch (err) {
      console.log('Error sharing:', err);
    }
  };

  let statusGradient = 'before:from-rail-blue/10';
  let gaugeColor = 'bg-rail-blue/10 text-rail-blue';
  
  if (isRunning) {
    if (journey.delayMinutes > 60) {
      statusGradient = 'before:from-rose-500/10';
      gaugeColor = 'bg-rose-500/10 text-rose-500';
    } else if (journey.delayMinutes > 15) {
      statusGradient = 'before:from-amber-500/10';
      gaugeColor = 'bg-amber-500/10 text-amber-600';
    } else if (journey.delayMinutes <= 0) {
      statusGradient = 'before:from-emerald-500/10';
      gaugeColor = 'bg-emerald-500/10 text-emerald-600';
    }
  }

  return (
    <div
      className={cn(
        'glass-panel relative overflow-hidden rounded-3xl p-6 shadow-glass transition-all duration-300',
        isRunning && `before:absolute before:inset-0 before:bg-gradient-to-br ${statusGradient} before:to-transparent before:animate-pulse`,
        className
      )}
    >
      <div className="relative z-10">
        {/* Header Bar */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-rail-blue/10 px-2.5 py-1 font-mono text-xs font-bold text-rail-blue">
              #{journey.number}
            </span>
            <DelayBadge delayMinutes={journey.delayMinutes} />
          </div>
          <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {journey.name}
          </h2>
          <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>{journey.origin.name} ({journey.origin.code})</span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
            <span>{journey.destination.name} ({journey.destination.code})</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ETAChip eta={journey.ETA} />
          
          <button
            onClick={handleShare}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100/80 text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700"
            title="Share Live Status"
          >
            <Share2 className="h-4 w-4" />
          </button>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100/80 text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700"
              title="Refresh Live Status"
            >
              <RefreshCw
                className={cn('h-4 w-4', isRefreshing && 'animate-spin text-rail-blue')}
              />
            </button>
          )}
        </div>
      </div>

      {/* Primary Live Status Grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Current / Last Passed Station */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800/60 dark:bg-slate-900/50">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Current / Last Station
            </span>
            <p className="font-semibold text-slate-900 dark:text-white">
              {journey.currentStation?.name || journey.previousStation?.name || 'In Transit'}
            </p>
            {journey.currentStation?.platform && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Platform {journey.currentStation.platform}
              </span>
            )}
          </div>
        </div>

        {/* Speed & Motion */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800/60 dark:bg-slate-900/50">
          <div className={cn("flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition-colors duration-500", gaugeColor)}>
            <Gauge className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Live Speed
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-xl font-bold text-slate-900 dark:text-white">
                {journey.speedKmh}
              </span>
              <span className="text-xs font-semibold text-slate-500">km/h</span>
            </div>
          </div>
        </div>

        {/* Journey Progress Ring */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800/60 dark:bg-slate-900/50">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Distance Covered
            </span>
            <p className="font-mono text-base font-bold text-slate-900 dark:text-white">
              {formatDistance(journey.distanceCoveredKm)} / {formatDistance(journey.totalDistanceKm)}
            </p>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {formatDistance(journey.remainingDistanceKm)} remaining
            </span>
          </div>
          <ProgressRing progress={journey.completionPercentage} size={54} strokeWidth={5} />
        </div>
      </div>

      {/* Footer Meta */}
      <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
        <span>Auto-refreshes every 30 seconds</span>
        <span>Updated {formatTimeAgo(journey.lastUpdated)}</span>
      </div>
      </div>
    </div>
  );
}