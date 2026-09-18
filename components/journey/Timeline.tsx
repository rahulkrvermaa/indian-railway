'use client';

import React, { useMemo, useState } from 'react';
import { CheckCircle2, Circle, Radio, Clock } from 'lucide-react';
import { Station } from '@/types/train';
import { formatDelay } from '@/utils/format';
import { cn } from '@/utils/cn';
import { ProgressRing } from './ProgressRing';

interface TimelineProps {
  stations: Station[];
  currentStationCode?: string;
  progress?: number;
  className?: string;
}

// Timeline now displays only stations where the train stops (haltMinutes > 0).
// The clickable area between two displayed stops toggles reveal/unreveal of that segment's details.
export function Timeline({ stations, currentStationCode, progress, className }: TimelineProps) {
  const [selectedSegmentIndex, setSelectedSegmentIndex] = useState<number | null>(null);

  const toggleSegment = (index: number) => {
    setSelectedSegmentIndex((current) => (current === index ? null : index));
  };

  const displayedStations = useMemo(() => {
    const stops = stations.filter((s) => typeof s.haltMinutes === 'number' && s.haltMinutes > 0);
    return stops.length > 0 ? stops : stations;
  }, [stations]);

  return (
    <div className={cn('glass-panel rounded-3xl p-6 shadow-glass', className)}>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Station Route Timeline</h3>
        {typeof progress === 'number' && <ProgressRing progress={progress} size={48} strokeWidth={5} />}
      </div>

      <div className="relative z-0 pl-6 before:absolute before:bottom-3 before:left-3 before:top-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        <div className="space-y-3">
          {displayedStations.map((st, idx) => {
            const isPassed = st.status === 'passed';
            const isCurrent = st.status === 'current' || st.code === currentStationCode;
            const isUpcoming = st.status === 'upcoming';
            const delayInfo = formatDelay(st.delayMinutes);
            const nextStation = idx < displayedStations.length - 1 ? displayedStations[idx + 1] : null;
            const isSelectedSegment = selectedSegmentIndex === idx;

            return (
              <React.Fragment key={st.code + idx}>
                <div className="relative z-10 flex items-start justify-between gap-4 rounded-2xl px-2 py-1">
                  <div className="absolute -left-6 top-0.5 z-10 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full bg-background">
                    {isPassed && <CheckCircle2 className="h-5 w-5 text-emerald-500 fill-emerald-500/20" />}
                    {isCurrent && (
                      <div className="relative z-10 flex items-center justify-center">
                        <span className="absolute h-9 w-9 rounded-full border-2 border-rail-blue/35 bg-rail-blue/10 animate-ping" />
                        <span className="absolute h-12 w-12 rounded-full border border-rail-blue/30 bg-rail-blue/5" />
                        <Radio className="relative z-10 h-5 w-5 text-rail-blue fill-rail-blue/15 animate-pulse" />
                      </div>
                    )}
                    {isUpcoming && <Circle className="h-4 w-4 text-slate-300 dark:text-slate-700" />}
                  </div>

                  <div className="flex-1 pl-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4
                        className={cn(
                          'font-bold',
                          isCurrent
                            ? 'text-rail-blue text-base'
                            : isPassed
                            ? 'text-slate-800 dark:text-slate-200 text-sm'
                            : 'text-slate-500 dark:text-slate-400 text-sm'
                        )}
                      >
                        {st.name} ({st.code})
                      </h4>

                      {isCurrent && (
                        <span className="rounded-md bg-rail-blue/10 px-2 py-0.5 font-mono text-[10px] font-bold text-rail-blue">LIVE LOCATION</span>
                      )}

                      {st.platform && (
                        <span className="rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                          PF {st.platform}
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                      <span>{st.distanceKm} km</span>
                      {st.haltMinutes && <span>Halt: {st.haltMinutes}m</span>}
                    </div>
                  </div>

                  <div className="text-right font-mono text-xs">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{st.actualArrival || st.scheduledArrival}</div>
                    {st.delayMinutes > 0 ? (
                      <div className={cn('text-[11px] font-bold', delayInfo.color)}>+{st.delayMinutes}m delay</div>
                    ) : (
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">On Time</div>
                    )}
                  </div>
                </div>

                {nextStation && (
                  <button
                    type="button"
                    onClick={() => toggleSegment(idx)}
                    className={cn(
                      'ml-8 flex w-[calc(100%-2rem)] cursor-pointer items-center justify-between rounded-xl border border-dashed border-slate-200 px-3 py-3 text-[11px] font-medium text-slate-500 transition-all outline-none hover:border-rail-blue/50 hover:text-rail-blue dark:border-slate-700 dark:text-slate-400',
                      isSelectedSegment && 'border-rail-blue/40 bg-rail-blue/5 text-rail-blue shadow-sm'
                    )}
                  >
                    <span className="text-left">{st.name} → {nextStation.name}</span>
                    <span className="shrink-0 font-semibold">{Math.max(0, nextStation.distanceKm - st.distanceKm).toFixed(1)} km</span>
                  </button>
                )}

                {isSelectedSegment && nextStation && (
                  <div className="ml-8 mt-2 rounded-md p-3 bg-slate-50 dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-200">
                    <div className="font-semibold">Segment: {st.name} → {nextStation.name}</div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Distance: {Math.max(0, nextStation.distanceKm - st.distanceKm).toFixed(1)} km</div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{/* could show halt/station details here if needed */}</div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}