'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface BillListProps {
  orders: Order[];
  selectedOrder: Order | null;
  onSelectOrder: (order: Order) => void;
  loading: boolean;
}

export function BillList({
  orders,
  selectedOrder,
  onSelectOrder,
  loading,
}: BillListProps) {
  const { getText } = useLanguage();

  return (
    <div className="space-y-3 lg:col-span-7">
      <h2 className="font-black tracking-tight text-[#F8FAFC] text-base">
        Active Bills Pending Settlement ({orders.length})
      </h2>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-2xl bg-[#171821] shadow-sm border border-white/5"
            />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card className="p-12 text-center text-[#94A3B8]">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
          <p className="mt-3 font-bold text-[#F8FAFC]">All active bills are settled!</p>
          <p className="text-xs text-[#94A3B8] mt-1">
            New customer bills will appear here automatically.
          </p>
        </Card>
      ) : (
        orders.map((ord) => {
          const isSelected = selectedOrder?._id === ord._id;
          return (
            <Card
              key={ord._id}
              onClick={() => onSelectOrder(ord)}
              className={`cursor-pointer p-4.5 transition-all shadow-sm ${
                isSelected
                  ? 'border-[#F59E0B] bg-[#1E202B] ring-1 ring-[#F59E0B]/50'
                  : 'hover:border-white/20 hover:bg-[#1A1C26]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-extrabold uppercase text-xs text-[#F59E0B]">
                    {ord.type === 'dine_in'
                      ? `Table ${ord.tableNumber}`
                      : 'Delivery / Online'}
                  </span>
                  <h3 className="text-base font-black text-[#F8FAFC]">
                    Order #{ord.orderNumber}
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-[#F59E0B] font-mono">
                    {ord.totalAmount} ETB
                  </p>
                  <Badge variant="outline" className="text-[10px]">
                    {ord.status}
                  </Badge>
                </div>
              </div>

              <div className="mt-2 text-xs text-[#94A3B8]">
                {ord.items.map((i) => `${i.qty}× ${getText(i.name)}`).join(', ')}
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
}
