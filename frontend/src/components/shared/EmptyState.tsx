'use client';

import React from 'react';
import { AlertTriangle, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type Tone = 'default' | 'success' | 'warning' | 'danger';

const toneStyles: Record<Tone, { icon: string; ring: string }> = {
  default: { icon: 'text-[#64748B]', ring: 'bg-slate-100' },
  success: { icon: 'text-emerald-600', ring: 'bg-emerald-500/10' },
  warning: { icon: 'text-[#B45309]', ring: 'bg-[#F59E0B]/10' },
  danger: { icon: 'text-rose-600', ring: 'bg-rose-500/10' },
};

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  tone?: Tone;
  className?: string;
  compact?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  tone = 'default',
  className,
  compact = false,
}: EmptyStateProps) {
  const styles = toneStyles[tone];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-[#FFFFFF]/60 text-center',
        compact ? 'gap-2 px-4 py-8' : 'gap-3 px-6 py-14',
        className
      )}
    >
      {Icon && (
        <span
          className={cn(
            'flex items-center justify-center rounded-2xl',
            compact ? 'h-10 w-10' : 'h-14 w-14',
            styles.ring
          )}
        >
          <Icon className={cn(compact ? 'h-5 w-5' : 'h-6 w-6', styles.icon)} />
        </span>
      )}
      <div className="max-w-sm space-y-1">
        <h3 className="text-sm font-extrabold text-[#0F172A]">{title}</h3>
        {description && (
          <p className="text-xs leading-relaxed text-[#64748B]">{description}</p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try again',
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-2xl border border-rose-500/25 bg-rose-500/[0.06] px-6 py-14 text-center',
        className
      )}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10">
        <AlertTriangle className="h-6 w-6 text-rose-600" />
      </span>
      <div className="max-w-sm space-y-1">
        <h3 className="text-sm font-extrabold text-[#0F172A]">{title}</h3>
        <p className="text-xs leading-relaxed text-rose-700/90">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
