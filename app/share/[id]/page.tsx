'use client';

import React from 'react';
import Link from 'next/link';
import { Train, ShieldCheck } from 'lucide-react';
import { useLiveJourney } from '@/hooks/useLiveJourney';
import { JourneyCard } from '@/components/journey/JourneyCard';
import { Timeline } from '@/components/journey/Timeline';
import { Skeleton } from '@/components/ui/Skeleton';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/features/maps/MapView'), {
  ssr: false,
  loading: () => <Skeleton className="h-[400px] w-full rounded-3xl" />,
});

export default function ShareJourneyPage({ params }: { params: { id: string } }) {
  const { data: journey, isLoading } = useLiveJourney(params.id);

  if (isLoading || !journey) {
    return (
      <div className="py-8 space-y-6">
        <Skeleton className="h-64 w-full rounded-3xl" />
        <Skeleton className="h-[400px] w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      {/* Banner */}
      <div className="glass-panel flex items-center justify-between rounded-2xl px-6 py-3 border border-rail-blue/30">
        <div className="flex items-center gap-2 text-xs font-semibold text-rail-blue">
          <ShieldCheck className="h-4 w-4" />
          <span>Public Shared Live Journey Stream</span>
        </div>
        <Link
          href="/"
          className="text-xs font-bold text-slate-800 dark:text-white hover:text-rail-blue transition-colors"
        >
          Track another train →
        </Link>
      </div>

      <JourneyCard journey={journey} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <MapView journey={journey} className="h-[420px] w-full" />
        </div>
        <div className="lg:col-span-5">
          <Timeline stations={journey.stations} progress={journey.completionPercentage} />
        </div>
      </div>
    </div>
  );
}
