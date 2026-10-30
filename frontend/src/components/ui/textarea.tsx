import * as React from 'react';
import { cn } from '@/lib/utils';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-3 text-xs text-[#0F172A] placeholder-[#94A3B8] transition-colors focus-visible:outline-none focus-visible:border-[#F59E0B] focus-visible:ring-1 focus-visible:ring-[#F59E0B] disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
