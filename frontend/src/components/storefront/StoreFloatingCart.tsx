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
    <div className="fixed inset-x-0 bottom-6 z-40 px-4">
      <div className="mx-auto flex max-w-lg items-center justify-between rounded-full border border-white/10 bg-[#171821]/95 p-2.5 pl-5 text-[#F8FAFC] shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F59E0B] text-xs font-black text-[#0F1015]">
            {totalCount}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Cart Total
            </span>
            <p className="text-sm font-black text-[#F59E0B]">
              {totalPrice.toLocaleString()} ETB
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={onOpenCheckout}
          className="rounded-full bg-[#F59E0B] px-6 py-3 text-xs font-black uppercase tracking-wider text-[#0F1015] shadow-lg shadow-amber-500/20 hover:bg-[#FBBF24] active:scale-95"
        >
          <span>CHECKOUT</span>
          <ArrowRight className="ml-2 h-4 w-4 stroke-[2.5]" />
        </Button>
      </div>
    </div>
  );
}
