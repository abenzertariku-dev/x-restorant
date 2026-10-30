'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShoppingBasket } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { formatETB } from '@/lib/format';

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
  const { t } = useLanguage();
  if (totalCount === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 px-4">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-3 rounded-full border border-white/10 bg-[#171821]/95 p-2.5 pl-4 text-[#F8FAFC] shadow-2xl backdrop-blur-md">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F59E0B]/15 text-[#F59E0B]">
            <ShoppingBasket className="h-4 w-4" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#F59E0B] text-[9px] font-black text-[#0F1015]">
              {totalCount}
            </span>
          </div>
          <div className="min-w-0">
            <span className="block truncate text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
              {t('table')} #{tableNumber} · {t('cart')}
            </span>
            <p className="text-sm font-black text-[#F59E0B]">{formatETB(totalPrice)}</p>
          </div>
        </div>

        <Button
          type="button"
          onClick={onSendOrder}
          disabled={busy}
          className="shrink-0 rounded-full bg-[#F59E0B] px-5 py-3 text-[11px] font-black uppercase tracking-wider text-[#0F1015] shadow-lg hover:bg-[#FBBF24] disabled:opacity-60"
        >
          <span>{busy ? 'Sending…' : t('sendToKitchen')}</span>
          <ArrowRight className="ml-1.5 h-4 w-4 stroke-[2.5]" />
        </Button>
      </div>
    </div>
  );
}
