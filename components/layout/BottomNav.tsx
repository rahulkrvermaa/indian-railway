'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Heart } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useFavoritesStore } from '@/store/favorites';

const NAV_ITEMS = [
  { href: '/', label: 'Search', icon: Search, exact: true },
  { href: '/favorites', label: 'Favorites', icon: Heart },
];

export function BottomNav() {
  const pathname = usePathname();
  const { favorites } = useFavoritesStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="glass-panel mx-3 mb-3 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-glass overflow-hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href);
            const isFavoritesTab = href === '/favorites';

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'relative flex min-w-24 flex-col items-center gap-0.5 rounded-xl px-4 py-2 transition-all duration-200',
                  isActive
                    ? 'text-rail-blue'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                )}
              >
                <div className="relative">
                  <Icon className={cn('h-5 w-5 transition-transform', isActive && 'scale-110')} />
                  {isFavoritesTab && favorites.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white">
                      {favorites.length > 9 ? '9+' : favorites.length}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold">{label}</span>
                {isActive && (
                  <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-rail-blue" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
