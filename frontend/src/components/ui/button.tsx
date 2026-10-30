import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B] disabled:pointer-events-none disabled:opacity-50 active:scale-95 cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-[#F59E0B] text-[#0F1015] shadow-md shadow-amber-500/20 hover:bg-[#FBBF24] hover:shadow-amber-500/30',
        destructive:
          'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 hover:text-rose-300',
        outline:
          'border border-white/10 bg-[#1A1B24] text-[#CBD5E1] hover:border-[#F59E0B]/50 hover:text-[#F8FAFC]',
        secondary:
          'bg-white/5 text-[#CBD5E1] hover:bg-white/10 hover:text-[#F8FAFC]',
        ghost:
          'hover:bg-white/5 hover:text-[#F8FAFC] text-[#94A3B8]',
        link:
          'text-[#F59E0B] underline-offset-4 hover:underline',
        success:
          'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 hover:bg-emerald-400',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-lg px-3 text-[11px]',
        lg: 'h-12 rounded-xl px-6 text-sm font-extrabold',
        icon: 'h-9 w-9 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<{ className?: string }>;
      return React.cloneElement(child, {
        ...props,
        className: cn(buttonVariants({ variant, size, className }), child.props.className),
      });
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
