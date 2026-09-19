'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { CheckCircle2, Circle, Radio, Clock, MapPin } from 'lucide-react';
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

export function Timeline({ stations, currentStationCode, progress, className }: TimelineProps) {
  const [selectedSegmentIndex, setSelectedSegmentIndex] = useState<number | null>(null);
  const liveStationRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the live station on initial render
  useEffect(() => {
    if (liveStationRef.current) {
      liveStationRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentStationCode]);

  const toggleSegment = (index: number) => {
    setSelectedSegmentIndex((current) => (current === index ? null : index));
  };

  const displayedStations = useMemo(() => {
    const stops = stations.filter(
      (s) =>
        (typeof s.haltMinutes === 'number' && s.haltMinutes > 0) ||
        s.code === currentStationCode ||
        s.status === 'current'
    );
    return stops.length > 0 ? stops : stations;
  }, [stations, currentStationCode]);

  const scrollToLive = () => {
    if (liveStationRef.current) {
      liveStationRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className={cn('glass-panel rounded-3xl p-6 shadow-glass relative', className)}>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-white">
          <Clock className="h-5 w-5 text-rail-blue" />
          <span>Journey Timeline</span>
        </div>
        {typeof progress === 'number' && <ProgressRing progress={progress} size={48} strokeWidth={5} />}
      </div>

      {/* Floating Snap to Live Button */}
      <button
        onClick={scrollToLive}
        className="absolute bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-rail-blue text-white shadow-[0_8px_30px_rgb(0,0,0,0.2)] shadow-rail-blue/40 transition-all hover:scale-110 active:scale-95"
        title="Snap to Live Location"
      >
        <MapPin className="h-5 w-5" />
      </button>

      <div className="relative z-0 pl-6 before:absolute before:bottom-3 before:left-3 before:top-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        <div className="space-y-3">
          {displayedStations.map((st, idx) => {
            const isCurrent = st.status === 'current' || st.code === currentStationCode;
            const isPassed = st.status === 'passed' && !isCurrent;
            const isUpcoming = st.status === 'upcoming' && !isCurrent;
            const delayInfo = formatDelay(st.delayMinutes);
            const nextStation = idx < displayedStations.length - 1 ? displayedStations[idx + 1] : null;
            const isSelectedSegment = selectedSegmentIndex === idx;

            const startIdx = stations.findIndex((s) => s.code === st.code);
            const endIdx = nextStation ? stations.findIndex((s) => s.code === nextStation.code) : -1;
            const intermediateStations =
              startIdx !== -1 && endIdx !== -1 && endIdx > startIdx + 1
                ? stations.slice(startIdx + 1, endIdx)
                : [];

            return (
              <React.Fragment key={st.code + idx}>
                <div 
                  ref={isCurrent ? liveStationRef : null}
                  className="relative z-10 flex items-start justify-between gap-4 rounded-2xl px-2 py-1"
                >
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
                        <span className="rounded-md border border-amber-300 bg-amber-100 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-800 shadow-sm dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-500">
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

                {intermediateStations.length > 0 && !isSelectedSegment && (
                  <button
                    type="button"
                    onClick={() => toggleSegment(idx)}
                    className="ml-8 my-2 flex flex-col items-start justify-center cursor-pointer group outline-none"
                  >
                    <div className="flex items-center gap-3 relative">
                      <div className="absolute -left-[2.25rem] flex flex-col gap-1.5 py-1">
                        {[...Array(Math.min(intermediateStations.length, 4))].map((_, i) => (
                          <div key={i} className="h-1 w-3 bg-slate-300 dark:bg-slate-700 group-hover:bg-rail-blue/50 rounded-sm transition-colors" />
                        ))}
                      </div>
                      <span className="text-[11px] font-medium text-slate-500 group-hover:text-rail-blue transition-colors bg-slate-100 dark:bg-slate-800/50 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                        {intermediateStations.length} non-stop stations • {Math.max(0, (nextStation?.distanceKm ?? st.distanceKm) - st.distanceKm).toFixed(1)} km
                      </span>
                    </div>
                  </button>
                )}

                {isSelectedSegment && intermediateStations.length > 0 && (
                  <div
                    onClick={() => toggleSegment(idx)}
                    role="button"
                    tabIndex={0}
                    className="my-2 space-y-3 pl-2 opacity-80 cursor-pointer group/expanded transition-all hover:opacity-100 outline-none"
                  >
                    {intermediateStations.map((ist) => {
                      const isIntermediateCurrent = ist.status === 'current' || ist.code === currentStationCode;
                      const isIntermediatePassed = ist.status === 'passed' && !isIntermediateCurrent;
                      const isIntermediateUpcoming = ist.status === 'upcoming' && !isIntermediateCurrent;

                      return (
                        <div key={ist.code} className="relative z-10 flex items-start justify-between gap-4 px-2 py-1">
                          <div className="absolute -left-[2rem] top-1.5 z-10 flex h-3 w-3 -translate-x-1/2 items-center justify-center rounded-full bg-background">
                            {isIntermediatePassed && <CheckCircle2 className="h-3 w-3 text-emerald-500/70" />}
                            {isIntermediateCurrent && (
                              <div className="relative flex items-center justify-center">
                                <span className="absolute h-4 w-4 rounded-full bg-rail-blue/30 animate-ping" />
                                <Radio className="relative z-10 h-3 w-3 text-rail-blue" />
                              </div>
                            )}
                            {isIntermediateUpcoming && <Circle className="h-2 w-2 text-slate-300 dark:text-slate-700" />}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1.5">
                              {ist.name} <span className="text-[10px] font-mono text-slate-500">{ist.code}</span>
                              {isIntermediateCurrent && (
                                <span className="rounded-sm bg-rail-blue/10 px-1 py-0.5 font-mono text-[8px] font-bold text-rail-blue">LIVE</span>
                              )}
                            </h5>
                            <div className="text-[10px] text-slate-500 mt-0.5">{ist.distanceKm} km from origin</div>
                          </div>
                          <div className="text-right font-mono text-[10px] text-slate-600 dark:text-slate-400 mt-0.5">
                            {ist.actualArrival || ist.scheduledArrival || ist.actualDeparture || ist.scheduledDeparture || '--:--'}
                          </div>
                        </div>
                      );
                    })}
                    <div className="ml-2 text-[10px] text-slate-500 group-hover/expanded:text-rail-blue group-hover/expanded:underline font-semibold py-1">
                      Hide intermediate stations
                    </div>
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