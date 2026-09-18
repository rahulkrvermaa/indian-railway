'use client';

import { useMemo } from 'react';
import { searchLocalTrains } from '@/lib/trains-db';
import { SearchResult } from '@/types/train';

/**
 * Client-side only search hook using the bundled static trains database.
 * No network call — instant results, no quota consumption, no timeouts.
 */
export function useTrainSearch(query: string) {
  const data = useMemo<SearchResult[]>(() => {
    const results = searchLocalTrains(query);
    return results.map((t) => ({
      id: t.number,
      number: t.number,
      name: t.name,
      origin: { code: t.fromCode, name: t.from },
      destination: { code: t.toCode, name: t.to },
    }));
  }, [query]);

  return {
    data,
    isLoading: false,
    isError: false,
    error: null,
  };
}
