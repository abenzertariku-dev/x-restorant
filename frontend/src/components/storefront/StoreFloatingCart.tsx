'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface StoreFloatingCartProps {
  totalCount: number;
  totalPrice: number;
  onOpenCheckout: () => void;
}

export function StoreFloatingCart({
  totalCount,
  totalPrice,
  onOpenCheckout,
}: StoreFloatingCartProps) {
  if (totalCount === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3 rounded-full border border-slate-200 bg-[#FFFFFF]/95 p-2.5 pl-4 text-[#0F172A] shadow-2xl backdrop-blur-xl sm:pl-5">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F59E0B] text-xs font-black text-[#0F1015]">
            {totalCount}
          </div>
          <div className="min-w-0">
            <span className="block truncate text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              Cart Total
            </span>
            <p className="truncate text-sm font-black text-[#B45309]">
              {totalPrice.toLocaleString()} ETB
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={onOpenCheckout}
          className="shrink-0 rounded-full bg-[#F59E0B] px-4 py-3 text-[11px] font-black uppercase tracking-wider text-[#0F1015] shadow-lg shadow-amber-500/20 hover:bg-[#FBBF24] active:scale-95 sm:px-6 sm:text-xs"
        >
          <span>CHECKOUT</span>
          <ArrowRight className="ml-2 h-4 w-4 stroke-[2.5]" />
        </Button>
      </div>
    </div>
  );
}
