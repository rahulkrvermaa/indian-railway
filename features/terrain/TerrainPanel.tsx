'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Mountain, Loader2, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { TerrainFeature } from '@/lib/overpass';
import { TerrainCard } from './TerrainCard';

interface TerrainPanelProps {
  trainId: string;
}

export function TerrainPanel({ trainId }: TerrainPanelProps) {
  const [features, setFeatures] = useState<TerrainFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(`/api/terrain?trainId=${trainId}`);
        const json = await res.json();
        if (json.success && json.data) {
          setFeatures(json.data);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [trainId]);

  // Framer motion variants for stagger
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, x: 20 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-white">
        <Mountain className="h-5 w-5 text-emerald-500" />
        <span>Terrain & Points of Interest</span>
        <span className="ml-auto text-xs font-normal text-slate-400">via Overpass API</span>
      </div>

      {loading && (
        <div className="glass-panel flex items-center gap-3 rounded-2xl p-5 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin text-rail-blue" />
          <span>Fetching bridges, rivers & terrain features along route...</span>
        </div>
      )}

      {error && !loading && (
        <div className="glass-panel rounded-2xl p-5 text-sm text-slate-500">
          Terrain data is temporarily unavailable. Try again later.
        </div>
      )}

      {!loading && !error && features.length === 0 && (
        <div className="glass-panel flex items-center gap-3 rounded-2xl p-5 text-sm text-slate-500">
          <MapPin className="h-4 w-4" />
          <span>No terrain features found along this route.</span>
        </div>
      )}

      {!loading && features.length > 0 && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'thin' }}
        >
          {features.map((f, i) => (
            <motion.div key={`${f.type}-${f.name}-${i}`} variants={item} className="snap-start">
              <TerrainCard feature={f} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
