'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface PortalLoadingProps {
  label?: string;
  columns?: 2 | 3;
  className?: string;
}

export function PortalLoading({
  label = 'Loading…',
  columns = 3,
  className,
}: PortalLoadingProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('space-y-5', className)}
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-slate-200 bg-[#FFFFFF] p-4"
          >
            <Skeleton className="h-2.5 w-20" />
            <Skeleton className="mt-3 h-6 w-12" />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-9 w-full max-w-xs rounded-xl" />
        <Skeleton className="h-9 w-24 rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>

      <div
        className={cn(
          'grid gap-3 md:grid-cols-2',
          columns === 3 ? 'xl:grid-cols-3' : 'lg:grid-cols-2'
        )}
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="space-y-3 rounded-2xl border border-slate-200 bg-[#FFFFFF] p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-14 rounded-full" />
            </div>
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-8 flex-1 rounded-lg" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      <span className="sr-only">{label}</span>
    </div>
  );
}
