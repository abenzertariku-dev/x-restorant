import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-[#F59E0B]',
  {
    variants: {
      variant: {
        default:
          'bg-[#F59E0B]/15 text-[#B45309] border border-[#F59E0B]/30',
        secondary:
          'bg-slate-100 text-[#334155] border border-slate-200',
        destructive:
          'bg-rose-500/10 text-rose-600 border border-rose-500/30',
        outline:
          'text-[#334155] border border-slate-200',
        success:
          'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30',
        warning:
          'bg-amber-500/10 text-amber-700 border border-amber-500/30',
        info:
          'bg-sky-500/10 text-sky-600 border border-sky-500/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
