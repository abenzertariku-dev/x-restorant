'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface TableBottomCartProps {
  tableNumber: string;
  totalCount: number;
  totalPrice: number;
  busy: boolean;
  onSendOrder: () => void;
}

export function TableBottomCart({
  tableNumber,
  totalCount,
  totalPrice,
  busy,
  onSendOrder,
}: TableBottomCartProps) {
  if (totalCount === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 px-4">
      <div className="mx-auto flex max-w-xl items-center justify-between rounded-full border border-white/10 bg-[#171821]/95 backdrop-blur-md p-2.5 pl-5 text-[#F8FAFC] shadow-2xl">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
            Table #{tableNumber} Basket: {totalCount} items
          </span>
          <p className="text-sm font-black text-[#F59E0B]">{totalPrice.toLocaleString()} ETB</p>
        </div>

        <Button
          type="button"
          onClick={onSendOrder}
          disabled={busy}
          className="rounded-full bg-[#F59E0B] px-6 py-3 font-black uppercase tracking-wider text-[#0F1015] shadow-lg hover:bg-[#FBBF24]"
        >
          <span>{busy ? 'Sending…' : 'SEND TO KITCHEN'}</span>
          <ArrowRight className="ml-2 h-4 w-4 stroke-[2.5]" />
        </Button>
      </div>
    </div>
  );
}
