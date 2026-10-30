'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Radio, UtensilsCrossed, ReceiptText } from 'lucide-react';
import type { Order } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import {
  statusTranslationKey,
  statusVariant,
  formatETB,
  formatClock,
} from '@/lib/format';

interface TableOrdersListProps {
  activeOrders: Order[];
}

const statusHint: Record<Order['status'], string> = {
  pending: 'Waiting for waiter confirmation',
  approved: 'Approved by the waiter',
  preparing: 'The kitchen is cooking',
  ready: 'Ready — coming to your table',
  served: 'Served. Enjoy your meal!',
  out_for_delivery: 'On the way',
  delivered: 'Delivered',
  settled: 'Settled',
  cancelled: 'Cancelled',
};

export function TableOrdersList({ activeOrders }: TableOrdersListProps) {
  const { t, getText } = useLanguage();

  if (activeOrders.length === 0) {
    return (
      <Card className="border-slate-200 bg-[#FFFFFF] shadow-sm">
        <CardContent className="flex flex-col items-center justify-center gap-2 py-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-[#94A3B8]">
            <ReceiptText className="h-5 w-5" />
          </span>
          <p className="text-sm font-bold text-[#0F172A]">{t('noOrders')}</p>
          <p className="max-w-xs text-xs text-[#64748B]">
            Add dishes from the menu and send them to the kitchen. Live status will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 bg-[#FFFFFF] shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between gap-2 text-xs font-black uppercase text-[#B45309]">
          <span className="flex items-center gap-1.5">
            <UtensilsCrossed className="h-4 w-4" /> {t('activeOrders')}
          </span>
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
            <Radio className="h-3 w-3 animate-pulse" /> {t('liveTracking')}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-slate-200 pt-1">
        {activeOrders.map((ord) => (
          <div key={ord._id} className="space-y-2 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-mono font-bold text-[#0F172A]">
                #{ord.orderNumber}
                <span className="ml-2 font-sans text-[10px] font-medium text-[#94A3B8]">
                  {formatClock(ord.createdAt)}
                </span>
              </span>
              <Badge variant={statusVariant(ord.status)}>
                {t(statusTranslationKey(ord.status))}
              </Badge>
            </div>

            <div className="space-y-1">
              {ord.items.map((item, index) => (
                <div
                  key={`${ord._id}-${index}`}
                  className="flex justify-between gap-2 text-[11px] text-[#64748B]"
                >
                  <span className="min-w-0 truncate">
                    {item.qty} × {getText(item.name)}
                  </span>
                  <span className="shrink-0 font-mono">
                    {formatETB(item.price * item.qty)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-1.5 text-[10px]">
              <span className="text-[#94A3B8]">{statusHint[ord.status]}</span>
              <span className="font-mono font-black text-[#B45309]">
                {formatETB(ord.totalAmount)}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
